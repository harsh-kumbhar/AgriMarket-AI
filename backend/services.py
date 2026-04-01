# services.py — AgriMarket AI
# Handles: Live API fetch → CSV fallback → Bias Correction → Prophet forecast

import os
import joblib
import requests
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
API_KEY     = os.getenv("DATAGOV_API_KEY")
RESOURCE_ID = os.getenv("RESOURCE_ID", "9ef84268-d588-465a-a308-a864a43d0070")
CSV_PATH    = os.path.join(os.path.dirname(__file__), "latest_prices.csv")
MODEL_PATH  = os.path.join(os.path.dirname(__file__), "models", "agrimarket_prophet_final.pkl")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# ── Load Model Once at Startup ────────────────────────────────────────────────
print("Loading Prophet model...")
model = joblib.load(MODEL_PATH)
print(f"Model loaded. Training data ends: {model.history['ds'].max().date()}")


# ── Layer 1: Live API Fetch ───────────────────────────────────────────────────
def fetch_live_record(commodity, market):
    """
    Fetch from Agmarknet API.
    KEY FIX: The state filter on this API is unreliable — it returns
    whatever states uploaded data today. We fetch all records for the
    commodity and filter Maharashtra client-side.
    """
    try:
        url    = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
        params = {
            "api-key":            API_KEY,
            "format":             "json",
            "limit":              "500",    # fetch max — don't rely on state filter
            "filters[commodity]": commodity,
        }
        resp = requests.get(url, params=params, headers=HEADERS, timeout=10)

        if resp.status_code != 200:
            print(f"API error: {resp.status_code}")
            return None

        try:
            data = resp.json()
        except Exception:
            print("API returned non-JSON response")
            return None

        all_records = data.get("records", [])
        if not all_records:
            print(f"API returned 0 records for {commodity} today")
            return None

        print(f"API: {len(all_records)} total records for {commodity}")

        # Filter Maharashtra client-side
        maha = [r for r in all_records if "maharashtra" in r.get("state", "").lower()]
        print(f"Maharashtra records today: {len(maha)}")

        if not maha:
            print("No Maharashtra data today — govt hasn't uploaded yet, falling to CSV")
            return None

        # Try specific market match first
        filtered = [r for r in maha if market.lower() in r["market"].lower()]

        if not filtered:
            print(f"'{market}' not found — using closest Maharashtra market for bias")
            filtered = maha  # any Maharashtra record is fine for bias correction

        rec          = filtered[0]
        actual_price = float(rec["modal_price"])
        actual_date  = pd.to_datetime(rec["arrival_date"], dayfirst=True)

        if actual_price < 100:
            print(f"Suspicious price Rs.{actual_price} — rejecting")
            return None

        print(f"Live: {rec['market']} | {actual_date.date()} | Rs.{actual_price}")
        return {"price": actual_price, "date": actual_date, "market": rec["market"]}

    except Exception as e:
        print(f"Live API failed: {e}")
        return None


# ── Layer 2: CSV Safe-Fail ────────────────────────────────────────────────────
def _parse_agmarknet_csv(filepath):
    """
    Custom parser for Agmarknet market-wise daily report CSV.
    Format: market names appear on their own line, commodities follow.
      Market Name : Pune APMC
      Onion,10,Metric Tonnes,...,950.0,...,Rs./Quintal
    """
    rows = []
    current_market = None
    report_date = datetime.now()

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    for line in content.split("\n")[:3]:
        if "on:" in line.lower():
            try:
                date_str = line.split("on:")[-1].strip().strip('"').strip()
                report_date = pd.to_datetime(date_str, dayfirst=True)
            except Exception:
                pass

    for line in content.split("\n"):
        line = line.strip()
        if line.startswith("Market Name :"):
            current_market = line.replace("Market Name :", "").strip()
        elif current_market and line and line not in ["Not Reported", "NIL Transaction"]:
            parts = line.split(",")
            if len(parts) >= 8:
                unit = parts[8].strip() if len(parts) > 8 else ""
                if "quintal" in unit.lower() or unit == "":
                    try:
                        rows.append({
                            "market":      current_market,
                            "commodity":   parts[0].strip(),
                            "modal_price": float(parts[7]),
                            "date":        report_date,
                        })
                    except (ValueError, IndexError):
                        pass
    return rows


def fetch_csv_record(commodity, market):
    """
    Safe-fail Layer 2 — parses Agmarknet market-wise daily report.
    Download from agmarknet.gov.in → Price Arrivals → Market-wise Report
    Save as latest_prices.csv in backend/
    """
    try:
        if not os.path.exists(CSV_PATH):
            print(f"CSV not found at {CSV_PATH}")
            return None

        rows = _parse_agmarknet_csv(CSV_PATH)
        print(f"CSV parsed: {len(rows)} total records")

        if not rows:
            print("CSV parsing returned 0 records")
            return None

        # Filter by commodity
        filtered = [r for r in rows if commodity.lower() in r["commodity"].lower()]
        print(f"CSV: {len(filtered)} {commodity} records")

        if not filtered:
            print(f"No {commodity} in CSV")
            return None

        # Try specific market match
        mkt_filtered = [r for r in filtered if market.lower() in r["market"].lower()]
        rec = mkt_filtered[0] if mkt_filtered else filtered[0]

        if not mkt_filtered:
            print(f"'{market}' not in CSV — using {rec['market']} for bias")

        price = rec["modal_price"]
        if price < 100:
            print(f"CSV price Rs.{price} too low — rejecting")
            return None

        print(f"CSV: Rs.{price}/quintal | {rec['market']} | {pd.Timestamp(rec['date']).date()}")
        return {"price": price, "date": rec["date"], "market": rec["market"]}

    except Exception as e:
        print(f"CSV fallback failed: {e}")
        return None


# ── Layer 3: Bias Correction + Prophet Forecast ───────────────────────────────
def run_forecast(record):
    """
    Kaggle-proven bias correction:
    bias = actual_price - model.predict(actual_date_from_record)
    Then forecast next 7 days from today with bias applied.
    """
    bias = 0.0

    if record is not None:
        actual_price    = record["price"]
        actual_date     = record["date"]
        model_at_actual = model.predict(pd.DataFrame({"ds": [actual_date]}))
        model_price     = float(model_at_actual["yhat"].values[0])
        bias            = actual_price - model_price
        print(f"Bias: actual=Rs.{actual_price} | model=Rs.{model_price:.2f} | correction={bias:+.2f}")

    today        = datetime.now()
    future_dates = [today + timedelta(days=i) for i in range(1, 8)]
    forecast_df  = model.predict(pd.DataFrame({"ds": future_dates}))

    forecast_list = []
    for _, row in forecast_df.iterrows():
        forecast_list.append({
            "date":        row["ds"].strftime("%Y-%m-%d"),
            "price":       round(max(float(row["yhat"])       + bias, 0), 2),
            "price_lower": round(max(float(row["yhat_lower"]) + bias, 0), 2),
            "price_upper": round(max(float(row["yhat_upper"]) + bias, 0), 2),
        })

    return forecast_list


# ── Recommendation Engine ─────────────────────────────────────────────────────
def get_recommendation(current_price, forecast):
    if current_price is None or not forecast:
        return {"signal": "UNKNOWN", "best_day": None, "profit_increase": 0}

    # 1. Find the absolute peak in the 7-day forecast
    # We find the day with the highest 'price'
    peak_entry = max(forecast, key=lambda x: x["price"])
    peak_price = peak_entry["price"]
    peak_date = peak_entry["date"]

    # 2. Calculate the percentage gain if they wait for the peak
    gain_percent = ((peak_price - current_price) / current_price) * 100

    # 3. Logic: If the peak is significantly higher (>5%) than today, 
    # and the peak isn't 'today', tell them to KEEP.
    if gain_percent > 5 and peak_date != forecast[0]["date"]:
        return {
            "signal": "KEEP",
            "best_day": peak_date,
            "expected_price": round(peak_price, 2),
            "gain": round(gain_percent, 1)
        }
    
    return {
        "signal": "SELL",
        "best_day": datetime.now().strftime("%Y-%m-%d"),
        "expected_price": round(current_price, 2),
        "gain": 0
    }

# ── Main Entry Point ──────────────────────────────────────────────────────────
def get_forecast(commodity, market):
    record      = fetch_live_record(commodity, market)
    data_source = "live_api"

    if record is None:
        record      = fetch_csv_record(commodity, market)
        data_source = "csv_fallback"

    if record is None:
        data_source = "model_only"
        print("No real price found — model running without bias correction")

    try:
        forecast       = run_forecast(record)
        current_price  = record["price"] if record else forecast[0]["price"]
        recommendation = get_recommendation(current_price, forecast)

        return {
            "status":         "success",
            "commodity":      commodity,
            "market":         record["market"] if record else market,
            "current_price":  round(current_price, 2),
            "price_per_kg":   round(current_price / 100, 2),
            "data_source":    data_source,
            "recommendation": recommendation,
            "forecast":       forecast,
            "generated_at":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
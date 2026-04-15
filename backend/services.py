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
    try:
        url    = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
        params = {
            "api-key":            API_KEY,
            "format":             "json",
            "limit":              "500",
            "filters[commodity]": commodity,
        }
        resp = requests.get(url, params=params, headers=HEADERS, timeout=10)

        if resp.status_code != 200:
            return None

        try:
            data = resp.json()
        except Exception:
            return None

        all_records = data.get("records", [])
        if not all_records:
            return None

        maha = [r for r in all_records if "maharashtra" in r.get("state", "").lower()]
        if not maha:
            return None

        filtered = [r for r in maha if market.lower() in r["market"].lower()]
        if not filtered:
            filtered = maha 

        rec          = filtered[0]
        actual_price = float(rec["modal_price"])
        actual_date = pd.to_datetime(rec.get("arrival_date"), dayfirst=True, errors='coerce')
        if pd.isna(actual_date):
            print("⚠️ API sent a broken date. Defaulting to Today.")
            actual_date = datetime.now()
        if actual_price < 100:
            return None

        return {"price": actual_price, "date": actual_date, "market": rec["market"]}

    except Exception as e:
        return None

# ── Layer 2: CSV Safe-Fail ────────────────────────────────────────────────────
def _parse_agmarknet_csv(filepath):
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
    try:
        if not os.path.exists(CSV_PATH):
            return None

        rows = _parse_agmarknet_csv(CSV_PATH)
        if not rows:
            return None

        filtered = [r for r in rows if commodity.lower() in r["commodity"].lower()]
        if not filtered:
            return None

        mkt_filtered = [r for r in filtered if market.lower() in r["market"].lower()]
        rec = mkt_filtered[0] if mkt_filtered else filtered[0]

        price = rec["modal_price"]
        if price < 100:
            return None

        return {"price": price, "date": rec["date"], "market": rec["market"]}

    except Exception as e:
        return None


# ── Layer 3: Bias Correction + Prophet Forecast ───────────────────────────────
def run_forecast(record):
    bias = 0.0

    if record is not None:
        actual_price    = record["price"]
        actual_date     = record["date"]
        model_at_actual = model.predict(pd.DataFrame({"ds": [actual_date]}))
        model_price     = float(model_at_actual["yhat"].values[0])
        bias            = actual_price - model_price

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

# ── NEW: Retail Estimator & Consumer Insights ─────────────────────────────────
def get_retail_markup(commodity):
    """Returns the markup percentage based on perishability and transport"""
    comm_lower = commodity.lower()
    if comm_lower in ['onion', 'potato']:
        return 0.35  # 35%
    elif comm_lower in ['wheat', 'garlic']:
        return 0.20  # 20%
    elif comm_lower in ['tomato', 'brinjal', 'cabbage', 'cauliflower', 'green chilli']:
        return 0.65  # 65% (High perishability)
    else:
        return 0.40  # 40% default

def get_consumer_insight(current_retail_price, retail_forecast):
    """Finds the lowest price in the week for the consumer"""
    if not retail_forecast:
        return {"signal": "UNKNOWN"}

    # Consumer wants the LOWEST price
    best_entry = min(retail_forecast, key=lambda x: x["retail_price_kg"])
    best_price = best_entry["retail_price_kg"]
    best_date = best_entry["date"]

    drop_percent = ((current_retail_price - best_price) / current_retail_price) * 100

    if drop_percent > 3 and best_date != retail_forecast[0]["date"]:
        return {
            "signal": "WAIT",
            "best_day": best_date,
            "target_price": round(best_price, 2),
            "savings_percent": round(drop_percent, 1),
            "message": f"Prices are expected to drop. Wait until {best_date} to buy."
        }
    
    return {
        "signal": "BUY",
        "best_day": "Today",
        "target_price": round(current_retail_price, 2),
        "savings_percent": 0,
        "message": "Market is at its weekly low. Good time to buy."
    }


# ── Recommendation Engine (For Farmers) ───────────────────────────────────────
def get_recommendation(current_price, forecast):
    if current_price is None or not forecast:
        return {"signal": "UNKNOWN", "best_day": None, "profit_increase": 0}

    # Farmer wants the HIGHEST price
    peak_entry = max(forecast, key=lambda x: x["price"])
    peak_price = peak_entry["price"]
    peak_date = peak_entry["date"]

    gain_percent = ((peak_price - current_price) / current_price) * 100

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

    try:
        forecast       = run_forecast(record)
        current_price  = record["price"] if record else forecast[0]["price"]
        recommendation = get_recommendation(current_price, forecast)

        # Apply Retail Logic
        markup = get_retail_markup(commodity)
        current_retail_kg = (current_price * (1 + markup)) / 100

        retail_forecast = []
        for f in forecast:
            retail_forecast.append({
                "date": f["date"],
                "mandi_price_q": f["price"],
                "retail_price_kg": round((f["price"] * (1 + markup)) / 100, 2)
            })
            
        consumer_insight = get_consumer_insight(current_retail_kg, retail_forecast)

        return {
            "status":         "success",
            "commodity":      commodity,
            "market":         record["market"] if record else market,
            "current_mandi_price": round(current_price, 2),
            "current_retail_price": round(current_retail_kg, 2),
            "retail_markup_percent": round(markup * 100, 0),
            "data_source":    data_source,
            "recommendation": recommendation,
            "consumer_insight": consumer_insight,
            "forecast":       retail_forecast,
            "generated_at":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
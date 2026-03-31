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
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# ── Load Model Once at Startup ────────────────────────────────────────────────
print("Loading Prophet model...")
model = joblib.load(MODEL_PATH)
print(f"Model loaded. Training data ends: {model.history['ds'].max().date()}")


# ── Layer 1: Live API Fetch ───────────────────────────────────────────────────
def fetch_live_record(commodity, market):
    """
    Returns a dict with both actual_price AND actual_date from the API record.
    The date is critical — it's used to calculate bias correctly.
    """
    try:
        url    = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
        params = {
            "api-key":            API_KEY,
            "format":             "json",
            "limit":              "100",
            "filters[commodity]": commodity,
            "filters[state]":     "Maharashtra",
        }
        resp = requests.get(url, params=params, headers=HEADERS, timeout=8)

        if resp.status_code != 200:
            print(f"API error: {resp.status_code}")
            return None

        try:
            data = resp.json()
        except Exception:
            print("API returned non-JSON response")
            return None

        records = data.get("records", [])

        # Filter by market name (partial match like Kaggle code)
        filtered = [r for r in records if market.lower() in r["market"].lower()]

        if not filtered:
            print(f"Market '{market}' not found in API records — trying any Maharashtra market")
            filtered = records  # fallback: use any Maharashtra record for bias

        if not filtered:
            return None

        rec          = filtered[0]
        actual_price = float(rec["modal_price"])
        actual_date  = pd.to_datetime(rec["arrival_date"], dayfirst=True)

        if actual_price < 100:
            print(f"Suspicious price Rs.{actual_price} from API — rejecting")
            return None

        print(f"API match: {rec['market']} | Date: {actual_date.date()} | Price: Rs.{actual_price}")
        return {"price": actual_price, "date": actual_date, "market": rec["market"]}

    except Exception as e:
        print(f"Live API failed: {e}")
        return None


# ── Layer 2: CSV Safe-Fail ────────────────────────────────────────────────────
def fetch_csv_record(commodity, market):
    """Fallback — returns price + date from latest_prices.csv."""
    try:
        df = pd.read_csv(CSV_PATH)
        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

        filtered = df[
            (df["commodity"].str.lower() == commodity.lower()) &
            (df["market"].str.lower().str.contains(market.lower()))
        ]
        if filtered.empty:
            filtered = df[df["commodity"].str.lower() == commodity.lower()]
        if filtered.empty:
            return None

        row   = filtered.iloc[0]
        price = float(row["modal_price"])
        if price < 100:
            return None

        # Try to parse date column if it exists, else use today
        date_col = next((c for c in df.columns if "date" in c), None)
        date     = pd.to_datetime(row[date_col], dayfirst=True) if date_col else datetime.now()

        print(f"CSV fallback: Rs.{price}/quintal | Date: {pd.Timestamp(date).date()}")
        return {"price": price, "date": pd.Timestamp(date), "market": str(row.get("market", market))}

    except Exception as e:
        print(f"CSV fallback failed: {e}")
        return None


# ── Layer 3: Bias Correction + Prophet Forecast ───────────────────────────────
def run_forecast(record):
    """
    Kaggle-proven bias correction strategy:
    1. Ask the model: "what would you predict for the date of this real record?"
    2. bias = actual_price - model_prediction_for_that_date
    3. Forecast the next 7 days from today and apply the same bias
    4. Clip to 0 to prevent negative prices
    """
    bias = 0.0

    if record is not None:
        actual_price = record["price"]
        actual_date  = record["date"]

        # What would the model have predicted for the real data's date?
        model_at_actual = model.predict(pd.DataFrame({"ds": [actual_date]}))
        model_price     = float(model_at_actual["yhat"].values[0])

        bias = actual_price - model_price
        print(f"Bias correction: actual=Rs.{actual_price} | model_for_{pd.Timestamp(actual_date).date()}=Rs.{model_price:.2f} | bias={bias:+.2f}")

    # Forecast next 7 days from TODAY
    today        = datetime.now()
    future_dates = [today + timedelta(days=i) for i in range(1, 8)]
    forecast_df  = model.predict(pd.DataFrame({"ds": future_dates}))

    forecast_list = []
    for _, row in forecast_df.iterrows():
        price       = round(max(float(row["yhat"])       + bias, 0), 2)  # clip negative
        price_lower = round(max(float(row["yhat_lower"]) + bias, 0), 2)
        price_upper = round(max(float(row["yhat_upper"]) + bias, 0), 2)

        forecast_list.append({
            "date":        row["ds"].strftime("%Y-%m-%d"),
            "price":       price,
            "price_lower": price_lower,
            "price_upper": price_upper,
        })

    return forecast_list


# ── Recommendation Engine ─────────────────────────────────────────────────────
def get_recommendation(current_price, forecast):
    if current_price is None or not forecast:
        return "UNKNOWN"

    avg_future = sum(d["price"] for d in forecast) / len(forecast)
    threshold  = current_price * 1.05  # 5% gain = KEEP

    return "KEEP" if avg_future > threshold else "SELL"


# ── Main Entry Point ──────────────────────────────────────────────────────────
def get_forecast(commodity, market):
    # Step 1 & 2: Get real price record (price + date)
    record      = fetch_live_record(commodity, market)
    data_source = "live_api"

    if record is None:
        record      = fetch_csv_record(commodity, market)
        data_source = "csv_fallback"

    if record is None:
        data_source = "model_only"
        print("No real price found — running model without bias correction")

    try:
        forecast      = run_forecast(record)
        current_price = record["price"] if record else forecast[0]["price"]
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
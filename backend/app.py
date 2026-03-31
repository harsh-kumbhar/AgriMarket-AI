# app.py — AgriMarket AI Backend
# Phase 1: The Backend Bridge

from flask import Flask, jsonify, request
from flask_cors import CORS
from services import get_forecast

app = Flask(__name__)
CORS(app)  # Allow React frontend on port 5173 to talk to Flask on 5000


# ── Health Check ─────────────────────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({"status": "AgriMarket AI backend is running ✅"})


# ── Main Forecast Endpoint ────────────────────────────────────────────────────
# GET /forecast?commodity=Onion&market=Pune
@app.route("/forecast")
def forecast():
    commodity = request.args.get("commodity", "Onion")
    market    = request.args.get("market", "Pune")

    result = get_forecast(commodity, market)

    if result["status"] == "error":
        return jsonify(result), 500

    return jsonify(result), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
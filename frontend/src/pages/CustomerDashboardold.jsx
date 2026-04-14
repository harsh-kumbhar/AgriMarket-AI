import React, { useState, useCallback } from "react";
import axios from "axios";
import {
  ArrowLeft, Search, Leaf, TrendingDown, TrendingUp, Minus,
  Clock, Database, ShoppingCart, AlertCircle, Sparkles,
  CalendarDays, BadgeIndianRupee,
} from "lucide-react";
import PriceTrendChart from "../components/PriceTrendChart";
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  .cd-root {
    --bg-deep:    #060e0a;
    --bg-card:    #0d1a12;
    --bg-surface: #132018;
    --border:     rgba(74,222,128,0.12);
    --border-h:   rgba(74,222,128,0.3);
    --green-hi:   #4ade80;
    --green-mid:  #22c55e;
    --amber:      #fbbf24;
    --red:        #f87171;
    --text-hi:    #f0fdf4;
    --text-mid:   rgba(240,253,244,0.65);
    --text-dim:   rgba(240,253,244,0.35);
    min-height: 100vh;
    background: var(--bg-deep);
    font-family: 'Sora', sans-serif;
    color: var(--text-hi);
    overflow-x: hidden;
    text-align: left;
  }
  .cd-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .cd-root::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(74,222,128,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(74,222,128,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .cd-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 64px;
    background: rgba(6,14,10,0.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .cd-back-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg-surface); border: 1px solid var(--border);
    color: var(--text-mid); border-radius: 10px;
    padding: 8px 16px; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 500;
    transition: all 0.2s;
  }
  .cd-back-btn:hover { border-color: var(--border-h); color: var(--text-hi); }
  .cd-brand { display: flex; align-items: center; gap: 10px; }
  .cd-brand-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green-hi); box-shadow: 0 0 12px var(--green-mid);
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.85)} }
  .cd-brand-label { font-size: 14px; font-weight: 600; color: var(--text-mid); letter-spacing: .5px; }
  .cd-badge {
    display: flex; align-items: center; gap: 6px;
    background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2);
    border-radius: 20px; padding: 5px 14px;
    font-size: 11px; font-weight: 600; color: var(--green-hi); letter-spacing: .5px;
  }
  .cd-hero { position: relative; z-index: 1; padding: 48px 32px 32px; max-width: 880px; margin: 0 auto; }
  .cd-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    color: var(--green-hi); text-transform: uppercase; margin-bottom: 16px;
  }
  .cd-hero h1 {
    font-size: clamp(28px, 5vw, 44px); font-weight: 800;
    line-height: 1.1; letter-spacing: -1px; color: var(--text-hi); margin-bottom: 8px;
  }
  .cd-hero h1 span { color: var(--green-hi); }
  .cd-hero-sub { font-size: 15px; color: var(--text-mid); margin-bottom: 32px; font-weight: 400; }
  .cd-search-form { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
  .cd-field { flex: 1; min-width: 180px; }
  .cd-field label {
    display: block; font-size: 11px; font-weight: 600;
    color: var(--text-dim); letter-spacing: .8px; text-transform: uppercase; margin-bottom: 8px;
  }
  .cd-field select {
    width: 100%; background: var(--bg-card);
    border: 1px solid var(--border); border-radius: 12px;
    padding: 14px 16px; color: var(--text-hi);
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 500;
    outline: none; transition: all 0.2s; appearance: none; cursor: pointer;
  }
  .cd-field select:focus { border-color: var(--border-h); box-shadow: 0 0 0 3px rgba(74,222,128,0.08); }
  .cd-field select option { background: #0d1a12; color: #f0fdf4; }
  .cd-search-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--green-mid); color: #060e0a;
    border: none; border-radius: 12px;
    padding: 14px 28px; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700;
    transition: all 0.2s; white-space: nowrap;
    box-shadow: 0 4px 20px rgba(34,197,94,0.3);
  }
  .cd-search-btn:hover:not(:disabled) { background: var(--green-hi); transform: translateY(-1px); box-shadow: 0 4px 30px rgba(34,197,94,0.5); }
  .cd-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .cd-content { position: relative; z-index: 1; max-width: 880px; margin: 0 auto; padding: 0 32px 64px; }
  .cd-tip {
    background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(74,222,128,0.06));
    border: 1px solid rgba(74,222,128,0.3); border-left: 4px solid var(--green-hi);
    border-radius: 16px; padding: 20px 24px;
    display: flex; align-items: flex-start; gap: 14px; margin-bottom: 24px;
    animation: slideIn 0.4s ease;
  }
  .cd-tip.warning { background: linear-gradient(135deg,rgba(251,191,36,.10),rgba(251,191,36,.04)); border-color: rgba(251,191,36,.3); border-left-color: var(--amber); }
  .cd-tip-title { font-size: 12px; font-weight: 700; color: var(--green-hi); letter-spacing: .5px; margin-bottom: 4px; text-transform: uppercase; }
  .cd-tip.warning .cd-tip-title { color: var(--amber); }
  .cd-tip-text { font-size: 14px; color: var(--text-hi); font-weight: 500; }
  @keyframes slideIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  .cd-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px; }
  @media(max-width:600px){.cd-stats{grid-template-columns:1fr 1fr}}
  .cd-stat {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 20px;
    transition: border-color 0.2s;
  }
  .cd-stat:hover { border-color: var(--border-h); }
  .cd-stat-label { font-size: 11px; font-weight: 600; color: var(--text-dim); letter-spacing: .8px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
  .cd-stat-value { font-size: 28px; font-weight: 800; color: var(--text-hi); letter-spacing: -.5px; line-height: 1; }
  .cd-stat-value small { font-size: 13px; font-weight: 500; color: var(--text-dim); margin-left: 4px; }
  .cd-stat-sub { font-size: 12px; color: var(--text-dim); margin-top: 6px; }
  .cd-stat-sub.up   { color: var(--red); }
  .cd-stat-sub.down { color: var(--green-hi); }
  .cd-stat-sub.flat { color: var(--amber); }
  .cd-mood { display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; padding: 4px 12px; font-size: 12px; font-weight: 700; }
  .cd-mood.bearish { background: rgba(248,113,113,0.15); color: var(--red); border: 1px solid rgba(248,113,113,0.25); }
  .cd-mood.bullish  { background: rgba(74,222,128,0.12); color: var(--green-hi); border: 1px solid rgba(74,222,128,0.25); }
  .cd-mood.neutral  { background: rgba(251,191,36,0.10); color: var(--amber); border: 1px solid rgba(251,191,36,0.2); }
  .cd-chart-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 28px; margin-bottom: 24px; }
  .cd-chart-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .cd-chart-title { font-size: 16px; font-weight: 700; color: var(--text-hi); margin-bottom: 4px; }
  .cd-chart-sub { font-size: 12px; color: var(--text-dim); }
  .cd-bestbuy { display: flex; align-items: center; gap: 8px; background: rgba(34,197,94,0.1); border: 1px solid rgba(74,222,128,0.2); border-radius: 10px; padding: 8px 14px; font-size: 12px; font-weight: 600; color: var(--green-hi); }
  .cd-meta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 20px; font-size: 12px; color: var(--text-dim); }
  .cd-meta-item { display: flex; align-items: center; gap: 6px; font-weight: 500; }
  .cd-meta-item span { color: var(--text-mid); font-family: 'JetBrains Mono', monospace; font-size: 11px; }
  .cd-meta-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green-hi); animation: pulse 2s infinite; }
  .cd-error { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; color: var(--red); font-size: 14px; font-weight: 500; animation: slideIn 0.3s ease; }
  .cd-skeleton { border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border); overflow: hidden; position: relative; }
  .cd-skeleton::after { content:''; position:absolute; inset:0; background: linear-gradient(90deg,transparent,rgba(74,222,128,0.05),transparent); animation: shimmer 1.4s infinite; }
  @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
  .cd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .cd-table thead tr { border-bottom: 1px solid var(--border); }
  .cd-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; color: var(--text-dim); letter-spacing: .8px; text-transform: uppercase; }
  .cd-table td { padding: 12px 16px; color: var(--text-mid); border-bottom: 1px solid rgba(74,222,128,0.05); }
  .cd-table tr:last-child td { border-bottom: none; }
  .cd-table tr.is-best { background: rgba(34,197,94,0.06); }
  .cd-table tr.is-best td { color: var(--text-hi); }
  .cd-price-cell { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500; }
  .cd-price-cell.best { color: var(--green-hi); font-weight: 700; }
  .cd-empty { text-align: center; padding: 80px 32px; animation: fadeIn 0.5s ease; }
  .cd-empty-icon { width: 80px; height: 80px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; }
  .cd-empty h3 { font-size: 20px; font-weight: 700; color: var(--text-hi); margin-bottom: 8px; }
  .cd-empty p  { font-size: 14px; color: var(--text-dim); max-width: 320px; margin: 0 auto; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @media(max-width:640px) {
    .cd-hero,.cd-content{padding-left:16px;padding-right:16px}
    .cd-nav{padding:0 16px}
    .cd-search-form{flex-direction:column}
    .cd-search-btn{width:100%;justify-content:center}
    .cd-stats{grid-template-columns:1fr 1fr}
  }
`;

// ── Real APMC market names that match the CSV/API ──────────────────────────
const MARKET_OPTIONS = [
  // Pune district markets
  { label: "Pune – Moshi APMC",    value: "Pune(Moshi) APMC" },
  { label: "Pune – Manjri APMC",   value: "Pune(Manjri) APMC" },
  { label: "Pune – Khed Chakan",   value: "Khed(Chakan) APMC" },
  { label: "Pune – Khed APMC",     value: "Khed APMC" },
  { label: "Pune APMC",            value: "Pune APMC" },
  // Nashik
  { label: "Nashik (Nasik) APMC",  value: "Nasik APMC" },
  { label: "Lasalgaon APMC",       value: "Lasalgaon APMC" },
  { label: "Pimpalgaon APMC",      value: "Pimpalgaon APMC" },
  // Mumbai / Vashi
  { label: "Mumbai APMC",          value: "Mumbai APMC" },
  { label: "Vashi New Mumbai APMC",value: "Vashi New Mumbai APMC" },
  // Nagpur
  { label: "Hingna APMC (Nagpur)", value: "Hingna APMC" },
  { label: "Katol APMC (Nagpur)",  value: "Katol APMC" },
  // Kolhapur / Sangli / Satara
  { label: "Kolhapur APMC",        value: "Kolhapur APMC" },
  { label: "Islampur APMC",        value: "Islampur APMC" },
  { label: "Karad APMC",           value: "Karad APMC" },
  { label: "Satara APMC",          value: "Satara APMC" },
  // Solapur / Jalgaon
  { label: "Solapur APMC",         value: "Solapur APMC" },
  { label: "Jalgaon APMC",         value: "Jalgaon APMC" },
  { label: "Bhusaval APMC",        value: "Bhusaval APMC" },
  // Ahmednagar
  { label: "Akole APMC",           value: "Akole APMC" },
  { label: "Rahuri APMC",          value: "Rahuri APMC" },
];

// ── Exact commodity names matching the CSV ─────────────────────────────────
const VEGETABLE_OPTIONS = [
  { label: "Onion",          value: "Onion" },
  { label: "Tomato",         value: "Tomato" },
  { label: "Potato",         value: "Potato" },
  { label: "Garlic",         value: "Garlic" },
  { label: "Cabbage",        value: "Cabbage" },
  { label: "Cauliflower",    value: "Cauliflower" },
  { label: "Carrot",         value: "Carrot" },
  { label: "Brinjal",        value: "Brinjal" },
  { label: "Green Chilli",   value: "Green Chilli" },
  { label: "Bitter Gourd",   value: "Bitter gourd" },
  { label: "Wheat",          value: "Wheat" },
  { label: "Ginger (Green)", value: "Ginger(Green)" },
];

const getBestBuy = (forecast) => {
  if (!forecast?.length) return null;
  let minIdx = 0;
  forecast.forEach((d, i) => { if (d.price < forecast[minIdx].price) minIdx = i; });
  return { ...forecast[minIdx], dayIndex: minIdx };
};

const getMood = (recommendation) => {
  // Extract the signal if it's an object, otherwise use the value
  const r = typeof recommendation === "object" 
    ? recommendation?.signal 
    : recommendation;

  if (!r || typeof r !== "string") return "neutral";
  
  const upper = r.toUpperCase();
  if (upper === "SELL") return "bearish";
  if (upper === "KEEP" || upper === "BUY") return "bullish";
  return "neutral";
};  
const moodLabel = { 
  bearish: "Prices Dropping 📉", 
  bullish: "Prices Rising 📈", 
  neutral: "Steady Prices ➡️" 
};

const CustomerDashboard = ({ onBack }) => {
  const [commodity, setCommodity] = useState("");
  const [market, setMarket] = useState("");
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!commodity || !market) return;
    setLoading(true);
    setError(null);
    setForecastData(null);
    try {
     const res = await axios.get(
  `http://localhost:5000/forecast?commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(market)}`
);
      if (res.data.status !== "success") throw new Error(res.data.message || "No data returned.");
      setForecastData(res.data);
    } catch (err) {
      if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setError("Cannot connect to the backend. Make sure Flask is running: cd backend && python app.py");
      } else {
        setError(err.response?.data?.message || err.message || "Could not fetch forecast. Try a different market or vegetable.");
      }
    } finally {
      setLoading(false);
    }
  }, [commodity, market]);

  const bestBuy = forecastData ? getBestBuy(forecastData.forecast) : null;
  const showEarlyTip = bestBuy && bestBuy.dayIndex <= 2;
  const mood = getMood(forecastData?.recommendation);

  let trendDir = "flat";
  if (forecastData?.forecast?.length >= 2) {
    const first = forecastData.forecast[0].price;
    const last  = forecastData.forecast[forecastData.forecast.length - 1].price;
    trendDir = last > first * 1.02 ? "up" : last < first * 0.98 ? "down" : "flat";
  }

  return (
    <>
      <style>{css}</style>
      <div className="cd-root">
        <nav className="cd-nav">
          <button className="cd-back-btn" onClick={onBack}><ArrowLeft size={15} /> Back</button>
          <div className="cd-brand">
            <div className="cd-brand-dot" />
            <span className="cd-brand-label">Consumer Price Tracker</span>
          </div>
          <div className="cd-badge"><Leaf size={12} /> AgriMarket AI</div>
        </nav>

        <div className="cd-hero">
          <div className="cd-eyebrow"><Sparkles size={12} /> Smart Price Forecasting</div>
          <h1>Know the best day<br />to buy <span>vegetables</span>.</h1>
          <p className="cd-hero-sub">7-day AI price forecasts powered by mandi data — buy smarter, save more.</p>

          <div className="cd-search-form">
            <div className="cd-field">
              <label>Vegetable</label>
              <select value={commodity} onChange={(e) => setCommodity(e.target.value)}>
                <option value="">Select vegetable…</option>
                {VEGETABLE_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="cd-field">
              <label>Market / APMC</label>
              <select value={market} onChange={(e) => setMarket(e.target.value)}>
                <option value="">Select market…</option>
                {MARKET_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <button className="cd-search-btn" onClick={handleSearch} disabled={loading || !commodity || !market}>
              <Search size={16} />
              {loading ? "Forecasting…" : "Get Forecast"}
            </button>
          </div>
        </div>

        <div className="cd-content">
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="cd-skeleton" style={{ height: 76 }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[1,2,3].map(i => <div key={i} className="cd-skeleton" style={{ height: 100 }} />)}
              </div>
              <div className="cd-skeleton" style={{ height: 300 }} />
            </div>
          )}

          {error && !loading && (
            <div className="cd-error"><AlertCircle size={20} /> {error}</div>
          )}

          {forecastData && !loading && (
            <>
              {showEarlyTip ? (
                <div className="cd-tip">
                  <ShoppingCart size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div className="cd-tip-title">💡 Consumer Tip — Best Buy Window!</div>
                    <div className="cd-tip-text">
                      Prices are expected to be lowest on <strong>{bestBuy.date}</strong> at ₹{bestBuy.price?.toFixed(2)}/q. Consider buying then to save money!
                    </div>
                  </div>
                </div>
              ) : bestBuy && (
                <div className="cd-tip warning">
                  <CalendarDays size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div className="cd-tip-title">📅 Best Price Later This Week</div>
                    <div className="cd-tip-text">
                      Lowest price is forecast on <strong>{bestBuy.date}</strong> (₹{bestBuy.price?.toFixed(2)}/q). Waiting could save you money.
                    </div>
                  </div>
                </div>
              )}

              <div className="cd-stats">
                <div className="cd-stat">
                  <div className="cd-stat-label"><BadgeIndianRupee size={13} /> Price Today</div>
<div className="cd-stat-value">₹{(forecastData.current_price / 100).toFixed(2)}<small>/kg</small></div>
                  <div className={"cd-stat-sub " + trendDir}>
                    {trendDir === "up" && "↑ Rising trend"}
                    {trendDir === "down" && "↓ Falling trend"}
                    {trendDir === "flat" && "→ Stable trend"}
                  </div>
                </div>
                <div className="cd-stat">
                  <div className="cd-stat-label"><TrendingDown size={13} /> Lowest Forecast</div>
<div className="cd-stat-value" style={{ color: "#4ade80" }}>₹{(bestBuy?.price / 100).toFixed(2)}<small>/kg</small></div>                  <div className="cd-stat-sub down">on {bestBuy?.date}</div>
                </div>
                <div className="cd-stat">
                  <div className="cd-stat-label">
                    {mood === "bullish" ? <TrendingUp size={13} /> : mood === "bearish" ? <TrendingDown size={13} /> : <Minus size={13} />}
                    Market Mood
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div className={"cd-mood " + mood}>{moodLabel[mood]}</div>
                  </div>
                  <div className="cd-stat-sub" style={{ marginTop: 10 }}>
                    {/* FIX: Access the signal property specifically */}
                    {typeof forecastData.recommendation === 'object' 
                      ? forecastData.recommendation.signal 
                      : forecastData.recommendation || "—"}
                  </div>
                </div>
              </div>

              <div className="cd-chart-card">
                <div className="cd-chart-header">
                  <div>
                    <div className="cd-chart-title">7-Day Price Forecast — {forecastData.commodity || commodity}</div>
                    <div className="cd-chart-sub">{forecastData.market || market} · prices in ₹/quintal</div>
                  </div>
                  {bestBuy && (
                    <div className="cd-bestbuy"><CalendarDays size={13} /> Best buy: {bestBuy.date}</div>
                  )}
                </div>
                <div style={{ height: 240 }}>
                  <PriceTrendChart data={forecastData.forecast} bestBuyDate={bestBuy?.date} />
                </div>
              </div>

              <div className="cd-chart-card" style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "var(--text-hi)" }}>Daily Breakdown</div>
                <div style={{ overflowX: "auto" }}>
                  <table className="cd-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Forecast Price</th>
                        <th>vs Today</th>
                        <th>Tip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.forecast?.map((row, i) => {
                        const isBest = row.date === bestBuy?.date;
                        const delta  = ((row.price - forecastData.current_price) / forecastData.current_price * 100);
                        return (
                          <tr key={i} className={isBest ? "is-best" : ""}>
                            <td>
                              {row.date}
                              {isBest && <span style={{ marginLeft: 6, fontSize: 11, color: "#4ade80", fontWeight: 700 }}>← best</span>}
                            </td>
                            <td className={"cd-price-cell " + (isBest ? "best" : "")}>₹{(row.price / 100).toFixed(2)}</td>
                            <td style={{ color: delta > 0 ? "#f87171" : delta < 0 ? "#4ade80" : "#fbbf24", fontFamily: "monospace", fontSize: 12 }}>
                              {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
                            </td>
                            <td style={{ fontSize: 12 }}>
                              {delta <= -2 ? "✅ Good to buy" : delta >= 2 ? "⚠️ Prices rising" : "→ Steady"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="cd-meta">
                <div className="cd-meta-item"><div className="cd-meta-dot" /> Source: <span>{forecastData.data_source || "—"}</span></div>
                <div className="cd-meta-item"><Clock size={12} /> Generated: <span>{forecastData.generated_at ? new Date(forecastData.generated_at).toLocaleString("en-IN") : "—"}</span></div>
                <div className="cd-meta-item"><Database size={12} /> Model: <span>Prophet AI Forecast</span></div>
              </div>
            </>
          )}

          {!forecastData && !loading && !error && (
            <div className="cd-empty">
              <div className="cd-empty-icon">🥦</div>
              <h3>Search for a vegetable to begin</h3>
              <p>Select a vegetable and APMC market above to get a 7-day AI-powered price forecast.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;

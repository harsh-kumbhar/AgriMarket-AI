import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
    Area, AreaChart,
} from "recharts";
import {
    ArrowLeft, Truck, MapPin, TrendingUp, TrendingDown,
    Store, Calculator, CalendarDays
} from "lucide-react";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import { DISTRICT_MARKET_MAP } from "../utils/marketData";

const font = "'Sora', sans-serif";
const mono = "'JetBrains Mono', monospace";

const css = `
  .fd-root { min-height: 100vh; background: #060e0a; color: #f0fdf4; font-family: ${font}; padding-bottom: 64px; }
  .fd-nav { background: rgba(6,14,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(74,222,128,0.1); display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 72px; position: sticky; top: 0; z-index: 100; }
  .fd-btn { background: rgba(74,222,128,0.05); border: 1px solid rgba(74,222,128,0.15); color: #4ade80; padding: 8px 16px; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; font-family: ${font}; font-size: 13px; }
  .fd-btn:hover { background: rgba(74,222,128,0.15); border-color: #4ade80; }
  
  .fd-tab-nav { display: flex; background: #0d1a12; border: 1px solid rgba(74,222,128,0.15); border-radius: 12px; padding: 4px; }
  .fd-tab { padding: 8px 24px; border-radius: 8px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; background: transparent; color: rgba(240,253,244,0.5); display: flex; align-items: center; gap: 6px; font-family: ${font}; }
  .fd-tab.active { background: #4ade80; color: #060e0a; box-shadow: 0 2px 10px rgba(74,222,128,0.2); }
  
  .fd-card { background: #0d1a12; border-radius: 28px; padding: 32px; border: 1px solid rgba(74,222,128,0.1); position: relative; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.2); }
  .fd-card.highlight { border-bottom: 4px solid #4ade80; }
  .fd-card.danger { border-bottom: 4px solid #f87171; }
  
  .fd-label { font-size: 11px; font-weight: 700; color: rgba(240,253,244,0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
  
  .fd-input { width: 100%; padding: 14px 16px; background: #132018; border: 1px solid rgba(74,222,128,0.2); border-radius: 14px; color: #4ade80; font-family: ${mono}; font-size: 16px; font-weight: 700; outline: none; transition: all 0.2s; }
  .fd-input:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.15); }
  .fd-select { width: 100%; padding: 14px 16px; background: #132018; border: 1px solid rgba(74,222,128,0.2); border-radius: 14px; color: #fff; font-family: ${font}; font-size: 14px; font-weight: 600; outline: none; appearance: none; cursor: pointer; transition: all 0.2s; }
  .fd-select:focus { border-color: #4ade80; }
  .fd-select option { background: #0d1a12; color: #fff; }
  
  .fd-value-lg { font-size: 48px; font-weight: 800; letter-spacing: -2px; line-height: 1; }
  .fd-mono { font-family: ${mono}; }
  .animate-fade-in { animation: fadeIn 0.4s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;

const CustomTooltip = ({ active, payload, label, unit }) => {
    if (!active || !payload?.length) return null;
    const price = payload[0]?.value;
    return (
        <div style={{ background: "#132018", borderRadius: 12, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", fontFamily: font, border: "1px solid rgba(74,222,128,0.2)" }}>
            <div style={{ fontSize: 11, color: "rgba(240,253,244,0.5)", marginBottom: 4, fontWeight: 600 }}>{label}</div>
            <div className="fd-mono" style={{ fontSize: 18, fontWeight: 700, color: "#4ade80" }}>
                ₹{price?.toFixed(0)} <span style={{ fontSize: 12, color: "rgba(240,253,244,0.4)", marginLeft: 4, fontFamily: font }}>{unit === "kg" ? "/kg" : "/q"}</span>
            </div>
        </div>
    );
};

const LoadingScreen = ({ crop }) => (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#060e0a", fontFamily: font, gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid #4ade80`, borderTopColor: "transparent", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Analyzing {crop} market logic...</div>
            <div style={{ fontSize: 13, color: "rgba(240,253,244,0.5)", marginTop: 4 }}>Running Prophet AI Engine</div>
        </div>
    </div>
);

export default function FarmerDashboard({ userPrefs, onBack }) {
    const [mainData, setMainData] = useState(null);
    const [nearbyData, setNearbyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [unit, setUnit] = useState(userPrefs?.unit || "quintal");
    const [activeTab, setActiveTab] = useState("forecast");

    const [harvestQty, setHarvestQty] = useState(50);
    const [transportCost, setTransportCost] = useState(25);
    const [distance, setDistance] = useState(40);
    const [targetMarket, setTargetMarket] = useState("");

    const px = unit === "kg" ? 0.01 : 1;
    const ul = unit === "kg" ? "/kg" : "/q";

    const fetchAll = async () => {
        setLoading(true); setError(null);
        try {
            const main = await axios.get(`http://localhost:5000/forecast?commodity=${userPrefs.crop}&market=${userPrefs.market}`);
            setMainData(main.data);

            const nearby = (DISTRICT_MARKET_MAP[userPrefs.district] || []).filter(m => m !== userPrefs.market);
            const results = await Promise.allSettled(
                nearby.map(m => axios.get(`http://localhost:5000/forecast?commodity=${userPrefs.crop}&market=${m}`))
            );
            const validNearby = results.filter(r => r.status === "fulfilled" && r.value.data.status === "success").map(r => r.value.data);
            setNearbyData(validNearby);

            if (validNearby.length > 0) {
                const sorted = [...validNearby].sort((a, b) => b.current_mandi_price - a.current_mandi_price);
                setTargetMarket(sorted[0].market);
            }
        } catch {
            setError("Server connection failed. Please ensure the Flask backend is active.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, [userPrefs]);

    if (loading) return <LoadingScreen crop={userPrefs?.crop} />;
    if (error) return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#060e0a", fontFamily: font, gap: 16 }}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <div style={{ fontSize: 16, color: "#f87171", fontWeight: 600 }}>{error}</div>
            <button onClick={onBack} className="fd-btn" style={{ marginTop: 12 }}>← Return to Setup</button>
        </div>
    );

    const rec = mainData?.recommendation;
    const isKeep = rec?.signal === "KEEP";

    const chartData = (mainData?.forecast || []).map(d => ({
        date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        price: +(d.mandi_price_q * px).toFixed(2),
    }));

    const minPrice = Math.min(...chartData.map(d => d.price));
    const maxPrice = Math.max(...chartData.map(d => d.price));
    const trend = chartData.length > 1 ? chartData[chartData.length - 1].price - chartData[0].price : 0;

    let daysToPeak = 0;
    if (isKeep && rec?.best_day) {
        const diffTime = Math.abs(new Date(rec.best_day) - new Date());
        daysToPeak = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    const peakDayFormatted = rec?.best_day ? new Date(rec.best_day).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : null;

    const basePrice = mainData?.current_mandi_price || 0;
    const allMarkets = [
        { ...mainData, isMain: true, diff: 0 },
        ...nearbyData.map(m => ({ ...m, isMain: false, diff: m.current_mandi_price - basePrice }))
    ].sort((a, b) => b.current_mandi_price - a.current_mandi_price);
    const bestMarket = allMarkets[0];

    // Calculator Logic
    const selectedTargetData = nearbyData.find(m => m.market === targetMarket);
    const targetPrice = selectedTargetData?.current_mandi_price || 0;

    const localRevenue = basePrice * harvestQty;
    const targetRevenue = targetPrice * harvestQty;
    const totalTransportCost = distance * transportCost;
    const targetNetProfit = targetRevenue - totalTransportCost;
    const profitDifference = targetNetProfit - localRevenue;
    const isWorthTrip = profitDifference > 0;

    return (
        <>
            <style>{css}</style>
            <div className="fd-root">
                <div style={{ position: 'fixed', inset: 0, opacity: 0.03, pointerEvents: 'none', zIndex: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")` }} />

                <nav className="fd-nav">
                    <button onClick={onBack} className="fd-btn"><ArrowLeft size={16} /> Exit</button>

                    <div className="fd-tab-nav">
                        <button onClick={() => setActiveTab("forecast")} className={`fd-tab ${activeTab === "forecast" ? "active" : ""}`}>
                            <TrendingUp size={16} /> Forecast
                        </button>
                        <button onClick={() => setActiveTab("logistics")} className={`fd-tab ${activeTab === "logistics" ? "active" : ""}`}>
                            <Truck size={16} /> Logistics
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ textAlign: "right", display: "none", "@media(minWidth: 768px)": { display: "block" } }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{userPrefs.crop} • {userPrefs.market}</div>
                        </div>
                        <button onClick={() => setUnit(unit === "kg" ? "quintal" : "kg")} style={{ background: "#fbbf24", color: "#060e0a", padding: "8px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: font }}>
                            {unit === "kg" ? "₹ / KG" : "₹ / QUINTAL"} ⇄
                        </button>
                    </div>
                </nav>

                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

                    {/* ── TAB 1: FORECAST ── */}
                    {activeTab === "forecast" && (
                        <div className="animate-fade-in">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

                                <div className={`fd-card ${isKeep ? 'highlight' : 'danger'}`}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                                        <div className="fd-label">AI Market Signal</div>
                                        <span style={{ padding: "6px 12px", borderRadius: 20, background: isKeep ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)", color: isKeep ? "#4ade80" : "#f87171", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                                            {isKeep ? "POTENTIAL GAIN" : "PEAK REACHED"}
                                        </span>
                                    </div>
                                    <div className="fd-value-lg" style={{ color: isKeep ? "#4ade80" : "#f87171", marginBottom: 12 }}>
                                        {isKeep ? "HOLD" : "SELL"}
                                    </div>
                                    <div style={{ fontSize: 14, color: "rgba(240,253,244,0.6)", lineHeight: 1.6, marginBottom: 24 }}>
                                        {isKeep ? `Market is rising. Peak profit expected around ${peakDayFormatted}.` : "Market prices are at their peak. Sell immediately before drop."}
                                    </div>

                                    {isKeep && (
                                        <div style={{ background: "#132018", borderRadius: 16, padding: "16px", border: "1px solid rgba(74,222,128,0.1)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 12 }}>
                                                <span>Urgency Tracker</span>
                                                <span>{daysToPeak} Days Left</span>
                                            </div>
                                            <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                                                <div style={{ width: `${Math.max(10, 100 - (daysToPeak * 14))}%`, height: "100%", background: "#4ade80", borderRadius: 4, transition: "width 1s ease" }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="fd-card" style={{ background: "linear-gradient(135deg, #0d1a12 0%, #132018 100%)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                    <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "rgba(74,222,128,0.03)", borderRadius: "50%" }} />
                                    <div style={{ position: "relative", zIndex: 1 }}>
                                        <div className="fd-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <MapPin size={14} /> {mainData?.market} (Your Mandi)
                                        </div>
                                        <div className="fd-value-lg fd-mono" style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                                            ₹{(mainData?.current_mandi_price * px).toFixed(unit === "kg" ? 2 : 0)}
                                            <span style={{ fontSize: 18, color: "rgba(240,253,244,0.4)", fontWeight: 500, letterSpacing: 0, fontFamily: font }}>/{unit}</span>
                                        </div>
                                        <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, fontSize: 13, color: trend >= 0 ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                                            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            {trend >= 0 ? "+" : ""}{trend.toFixed(2)} trend this week
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="fd-card" style={{ marginBottom: 24, padding: "28px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                                        <Store size={20} color="#fbbf24" /> Nearby Mandi Arbitrage
                                    </h3>
                                    <span style={{ fontSize: 12, color: "rgba(240,253,244,0.5)", fontWeight: 600 }}>Comparing {nearbyData.length} markets</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                                    {allMarkets.filter(m => !m.isMain).slice(0, 5).map((m, i) => {
                                        const isPos = m.diff > 0;
                                        return (
                                            <div key={i} style={{ padding: "20px", borderRadius: 16, border: `1px solid ${isPos ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.05)'}`, background: isPos ? 'rgba(74,222,128,0.05)' : '#132018', position: "relative" }}>
                                                {i === 0 && isPos && <div style={{ position: "absolute", top: -10, right: 16, background: "#fbbf24", color: "#060e0a", fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 12 }}>HIGHEST PAYOUT</div>}
                                                <div style={{ fontSize: 12, color: "rgba(240,253,244,0.6)", fontWeight: 600, marginBottom: 8 }}>{m.market.split("(")[0]}</div>
                                                <div className="fd-mono" style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>₹{(m.current_mandi_price * px).toFixed(0)}</div>
                                                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: isPos ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
                                                    {isPos ? "▲" : "▼"} ₹{Math.abs(m.diff * px).toFixed(0)} {isPos ? "more" : "less"}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="fd-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>7-Day AI Price Forecast</h3>
                                        <p style={{ fontSize: 12, color: "rgba(240,253,244,0.5)", marginTop: 4 }}>Projected Mandi Rates for {userPrefs.crop}</p>
                                    </div>
                                </div>
                                <div style={{ height: 300, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} /><stop offset="95%" stopColor="#4ade80" stopOpacity={0} /></linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "rgba(240,253,244,0.5)", fontSize: 11 }} dy={15} />
                                            <YAxis hide domain={["auto", "auto"]} />
                                            <Tooltip content={<CustomTooltip unit={unit} />} />
                                            {isKeep && peakDayFormatted && <ReferenceLine x={peakDayFormatted} stroke="#fbbf24" strokeDasharray="5 5" label={{ position: 'top', value: 'PROFIT PEAK', fill: "#fbbf24", fontSize: 10, fontWeight: 700 }} />}
                                            <Area type="monotone" dataKey="price" stroke="#4ade80" strokeWidth={4} fill="url(#chartFill)" dot={{ r: 6, fill: "#22c55e", stroke: "#060e0a", strokeWidth: 3 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB 2: LOGISTICS ── */}
                    {activeTab === "logistics" && (
                        <div className="animate-fade-in">
                            <div className="fd-card" style={{ padding: "40px" }}>
                                <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
                                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 20, background: "rgba(74,222,128,0.15)", color: "#4ade80", marginBottom: 16 }}>
                                        <Truck size={32} />
                                    </div>
                                    <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: -1 }}>Farm-to-Mandi Profit Planner</h2>
                                    <p style={{ fontSize: 14, color: "rgba(240,253,244,0.6)", lineHeight: 1.6 }}>A nearby market might pay more, but is it worth the diesel cost? Calculate your actual net profit after transportation expenses.</p>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 40, alignItems: "start" }}>
                                    {/* Inputs */}
                                    <div style={{ background: "#132018", borderRadius: 24, padding: "32px", border: "1px solid rgba(74,222,128,0.1)" }}>
                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 1, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}><Calculator size={16} /> Transport Details</h4>

                                        <div style={{ marginBottom: 20 }}>
                                            <label className="fd-label">Total Harvest Quantity (Quintals)</label>
                                            <input type="number" className="fd-input" value={harvestQty} onChange={e => setHarvestQty(Number(e.target.value))} />
                                        </div>
                                        <div style={{ marginBottom: 20 }}>
                                            <label className="fd-label">Target Market (For Arbitrage)</label>
                                            <select className="fd-select" value={targetMarket} onChange={e => setTargetMarket(e.target.value)}>
                                                {nearbyData.map(m => <option key={m.market} value={m.market}>{m.market} (₹{m.current_mandi_price}/q)</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                            <div>
                                                <label className="fd-label">Distance (km)</label>
                                                <input type="number" className="fd-input" value={distance} onChange={e => setDistance(Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="fd-label">Transport Cost (₹/km)</label>
                                                <input type="number" className="fd-input" value={transportCost} onChange={e => setTransportCost(Number(e.target.value))} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Outputs */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                            <div style={{ background: "#132018", borderRadius: 20, padding: "24px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                <div className="fd-label">Selling Locally</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(240,253,244,0.8)", marginBottom: 12 }}>{mainData?.market}</div>
                                                <div className="fd-value-lg fd-mono">₹{localRevenue.toLocaleString('en-IN')}</div>
                                                <div style={{ fontSize: 12, color: "rgba(240,253,244,0.4)", marginTop: 8 }}>No transport cost</div>
                                            </div>

                                            <div style={{ background: "rgba(74,222,128,0.05)", borderRadius: 20, padding: "24px", border: "1px solid rgba(74,222,128,0.3)" }}>
                                                <div className="fd-label" style={{ color: "#4ade80" }}>Selling at Target</div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{targetMarket.split("(")[0]}</div>
                                                <div className="fd-value-lg fd-mono" style={{ color: "#4ade80" }}>₹{targetRevenue.toLocaleString('en-IN')}</div>
                                                <div style={{ fontSize: 12, color: "#f87171", marginTop: 8, fontWeight: 600 }}>- ₹{totalTransportCost.toLocaleString('en-IN')} Fuel</div>
                                            </div>
                                        </div>

                                        <div style={{ background: isWorthTrip ? "#22c55e" : "#132018", border: isWorthTrip ? "none" : "1px solid rgba(248,113,113,0.3)", borderRadius: 24, padding: "32px", color: isWorthTrip ? "#060e0a" : "#fff", marginTop: 16, textAlign: "center", boxShadow: isWorthTrip ? "0 20px 40px rgba(34,197,94,0.2)" : "none" }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: isWorthTrip ? "rgba(0,0,0,0.6)" : "#f87171", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                                                Final Verdict
                                            </div>
                                            <div className="fd-mono" style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>
                                                {isWorthTrip ? `+ ₹${profitDifference.toLocaleString('en-IN')}` : `- ₹${Math.abs(profitDifference).toLocaleString('en-IN')}`}
                                            </div>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: isWorthTrip ? "rgba(0,0,0,0.7)" : "rgba(240,253,244,0.6)" }}>
                                                {isWorthTrip
                                                    ? `Traveling to ${targetMarket.split("(")[0]} yields more profit even after fuel costs.`
                                                    : `Stay local! The transport cost destroys the profit margin for traveling to ${targetMarket.split("(")[0]}.`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
import { useState, useEffect } from "react";
import axios from "axios";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
    Area, AreaChart,
} from "recharts";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import { DISTRICT_MARKET_MAP } from "../utils/marketData";

const C = {
    forest: "#1a3a2a", leaf: "#2d6a4f", mint: "#52b788",
    cream: "#f8f4e8", gold: "#e9c46a", mist: "#f0ede4",
    charcoal: "#1c1c1e", red: "#e05c5c",
};

const font = "'Poppins', sans-serif";

const CustomTooltip = ({ active, payload, label, unit }) => {
    if (!active || !payload?.length) return null;
    const price = payload[0]?.value;
    return (
        <div style={{
            background: C.forest, borderRadius: 14, padding: "12px 18px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)", fontFamily: font,
            border: "1px solid rgba(82,183,136,0.2)"
        }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.mint }}>
                ₹{price?.toFixed(0)}
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>
                    {unit === "kg" ? "/kg" : "/q"}
                </span>
            </div>
        </div>
    );
};

const LoadingScreen = ({ crop }) => (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.cream, fontFamily: font, gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid ${C.mint}`, borderTopColor: "transparent", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.forest }}>Analyzing {crop} trends...</div>
            <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>Accessing Prophet AI Engine & Agmarknet Records</div>
        </div>
    </div>
);

export default function FarmerDashboard({ userPrefs, onBack }) {
    const [mainData, setMainData] = useState(null);
    const [nearbyData, setNearbyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unit, setUnit] = useState(userPrefs?.unit || "kg");
    const [error, setError] = useState(null);

    const px = unit === "kg" ? 0.01 : 1;
    const ul = unit === "kg" ? "/kg" : "/q";

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const main = await axios.get(`http://localhost:5000/forecast?commodity=${userPrefs.crop}&market=${userPrefs.district}`);
            setMainData(main.data);

            const nearby = DISTRICT_MARKET_MAP[userPrefs.district] || [];
            const results = await Promise.allSettled(
                nearby.map(m => axios.get(`http://localhost:5000/forecast?commodity=${userPrefs.crop}&market=${m}`))
            );
            setNearbyData(results.filter(r => r.status === "fulfilled" && r.value.data.status === "success").map(r => r.value.data));
        } catch {
            setError("Server connection failed. Please ensure the Flask backend is active.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, [userPrefs]);

    if (loading) return <LoadingScreen crop={userPrefs?.crop} />;
    if (error) return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.cream, fontFamily: font, gap: 16 }}>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <div style={{ fontSize: 16, color: C.forest, fontWeight: 600 }}>{error}</div>
            <button onClick={onBack} style={{ padding: "12px 32px", background: C.forest, color: "#fff", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>← Return to Setup</button>
        </div>
    );

    const rec = mainData?.recommendation;
    const isKeep = rec?.signal === "KEEP";

    const chartData = (mainData?.forecast || []).map(d => ({
        date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        price: +(d.price * px).toFixed(2),
        lower: +(d.price_lower * px).toFixed(2),
        upper: +(d.price_upper * px).toFixed(2),
    }));

    const minPrice = Math.min(...chartData.map(d => d.price));
    const maxPrice = Math.max(...chartData.map(d => d.price));
    const trend = chartData.length > 1 ? chartData[chartData.length - 1].price - chartData[0].price : 0;
    const peakDayFormatted = rec?.best_day ? new Date(rec.best_day).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : null;

    const allMarkets = [
        ...(mainData ? [{ ...mainData, isMain: true }] : []),
        ...nearbyData,
    ].sort((a, b) => b.current_price - a.current_price);

    const bestMarket = allMarkets[0];

    return (
        <div style={{ minHeight: "100vh", background: C.cream, fontFamily: font, color: C.charcoal, paddingBottom: 64, position: 'relative' }}>
            <div style={{ position: 'fixed', inset: 0, opacity: 0.04, pointerEvents: 'none', zIndex: 9999, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")` }} />

            <nav style={{ background: C.forest, padding: "0 48px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 30px rgba(0,0,0,0.15)", borderBottom: "1px solid rgba(82,183,136,0.1)" }}>
                <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontFamily: font, fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 10 }}>← Exit Dashboard</button>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{userPrefs.crop} Intelligence</div>
                    <div style={{ fontSize: 11, color: C.mint, fontWeight: 500 }}>{userPrefs.district} DISTRICT · MAHARASHTRA</div>
                </div>
                <button onClick={() => setUnit(unit === "kg" ? "quintal" : "kg")} style={{ background: C.mint, color: C.forest, padding: "8px 24px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: font }}>VIEW IN {unit === "kg" ? "QUINTAL" : "KG"}</button>
            </nav>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
                {/* Top Row: Best Market Arbitrage Highlight */}
                <div style={{ background: "linear-gradient(90deg, #1a3a2a, #2d6a4f)", borderRadius: 24, padding: "20px 32px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 30px rgba(26,58,42,0.15)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 32 }}>🏪</span>
                        <div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 1 }}>SMART ARBITRAGE</div>
                            <div style={{ color: "#fff", fontWeight: 700 }}>Highest price currently at <span style={{ color: C.gold }}>{bestMarket?.market}</span></div>
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>₹{(bestMarket?.current_price * px).toFixed(2)}<span style={{ fontSize: 14, opacity: 0.6 }}>{ul}</span></div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ background: "#fff", borderRadius: 28, padding: "32px", borderBottom: `8px solid ${isKeep ? C.mint : C.red}`, boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginBottom: 16 }}>AI Market Signal</div>
                            <div style={{ fontSize: 48, fontWeight: 800, color: isKeep ? C.leaf : C.red, marginBottom: 12, lineHeight: 1 }}>{isKeep ? "HOLD" : "SELL"}</div>
                            <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{isKeep ? `Wait for the peak arrival on ${peakDayFormatted}.` : "Market prices are at their peak. Sell now."}</div>
                        </div>

                        <div style={{ background: C.forest, borderRadius: 28, padding: "32px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(26,58,42,0.2)" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Live Rate</div>
                            <div style={{ fontSize: 40, fontWeight: 800 }}>₹{(mainData?.current_price * px).toFixed(unit === "kg" ? 2 : 0)}<span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>/{unit}</span></div>
                            <div style={{ marginTop: 12, fontSize: 12, color: trend >= 0 ? C.mint : C.red, fontWeight: 700 }}>
                                {trend >= 0 ? "📈" : "📉"} {trend >= 0 ? "+" : ""}{trend.toFixed(2)} trend this week
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "#fff", borderRadius: 28, padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.forest }}>7-Day Smart Forecast</h3>
                            <div style={{ display: "flex", gap: 20 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: "#bbb", fontWeight: 700 }}>WEEKLY LOW</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: C.red }}>₹{minPrice.toFixed(0)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: "#bbb", fontWeight: 700 }}>WEEKLY HIGH</div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: C.mint }}>₹{maxPrice.toFixed(0)}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 280, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.mint} stopOpacity={0.2} /><stop offset="95%" stopColor={C.mint} stopOpacity={0} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#bbb", fontSize: 11 }} dy={15} />
                                    <YAxis hide domain={["auto", "auto"]} />
                                    <Tooltip content={<CustomTooltip unit={unit} />} />
                                    {isKeep && peakDayFormatted && <ReferenceLine x={peakDayFormatted} stroke={C.gold} strokeDasharray="5 5" label={{ position: 'top', value: 'PROFIT PEAK', fill: C.gold, fontSize: 10, fontWeight: 700 }} />}
                                    <Area type="monotone" dataKey="price" stroke={C.leaf} strokeWidth={4} fill="url(#chartFill)" dot={{ r: 6, fill: C.mint, stroke: "#fff", strokeWidth: 3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div style={{ background: "#fff", borderRadius: 28, padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: C.forest, marginBottom: 24 }}>Daily Prediction Breakdown</h3>
                    <div style={{ overflow: "hidden", borderRadius: 16, border: "1px solid #f0f0f0" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "#fafafa" }}>
                                    {["Date", "Predicted Rate", "Price Range", "Market Signal"].map(h => (
                                        <th key={h} style={{ padding: "16px 24px", fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row, i) => {
                                    const isPeak = row.date === peakDayFormatted;
                                    return (
                                        <tr key={i} style={{ borderTop: "1px solid #f8f8f8", background: isPeak ? "rgba(233,196,106,0.05)" : "#fff" }}>
                                            <td style={{ padding: "18px 24px" }}><div style={{ fontSize: 14, fontWeight: 700, color: C.forest }}>{row.date} {isPeak && "⭐"}</div></td>
                                            <td style={{ padding: "18px 24px" }}><div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal }}>₹{row.price} <span style={{ fontSize: 12, color: '#ccc' }}>{ul}</span></div></td>
                                            <td style={{ padding: "18px 24px" }}><div style={{ fontSize: 12, color: "#999" }}>₹{row.lower} - ₹{row.upper}</div></td>
                                            <td style={{ padding: "18px 24px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 100, background: isPeak ? C.gold : "rgba(0,0,0,0.03)", color: isPeak ? C.forest : "#777" }}>{isPeak ? "PROFIT PEAK" : "STABLE"}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
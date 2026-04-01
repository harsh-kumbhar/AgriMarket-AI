import { useState } from "react";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import { CROPS, DISTRICTS } from "../utils/marketData";

const S = {
    overlay: {
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(26,58,42,0.92)", backdropFilter: "blur(8px)", padding: 24,
    },
    card: {
        background: "#fff", width: "100%", maxWidth: 460,
        borderRadius: 28, overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
    },
    header: {
        background: "linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%)",
        padding: "40px 40px 32px",
        position: "relative", overflow: "hidden",
    },
    headerBg: {
        position: "absolute", top: -40, right: -40,
        width: 160, height: 160,
        background: "rgba(82,183,136,0.12)",
        borderRadius: "50%",
    },
    headerBg2: {
        position: "absolute", bottom: -20, left: -20,
        width: 100, height: 100,
        background: "rgba(233,196,106,0.08)",
        borderRadius: "50%",
    },
    iconWrap: {
        width: 64, height: 64, borderRadius: 18,
        background: "rgba(82,183,136,0.2)",
        border: "1px solid rgba(82,183,136,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 30, marginBottom: 16, position: "relative", zIndex: 1,
    },
    headerTitle: {
        fontSize: 26, fontWeight: 700, color: "#fff",
        margin: "0 0 6px", letterSpacing: -0.5, position: "relative", zIndex: 1,
    },
    headerSub: {
        fontSize: 13, color: "rgba(255,255,255,0.55)",
        margin: 0, position: "relative", zIndex: 1, fontWeight: 400,
    },
    steps: {
        display: "flex", gap: 6, marginTop: 24, position: "relative", zIndex: 1,
    },
    stepDot: (active) => ({
        height: 3, borderRadius: 10, transition: "all 0.3s",
        background: active ? "#52b788" : "rgba(255,255,255,0.2)",
        flex: active ? 2 : 1,
    }),
    body: { padding: "32px 40px 40px" },
    label: {
        display: "flex", alignItems: "center", gap: 8,
        fontSize: 12, fontWeight: 600, color: "#555",
        letterSpacing: 0.8, textTransform: "uppercase",
        marginBottom: 10,
    },
    labelIcon: { fontSize: 14 },
    selectWrap: { position: "relative", marginBottom: 24 },
    select: {
        width: "100%", padding: "14px 44px 14px 16px",
        border: "2px solid #eee", borderRadius: 14,
        fontSize: 15, fontWeight: 500, color: "#1c1c1e",
        fontFamily: "'Poppins', sans-serif",
        background: "#fafafa", outline: "none",
        appearance: "none", cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
    },
    selectArrow: {
        position: "absolute", right: 16, top: "50%",
        transform: "translateY(-50%)",
        color: "#aaa", fontSize: 12, pointerEvents: "none",
    },
    unitSection: {
        background: "#f8f8f8", borderRadius: 16,
        padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 28, border: "1px solid #f0f0f0",
    },
    unitLabel: { fontSize: 13, fontWeight: 600, color: "#444" },
    unitSub: { fontSize: 11, color: "#aaa", marginTop: 2 },
    unitToggle: {
        display: "flex", background: "#e8e8e8",
        borderRadius: 10, padding: 3, gap: 2,
    },
    unitBtn: (active) => ({
        padding: "6px 18px", borderRadius: 8,
        fontSize: 12, fontWeight: 700,
        border: "none", cursor: "pointer",
        fontFamily: "'Poppins', sans-serif",
        transition: "all 0.2s",
        background: active ? "#fff" : "transparent",
        color: active ? "#1a3a2a" : "#888",
        boxShadow: active ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
    }),
    submitBtn: {
        width: "100%", padding: "16px",
        background: "linear-gradient(135deg, #2d6a4f, #1a3a2a)",
        color: "#fff", border: "none", borderRadius: 16,
        fontSize: 15, fontWeight: 700,
        fontFamily: "'Poppins', sans-serif",
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", gap: 10,
        transition: "all 0.25s",
        boxShadow: "0 8px 24px rgba(26,58,42,0.35)",
        letterSpacing: 0.3,
    },
    cropGrid: {
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8, marginBottom: 24,
    },
    cropBtn: (active) => ({
        padding: "10px 4px", borderRadius: 12,
        border: active ? "2px solid #52b788" : "2px solid #eee",
        background: active ? "rgba(82,183,136,0.08)" : "#fafafa",
        cursor: "pointer", textAlign: "center",
        fontFamily: "'Poppins', sans-serif",
        transition: "all 0.2s",
    }),
    cropEmoji: { fontSize: 20, display: "block", marginBottom: 4 },
    cropName: (active) => ({
        fontSize: 11, fontWeight: 600,
        color: active ? "#2d6a4f" : "#888",
    }),
};

const CROP_EMOJIS = {
    Onion: "🧅", Tomato: "🍅", Potato: "🥔", Garlic: "🧄",
    Wheat: "🌾", Maize: "🌽", Capsicum: "🫑", Brinjal: "🍆",
};

export default function FarmerOnboarding({ onComplete }) {
    const [form, setForm] = useState({ crop: "Onion", district: "Pune", unit: "kg" });
    const [hoverBtn, setHoverBtn] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onComplete(form);
    };

    return (
        <div style={S.overlay}>
            <div style={S.card}>

                {/* ── Header ── */}
                <div style={S.header}>
                    <div style={S.headerBg} />
                    <div style={S.headerBg2} />
                    <div style={S.iconWrap}>🌾</div>
                    <h2 style={S.headerTitle}>Farmer Setup</h2>
                    <p style={S.headerSub}>Personalize your mandi intelligence dashboard</p>
                    <div style={S.steps}>
                        <div style={S.stepDot(true)} />
                        <div style={S.stepDot(true)} />
                        <div style={S.stepDot(false)} />
                    </div>
                </div>

                {/* ── Body ── */}
                <form onSubmit={handleSubmit} style={S.body}>

                    {/* Crop Grid */}
                    <div style={S.label}>
                        <span style={S.labelIcon}>🌱</span> What do you grow?
                    </div>
                    <div style={S.cropGrid}>
                        {CROPS.map(c => (
                            <button
                                key={c} type="button"
                                style={S.cropBtn(form.crop === c)}
                                onClick={() => setForm({ ...form, crop: c })}
                            >
                                <span style={S.cropEmoji}>{CROP_EMOJIS[c]}</span>
                                <span style={S.cropName(form.crop === c)}>{c}</span>
                            </button>
                        ))}
                    </div>

                    {/* District Select */}
                    <div style={S.label}>
                        <span style={S.labelIcon}>📍</span> Your District
                    </div>
                    <div style={S.selectWrap}>
                        <select
                            style={S.select}
                            value={form.district}
                            onChange={e => setForm({ ...form, district: e.target.value })}
                            onFocus={e => { e.target.style.borderColor = "#52b788"; e.target.style.boxShadow = "0 0 0 3px rgba(82,183,136,0.15)"; }}
                            onBlur={e => { e.target.style.borderColor = "#eee"; e.target.style.boxShadow = "none"; }}
                        >
                            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <span style={S.selectArrow}>▼</span>
                    </div>

                    {/* Unit Toggle */}
                    <div style={S.unitSection}>
                        <div>
                            <div style={S.unitLabel}>Preferred Price Unit</div>
                            <div style={S.unitSub}>How you want to see prices</div>
                        </div>
                        <div style={S.unitToggle}>
                            {["kg", "quintal"].map(u => (
                                <button
                                    key={u} type="button"
                                    style={S.unitBtn(form.unit === u)}
                                    onClick={() => setForm({ ...form, unit: u })}
                                >
                                    {u === "kg" ? "₹/kg" : "₹/q"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        style={{ ...S.submitBtn, ...(hoverBtn ? { transform: "translateY(-2px)", boxShadow: "0 12px 32px rgba(26,58,42,0.45)" } : {}) }}
                        onMouseEnter={() => setHoverBtn(true)}
                        onMouseLeave={() => setHoverBtn(false)}
                    >
                        <span>Get Market Insights</span>
                        <span style={{ fontSize: 18 }}>→</span>
                    </button>

                </form>
            </div>
        </div>
    );
}
import React, { useState, useEffect } from "react";
import { Leaf, MapPin, Scale, ArrowRight, Store } from "lucide-react";
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/jetbrains-mono/500.css";
// Importing your existing map so the Mandi dropdown works automatically!
import { DISTRICT_MARKET_MAP } from "../utils/marketData";

// ── EXPANDED CROP DATABASE (30+ Crops) ──────────────────────────────────────
const EXPANDED_CROPS = [
    { name: "Onion", emoji: "🧅" }, { name: "Tomato", emoji: "🍅" }, { name: "Potato", emoji: "🥔" },
    { name: "Garlic", emoji: "🧄" }, { name: "Cabbage", emoji: "🥬" }, { name: "Cauliflower", emoji: "🥦" },
    { name: "Carrot", emoji: "🥕" }, { name: "Brinjal", emoji: "🍆" }, { name: "Green Chilli", emoji: "🌶️" },
    { name: "Capsicum", emoji: "🫑" }, { name: "Wheat", emoji: "🌾" }, { name: "Maize", emoji: "🌽" },
    { name: "Soybean", emoji: "🫘" }, { name: "Cotton", emoji: "☁️" }, { name: "Ginger", emoji: "🫚" },
    { name: "Turmeric", emoji: "🏵️" }, { name: "Apple", emoji: "🍎" }, { name: "Banana", emoji: "🍌" },
    { name: "Grapes", emoji: "🍇" }, { name: "Mango", emoji: "🥭" }, { name: "Orange", emoji: "🍊" },
    { name: "Papaya", emoji: "🍈" }, { name: "Pomegranate", emoji: "🍎" }, { name: "Spinach", emoji: "🥬" },
    { name: "Fenugreek", emoji: "🌿" }, { name: "Coriander", emoji: "🌿" }, { name: "Cucumber", emoji: "🥒" },
    { name: "Pumpkin", emoji: "🎃" }, { name: "Radish", emoji: "🥕" }, { name: "Sweet Potato", emoji: "🍠" },
    { name: "Bitter Gourd", emoji: "🥒" }, { name: "Bottle Gourd", emoji: "🍐" }
];

const css = `
  .fo-overlay {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center;
    background: rgba(6, 14, 10, 0.95); backdrop-filter: blur(12px);
    padding: 24px; font-family: 'Sora', sans-serif; color: #f0fdf4;
  }
  .fo-card {
    background: #0d1a12; width: 100%; max-width: 520px;
    border-radius: 28px; border: 1px solid rgba(74,222,128,0.15);
    box-shadow: 0 32px 80px rgba(0,0,0,0.6); overflow: hidden;
    display: flex; flex-direction: column; max-height: 90vh;
  }
  .fo-header {
    background: linear-gradient(135deg, #0d1a12 0%, #132018 100%);
    padding: 32px 40px 24px; border-bottom: 1px solid rgba(74,222,128,0.1);
    position: relative; overflow: hidden; flex-shrink: 0;
  }
  .fo-header-glow {
    position: absolute; top: -50px; right: -50px; width: 150px; height: 150px;
    background: rgba(74,222,128,0.15); filter: blur(40px); border-radius: 50%;
  }
  .fo-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 6px; letter-spacing: -0.5px; }
  .fo-sub { font-size: 13px; color: rgba(240,253,244,0.6); font-weight: 400; line-height: 1.5; }
  
  .fo-body { padding: 32px 40px 40px; overflow-y: auto; }
  .fo-body::-webkit-scrollbar { width: 6px; }
  .fo-body::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.2); border-radius: 10px; }
  
  .fo-label {
    display: flex; align-items: center; gap: 8px; font-size: 11px;
    font-weight: 700; color: #4ade80; text-transform: uppercase;
    letter-spacing: 1px; margin-bottom: 12px;
  }
  
  /* Scrollable Crop Grid */
  .fo-crop-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
    max-height: 180px; overflow-y: auto; padding-right: 8px; margin-bottom: 32px;
  }
  .fo-crop-grid::-webkit-scrollbar { width: 4px; }
  .fo-crop-grid::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.2); border-radius: 10px; }
  
  .fo-crop-btn {
    background: #132018; border: 1px solid rgba(74,222,128,0.1);
    border-radius: 14px; padding: 12px 4px; cursor: pointer;
    transition: all 0.2s; display: flex; flex-direction: column; align-items: center;
    color: rgba(240,253,244,0.5); font-family: 'Sora', sans-serif;
  }
  .fo-crop-btn:hover { background: rgba(74,222,128,0.05); border-color: rgba(74,222,128,0.3); color: #fff; }
  .fo-crop-btn.active {
    background: rgba(74,222,128,0.15); border-color: #4ade80;
    color: #4ade80; box-shadow: 0 4px 16px rgba(74,222,128,0.15);
  }
  .fo-crop-emoji { font-size: 24px; margin-bottom: 6px; }
  .fo-crop-name { font-size: 10px; font-weight: 600; text-align: center; }

  /* Dropdowns */
  .fo-select-group { display: flex; gap: 16px; margin-bottom: 32px; }
  .fo-select-wrap { flex: 1; position: relative; }
  .fo-select {
    width: 100%; padding: 14px 16px; background: #132018;
    border: 1px solid rgba(74,222,128,0.2); border-radius: 14px;
    color: #fff; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 500;
    appearance: none; cursor: pointer; transition: all 0.2s; outline: none;
  }
  .fo-select:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.1); }
  .fo-select option { background: #0d1a12; color: #fff; }
  .fo-select:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Unit Toggle */
  .fo-unit-box {
    background: #132018; border: 1px solid rgba(74,222,128,0.1);
    border-radius: 16px; padding: 16px 20px; display: flex;
    align-items: center; justify-content: space-between; margin-bottom: 32px;
  }
  .fo-unit-text h4 { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 2px; }
  .fo-unit-text p { font-size: 11px; color: rgba(240,253,244,0.5); }
  .fo-unit-toggle { display: flex; background: #060e0a; border-radius: 10px; padding: 4px; }
  .fo-unit-btn {
    padding: 6px 16px; border-radius: 8px; border: none; font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: 'Sora', sans-serif;
  }
  .fo-unit-btn.active { background: #4ade80; color: #060e0a; }
  .fo-unit-btn:not(.active) { background: transparent; color: rgba(240,253,244,0.5); }

  /* Submit */
  .fo-submit {
    width: 100%; padding: 16px; background: #22c55e; color: #060e0a;
    border: none; border-radius: 14px; font-size: 14px; font-weight: 700;
    font-family: 'Sora', sans-serif; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 20px rgba(34,197,94,0.3);
  }
  .fo-submit:hover:not(:disabled) { background: #4ade80; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(34,197,94,0.4); }
  .fo-submit:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
`;

export default function FarmerOnboarding({ onComplete }) {
    const districtsList = Object.keys(DISTRICT_MARKET_MAP || {});

    const [form, setForm] = useState({
        crop: "Onion",
        district: districtsList[0] || "Pune",
        market: "", // The specific APMC mandi
        unit: "quintal" // Defaulting to quintal for farmers
    });

    // When district changes, reset the market dropdown
    useEffect(() => {
        const availableMarkets = DISTRICT_MARKET_MAP[form.district] || [];
        setForm(prev => ({ ...prev, market: availableMarkets[0] || "" }));
    }, [form.district]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onComplete(form);
    };

    return (
        <>
            <style>{css}</style>
            <div className="fo-overlay">
                <div className="fo-card">

                    {/* ── Header ── */}
                    <div className="fo-header">
                        <div className="fo-header-glow" />
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div style={{ padding: 8, background: "rgba(74,222,128,0.15)", borderRadius: 12, color: "#4ade80" }}>
                                <Leaf size={24} />
                            </div>
                            <h2 className="fo-title">Farmer Setup</h2>
                        </div>
                        <p className="fo-sub">Configure your dashboard to track local mandi prices and AI profit forecasts.</p>
                    </div>

                    {/* ── Body ── */}
                    <form onSubmit={handleSubmit} className="fo-body">

                        {/* 1. Crop Selection (Scrollable Grid) */}
                        <div className="fo-label"><Leaf size={14} /> 1. Select Your Crop</div>
                        <div className="fo-crop-grid">
                            {EXPANDED_CROPS.map(c => (
                                <div
                                    key={c.name}
                                    className={`fo-crop-btn ${form.crop === c.name ? "active" : ""}`}
                                    onClick={() => setForm({ ...form, crop: c.name })}
                                >
                                    <span className="fo-crop-emoji">{c.emoji}</span>
                                    <span className="fo-crop-name">{c.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* 2. District & APMC Cascading Dropdowns */}
                        <div className="fo-select-group">
                            <div className="fo-select-wrap">
                                <div className="fo-label"><MapPin size={14} /> 2. District</div>
                                <select
                                    className="fo-select"
                                    value={form.district}
                                    onChange={e => setForm({ ...form, district: e.target.value })}
                                >
                                    {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="fo-select-wrap">
                                <div className="fo-label"><Store size={14} /> 3. APMC Mandi</div>
                                <select
                                    className="fo-select"
                                    value={form.market}
                                    onChange={e => setForm({ ...form, market: e.target.value })}
                                    disabled={!form.district}
                                >
                                    {DISTRICT_MARKET_MAP[form.district]?.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 3. Unit Toggle */}
                        <div className="fo-unit-box">
                            <div className="fo-unit-text">
                                <h4><Scale size={14} style={{ display: "inline", marginRight: 6, color: "#4ade80" }} />Price Unit</h4>
                                <p>How do you sell your harvest?</p>
                            </div>
                            <div className="fo-unit-toggle">
                                <button type="button" className={`fo-unit-btn ${form.unit === "quintal" ? "active" : ""}`} onClick={() => setForm({ ...form, unit: "quintal" })}>Quintal</button>
                                <button type="button" className={`fo-unit-btn ${form.unit === "kg" ? "active" : ""}`} onClick={() => setForm({ ...form, unit: "kg" })}>KG</button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="fo-submit"
                            disabled={!form.crop || !form.district || !form.market}
                        >
                            Generate Dashboard <ArrowRight size={16} />
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}
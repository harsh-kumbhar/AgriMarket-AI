import React, { useState, useCallback } from "react";
import axios from "axios";
import {
    ArrowLeft, Search, Leaf, TrendingDown, TrendingUp, Minus,
    Clock, Database, ShoppingCart, AlertCircle, Sparkles,
    CalendarDays, BadgeIndianRupee, Zap, Heart, Gift, Cpu, BarChart2,
} from "lucide-react";
import PriceTrendChart from "../components/PriceTrendChart.jsx";
// ─────────────────────────────────────────────────────────────────────────────
// ALL STYLES  (original cd-* + new ins-* + tab nav)
// ─────────────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ── Base / Tokens ─────────────────────────────────────────────────────── */
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

  /* ── Nav ───────────────────────────────────────────────────────────────── */
  .cd-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; height: 64px; gap: 16px;
    background: rgba(6,14,10,0.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
  }
  .cd-back-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg-surface); border: 1px solid var(--border);
    color: var(--text-mid); border-radius: 10px;
    padding: 8px 16px; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 500;
    transition: all 0.2s; flex-shrink: 0;
  }
  .cd-back-btn:hover { border-color: var(--border-h); color: var(--text-hi); }
  .cd-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
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
    flex-shrink: 0;
  }

  /* ── Tab Nav (NEW) ─────────────────────────────────────────────────────── */
  .cd-tab-nav {
    display: flex; gap: 4px;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 4px; flex-shrink: 0;
  }
  .cd-tab-btn {
    background: transparent; border: none; border-radius: 8px;
    padding: 7px 16px; font-family: 'Sora', sans-serif;
    font-size: 13px; font-weight: 600; color: var(--text-dim);
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .cd-tab-btn.active {
    background: var(--green-mid); color: #060e0a;
    box-shadow: 0 2px 12px rgba(34,197,94,0.35);
  }
  .cd-tab-btn:hover:not(.active) { color: var(--text-hi); background: rgba(74,222,128,0.07); }

  /* ── Forecast tab ──────────────────────────────────────────────────────── */
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

  /* ── Insights Tab Styles (NEW) ─────────────────────────────────────────── */
  .ins-root { position: relative; z-index: 1; padding: 40px 32px 80px; max-width: 1000px; margin: 0 auto; }
  .ins-section-title {
    font-size: 12px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: var(--green-hi);
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 16px; margin-top: 44px;
  }
  .ins-section-title:first-child { margin-top: 0; }
  .ins-grid { display: grid; gap: 14px; }
  .ins-grid-2 { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  .ins-grid-3 { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
  .ins-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 18px;
    padding: 20px; display: flex; flex-direction: column; gap: 10px;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    animation: insIn 0.4s ease both;
  }
  .ins-card:hover { border-color: var(--border-h); transform: translateY(-3px); box-shadow: 0 8px 32px rgba(34,197,94,0.10); }
  @keyframes insIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .ins-card:nth-child(1){animation-delay:.04s} .ins-card:nth-child(2){animation-delay:.08s}
  .ins-card:nth-child(3){animation-delay:.12s} .ins-card:nth-child(4){animation-delay:.16s}
  .ins-card:nth-child(5){animation-delay:.20s} .ins-card:nth-child(6){animation-delay:.24s}
  .ins-card-icon { font-size: 26px; line-height: 1; }
  .ins-card-name { font-size: 14px; font-weight: 700; color: var(--text-hi); }
  .ins-card-sub  { font-size: 12px; color: var(--text-dim); }
  .ins-card-price { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; color: var(--text-hi); }
  .ins-badge {
    display: inline-flex; align-items: center; gap: 4px; border-radius: 20px; padding: 3px 10px;
    font-size: 10px; font-weight: 700; letter-spacing: .4px; white-space: nowrap;
  }
  .ins-badge.seasonal { background: rgba(74,222,128,0.12); color: var(--green-hi); border: 1px solid rgba(74,222,128,0.25); }
  .ins-badge.deal     { background: rgba(251,191,36,0.12); color: var(--amber); border: 1px solid rgba(251,191,36,0.25); }
  .ins-badge.trending { background: rgba(248,113,113,0.12); color: var(--red); border: 1px solid rgba(248,113,113,0.25); }
  .ins-badge.suggest  { background: rgba(167,139,250,0.12); color: #c4b5fd; border: 1px solid rgba(167,139,250,0.25); }
  .ins-badge.demand-hi{ background: rgba(248,113,113,0.12); color: var(--red); border: 1px solid rgba(248,113,113,0.25); }
  .ins-badge.demand-md{ background: rgba(251,191,36,0.12); color: var(--amber); border: 1px solid rgba(251,191,36,0.25); }
  .ins-badge.demand-lo{ background: rgba(74,222,128,0.12); color: var(--green-hi); border: 1px solid rgba(74,222,128,0.25); }
  /* Chart */
  .ins-chart-wrap { background: var(--bg-card); border: 1px solid var(--border); border-radius: 18px; padding: 24px; animation: insIn 0.5s ease both; }
  .ins-chart-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
  .ins-chart-title { font-size: 15px; font-weight: 700; color: var(--text-hi); margin-bottom: 8px; }
  .ins-veg-toggle,.ins-period-toggle { display: flex; gap: 4px; flex-wrap: wrap; }
  .ins-period-btn {
    background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px;
    padding: 5px 12px; font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 600;
    color: var(--text-dim); cursor: pointer; transition: all 0.2s;
  }
  .ins-period-btn.active { background: rgba(74,222,128,0.12); border-color: var(--border-h); color: var(--green-hi); }
  .ins-ph-row { display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px; }
  .ins-ph-item { display: flex; flex-direction: column; gap: 2px; }
  .ins-ph-label { font-size: 10px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: .6px; }
  .ins-ph-value { font-size: 16px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
  .ins-ph-value.low  { color: var(--green-hi); }
  .ins-ph-value.curr { color: var(--amber); }
  /* Budget basket */
  .ins-budget-wrap { background: linear-gradient(135deg,rgba(34,197,94,.10),rgba(74,222,128,.04)); border: 1px solid rgba(74,222,128,0.25); border-radius: 18px; padding: 24px; animation: insIn 0.5s ease both; }
  .ins-budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .ins-budget-title { font-size: 15px; font-weight: 700; color: var(--text-hi); }
  .ins-budget-row { display: flex; gap: 10px; align-items: center; }
  .ins-budget-input {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 14px; width: 100px; color: var(--text-hi);
    font-family: 'JetBrains Mono', monospace; font-size: 14px; outline: none; transition: all 0.2s;
  }
  .ins-budget-input:focus { border-color: var(--border-h); box-shadow: 0 0 0 3px rgba(74,222,128,0.08); }
  .ins-gen-btn {
    background: var(--green-mid); color: #060e0a; border: none; border-radius: 10px;
    padding: 8px 18px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
  }
  .ins-gen-btn:hover { background: var(--green-hi); }
  .ins-basket-row {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(13,26,18,0.8); border: 1px solid var(--border); border-radius: 12px;
    padding: 12px 16px; margin-bottom: 10px; transition: border-color 0.2s;
  }
  .ins-basket-row:hover { border-color: var(--border-h); }
  .ins-basket-left { display: flex; align-items: center; gap: 12px; }
  .ins-basket-icon { font-size: 22px; }
  .ins-basket-name { font-size: 14px; font-weight: 600; color: var(--text-hi); }
  .ins-basket-qty  { font-size: 11px; color: var(--text-dim); }
  .ins-basket-price { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: var(--green-hi); }
  .ins-basket-total { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .ins-basket-total-label { font-size: 13px; font-weight: 600; color: var(--text-dim); }
  .ins-basket-total-val { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 800; color: var(--green-hi); }
  .ins-basket-saved { font-size: 11px; color: var(--green-hi); margin-top: 2px; }
  /* Smart grid */
  .ins-smart-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px,1fr)); gap: 14px; }
  .ins-smart-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px;
    padding: 20px; display: flex; flex-direction: column; gap: 8px;
    transition: all 0.2s; animation: insIn 0.5s ease both;
  }
  .ins-smart-card:hover { border-color: var(--border-h); transform: translateY(-2px); }
  .ins-smart-card:nth-child(1){animation-delay:.04s} .ins-smart-card:nth-child(2){animation-delay:.09s}
  .ins-smart-card:nth-child(3){animation-delay:.14s} .ins-smart-card:nth-child(4){animation-delay:.19s}
  .ins-smart-card:nth-child(5){animation-delay:.24s} .ins-smart-card:nth-child(6){animation-delay:.29s}
  .ins-smart-label { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: .8px; }
  .ins-smart-value { font-size: 18px; font-weight: 800; }
  .ins-smart-value.up   { color: var(--red); }
  .ins-smart-value.down { color: var(--green-hi); }
  .ins-smart-value.flat { color: var(--amber); }
  .ins-smart-sub { font-size: 12px; color: var(--text-dim); }

  /* ── Responsive ────────────────────────────────────────────────────────── */
  @media(max-width:640px) {
    .cd-hero,.cd-content,.ins-root{padding-left:16px;padding-right:16px}
    .cd-nav{padding:0 12px; gap:8px;}
    .cd-brand-label{display:none}
    .cd-search-form{flex-direction:column}
    .cd-search-btn{width:100%;justify-content:center}
    .cd-stats{grid-template-columns:1fr 1fr}
    .cd-tab-btn{padding:7px 10px;font-size:12px}
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// FORECAST TAB 
// ─────────────────────────────────────────────────────────────────────────────
const MARKET_OPTIONS = [
    { label: "Pune – Moshi APMC", value: "Pune(Moshi) APMC" },
    { label: "Pune – Manjri APMC", value: "Pune(Manjri) APMC" },
    { label: "Pune – Khed Chakan", value: "Khed(Chakan) APMC" },
    { label: "Pune – Khed APMC", value: "Khed APMC" },
    { label: "Pune APMC", value: "Pune APMC" },
    { label: "Nashik (Nasik) APMC", value: "Nasik APMC" },
    { label: "Lasalgaon APMC", value: "Lasalgaon APMC" },
    { label: "Pimpalgaon APMC", value: "Pimpalgaon APMC" },
    { label: "Mumbai APMC", value: "Mumbai APMC" },
    { label: "Vashi New Mumbai APMC", value: "Vashi New Mumbai APMC" },
    { label: "Hingna APMC (Nagpur)", value: "Hingna APMC" },
    { label: "Katol APMC (Nagpur)", value: "Katol APMC" },
    { label: "Kolhapur APMC", value: "Kolhapur APMC" },
    { label: "Islampur APMC", value: "Islampur APMC" },
    { label: "Karad APMC", value: "Karad APMC" },
    { label: "Satara APMC", value: "Satara APMC" },
    { label: "Solapur APMC", value: "Solapur APMC" },
    { label: "Jalgaon APMC", value: "Jalgaon APMC" },
    { label: "Bhusaval APMC", value: "Bhusaval APMC" },
    { label: "Akole APMC", value: "Akole APMC" },
    { label: "Rahuri APMC", value: "Rahuri APMC" },
];

const VEGETABLE_OPTIONS = [
    { label: "Onion", value: "Onion" },
    { label: "Tomato", value: "Tomato" },
    { label: "Potato", value: "Potato" },
    { label: "Garlic", value: "Garlic" },
    { label: "Cabbage", value: "Cabbage" },
    { label: "Cauliflower", value: "Cauliflower" },
    { label: "Carrot", value: "Carrot" },
    { label: "Brinjal", value: "Brinjal" },
    { label: "Green Chilli", value: "Green Chilli" },
    { label: "Bitter Gourd", value: "Bitter gourd" },
    { label: "Wheat", value: "Wheat" },
    { label: "Ginger (Green)", value: "Ginger(Green)" },
];

const getBestBuy = (retailForecast) => {
    if (!retailForecast?.length) return null;
    let minIdx = 0;
    retailForecast.forEach((d, i) => { if (d.retail_price_kg < retailForecast[minIdx].retail_price_kg) minIdx = i; });
    return { ...retailForecast[minIdx], dayIndex: minIdx };
};

// BUG FIX: Handle the object structure sent by backend
const getMood = (recommendation) => {
    if (!recommendation) return "neutral";

    // Safe-check if it's the new object { signal: 'SELL' } or a plain string
    const r = recommendation.signal ? recommendation.signal.toUpperCase() :
        (typeof recommendation === 'string' ? recommendation.toUpperCase() : "NEUTRAL");

    if (r === "SELL") return "bearish";
    if (r === "KEEP") return "bullish";
    return "neutral";
};

const moodLabel = { bearish: "Prices are High 📉", bullish: "Prices dropping 📈", neutral: "Stable Market ➡️" };

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHTS TAB — mock data
// ─────────────────────────────────────────────────────────────────────────────

const SEASONAL = [
    { emoji: "🥬", name: "Fenugreek (Methi)", note: "Peak harvest Apr–Jun", price: 28 },
    { emoji: "🌿", name: "Coriander", note: "Abundant this season", price: 22 },
    { emoji: "🥦", name: "Capsicum", note: "Good yield this month", price: 60 },
    { emoji: "🌶️", name: "Green Chilli", note: "Locally sourced", price: 35 },
    { emoji: "🫘", name: "Cluster Beans", note: "Low pesticide season", price: 45 },
    { emoji: "🥒", name: "Ridge Gourd", note: "In season – buy now!", price: 30 },
];

const MOST_BOUGHT = [
    { emoji: "🧅", name: "Onion", orders: 1420, price: 38 },
    { emoji: "🍅", name: "Tomato", orders: 1310, price: 55 },
    { emoji: "🥔", name: "Potato", orders: 1185, price: 30 },
    { emoji: "🧄", name: "Garlic", orders: 890, price: 120 },
    { emoji: "🥕", name: "Carrot", orders: 760, price: 48 },
    { emoji: "🥬", name: "Cabbage", orders: 645, price: 25 },
];

const BEST_DEALS = [
    { emoji: "🍅", name: "Tomato", currPrice: 55, avgPrice: 90, drop: 39 },
    { emoji: "🌿", name: "Coriander", currPrice: 22, avgPrice: 38, drop: 42 },
    { emoji: "🥦", name: "Capsicum", currPrice: 60, avgPrice: 95, drop: 37 },
    { emoji: "🥒", name: "Ridge Gourd", currPrice: 30, avgPrice: 48, drop: 38 },
];

const SUGGESTIONS = [
    { emoji: "🥦", name: "Broccoli", reason: "Pairs well with Capsicum", price: 80 },
    { emoji: "🧅", name: "Spring Onion", reason: "Often bought with Coriander", price: 20 },
    { emoji: "🫛", name: "Peas", reason: "Based on your Carrot orders", price: 65 },
    { emoji: "🥬", name: "Spinach", reason: "Nutritious combo with Methi", price: 18 },
];

const SMART_INSIGHTS = [
    { label: "Onion Price Trend", value: "↑ Rising", dir: "up", sub: "Up ~8% in last 7 days. Buy early." },
    { label: "Tomato Forecast", value: "↓ Falling", dir: "down", sub: "Down ~12%. Wait 2–3 days." },
    { label: "Potato Demand", value: "🔥 High", dir: "up", sub: "High demand near Mumbai this week." },
    { label: "Coriander Demand", value: "📊 Medium", dir: "flat", sub: "Stable demand; good supply." },
    { label: "Garlic Prediction", value: "↑ Rising", dir: "up", sub: "Festive season driving prices up." },
    { label: "Capsicum Outlook", value: "↓ Falling", dir: "down", sub: "Good harvest = lower prices ahead." },
];

const genHistory = (base, vol, days) => {
    let price = base;
    return Array.from({ length: days + 1 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (days - i));
        price = Math.max(10, price + (Math.random() - 0.47) * vol);
        return { date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), price: +price.toFixed(1) };
    });
};

const TREND_VEGS = [
    { name: "Onion", color: "#4ade80", d7: genHistory(40, 8, 7), d30: genHistory(40, 8, 30) },
    { name: "Tomato", color: "#f87171", d7: genHistory(58, 12, 7), d30: genHistory(58, 12, 30) },
    { name: "Potato", color: "#fbbf24", d7: genHistory(32, 5, 7), d30: genHistory(32, 5, 30) },
];

const BASKET_POOL = [
    { emoji: "🧅", name: "Onion", pricePerKg: 38, minQty: 0.5 },
    { emoji: "🍅", name: "Tomato", pricePerKg: 55, minQty: 0.5 },
    { emoji: "🥔", name: "Potato", pricePerKg: 30, minQty: 0.5 },
    { emoji: "🥕", name: "Carrot", pricePerKg: 48, minQty: 0.25 },
    { emoji: "🌿", name: "Coriander", pricePerKg: 22, minQty: 0.1 },
    { emoji: "🌶️", name: "Green Chilli", pricePerKg: 35, minQty: 0.1 },
    { emoji: "🥬", name: "Cabbage", pricePerKg: 25, minQty: 0.5 },
    { emoji: "🥒", name: "Ridge Gourd", pricePerKg: 30, minQty: 0.25 },
];

const generateBasket = (budgetRs) => {
    const budget = parseFloat(budgetRs) || 100;
    const items = [];
    let rem = budget;
    const pool = [...BASKET_POOL].sort(() => Math.random() - 0.5);
    for (const item of pool) {
        if (rem <= 5 || items.length >= 5) break;
        const qty = Math.floor((rem / item.pricePerKg * 0.6) / item.minQty) * item.minQty;
        if (qty <= 0) continue;
        const cost = +(qty * item.pricePerKg).toFixed(1);
        items.push({ ...item, qty, cost });
        rem -= cost;
    }
    return { items, total: +items.reduce((s, i) => s + i.cost, 0).toFixed(1), saved: +rem.toFixed(1) };
};

const MiniSVGChart = ({ data, color = "#4ade80" }) => {
    if (!data || data.length < 2) return null;
    const prices = data.map(d => d.price);
    const minP = Math.min(...prices), maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const W = 1000, H = 200;
    const PAD = { t: 28, b: 34, l: 54, r: 24 };
    const iw = W - PAD.l - PAD.r, ih = H - PAD.t - PAD.b;
    const px = i => PAD.l + (i / (data.length - 1)) * iw;
    const py = p => PAD.t + (1 - (p - minP) / range) * ih;
    const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.price).toFixed(1)}`).join(" ");
    const areaD = `${pathD} L${px(data.length - 1)},${H - PAD.b} L${PAD.l},${H - PAD.b}Z`;
    const lowIdx = prices.indexOf(minP);
    const currP = prices[prices.length - 1];
    const step = Math.max(1, Math.ceil(data.length / 5));
    const gid = `g${color.replace("#", "")}`;
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 200 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {[minP, minP + range * 0.5, maxP].map((t, i) => (
                <g key={i}>
                    <line x1={PAD.l} y1={py(t)} x2={W - PAD.r} y2={py(t)} stroke="rgba(74,222,128,0.08)" strokeDasharray="4 4" />
                    <text x={PAD.l - 6} y={py(t) + 4} textAnchor="end" fontSize="20" fill="rgba(240,253,244,0.35)" fontFamily="monospace">₹{t.toFixed(0)}</text>
                </g>
            ))}
            <path d={areaD} fill={`url(#${gid})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={px(lowIdx)} cy={py(minP)} r="6" fill="#060e0a" stroke="#4ade80" strokeWidth="2.5" />
            <text x={px(lowIdx)} y={py(minP) - 12} textAnchor="middle" fontSize="18" fill="#4ade80" fontFamily="monospace" fontWeight="bold">₹{minP.toFixed(0)}</text>
            <circle cx={px(data.length - 1)} cy={py(currP)} r="6" fill="#060e0a" stroke={color} strokeWidth="2.5" />
            <text x={px(data.length - 1)} y={py(currP) - 12} textAnchor="middle" fontSize="18" fill={color} fontFamily="monospace" fontWeight="bold">₹{currP.toFixed(0)}</text>
            {data.filter((_, i) => i % step === 0 || i === data.length - 1).map((d, i, arr) => {
                const origIdx = data.indexOf(d);
                return <text key={i} x={px(origIdx)} y={H - 6} textAnchor="middle" fontSize="19" fill="rgba(240,253,244,0.28)" fontFamily="sans-serif">{d.date}</text>;
            })}
        </svg>
    );
};

const InsightsPanel = () => {
    const [trendIdx, setTrendIdx] = useState(0);
    const [period, setPeriod] = useState("7");
    const [budget, setBudget] = useState("100");
    const [basket, setBasket] = useState(() => generateBasket(100));

    const trendData = period === "7" ? TREND_VEGS[trendIdx].d7 : TREND_VEGS[trendIdx].d30;
    const prices = trendData.map(d => d.price);
    const currPrice = prices[prices.length - 1];
    const lowPrice = Math.min(...prices);

    return (
        <div className="ins-root">

            <div className="ins-section-title"><Leaf size={13} /> 🌿 Seasonal Vegetables</div>
            <div className="ins-grid ins-grid-3">
                {SEASONAL.map((v, i) => (
                    <div className="ins-card" key={i}>
                        <div className="ins-card-icon">{v.emoji}</div>
                        <div>
                            <div className="ins-card-name">{v.name}</div>
                            <div className="ins-card-sub">{v.note}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div className="ins-card-price">₹{v.price}<span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 400 }}>/kg</span></div>
                            <span className="ins-badge seasonal">🌿 Seasonal</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ins-section-title"><TrendingUp size={13} /> 📈 Price Trends</div>
            <div className="ins-chart-wrap">
                <div className="ins-chart-header">
                    <div>
                        <div className="ins-chart-title">{TREND_VEGS[trendIdx].name} — Last {period} Days</div>
                        <div className="ins-veg-toggle" style={{ marginTop: 8 }}>
                            {TREND_VEGS.map((v, i) => (
                                <button key={i} className={"ins-period-btn" + (trendIdx === i ? " active" : "")} onClick={() => setTrendIdx(i)}>{v.name}</button>
                            ))}
                        </div>
                    </div>
                    <div className="ins-period-toggle">
                        <button className={"ins-period-btn" + (period === "7" ? " active" : "")} onClick={() => setPeriod("7")}>7D</button>
                        <button className={"ins-period-btn" + (period === "30" ? " active" : "")} onClick={() => setPeriod("30")}>30D</button>
                    </div>
                </div>
                <MiniSVGChart data={trendData} color={TREND_VEGS[trendIdx].color} />
                <div className="ins-ph-row">
                    <div className="ins-ph-item">
                        <div className="ins-ph-label">Lowest in period</div>
                        <div className="ins-ph-value low">₹{lowPrice.toFixed(1)}</div>
                    </div>
                    <div className="ins-ph-item">
                        <div className="ins-ph-label">Current Price</div>
                        <div className="ins-ph-value curr">₹{currPrice.toFixed(1)}</div>
                    </div>
                    <div className="ins-ph-item">
                        <div className="ins-ph-label">Change from low</div>
                        <div className="ins-ph-value" style={{ color: currPrice > lowPrice * 1.05 ? "var(--red)" : "var(--green-hi)" }}>
                            {currPrice > lowPrice ? `+${((currPrice - lowPrice) / lowPrice * 100).toFixed(1)}%` : "At period low 🎉"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="ins-section-title"><Zap size={13} /> 💸 Best Deals Today</div>
            <div className="ins-grid ins-grid-2">
                {BEST_DEALS.map((v, i) => (
                    <div className="ins-card" key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div className="ins-card-icon">{v.emoji}</div>
                            <span className="ins-badge deal">💸 Lowest Price</span>
                        </div>
                        <div className="ins-card-name">{v.name}</div>
                        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                            <div className="ins-card-price" style={{ color: "var(--amber)" }}>₹{v.currPrice}/kg</div>
                            <div style={{ fontSize: 11, color: "var(--text-dim)", textDecoration: "line-through" }}>avg ₹{v.avgPrice}</div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--green-hi)", fontWeight: 600 }}>↓ {v.drop}% cheaper than avg</div>
                    </div>
                ))}
            </div>

            <div className="ins-section-title"><ShoppingCart size={13} /> 🔥 Most Bought This Month</div>
            <div className="ins-grid ins-grid-3">
                {MOST_BOUGHT.map((v, i) => (
                    <div className="ins-card" key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div className="ins-card-icon">{v.emoji}</div>
                            <span className="ins-badge trending">🔥 Trending</span>
                        </div>
                        <div className="ins-card-name">{v.name}</div>
                        <div className="ins-card-sub">{v.orders.toLocaleString()} orders</div>
                        <div className="ins-card-price">₹{v.price}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-dim)" }}>/kg</span></div>
                    </div>
                ))}
            </div>

            <div className="ins-section-title"><Heart size={13} /> ✨ You May Also Like…</div>
            <div className="ins-grid ins-grid-2">
                {SUGGESTIONS.map((v, i) => (
                    <div className="ins-card" key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div className="ins-card-icon">{v.emoji}</div>
                            <span className="ins-badge suggest">💡 For You</span>
                        </div>
                        <div className="ins-card-name">{v.name}</div>
                        <div className="ins-card-sub">{v.reason}</div>
                        <div className="ins-card-price">₹{v.price}/kg</div>
                    </div>
                ))}
            </div>

            <div className="ins-section-title"><Gift size={13} /> 🧺 Budget Basket Generator</div>
            <div className="ins-budget-wrap">
                <div className="ins-budget-header">
                    <div className="ins-budget-title">What can I buy in my budget?</div>
                    <div className="ins-budget-row">
                        <span style={{ color: "var(--text-dim)", fontSize: 14, fontWeight: 700 }}>₹</span>
                        <input
                            className="ins-budget-input" type="number" min={20} max={2000}
                            value={budget} onChange={e => setBudget(e.target.value)}
                        />
                        <button className="ins-gen-btn" onClick={() => setBasket(generateBasket(budget))}>Generate 🎲</button>
                    </div>
                </div>
                {basket.items.map((item, i) => (
                    <div className="ins-basket-row" key={i}>
                        <div className="ins-basket-left">
                            <div className="ins-basket-icon">{item.emoji}</div>
                            <div>
                                <div className="ins-basket-name">{item.name}</div>
                                <div className="ins-basket-qty">{item.qty} kg × ₹{item.pricePerKg}/kg</div>
                            </div>
                        </div>
                        <div className="ins-basket-price">₹{item.cost}</div>
                    </div>
                ))}
                <div className="ins-basket-total">
                    <div>
                        <div className="ins-basket-total-label">Total Cost</div>
                        {basket.saved > 0 && <div className="ins-basket-saved">₹{basket.saved} change back 🎉</div>}
                    </div>
                    <div className="ins-basket-total-val">₹{basket.total}</div>
                </div>
            </div>

            <div className="ins-section-title"><Cpu size={13} /> 🤖 Smart Price Insights</div>
            <div className="ins-smart-grid">
                {SMART_INSIGHTS.map((s, i) => (
                    <div className="ins-smart-card" key={i}>
                        <div className="ins-smart-label">{s.label}</div>
                        <div className={"ins-smart-value " + s.dir}>{s.value}</div>
                        <div className="ins-smart-sub">{s.sub}</div>
                        <span className={`ins-badge ${s.dir === "up" ? "demand-hi" : s.dir === "down" ? "demand-lo" : "demand-md"}`} style={{ marginTop: 4, alignSelf: "flex-start" }}>
                            {s.dir === "up" ? "📈 Rising Demand" : s.dir === "down" ? "📉 Easing" : "📊 Stable"}
                        </span>
                    </div>
                ))}
            </div>

        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CustomerDashboard = ({ onBack }) => {
    const [commodity, setCommodity] = useState("");
    const [market, setMarket] = useState("");
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("forecast");

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

    // Use the new RETAIL forecast data for the consumer's "Best Buy"
    const bestBuy = forecastData ? getBestBuy(forecastData.forecast) : null;
    const cInsight = forecastData?.consumer_insight;
    const showWaitTip = cInsight?.signal === "WAIT";
    const mood = getMood(forecastData?.recommendation);

    let trendDir = "flat";
    if (forecastData?.forecast?.length >= 2) {
        const first = forecastData.forecast[0].retail_price_kg;
        const last = forecastData.forecast[forecastData.forecast.length - 1].retail_price_kg;
        trendDir = last > first * 1.02 ? "up" : last < first * 0.98 ? "down" : "flat";
    }

    // To re-use your friend's Chart.js wrapper correctly, we pass the retail_price_kg
    const chartData = forecastData?.forecast?.map(d => ({
        date: d.date,
        price: d.retail_price_kg
    })) || [];

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
                    <div className="cd-tab-nav">
                        <button className={"cd-tab-btn" + (activeTab === "forecast" ? " active" : "")} onClick={() => setActiveTab("forecast")}>📊 Forecast</button>
                        <button className={"cd-tab-btn" + (activeTab === "insights" ? " active" : "")} onClick={() => setActiveTab("insights")}>✨ Insights</button>
                    </div>
                    <div className="cd-badge"><Leaf size={12} /> AgriMarket AI</div>
                </nav>

                {activeTab === "forecast" && (
                    <>
                        <div className="cd-hero">
                            <div className="cd-eyebrow"><Sparkles size={12} /> Smart Price Forecasting</div>
                            <h1>Know the best day<br />to buy <span>vegetables</span>.</h1>
                            <p className="cd-hero-sub">Local shop prices are estimated using real-time Mandi markup logic.</p>

                            <div className="cd-search-form">
                                <div className="cd-field">
                                    <label>Vegetable</label>
                                    <select value={commodity} onChange={e => setCommodity(e.target.value)}>
                                        <option value="">Select vegetable…</option>
                                        {VEGETABLE_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                                    </select>
                                </div>
                                <div className="cd-field">
                                    <label>Market / APMC</label>
                                    <select value={market} onChange={e => setMarket(e.target.value)}>
                                        <option value="">Select market…</option>
                                        {MARKET_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
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
                                        {[1, 2, 3].map(i => <div key={i} className="cd-skeleton" style={{ height: 100 }} />)}
                                    </div>
                                    <div className="cd-skeleton" style={{ height: 300 }} />
                                </div>
                            )}

                            {error && !loading && <div className="cd-error"><AlertCircle size={20} /> {error}</div>}

                            {forecastData && !loading && (
                                <>
                                    {/* Dynamic Tip powered by the new Backend Consumer Insight */}
                                    {showWaitTip ? (
                                        <div className="cd-tip">
                                            <ShoppingCart size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                                            <div>
                                                <div className="cd-tip-title">💡 Consumer Tip — Prices Dropping!</div>
                                                <div className="cd-tip-text">{cInsight?.message} You could save {cInsight?.savings_percent}% by waiting.</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="cd-tip warning">
                                            <CalendarDays size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
                                            <div>
                                                <div className="cd-tip-title">📅 Buy Today</div>
                                                <div className="cd-tip-text">{cInsight?.message} Local shop rates are roughly ₹{forecastData.current_retail_price}/kg.</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="cd-stats">
                                        <div className="cd-stat">
                                            <div className="cd-stat-label"><BadgeIndianRupee size={13} /> Est. Local Shop Rate</div>
                                            <div className="cd-stat-value">₹{forecastData.current_retail_price?.toFixed(0)}<small>/kg</small></div>
                                            <div className="cd-stat-sub" style={{ color: "var(--text-mid)" }}>Based on {forecastData.retail_markup_percent}% markup</div>
                                        </div>
                                        <div className="cd-stat">
                                            <div className="cd-stat-label"><Database size={13} /> Actual Mandi Rate</div>
                                            <div className="cd-stat-value" style={{ color: "#4ade80" }}>₹{forecastData.current_mandi_price?.toFixed(0)}<small>/q</small></div>
                                            <div className="cd-stat-sub down">{forecastData.market}</div>
                                        </div>
                                        <div className="cd-stat">
                                            <div className="cd-stat-label">
                                                {mood === "bullish" ? <TrendingUp size={13} /> : mood === "bearish" ? <TrendingDown size={13} /> : <Minus size={13} />}
                                                Market Mood
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                <div className={"cd-mood " + mood}>{moodLabel[mood]}</div>
                                            </div>
                                            <div className="cd-stat-sub" style={{ marginTop: 10 }}>{trendDir === "up" ? "Expect retail prices to rise." : "Expect retail prices to stabilize."}</div>
                                        </div>
                                    </div>

                                    <div className="cd-chart-card">
                                        <div className="cd-chart-header">
                                            <div>
                                                <div className="cd-chart-title">7-Day Retail Price Forecast — {forecastData.commodity || commodity}</div>
                                                <div className="cd-chart-sub">Prices in ₹/kg (Local Shop Estimate)</div>
                                            </div>
                                            {bestBuy && <div className="cd-bestbuy"><CalendarDays size={13} /> Best buy: {bestBuy.date}</div>}
                                        </div>
                                        <div style={{ height: 240 }}>
                                            {/* Passing the retail chartData formatted for the wrapper */}
                                            <PriceTrendChart data={chartData} bestBuyDate={bestBuy?.date} />
                                        </div>
                                    </div>

                                    <div className="cd-chart-card" style={{ marginBottom: 24 }}>
                                        <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "var(--text-hi)" }}>Daily Retail Breakdown</div>
                                        <div style={{ overflowX: "auto" }}>
                                            <table className="cd-table">
                                                <thead>
                                                    <tr><th>Date</th><th>Est. Local Shop (₹/kg)</th><th>Mandi Base (₹/q)</th><th>Tip</th></tr>
                                                </thead>
                                                <tbody>
                                                    {forecastData.forecast?.map((row, i) => {
                                                        const isBest = row.date === bestBuy?.date;
                                                        const delta = ((row.retail_price_kg - forecastData.current_retail_price) / forecastData.current_retail_price * 100);
                                                        return (
                                                            <tr key={i} className={isBest ? "is-best" : ""}>
                                                                <td>{row.date}{isBest && <span style={{ marginLeft: 6, fontSize: 11, color: "#4ade80", fontWeight: 700 }}>← cheapest</span>}</td>
                                                                <td className={"cd-price-cell " + (isBest ? "best" : "")}>₹{row.retail_price_kg?.toFixed(1)}</td>
                                                                <td style={{ color: "var(--text-dim)", fontFamily: "monospace" }}>₹{row.mandi_price_q?.toFixed(0)}</td>
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
                                        <div className="cd-meta-item"><Database size={12} /> Model: <span>Prophet AI + Retail Logic</span></div>
                                    </div>
                                </>
                            )}

                            {!forecastData && !loading && !error && (
                                <div className="cd-empty">
                                    <div className="cd-empty-icon">🥦</div>
                                    <h3>Search for a vegetable to begin</h3>
                                    <p>Select a vegetable to see estimated local shop prices and find the cheapest day to buy.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === "insights" && <InsightsPanel />}

            </div>
        </>
    );
};

export default CustomerDashboard;
import { useEffect, useRef, useState } from "react";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const styles = `
  :root {
    --forest:   #1a3a2a;
    --leaf:     #2d6a4f;
    --mint:     #52b788;
    --cream:    #f8f4e8;
    --gold:     #e9c46a;
    --charcoal: #1c1c1e;
    --mist:     #f0ede4;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Poppins', sans-serif;
    background: var(--cream);
    color: var(--charcoal);
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.4;
  }

  .navbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    height: 68px;
    background: var(--forest);
    border-bottom: 1px solid rgba(82,183,136,0.2);
  }

  .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }

  .nav-logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--mint), var(--gold));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }

  .nav-logo-text { display: flex; flex-direction: column; line-height: 1; }
  .nav-logo-text span:first-child { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
  .nav-logo-text span:last-child  { font-size: 10px; font-weight: 400; color: var(--mint); letter-spacing: 0.5px; }

  .nav-links { display: flex; align-items: center; gap: 32px; }
  .nav-links a { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.65); text-decoration: none; letter-spacing: 0.3px; transition: color 0.2s; }
  .nav-links a:hover { color: #fff; }

  .nav-cta {
    background: var(--mint) !important;
    color: var(--forest) !important;
    padding: 8px 20px !important;
    border-radius: 8px;
    font-weight: 600 !important;
    transition: background 0.2s, transform 0.15s !important;
  }
  .nav-cta:hover { background: #63d3a0 !important; transform: translateY(-1px); }

  .ticker-bar { background: var(--leaf); padding: 10px 0; overflow: hidden; }
  .ticker-track { display: flex; animation: ticker 35s linear infinite; white-space: nowrap; }
  .ticker-item {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0 28px;
    font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.9);
    border-right: 1px solid rgba(255,255,255,0.15);
  }
  .ticker-price { color: var(--gold); font-weight: 700; }
  .ticker-up   { color: #7dffb3; }
  .ticker-down { color: #ff9f9f; }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

  .hero {
    min-height: calc(100vh - 108px);
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .hero-left {
    background: var(--forest);
    padding: 72px 64px 72px 80px;
    display: flex; flex-direction: column; justify-content: center;
    position: relative;
  }

  .hero-left::after {
    content: '';
    position: absolute;
    top: 0; right: -55px;
    width: 110px; height: 100%;
    background: var(--forest);
    clip-path: polygon(0 0, 50% 0, 100% 100%, 0 100%);
    z-index: 2;
  }

  .hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(82,183,136,0.15);
    border: 1px solid rgba(82,183,136,0.3);
    border-radius: 100px;
    padding: 6px 16px;
    margin-bottom: 28px;
    width: fit-content;
  }
  .hero-tag span { font-size: 11px; font-weight: 600; color: var(--mint); letter-spacing: 1.5px; text-transform: uppercase; }
  .tag-dot { width: 6px; height: 6px; background: var(--mint); border-radius: 50%; animation: blink 2s infinite; }
  @keyframes blink { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.8); } }

  .hero-headline { font-size: 50px; font-weight: 700; color: #fff; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 16px; }
  .hero-headline em { color: var(--gold); font-style: italic; }

  .hero-sub { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.6); line-height: 1.75; max-width: 360px; margin-bottom: 40px; }

  .hero-stats { display: flex; gap: 36px; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .stat-num   { font-size: 26px; font-weight: 700; color: var(--mint); line-height: 1; }
  .stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 4px; letter-spacing: 0.4px; }

  .hero-btns { display: flex; gap: 14px; }

  .btn-gold {
    display: flex; align-items: center; gap: 8px;
    background: var(--gold); color: var(--forest);
    padding: 13px 26px; border-radius: 12px;
    font-size: 14px; font-weight: 700; font-family: 'Poppins', sans-serif;
    cursor: pointer; border: none;
    transition: all 0.2s; letter-spacing: 0.2px;
  }
  .btn-gold:hover { background: #f0d080; transform: translateY(-2px); box-shadow: 0 12px 28px rgba(233,196,106,0.35); }

  .btn-ghost {
    display: flex; align-items: center; gap: 8px;
    background: transparent; color: #fff;
    padding: 13px 26px; border-radius: 12px;
    font-size: 14px; font-weight: 500; font-family: 'Poppins', sans-serif;
    cursor: pointer; border: 1px solid rgba(255,255,255,0.2);
    transition: all 0.2s;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); transform: translateY(-2px); }

  .hero-right {
    background: var(--mist);
    padding: 72px 72px 72px 96px;
    display: flex; flex-direction: column; justify-content: center;
    position: relative; z-index: 1;
  }

  .cards-label { font-size: 11px; font-weight: 600; color: var(--leaf); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }

  .entry-cards { display: flex; flex-direction: column; gap: 18px; }

  .entry-card {
    background: #fff;
    border-radius: 18px;
    padding: 26px 28px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.25s;
    position: relative; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .entry-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; width: 4px; height: 100%;
    transition: width 0.25s;
  }
  .entry-card.farmer::before  { background: var(--mint); }
  .entry-card.customer::before { background: var(--gold); }
  .entry-card:hover { transform: translateX(5px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
  .entry-card.farmer:hover   { border-color: rgba(82,183,136,0.3); }
  .entry-card.customer:hover { border-color: rgba(233,196,106,0.4); }

  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }

  .card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .entry-card.farmer  .card-icon { background: rgba(82,183,136,0.12); }
  .entry-card.customer .card-icon { background: rgba(233,196,106,0.15); }

  .card-arrow {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: transform 0.2s;
  }
  .entry-card.farmer  .card-arrow { background: rgba(82,183,136,0.1); color: var(--leaf); }
  .entry-card.customer .card-arrow { background: rgba(233,196,106,0.15); color: #9a6e00; }
  .entry-card:hover .card-arrow { transform: translateX(4px); }

  .card-title { font-size: 17px; font-weight: 700; color: var(--charcoal); margin-bottom: 6px; letter-spacing: -0.3px; }
  .card-desc  { font-size: 12.5px; color: #888; line-height: 1.55; }

  .card-pills { display: flex; gap: 7px; margin-top: 14px; flex-wrap: wrap; }
  .pill { font-size: 11px; font-weight: 500; padding: 3px 11px; border-radius: 100px; }
  .entry-card.farmer  .pill { background: rgba(82,183,136,0.1); color: var(--leaf); }
  .entry-card.customer .pill { background: rgba(233,196,106,0.15); color: #9a6e00; }

  .trust-row {
    display: flex; gap: 16px; margin-top: 20px;
    padding: 14px 18px;
    background: rgba(45,106,79,0.05);
    border-radius: 12px;
    border: 1px solid rgba(45,106,79,0.1);
    flex-wrap: wrap;
  }
  .trust-item { font-size: 11px; color: #888; display: flex; align-items: center; gap: 5px; }
  .trust-check { color: var(--leaf); font-weight: 700; }

  .features-section { padding: 90px 80px; background: var(--cream); }
  .section-eyebrow { font-size: 11px; font-weight: 600; color: var(--leaf); letter-spacing: 2.5px; text-transform: uppercase; text-align: center; margin-bottom: 14px; }
  .section-headline { font-size: 38px; font-weight: 700; color: var(--forest); text-align: center; letter-spacing: -1px; margin-bottom: 56px; line-height: 1.15; }

  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1050px; margin: 0 auto; }

  .feat-card {
    background: #fff; border-radius: 18px; padding: 32px 28px;
    border: 1px solid rgba(0,0,0,0.05);
    transition: all 0.25s; position: relative; overflow: hidden;
  }
  .feat-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--mint), var(--gold));
    transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
  }
  .feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
  .feat-card:hover::after { transform: scaleX(1); }
  .feat-icon  { font-size: 30px; margin-bottom: 18px; display: block; }
  .feat-title { font-size: 16px; font-weight: 700; color: var(--forest); margin-bottom: 8px; letter-spacing: -0.2px; }
  .feat-desc  { font-size: 13px; color: #777; line-height: 1.65; }

  .fade-up { opacity: 0; transform: translateY(20px); transition: opacity 0.55s ease, transform 0.55s ease; }
  .fade-up.visible { opacity: 1; transform: translateY(0); }

  .footer {
    background: var(--forest);
    padding: 28px 80px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .footer-l { font-size: 13px; color: rgba(255,255,255,0.4); }
  .footer-l strong { color: var(--mint); font-weight: 600; }
  .footer-r { display: flex; gap: 20px; }
  .footer-r span { font-size: 12px; color: rgba(255,255,255,0.3); cursor: pointer; transition: color 0.2s; }
  .footer-r span:hover { color: rgba(255,255,255,0.65); }
`;

const TICKER = [
    { crop: "🧅 Onion", market: "Pune APMC", price: "₹950", change: "+2.3%", up: true },
    { crop: "🍅 Tomato", market: "Nashik APMC", price: "₹1,200", change: "-1.1%", up: false },
    { crop: "🥔 Potato", market: "Mumbai APMC", price: "₹1,450", change: "+0.8%", up: true },
    { crop: "🌾 Wheat", market: "Kolhapur APMC", price: "₹2,100", change: "+3.2%", up: true },
    { crop: "🌽 Maize", market: "Aurangabad APMC", price: "₹1,890", change: "-0.5%", up: false },
    { crop: "🧄 Garlic", market: "Solapur APMC", price: "₹6,500", change: "+1.7%", up: true },
    { crop: "🫑 Capsicum", market: "Satara APMC", price: "₹3,200", change: "+4.1%", up: true },
    { crop: "🍆 Brinjal", market: "Sangli APMC", price: "₹780", change: "-2.8%", up: false },
];

const FEATURES = [
    { icon: "🤖", title: "Prophet AI Forecasting", desc: "Facebook's Prophet model trained on 2 years of Maharashtra mandi data — delivering 7-day forecasts with upper/lower confidence bands." },
    { icon: "⚡", title: "Live Bias Correction", desc: "Every prediction is anchored to today's real Agmarknet price. The model's output is adjusted so forecasts always start from reality." },
    { icon: "🏪", title: "Multi-Market Arbitrage", desc: "Compare prices across 5 nearby mandis in the same district. Sell where the price is highest — intelligently." },
    { icon: "📊", title: "KEEP / SELL Intelligence", desc: "Automated engine tells farmers whether holding stock for 5+ days yields more than selling today at current price." },
    { icon: "🔄", title: "Triple-Layer Reliability", desc: "Live API → CSV fallback → Model-only. The system never goes down, even when government servers are slow." },
    { icon: "⚖️", title: "₹/kg Unit Conversion", desc: "Mandi prices are quoted in ₹/quintal. Farmer view auto-converts to ₹/kg — the unit that matters at the farm gate." },
];

export default function LandingPage({ onEnter }) {
    const featRefs = useRef([]);

    useEffect(() => {
        const obs = new IntersectionObserver(
            entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")),
            { threshold: 0.12 }
        );
        featRefs.current.forEach(el => el && obs.observe(el));
        return () => obs.disconnect();
    }, []);

    return (
        <>
            <style>{styles}</style>

            {/* ── Navbar ── */}
            <nav className="navbar">
                <a className="nav-logo" href="#">
                    <div className="nav-logo-icon">🌾</div>
                    <div className="nav-logo-text">
                        <span>AgriMarket AI</span>
                        <span>Maharashtra Mandi Intelligence</span>
                    </div>
                </a>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    <a href="#" className="nav-cta" onClick={e => { e.preventDefault(); onEnter?.("farmer"); }}>
                        Launch App →
                    </a>
                </div>
            </nav>

            {/* ── Live Ticker ── */}
            <div className="ticker-bar" style={{ marginTop: 68 }}>
                <div className="ticker-track">
                    {[...TICKER, ...TICKER].map((t, i) => (
                        <span className="ticker-item" key={i}>
                            {t.crop}
                            <span style={{ color: "rgba(255,255,255,0.45)" }}>{t.market}</span>
                            <span className="ticker-price">{t.price}</span>
                            <span className={t.up ? "ticker-up" : "ticker-down"}>{t.change}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Hero ── */}
            <section className="hero">
                {/* Left — Copy */}
                <div className="hero-left">
                    <div className="hero-tag">
                        <div className="tag-dot" />
                        <span>Live · Agmarknet · Maharashtra</span>
                    </div>

                    <h1 className="hero-headline">
                        Know the price<br />
                        before the <em>mandi</em><br />
                        does.
                    </h1>

                    <p className="hero-sub">
                        AI-powered 7-day crop price forecasting for Maharashtra farmers and consumers.
                        Built on real mandi data, corrected live every single day.
                    </p>

                    <div className="hero-stats">
                        <div><div className="stat-num">400+</div><div className="stat-label">Days of Training</div></div>
                        <div><div className="stat-num">30+</div><div className="stat-label">Mandis Covered</div></div>
                        <div><div className="stat-num">7-Day</div><div className="stat-label">Forecast Window</div></div>
                    </div>

                    <div className="hero-btns">
                        <button className="btn-gold" onClick={() => onEnter?.("farmer")}>🌾 Farmer Dashboard</button>
                        <button className="btn-ghost" onClick={() => onEnter?.("customer")}>🛒 Customer View</button>
                    </div>
                </div>

                {/* Right — Entry Cards */}
                <div className="hero-right">
                    <div className="cards-label">Choose your view</div>

                    <div className="entry-cards">
                        <div className="entry-card farmer" onClick={() => onEnter?.("farmer")}>
                            <div className="card-header">
                                <div className="card-icon">🌾</div>
                                <div className="card-arrow">→</div>
                            </div>
                            <div className="card-title">Farmer Intelligence Mode</div>
                            <div className="card-desc">
                                KEEP / SELL signals, ₹/kg auto-conversion, and multi-market arbitrage across nearby mandis.
                            </div>
                            <div className="card-pills">
                                <span className="pill">KEEP/SELL Signal</span>
                                <span className="pill">₹/kg View</span>
                                <span className="pill">Arbitrage Map</span>
                            </div>
                        </div>

                        <div className="entry-card customer" onClick={() => onEnter?.("customer")}>
                            <div className="card-header">
                                <div className="card-icon">🛒</div>
                                <div className="card-arrow">→</div>
                            </div>
                            <div className="card-title">Consumer Price Tracker</div>
                            <div className="card-desc">
                                Know when prices are dropping before you shop. 7-day trend charts for vegetables, fruits & grains.
                            </div>
                            <div className="card-pills">
                                <span className="pill">7-Day Forecast</span>
                                <span className="pill">Best Buy Day</span>
                                <span className="pill">Price Alerts</span>
                            </div>
                        </div>
                    </div>

                    <div className="trust-row">
                        <div className="trust-item"><span className="trust-check">✓</span> Data.gov.in Agmarknet</div>
                        <div className="trust-item"><span className="trust-check">✓</span> Facebook Prophet AI</div>
                        <div className="trust-item"><span className="trust-check">✓</span> Live Bias Correction</div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="features-section" id="features">
                <div className="section-eyebrow">What it does</div>
                <h2 className="section-headline">Built for the field.<br />Powered by AI.</h2>
                <div className="features-grid">
                    {FEATURES.map((f, i) => (
                        <div
                            key={i}
                            className="feat-card fade-up"
                            ref={el => featRefs.current[i] = el}
                            style={{ transitionDelay: `${i * 75}ms` }}
                        >
                            <span className="feat-icon">{f.icon}</span>
                            <div className="feat-title">{f.title}</div>
                            <div className="feat-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="footer">
                <div className="footer-r">
                    <span>Data: Agmarknet</span>
                    <span>Model: Prophet</span>
                    <span>Academic Project</span>
                </div>
            </footer>
        </>
    );
}
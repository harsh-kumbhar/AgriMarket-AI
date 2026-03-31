import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, TrendingUp, TrendingDown, MapPin, Info, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DISTRICT_MARKET_MAP } from "../utils/marketData";
const FarmerDashboard = ({ userPrefs, onBack }) => {
    const [mainData, setMainData] = useState(null);
    const [nearbyData, setNearbyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unit, setUnit] = useState(userPrefs.unit); // 'kg' or 'quintal'

    // ── Data Fetching ────────────────────────────────────────────────────────
    const fetchAllData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Main Market Forecast
            const mainRes = await axios.get(`http://localhost:5000/forecast?commodity=${userPrefs.crop}&market=${userPrefs.district}`);
            setMainData(mainRes.data);

            // 2. Fetch Arbitrage (Nearby Markets)
            const nearbyMarkets = DISTRICT_MARKET_MAP[userPrefs.district] || [];
            const requests = nearbyMarkets.map(m => 
                axios.get(`http://localhost:5000/forecast?commodity=${userPrefs.crop}&market=${m}`).catch(() => null)
            );
            
            const results = await Promise.all(requests);
            const validResults = results.filter(r => r && r.data.status === "success").map(r => r.data);
            setNearbyData(validResults);
        } catch (err) {
            console.error("Dashboard Load Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, [userPrefs]);

    if (loading) return (
        <div className="min-h-screen bg-[#f8f4e8] flex flex-col items-center justify-center font-['Poppins']">
            <RefreshCw className="animate-spin text-[#2d6a4f] mb-4" size={48} />
            <p className="text-[#1a3a2a] font-medium">Analyzing Mandi Trends...</p>
        </div>
    );

    const priceMultiplier = unit === "kg" ? 0.01 : 1;
    const unitLabel = unit === "kg" ? "/kg" : "/q";

    return (
        <div className="min-h-screen bg-[#f8f4e8] font-['Poppins'] text-[#1c1c1e] pb-12">
            {/* ── Top Navigation ── */}
            <nav className="bg-[#1a3a2a] text-white p-6 shadow-xl flex justify-between items-center">
                <button onClick={onBack} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-all">
                    <ArrowLeft size={20} /> Back
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-bold">{userPrefs.crop} Intelligence</h1>
                    <p className="text-xs text-[#52b788]">{userPrefs.district} District</p>
                </div>
                <button onClick={() => setUnit(unit === "kg" ? "quintal" : "kg")} className="bg-[#52b788] text-[#1a3a2a] px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    {unit.toUpperCase()} UNIT
                </button>
            </nav>

            <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ── Left Column: Recommendation & Stats ── */}
                <div className="lg:col-span-1 space-y-6">
                    <div className={`p-8 rounded-3xl shadow-lg border-b-8 ${mainData?.recommendation === 'KEEP' ? 'bg-white border-[#52b788]' : 'bg-white border-red-400'}`}>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Recommendation</p>
                        <h2 className={`text-4xl font-black mb-4 ${mainData?.recommendation === 'KEEP' ? 'text-[#2d6a4f]' : 'text-red-600'}`}>
                            {mainData?.recommendation === 'KEEP' ? 'HOLD STOCK' : 'SELL NOW'}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                            <Info size={14} />
                            {mainData?.recommendation === 'KEEP' ? 'Prices expected to rise > 5%' : 'Downward trend detected'}
                        </div>
                    </div>

                    <div className="bg-[#1a3a2a] p-8 rounded-3xl text-white shadow-xl">
                        <p className="opacity-60 text-sm mb-1">Current Market Rate</p>
                        <div className="text-5xl font-bold mb-2">
                            ₹{(mainData?.current_price * priceMultiplier).toFixed(2)}
                            <span className="text-lg opacity-50 ml-2">{unitLabel}</span>
                        </div>
                        <p className="text-[#52b788] text-sm font-medium">Source: {mainData?.data_source}</p>
                    </div>
                </div>

                {/* ── Center Column: Main Forecast Graph ── */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-lg">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-[#1a3a2a]">7-Day Forecast Trend</h3>
                        <TrendingUp className="text-[#52b788]" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mainData?.forecast}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                                <Line type="monotone" dataKey="price" stroke="#2d6a4f" strokeWidth={5} dot={{ r: 6, fill: '#52b788', strokeWidth: 3, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Bottom Section: Arbitrage (Multi-Market) ── */}
                <div className="lg:col-span-3">
                    <h3 className="text-2xl font-bold text-[#1a3a2a] mb-6 flex items-center gap-3">
                        <MapPin className="text-[#52b788]" /> Nearby Market Arbitrage
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {nearbyData.map((m, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-all border-t-4 border-[#mist]">
                                <p className="text-xs font-bold text-gray-400 truncate mb-1">{m.market}</p>
                                <p className="text-2xl font-bold text-[#1a3a2a]">₹{(m.current_price * priceMultiplier).toFixed(2)}</p>
                                <p className={`text-xs font-bold mt-2 ${m.recommendation === 'KEEP' ? 'text-green-500' : 'text-red-400'}`}>
                                    {m.recommendation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerDashboard;
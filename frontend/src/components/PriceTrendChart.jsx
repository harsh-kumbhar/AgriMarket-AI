import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0f2419",
          border: "1px solid rgba(74,222,128,0.25)",
          borderRadius: "14px",
          padding: "12px 18px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ color: "#6ee7a0", fontSize: "11px", fontWeight: 600, marginBottom: 4, letterSpacing: "0.5px" }}>
          {label}
        </p>
        <p style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: 0 }}>
          ₹{payload[0].value?.toFixed(2)}
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>/q</span>
        </p>
      </div>
    );
  }
  return null;
};

const PriceTrendChart = ({ data, bestBuyDate }) => {
  if (!data || data.length === 0) return null;

  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const range = maxPrice - minPrice;
  const yMin = Math.floor((minPrice - range * 0.15) / 10) * 10;
  const yMax = Math.ceil((maxPrice + range * 0.15) / 10) * 10;

  const enhancedData = data.map((d) => ({
    ...d,
    isLowest: d.date === bestBuyDate,
  }));

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.isLowest) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={10} fill="#22c55e" opacity={0.25} />
          <circle cx={cx} cy={cy} r={6} fill="#22c55e" stroke="#fff" strokeWidth={2.5} />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#4ade80" stroke="#0f2419" strokeWidth={2} />;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={enhancedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="rgba(255,255,255,0.06)"
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "inherit" }}
          interval={0}
        />
        <YAxis
          domain={[yMin, yMax]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "inherit" }}
          tickFormatter={(v) => `₹${v}`}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(74,222,128,0.2)", strokeWidth: 1 }} />
        {bestBuyDate && (
          <ReferenceLine
            x={bestBuyDate}
            stroke="#22c55e"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        )}
        <Area
          type="monotone"
          dataKey="price"
          stroke="#4ade80"
          strokeWidth={2.5}
          fill="url(#priceGradient)"
          dot={<CustomDot />}
          activeDot={{ r: 7, fill: "#86efac", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PriceTrendChart;

// marketData.js — Real Agmarknet market names for Maharashtra districts

export const DISTRICT_MARKET_MAP = {
    "Pune": [
        "Pune(Moshi) APMC",
        "Pune(Manjri) APMC",
        "Khed(Chakan)",
        "Pimpri",
        "Manchar"
    ],
    "Nashik": [
        "Lasalgaon(Niphad)",
        "Pimpalgaon",
        "Yeola",
        "Sinnar",
        "Kalwan"
    ],
    "Mumbai": [
        "Mumbai",
        "Vashi",
        "Kalyan",
        "Thane",
        "Palghar"
    ],
    "Nagpur": [
        "Nagpur",
        "Kalmeshwar",
        "Katol",
        "Saoner",
        "Ramtek"
    ],
    "Kolhapur": [
        "Kolhapur",
        "Ichalkaranji",
        "Gadhinglaj",
        "Radhanagari",
        "Kagal"
    ],
    "Solapur": [
        "Solapur",
        "Barshi",
        "Pandharpur",
        "Mangalvedhe",
        "Mohol"
    ],
    "Aurangabad": [
        "Aurangabad",
        "Kannad",
        "Vaijapur",
        "Gangapur",
        "Sillod"
    ],
    "Satara": [
        "Satara",
        "Karad",
        "Wai",
        "Phaltan",
        "Rahimatpur"
    ],
    "Sangli": [
        "Sangli",
        "Miraj",
        "Tasgaon",
        "Vita",
        "Islampur"
    ],
    "Thane": [
        "Thane",
        "Kalyan",
        "Bhiwandi",
        "Shahapur",
        "Murbad"
    ],
};

export const CROPS = [
    "Onion", "Tomato", "Potato", "Garlic",
    "Wheat", "Maize", "Capsicum", "Brinjal"
];

export const DISTRICTS = Object.keys(DISTRICT_MARKET_MAP);

// Recommendation logic (matches backend 5% threshold)
export const calculateRecommendation = (currentPrice, forecast) => {
    if (!currentPrice || !forecast || forecast.length === 0) return { signal: "UNKNOWN" };

    // Find the entry with the highest price
    const peakEntry = forecast.reduce((prev, current) =>
        (prev.price > current.price) ? prev : current
    );

    const gainPercent = ((peakEntry.price - currentPrice) / currentPrice) * 100;

    if (gainPercent > 5) {
        return {
            signal: "KEEP",
            bestDay: peakEntry.date,
            price: peakEntry.price.toFixed(2)
        };
    }

    return {
        signal: "SELL",
        bestDay: "Today",
        price: currentPrice.toFixed(2)
    };
};
// This map ensures that when a farmer selects a district, 
// we fetch data for the most relevant local hubs.
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
    ]
};

/**
 * Logic to determine if a farmer should SELL or KEEP based on 
 * the 5% threshold you defined.
 */
export const calculateRecommendation = (currentPrice, forecast) => {
    if (!currentPrice || !forecast || forecast.length === 0) return "UNKNOWN";

    const avgFuturePrice = forecast.reduce((acc, curr) => acc + curr.price, 0) / forecast.length;
    const threshold = currentPrice * 1.05; // 5% profit margin logic

    return avgFuturePrice > threshold ? "KEEP" : "SELL";
};
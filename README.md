

# **AgriMarket AI Intelligence Dashboard**

### *Smart Decision Support System for Agricultural Price Optimization*

[](https://reactjs.org/)
[](https://flask.palletsprojects.com/)
[](https://facebook.github.io/prophet/)

-----

## **📌 Overview**

**AgriMarket AI** is a predictive analytics platform designed to solve price volatility in Maharashtra's agricultural sector. Unlike standard price trackers, this system uses **Machine Learning (Facebook Prophet)** to forecast market trends and a **Live Bias Correction Layer** to adjust predictions based on today's real-time Agmarknet API data.

The platform provides two specialized experiences:

  * **For Farmers:** A "Hold vs. Sell" decision engine with a built-in logistics profit calculator.
  * **For Consumers:** A retail price estimator that tracks the "Mandi-to-Shop" spread.

-----

## **🚀 Key Features**

### **1. AI-Powered Forecasting**

  * **Time-Series Analysis:** Uses Prophet to handle yearly/weekly seasonality of crops like Onion, Tomato, and Potato.
  * **Live Bias Correction:** Automatically anchors AI predictions to the latest API price to account for sudden market shocks.

### **2. Farmer Decision Support**

  * **Profit Peak Detection:** Identifies the exact day in the next week to sell for maximum profit.
  * **Farm-to-Mandi Logistics Calculator:** Real-time calculation of Net Profit after factoring in transport costs (Distance × Fuel) to determine if market arbitrage is worth the trip.
  * **Smart Arbitrage:** Compares your local Mandi with nearby district markets to find higher payouts.

### **3. Consumer Intelligence**

  * **Retail Markup Engine:** Estimates local shop prices using dynamic perishability coefficients.
  * **Best Buy Alerts:** Signals the weekly price bottom for smart household budgeting.

-----

## **🛠️ Tech Stack**

  * **Frontend:** React, Vite, Recharts, Lucide-React, Tailwind CSS.
  * **Backend:** Python (Flask), Pandas, NumPy.
  * **AI/ML:** Facebook Prophet, Joblib.
  * **Data Sources:** Data.gov.in (Agmarknet API), Local CSV Fallback.

-----

## **⚙️ Installation & Setup**

### **1. Clone the Repository**

```bash
git clone https://github.com/HarshKumbhar/AgriMarket-AI.git
cd AgriMarket-AI
```

### **2. Backend Setup**

```bash
cd backend
pip install -r requirements.txt
# Create a .env file and add your DATAGOV_API_KEY
python app.py
```

### **3. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

-----

## **📊 Project Logic: The "Bias Correction" Formula**

To ensure accuracy, the system calculates the error ($B$) between the AI's base prediction ($P_{base}$) and the live API price ($P_{api}$):

$$B = P_{api} - P_{base}$$

This bias is then applied to the entire 7-day forecast to align the "AI Map" with "Today's Reality."

-----

## **📝 Authors**

  * **Harsh Kumbhar** - *3rd Year IT, Vidyalankar Institute of Technology*

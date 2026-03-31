import { useState } from "react";
import LandingPage from "./LandingPage";
import FarmerOnboarding from "./pages/FarmerOnboarding";
import FarmerDashboard from "./pages/FarmerDashboard";
//import CustomerDashboard from "./pages/CustomerDashboard"; // Assuming teammate uses this name

export default function App() {
    // Current View State: "landing" | "farmer" | "customer"
    const [view, setView] = useState("landing");

    // Farmer Onboarding State: Stores {crop, district, unit}
    const [farmerPrefs, setFarmerPrefs] = useState(null);

    // ── 1. Landing Page ──────────────────────────────────────────────────
    if (view === "landing") {
        return <LandingPage onEnter={(mode) => setView(mode)} />;
    }

    // ── 2. Farmer Flow ───────────────────────────────────────────────────
    if (view === "farmer") {
        // If they haven't filled onboarding, show the modal first
        if (!farmerPrefs) {
            return (
                <FarmerOnboarding
                    onComplete={(data) => setFarmerPrefs(data)}
                />
            );
        }

        // Once data is ready, show the Dashboard
        return (
            <FarmerDashboard
                userPrefs={farmerPrefs}
                onBack={() => {
                    setView("landing");
                    setFarmerPrefs(null); // Reset prefs if they go back
                }}
            />
        );
    }

    // ── 3. Customer Flow ─────────────────────────────────────────────────
    if (view === "customer") {
        return (
            <CustomerDashboard
                onBack={() => setView("landing")}
            />
        );
    }

    return null;
}
import { useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import FarmerOnboarding from "./pages/FarmerOnboarding";
import FarmerDashboard from "./pages/FarmerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

export default function App() {
    const [view, setView] = useState("landing");
    const [farmerPrefs, setFarmerPrefs] = useState(null);

    // ── INTERCEPT BROWSER BACK BUTTON ────────────────────────────────────
    useEffect(() => {
        const handleHashChange = () => {
            // Read the current URL hash (e.g., "#farmer" becomes "farmer")
            const hash = window.location.hash.replace("#", "");

            if (hash === "farmer") {
                setView("farmer");
            } else if (hash === "customer") {
                setView("customer");
            } else {
                // If there's no hash, or they went back to the start
                setView("landing");
                setFarmerPrefs(null); // Reset farmer prefs automatically
            }
        };

        // Run once on load to catch if someone refreshes the page
        handleHashChange();

        // Listen for the physical browser Back/Forward buttons
        window.addEventListener("hashchange", handleHashChange);

        // Cleanup listener on unmount
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // Custom navigation function to change the URL hash
    const navigateTo = (newView) => {
        window.location.hash = newView;
    };

    // ── 1. Landing Page ──────────────────────────────────────────────────
    if (view === "landing") {
        // Use navigateTo instead of setView directly
        return <LandingPage onEnter={(mode) => navigateTo(mode)} />;
    }

    // ── 2. Farmer Flow ───────────────────────────────────────────────────
    if (view === "farmer") {
        if (!farmerPrefs) {
            return (
                <FarmerOnboarding
                    onComplete={(data) => setFarmerPrefs(data)}
                />
            );
        }

        return (
            <FarmerDashboard
                userPrefs={farmerPrefs}
                onBack={() => navigateTo("landing")}
            />
        );
    }

    // ── 3. Customer Flow ─────────────────────────────────────────────────
    if (view === "customer") {
        return (
            <CustomerDashboard
                onBack={() => navigateTo("landing")}
            />
        );
    }

    return null;
}
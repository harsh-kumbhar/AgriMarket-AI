import React, { useState } from "react";
import { Sprout, MapPin, ArrowRight } from "lucide-react";

const FarmerOnboarding = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    crop: "Onion",
    district: "Pune",
    unit: "kg",
  });

  const crops = ["Onion", "Tomato", "Potato", "Wheat"];
  const districts = ["Pune", "Nashik", "Mumbai", "Nagpur", "Thane"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a3a2a]/90 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden font-['Poppins']">
        {/* Header Section */}
        <div className="bg-[#52b788] p-8 text-[#1a3a2a] text-center">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sprout size={32} />
          </div>
          <h2 className="text-2xl font-bold">Farmer Setup</h2>
          <p className="text-sm opacity-80">Help us personalize your market insights</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Crop Selection */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-600 mb-2">
              <Sprout size={16} className="mr-2 text-[#52b788]" /> What do you grow?
            </label>
            <select
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#52b788] outline-none transition-all"
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
            >
              {crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* District Selection */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-600 mb-2">
              <MapPin size={16} className="mr-2 text-[#52b788]" /> Your District
            </label>
            <select
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-[#52b788] outline-none transition-all"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
            <span className="text-sm font-semibold text-gray-600">Preferred Unit</span>
            <div className="flex bg-gray-200 rounded-lg p-1">
              {["kg", "quintal"].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setFormData({ ...formData, unit: u })}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    formData.unit === u ? "bg-white text-[#1a3a2a] shadow-sm" : "text-gray-500"
                  }`}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#1a3a2a] text-white py-4 rounded-2xl font-bold flex items-center justify-center group hover:bg-[#2d5a44] transition-all"
          >
            Get Market Insights
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FarmerOnboarding;
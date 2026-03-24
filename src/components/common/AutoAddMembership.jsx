import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TIER_CONFIG = {
  demo: {
    amount: 0,
    days: 7,
    description: "Trial Membership",
    paymentMode: "Free"
  },
  silver: {
    amount: 50,
    days: 30,
    description: "Standard Silver Tier",
    paymentMode: "Cash"
  },
  gold: {
    amount: 500,
    days: 365,
    description: "Premium Gold Tier",
    paymentMode: "Online"
  },
};

export default function AutoAddMembership({ onConfigGenerated }) {
  const [selectedTier, setSelectedTier] = useState("");

  const handleAddTier = () => {
    if (!selectedTier) return;

    const config = TIER_CONFIG[selectedTier];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + config.days);

    const payload = {
      tier: selectedTier,
      amount: config.amount,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      description: config.description,
      paymentMode: config.paymentMode,
    };

    onConfigGenerated(payload);
  };

  return (
    <div className="w-full space-y-2 px-4">
      <label className="block text-sm font-bold text-gray-900">Select Tier</label>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Select Tier...</option>
            <option value="demo">Demo</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>

        <button
          onClick={handleAddTier}
          disabled={!selectedTier}
          className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-black active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
        >
          Add
        </button>
      </div>
    </div>
  );
};
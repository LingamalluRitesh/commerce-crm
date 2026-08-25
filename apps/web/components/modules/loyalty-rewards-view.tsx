"use client";

import React, { useState } from "react";
import {
  Award,
  Crown,
  Gift,
  Coins,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface RewardItem {
  id: string;
  title: string;
  pointsCost: number;
  dollarVal: number;
  category: "DISCOUNT" | "SWAG" | "EXPERIENCE" | "SERVICE";
}

const REWARDS: RewardItem[] = [
  { id: "REW-01", title: "$50 Off Next Monthly Subscription Invoice", pointsCost: 5000, dollarVal: 50, category: "DISCOUNT" },
  { id: "REW-02", title: "$150 Off Server Hardware Component Order", pointsCost: 15000, dollarVal: 150, category: "DISCOUNT" },
  { id: "REW-03", title: "Dedicated Solutions Architect 1-on-1 Consultation", pointsCost: 20000, dollarVal: 500, category: "SERVICE" },
  { id: "REW-04", title: "Executive Annual User Conference Pass", pointsCost: 35000, dollarVal: 1200, category: "EXPERIENCE" },
  { id: "REW-05", title: "Enterprise Custom Swag Kit (Jacket + Thermal Mug)", pointsCost: 8000, dollarVal: 100, category: "SWAG" },
];

export function LoyaltyRewardsView() {
  const [pointsBalance, setPointsBalance] = useState<number>(18500);
  const [lifetimeEarned, setLifetimeEarned] = useState<number>(23500);
  const [currentTier, setCurrentTier] = useState<string>("GOLD");
  const [redeemed, setRedeemed] = useState<string[]>([]);

  const handleRedeem = (item: RewardItem) => {
    if (pointsBalance >= item.pointsCost) {
      setPointsBalance(pointsBalance - item.pointsCost);
      setRedeemed([...redeemed, item.id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Enterprise Loyalty Rewards & VIP Tier Engine</h2>
              <p className="text-sm text-slate-400">
                Omnichannel points accrual (1.5x Gold Multiplier), rolling FIFO expiration & real-time redemption catalogue.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 font-semibold">
            <Sparkles className="h-4 w-4 text-amber-400" />
            VIP Gold Member Active
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Points Balance</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{pointsBalance.toLocaleString()} pts</div>
          <div className="text-xs text-amber-400 mt-1">Value: ${(pointsBalance * 0.01).toFixed(2)} USD</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current VIP Tier</span>
            <Crown className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">{currentTier} (1.5x)</div>
          <div className="text-xs text-slate-400 mt-1">50,000 pts for Platinum (2.0x)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lifetime Points Earned</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{lifetimeEarned.toLocaleString()} pts</div>
          <div className="text-xs text-indigo-300 mt-1">Across 14 enterprise orders</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Points Expiration</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">Zero Expiring</div>
          <div className="text-xs text-slate-400 mt-1">Active within last 365 days</div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Available Rewards Catalog ({REWARDS.length} Rewards)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {REWARDS.map((r) => {
            const isRedeemed = redeemed.includes(r.id);
            const canAfford = pointsBalance >= r.pointsCost;

            return (
              <div
                key={r.id}
                className="bg-slate-950/80 border border-slate-800 p-5 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {r.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {r.pointsCost.toLocaleString()} PTS
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-100">{r.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Equivalent Value: ${r.dollarVal} USD</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {isRedeemed ? (
                    <button
                      disabled
                      className="w-full py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Claimed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRedeem(r)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? "bg-amber-600 hover:bg-amber-500 text-white"
                          : "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800"
                      }`}
                    >
                      <Gift className="h-3.5 w-3.5" />
                      {canAfford ? "Redeem Reward" : "Need More Points"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Compass,
  PieChart,
  TrendingUp,
  Share2,
  DollarSign,
  ShieldCheck,
  Zap,
  BarChart3,
} from "lucide-react";

interface ChannelAttributionUI {
  channel: string;
  name: string;
  attributedRevenue: number;
  conversions: number;
  spend: number;
  roas: number;
}

const SAMPLE_ATTRIBUTION: ChannelAttributionUI[] = [
  { channel: "PAID_SEARCH_SEM", name: "Paid Search (Google Ads)", attributedRevenue: 145000.0, conversions: 42.5, spend: 28000.0, roas: 5.18 },
  { channel: "PAID_SOCIAL_LINKEDIN", name: "LinkedIn B2B Sponsored Content", attributedRevenue: 98000.0, conversions: 26.0, spend: 22000.0, roas: 4.45 },
  { channel: "INBOUND_CONTENT_BLOG", name: "Organic Tech Blog & SEO", attributedRevenue: 182000.0, conversions: 65.2, spend: 12000.0, roas: 15.17 },
  { channel: "WEBINAR_EVENT", name: "Executive Product Webinars", attributedRevenue: 115000.0, conversions: 31.8, spend: 15000.0, roas: 7.67 },
  { channel: "EMAIL_NURTURE", name: "Automated Lifecycle Drip", attributedRevenue: 76000.0, conversions: 24.5, spend: 4500.0, roas: 16.89 },
];

export function CustomerJourneyAttributionView() {
  const [modelType, setModelType] = useState<string>("U_SHAPED_POSITION");
  const [channels, setChannels] = useState<ChannelAttributionUI[]>(SAMPLE_ATTRIBUTION);

  const totalAttributed = channels.reduce((sum, c) => sum + c.attributedRevenue, 0);
  const totalSpend = channels.reduce((sum, c) => sum + c.spend, 0);
  const overallRoas = (totalAttributed / totalSpend).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Omnichannel Customer Journey & Multi-Touch Attribution</h2>
              <p className="text-sm text-slate-400">
                Multi-channel touchpoint weighting: Shapley Game Theory, Markov Removal Effects & Position-Based U-Curve models.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="U_SHAPED_POSITION">U-Shaped Position Model (40-20-40)</option>
            <option value="SHAPLEY_GAME_THEORY">Shapley Value Game Theory</option>
            <option value="TIME_DECAY">Exponential Time-Decay (7-Day Halflife)</option>
            <option value="LINEAR">Linear Equal Distribution</option>
            <option value="FIRST_TOUCH">First-Touch Acquisition</option>
            <option value="LAST_TOUCH">Last-Touch Close</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total Attributed Pipeline Revenue</span>
          <span className="text-xl font-bold text-slate-100">${totalAttributed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total Cross-Channel Ad Spend</span>
          <span className="text-xl font-bold text-slate-200">${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Blended Return on Ad Spend (ROAS)</span>
          <span className="text-xl font-bold text-emerald-400">{overallRoas}x Efficiency</span>
        </div>
      </div>

      {/* Channels Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-400" /> Channel Performance & Marginal Attribution Value
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">Channel Medium</th>
                <th className="py-2 font-medium text-right">Attributed Revenue</th>
                <th className="py-2 font-medium text-center">Attributed Conversions</th>
                <th className="py-2 font-medium text-right">Channel Spend</th>
                <th className="py-2 font-medium text-right">Channel ROAS</th>
                <th className="py-2 font-medium text-right">Revenue Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {channels.map((c) => {
                const sharePct = ((c.attributedRevenue / totalAttributed) * 100).toFixed(1);
                return (
                  <tr key={c.channel} className="text-slate-300">
                    <td className="py-3">
                      <span className="font-semibold text-slate-200 block">{c.name}</span>
                      <span className="text-[10px] font-mono text-indigo-400">{c.channel}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-100">${c.attributedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 text-center font-mono text-slate-300">{c.conversions.toFixed(1)}</td>
                    <td className="py-3 text-right text-slate-400">${c.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 text-right font-bold text-emerald-400">{c.roas}x</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${sharePct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-300">{sharePct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Share2,
  PieChart,
  DollarSign,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight
} from "lucide-react";

interface ChannelAttr {
  channel: string;
  spend: number;
  firstTouch: number;
  lastTouch: number;
  uShaped: number;
  markov: number;
  roas: number;
}

const CHANNELS: ChannelAttr[] = [
  { channel: "LinkedIn Sponsored Content", spend: 45000, firstTouch: 180000, lastTouch: 120000, uShaped: 160000, markov: 175000, roas: 3.89 },
  { channel: "Paid Search (Google SEM)", spend: 38000, firstTouch: 90000, lastTouch: 210000, uShaped: 170000, markov: 155000, roas: 4.08 },
  { channel: "Outbound BDR Sequence", spend: 28000, firstTouch: 220000, lastTouch: 85000, uShaped: 185000, markov: 190000, roas: 6.79 },
  { channel: "Industry Tech Conferences", spend: 50000, firstTouch: 140000, lastTouch: 95000, uShaped: 130000, markov: 145000, roas: 2.90 },
  { channel: "Organic Search / SEO", spend: 15000, firstTouch: 110000, lastTouch: 130000, uShaped: 125000, markov: 135000, roas: 9.00 },
];

export function MarketingAttributionView() {
  const [channels, setChannels] = useState<ChannelAttr[]>(CHANNELS);
  const [selectedModel, setSelectedModel] = useState<string>("markov");

  const totalSpend = channels.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = channels.reduce((acc, c) => acc + c.markov, 0);
  const blendedROAS = (totalRevenue / totalSpend).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Multi-Touch Marketing Attribution & Markov Chain Engine</h2>
              <p className="text-sm text-slate-400">
                First-Touch, Last-Touch, U-Shaped & Data-Driven Markov Chain removal effect conversion attribution.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-rose-400" />
            {blendedROAS}x Blended Return on Ad Spend
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Attributed Bookings</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalRevenue / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Omnichannel Touchpoint Verified
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Program Spend</span>
            <Target className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${(totalSpend / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-slate-400 mt-1">Across 5 marketing channels</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Performing Channel</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400">Outbound BDR</div>
          <div className="text-xs text-slate-400 mt-1">6.79x Markov ROAS ($190k)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Attribution Model</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">Markov Chain</div>
          <div className="text-xs text-slate-400 mt-1">Removal effect algorithm</div>
        </div>
      </div>

      {/* Attribution Comparison Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Attribution Model Comparison Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Marketing Channel</th>
                <th className="py-3 px-4 font-semibold text-right">Spend</th>
                <th className="py-3 px-4 font-semibold text-right">First-Touch</th>
                <th className="py-3 px-4 font-semibold text-right">Last-Touch</th>
                <th className="py-3 px-4 font-semibold text-right">U-Shaped (40-20-40)</th>
                <th className="py-3 px-4 font-semibold text-right">Markov Removal</th>
                <th className="py-3 px-4 font-semibold text-right">Markov ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {channels.map((c) => (
                <tr key={c.channel} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-100">{c.channel}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">${c.spend.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${c.firstTouch.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${c.lastTouch.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${c.uShaped.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${c.markov.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-cyan-400">{c.roas}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Tag,
  Gift,
  ShoppingCart,
  Percent,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface CartLine {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  qty: number;
}

const SAMPLE_PRODUCTS: CartLine[] = [
  { id: "1", sku: "SRV-NODE-X9", name: "Enterprise Server Motherboard", category: "HARDWARE", price: 4500.0, qty: 1 },
  { id: "2", sku: "RAM-64GB-ECC", name: "64GB DDR5 ECC RAM Module", category: "HARDWARE", price: 180.0, qty: 3 },
  { id: "3", sku: "LIC-ENTERPRISE-SAAS", name: "Enterprise Annual SaaS License", category: "SOFTWARE", price: 1200.0, qty: 1 },
];

export function PromotionsPricingView() {
  const [items, setItems] = useState<CartLine[]>(SAMPLE_PRODUCTS);
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupons, setAppliedCoupons] = useState<string[]>(["ENTERPRISE20"]);

  const grossSubtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  // Evaluate promotions
  let totalDiscount = 0;
  const discountBreakdown: { code: string; desc: string; amount: number }[] = [];

  if (appliedCoupons.includes("ENTERPRISE20") && grossSubtotal >= 1000) {
    const d = grossSubtotal * 0.20;
    totalDiscount += d;
    discountBreakdown.push({ code: "ENTERPRISE20", desc: "20% Off Orders over $1,000", amount: d });
  }

  if (appliedCoupons.includes("BOGORAM")) {
    const ramItem = items.find((i) => i.sku === "RAM-64GB-ECC");
    if (ramItem && ramItem.qty >= 3) {
      const freeUnits = Math.floor(ramItem.qty / 3);
      const d = freeUnits * ramItem.price;
      totalDiscount += d;
      discountBreakdown.push({ code: "BOGORAM", desc: "Buy 2 RAM Modules Get 1 Free", amount: d });
    }
  }

  const finalSubtotal = Math.max(0, grossSubtotal - totalDiscount);

  const handleAddCoupon = () => {
    if (!couponInput.trim()) return;
    const clean = couponInput.trim().toUpperCase();
    if (!appliedCoupons.includes(clean)) {
      setAppliedCoupons([...appliedCoupons, clean]);
    }
    setCouponInput("");
  };

  const handleRemoveCoupon = (code: string) => {
    setAppliedCoupons(appliedCoupons.filter((c) => c !== code));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">B2B Promotions, BOGO & Cart Discount Rules</h2>
              <p className="text-sm text-slate-400">
                Rule stacking, buy X get Y discounts, tiered basket spend thresholds & customer segment promo engines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-rose-400" />
            Active Stacking Rules Engine
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Cart Value</span>
            <ShoppingCart className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${grossSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-400 mt-1">{items.reduce((acc, i) => acc + i.qty, 0)} line items</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Discounts Applied</span>
            <Gift className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">-${totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-emerald-300 mt-1">{discountBreakdown.length} active coupons applied</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Effective Savings</span>
            <Percent className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {grossSubtotal > 0 ? ((totalDiscount / grossSubtotal) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Blended order savings</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Final Net Pay</span>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">${finalSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-cyan-300 mt-1">Ready for checkout</div>
        </div>
      </div>

      {/* Cart & Promotions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800/80">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Simulated Basket Line Items
            </h3>
          </div>

          <div className="divide-y divide-slate-800/40">
            {items.map((i) => (
              <div key={i.id} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                <div>
                  <h4 className="font-semibold text-sm text-slate-100">{i.name}</h4>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {i.sku} • {i.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-100 text-sm font-mono">
                    ${(i.price * i.qty).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-400">
                    {i.qty} × ${i.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Codes Panel */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Apply Promotional Codes
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. BOGORAM, ENTERPRISE20"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono uppercase"
            />
            <button
              onClick={handleAddCoupon}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Apply
            </button>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applied Coupons</div>
            {appliedCoupons.map((code) => (
              <div
                key={code}
                className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-rose-400" />
                  <span className="font-mono font-bold text-slate-200">{code}</span>
                </div>
                <button
                  onClick={() => handleRemoveCoupon(code)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {discountBreakdown.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Discount Summary</div>
              {discountBreakdown.map((d) => (
                <div key={d.code} className="flex justify-between text-xs text-emerald-400 font-medium">
                  <span>{d.desc}</span>
                  <span className="font-mono">-${d.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

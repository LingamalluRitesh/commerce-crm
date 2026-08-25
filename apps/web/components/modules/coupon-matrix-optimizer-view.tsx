"use client";

import React, { useState } from "react";
import {
  Tag,
  Sparkles,
  Percent,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Trash2,
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  qty: number;
}

interface CouponRule {
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  policy: "EXCLUSIVE" | "STACKABLE";
  minSubtotal: number;
}

const REGISTERED_COUPONS: CouponRule[] = [
  { code: "WELCOME15", name: "New Enterprise Customer 15% Off", type: "PERCENTAGE", value: 15, policy: "STACKABLE", minSubtotal: 100 },
  { code: "FREESHIP", name: "Free Expedited Freight Shipping", type: "FREE_SHIPPING", value: 45, policy: "STACKABLE", minSubtotal: 250 },
  { code: "TIER50", name: "$50 Volume Hardware Rebate", type: "FIXED_AMOUNT", value: 50, policy: "STACKABLE", minSubtotal: 500 },
  { code: "VIPEXCLUSIVE", name: "VIP 30% Off Exclusive Mega Sale", type: "PERCENTAGE", value: 30, policy: "EXCLUSIVE", minSubtotal: 1000 },
];

export function CouponMatrixOptimizerView() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: "ITEM-01", name: "Edge IoT Gateway Appliance", category: "HARDWARE", unitPrice: 450, qty: 2 },
    { id: "ITEM-02", name: "Enterprise SaaS Annual Seat", category: "SOFTWARE", unitPrice: 200, qty: 1 },
    { id: "ITEM-03", name: "Cat6A Shielded Cabling Spool", category: "ACCESSORIES", unitPrice: 85, qty: 2 },
  ]);

  const [inputCode, setInputCode] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["WELCOME15", "FREESHIP", "TIER50"]);
  const shippingFee = 45;

  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.qty, 0);

  // Combinatorial evaluation logic
  const activeCouponObjs = REGISTERED_COUPONS.filter((c) => selectedCodes.includes(c.code));
  const exclusiveCandidate = activeCouponObjs.find((c) => c.policy === "EXCLUSIVE" && rawSubtotal >= c.minSubtotal);
  const stackableCandidates = activeCouponObjs.filter((c) => c.policy === "STACKABLE" && rawSubtotal >= c.minSubtotal);

  let appliedCoupons: { code: string; name: string; discount: number; freeShip: boolean }[] = [];
  let rejected: { code: string; reason: string }[] = [];

  const exclusiveDiscount = exclusiveCandidate ? (rawSubtotal * exclusiveCandidate.value) / 100 : 0;
  let stackableDiscount = 0;
  let freeShippingGranted = false;

  stackableCandidates.forEach((c) => {
    if (c.type === "PERCENTAGE") {
      stackableDiscount += (rawSubtotal * c.value) / 100;
    } else if (c.type === "FIXED_AMOUNT") {
      stackableDiscount += c.value;
    } else if (c.type === "FREE_SHIPPING") {
      freeShippingGranted = true;
      stackableDiscount += shippingFee;
    }
  });

  if (exclusiveCandidate && exclusiveDiscount > stackableDiscount) {
    appliedCoupons = [{ code: exclusiveCandidate.code, name: exclusiveCandidate.name, discount: exclusiveDiscount, freeShip: false }];
    stackableCandidates.forEach((s) => rejected.push({ code: s.code, reason: "Surpassed by higher-value exclusive coupon" }));
  } else {
    appliedCoupons = stackableCandidates.map((c) => {
      let d = 0;
      if (c.type === "PERCENTAGE") d = (rawSubtotal * c.value) / 100;
      else if (c.type === "FIXED_AMOUNT") d = c.value;
      else if (c.type === "FREE_SHIPPING") d = shippingFee;
      return { code: c.code, name: c.name, discount: d, freeShip: c.type === "FREE_SHIPPING" };
    });
    if (exclusiveCandidate) {
      rejected.push({ code: exclusiveCandidate.code, reason: "Exclusive coupon cannot combine with stackable coupons" });
    }
  }

  // Check subtotal thresholds for inactive ones
  selectedCodes.forEach((c) => {
    const found = REGISTERED_COUPONS.find((r) => r.code === c);
    if (found && rawSubtotal < found.minSubtotal) {
      rejected.push({ code: c, reason: `Basket subtotal ($${rawSubtotal}) is below threshold ($${found.minSubtotal})` });
    }
  });

  const totalDiscount = appliedCoupons.reduce((sum, a) => sum + a.discount, 0);
  const finalShipping = freeShippingGranted ? 0 : shippingFee;
  const finalPayable = Math.max(0, rawSubtotal - (totalDiscount - (freeShippingGranted ? shippingFee : 0))) + finalShipping;

  const handleAddCode = () => {
    const upper = inputCode.trim().toUpperCase();
    if (upper && !selectedCodes.includes(upper)) {
      setSelectedCodes([...selectedCodes, upper]);
      setInputCode("");
    }
  };

  const handleRemoveCode = (code: string) => {
    setSelectedCodes(selectedCodes.filter((c) => c !== code));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Dynamic Coupon Stacking Matrix & Basket Optimizer</h2>
              <p className="text-sm text-slate-400">
                Solves optimal non-conflicting coupon subsets, enforces minimum order values, and prevents promo code abuse.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> ASC 606 Compliant Allocation
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cart & Coupons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <ShoppingCart className="h-4 w-4 text-cyan-400" /> Current Shopping Basket
              </div>
              <span className="text-xs text-slate-400">{cartItems.length} items</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {cartItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      Category: {item.category} • ${item.unitPrice.toFixed(2)} x {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-100">${(item.unitPrice * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Stacking Input */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Apply Promotional Codes
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon (e.g. WELCOME15, FREESHIP, VIPEXCLUSIVE)..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAddCode}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="h-4 w-4" /> Add Code
              </button>
            </div>

            {/* Selected Code Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedCodes.map((code) => (
                <span
                  key={code}
                  className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-2"
                >
                  <Tag className="h-3 w-3 text-cyan-400" />
                  {code}
                  <button onClick={() => handleRemoveCode(code)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Settlement & Optimization Output */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-200">Combinatorial Optimization Summary</h3>

            <div className="space-y-2.5 text-sm border-b border-slate-800 pb-4">
              <div className="flex justify-between text-slate-400">
                <span>Basket Subtotal</span>
                <span className="text-slate-200">${rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Standard Freight</span>
                <span className={freeShippingGranted ? "line-through text-slate-500" : "text-slate-200"}>
                  ${shippingFee.toFixed(2)}
                </span>
              </div>
              {appliedCoupons.map((a) => (
                <div key={a.code} className="flex justify-between text-emerald-400 font-medium">
                  <span className="flex items-center gap-1 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {a.code} ({a.name})
                  </span>
                  <span>-${a.discount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-400 pt-1">
                <span>Total Savings</span>
                <span className="text-emerald-400 font-bold">-${totalDiscount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-medium text-slate-300">Final Order Payable</span>
              <span className="text-2xl font-bold text-slate-100">${finalPayable.toFixed(2)}</span>
            </div>

            {rejected.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 space-y-1.5">
                <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Disqualified / Overridden Codes
                </p>
                {rejected.map((r, i) => (
                  <p key={i} className="text-xs text-amber-300/80">
                    <span className="font-mono font-bold text-amber-300">{r.code}</span>: {r.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

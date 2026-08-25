"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
}

export function QuoteBuilder() {
  const [items, setItems] = useState<QuoteLineItem[]>([
    { id: "1", description: "Enterprise Cloud Node Compute X9", quantity: 10, unitPrice: 4500.00, discountPercentage: 10 },
    { id: "2", description: "Industrial IoT Gateway Pro", quantity: 25, unitPrice: 1100.00, discountPercentage: 5 },
    { id: "3", description: "Dedicated Solution Architect Support (Hours)", quantity: 100, unitPrice: 250.00, discountPercentage: 0 },
  ]);

  const subtotal = items.reduce((acc, it) => {
    const discountedPrice = it.unitPrice * (1 - it.discountPercentage / 100);
    return acc + discountedPrice * it.quantity;
  }, 0);

  const taxRate = 8.25;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalGross = subtotal + taxAmount;

  return (
    <Card variant="bordered" className="p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
        <div>
          <CardTitle>Commercial Proposal & Quotation Designer</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Live Decimal line-item arithmetic with dynamic tier volume discounts.</p>
        </div>
        <Button variant="default" size="sm">+ Add Line Item</Button>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-slate-400 uppercase">
          <span className="col-span-5">Item Description</span>
          <span className="col-span-2 text-center">Quantity</span>
          <span className="col-span-2 text-right">Unit Price</span>
          <span className="col-span-1 text-center">Disc %</span>
          <span className="col-span-2 text-right">Total Net</span>
        </div>

        {items.map((it) => {
          const itemNet = it.unitPrice * (1 - it.discountPercentage / 100) * it.quantity;
          return (
            <div key={it.id} className="grid grid-cols-12 gap-3 items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="col-span-5 font-semibold text-slate-800 dark:text-slate-200">{it.description}</span>
              <span className="col-span-2 text-center font-mono">{it.quantity}</span>
              <span className="col-span-2 text-right font-mono">${it.unitPrice.toFixed(2)}</span>
              <span className="col-span-1 text-center font-mono text-indigo-600">{it.discountPercentage}%</span>
              <span className="col-span-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                ${itemNet.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
        <div className="w-72 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Net Subtotal:</span>
            <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Tax ({taxRate}%):</span>
            <span className="font-mono font-semibold">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 border-t pt-2">
            <span>Total Gross:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">${totalGross.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

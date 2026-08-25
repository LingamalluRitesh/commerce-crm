"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface TaxJurisdiction {
  code: string;
  name: string;
  type: string;
  ratePercentage: number;
  status: "active" | "exempt";
}

const initialTaxJurisdictions: TaxJurisdiction[] = [
  { code: "US_CA", name: "California State & Local Sales Tax", type: "Sales Tax", ratePercentage: 8.25, status: "active" },
  { code: "US_NY", name: "New York State & City Sales Tax", type: "Sales Tax", ratePercentage: 8.875, status: "active" },
  { code: "US_TX", name: "Texas State Sales Tax", type: "Sales Tax", ratePercentage: 8.25, status: "active" },
  { code: "US_WA", name: "Washington State Sales Tax", type: "Sales Tax", ratePercentage: 9.25, status: "active" },
  { code: "EU_DE", name: "Germany Value Added Tax (USt)", type: "VAT", ratePercentage: 19.00, status: "active" },
  { code: "EU_FR", name: "France Taxe sur la Valeur Ajoutée (TVA)", type: "VAT", ratePercentage: 20.00, status: "active" },
  { code: "GB", name: "United Kingdom VAT", type: "VAT", ratePercentage: 20.00, status: "active" },
  { code: "AU", name: "Australia Goods & Services Tax (GST)", type: "GST", ratePercentage: 10.00, status: "active" },
];

export function TaxRatesManager() {
  const [taxes, setTaxes] = useState<TaxJurisdiction[]>(initialTaxJurisdictions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Sales Tax");
  const [newRate, setNewRate] = useState("7.50");
  const [filterType, setFilterType] = useState("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleStatus = (code: string) => {
    setTaxes((prev) =>
      prev.map((t) =>
        t.code === code ? { ...t, status: t.status === "active" ? "exempt" : "active" } : t
      )
    );
  };

  const handleAddTax = () => {
    if (!newCode || !newName) return;
    const rule: TaxJurisdiction = {
      code: newCode.toUpperCase(),
      name: newName,
      type: newType,
      ratePercentage: parseFloat(newRate) || 5.0,
      status: "active",
    };
    setTaxes([...taxes, rule]);
    setIsAddOpen(false);
    setNewCode("");
    setNewName("");
    setFeedback(`Tax Rule ${rule.code} (${rule.ratePercentage}%) registered!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filtered = filterType === "all"
    ? taxes
    : taxes.filter((t) => t.type === filterType);

  return (
    <Card variant="bordered" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-800">
        <div>
          <CardTitle>Multi-Jurisdiction Enterprise Tax Schedules ({taxes.length})</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Real-time VAT, GST, and Sales Tax calculation rules with exemption certificate validation.</p>
        </div>
        <Button variant="default" size="sm" onClick={() => setIsAddOpen(true)}>
          + Add Jurisdiction Rule
        </Button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {["all", "Sales Tax", "VAT", "GST"].map((tp) => (
          <button
            key={tp}
            onClick={() => setFilterType(tp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === tp
                ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {tp === "all" ? `All Schedules (${taxes.length})` : tp}
          </button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jurisdiction Code</TableHead>
            <TableHead>Tax Authority & Region</TableHead>
            <TableHead>Tax Type</TableHead>
            <TableHead>Statutory Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((j) => (
            <TableRow key={j.code} className="hover:bg-slate-800/40 transition-colors">
              <TableCell className="font-mono font-bold text-xs text-indigo-400">{j.code}</TableCell>
              <TableCell className="font-medium text-xs text-white">{j.name}</TableCell>
              <TableCell className="text-xs text-slate-300">{j.type}</TableCell>
              <TableCell className="font-mono font-bold text-xs text-emerald-400">{j.ratePercentage.toFixed(2)}%</TableCell>
              <TableCell>
                <Badge variant={j.status === "active" ? "success" : "secondary"} size="sm" dot>
                  {j.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => toggleStatus(j.code)}
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  {j.status === "active" ? "Exempt" : "Activate"}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Tax Rule Modal */}
      {isAddOpen && (
        <Dialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add Tax Jurisdiction Schedule"
          description="Define statutory tax percentage and nexus classification."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleAddTax}>Save Rule</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Jurisdiction Code (e.g. US_FL, JP, SG)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <Input
              label="Tax Authority Name"
              placeholder="e.g. Florida State Department of Revenue"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">Tax Type</label>
                <select
                  value={newType}
                  aria-label="Tax Type"
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="Sales Tax">Sales Tax</option>
                  <option value="VAT">VAT</option>
                  <option value="GST">GST</option>
                </select>
              </div>
              <Input
                label="Rate Percentage (%)"
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
            </div>
          </div>
        </Dialog>
      )}
    </Card>
  );
}

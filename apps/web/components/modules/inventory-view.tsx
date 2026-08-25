"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface StockRecord {
  id: string;
  sku: string;
  name: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
}

const initialStock: StockRecord[] = [
  { id: "st-1", sku: "SRV-NODE-01", name: "Enterprise Edge Node Server", warehouse: "Dallas Primary (W-1)", onHand: 42, reserved: 8, available: 34, reorderPoint: 15 },
  { id: "st-2", sku: "IOT-GW-MAX", name: "Industrial IoT Gateway Pro", warehouse: "Frankfurt Hub (W-2)", onHand: 120, reserved: 25, available: 95, reorderPoint: 30 },
  { id: "st-3", sku: "CAB-FIBER-10M", name: "Armored Fiber Cable 10m", warehouse: "Singapore Central (W-3)", onHand: 450, reserved: 40, available: 410, reorderPoint: 100 },
  { id: "st-4", sku: "PWR-RPS-850", name: "Redundant Power Supply 850W", warehouse: "Dallas Primary (W-1)", onHand: 8, reserved: 4, available: 4, reorderPoint: 10 },
];

export function InventoryView() {
  const [stock, setStock] = useState<StockRecord[]>(initialStock);
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<StockRecord | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("10");
  const [adjustReason, setAdjustReason] = useState("Inbound Shipment Restock");
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const filtered = selectedWarehouse === "all"
    ? stock
    : stock.filter((s) => s.warehouse.includes(selectedWarehouse));

  const handleAdjustStock = () => {
    if (!selectedItemForAdjust) return;
    const delta = parseInt(adjustDelta, 10) || 0;
    setStock((prev) =>
      prev.map((s) => {
        if (s.id === selectedItemForAdjust.id) {
          const newOnHand = Math.max(0, s.onHand + delta);
          const newAvailable = Math.max(0, newOnHand - s.reserved);
          return { ...s, onHand: newOnHand, available: newAvailable };
        }
        return s;
      })
    );
    setIsAdjustOpen(false);
    setSelectedItemForAdjust(null);
  };

  const handleDispatchTransfer = () => {
    setTransferSuccess("Transfer dispatched: 10x SRV-NODE-01 to Frankfurt Hub (Tracking: DHL-EXP-9921)");
    setIsTransferOpen(false);
    setTimeout(() => setTransferSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Multi-Warehouse Inventory & Fulfillment
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stock reservation, ledger movements, inter-warehouse transfers, and PO tracking.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(true)}>
            🔄 Inter-Warehouse Transfer
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setSelectedItemForAdjust(stock[0]);
              setIsAdjustOpen(true);
            }}
          >
            ⚡ Adjust Stock Ledger
          </Button>
        </div>
      </div>

      {transferSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {transferSuccess}</span>
          <button onClick={() => setTransferSuccess(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Warehouse Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Warehouses" },
          { id: "Dallas", label: "🏢 Dallas W-1" },
          { id: "Frankfurt", label: "🌍 Frankfurt W-2" },
          { id: "Singapore", label: "🌏 Singapore W-3" },
        ].map((w) => (
          <button
            key={w.id}
            onClick={() => setSelectedWarehouse(w.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedWarehouse === w.id
                ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Stock Table */}
      <Card variant="bordered" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU & Product Name</TableHead>
              <TableHead>Warehouse Location</TableHead>
              <TableHead>Quantity On Hand</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Health Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-800/40 transition-colors">
                <TableCell>
                  <div className="font-mono font-bold text-xs text-indigo-400">{item.sku}</div>
                  <div className="text-xs font-medium text-white">{item.name}</div>
                </TableCell>
                <TableCell className="text-xs text-slate-300">{item.warehouse}</TableCell>
                <TableCell className="font-mono font-semibold text-xs text-slate-200">{item.onHand}</TableCell>
                <TableCell className="font-mono text-xs text-amber-400">{item.reserved}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-emerald-400">{item.available}</TableCell>
                <TableCell>
                  {item.available <= item.reorderPoint ? (
                    <Badge variant="warning" dot size="sm">Low Stock (≤{item.reorderPoint})</Badge>
                  ) : (
                    <Badge variant="success" dot size="sm">Optimal Level</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setSelectedItemForAdjust(item);
                      setIsAdjustOpen(true);
                    }}
                  >
                    Adjust ➔
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Adjust Stock Dialog */}
      {isAdjustOpen && selectedItemForAdjust && (
        <Dialog
          open={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          title={`Adjust Inventory — ${selectedItemForAdjust.sku}`}
          description={`Location: ${selectedItemForAdjust.warehouse} • Current On-Hand: ${selectedItemForAdjust.onHand}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleAdjustStock}>Commit Adjustment</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Quantity Adjustment Delta (+/-)"
              type="number"
              value={adjustDelta}
              onChange={(e) => setAdjustDelta(e.target.value)}
              placeholder="e.g. 25 or -5"
            />
            <Input
              label="Adjustment Reason Code"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
            />
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-slate-300">
              <span>New Projected On-Hand:</span>
              <span className="font-mono font-bold text-emerald-400">
                {Math.max(0, selectedItemForAdjust.onHand + (parseInt(adjustDelta, 10) || 0))} units
              </span>
            </div>
          </div>
        </Dialog>
      )}

      {/* Transfer Dialog */}
      {isTransferOpen && (
        <Dialog
          open={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          title="Create Inter-Warehouse Stock Transfer"
          description="Initiate an atomic multi-item stock transfer between enterprise fulfillment hubs."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleDispatchTransfer}>Dispatch Transfer</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Source Warehouse" defaultValue="Dallas Primary (W-1)" />
              <Input label="Destination Warehouse" defaultValue="Frankfurt Hub (W-2)" />
            </div>
            <Input label="SKU & Quantity" defaultValue="SRV-NODE-01 (10 units)" />
            <Input label="Carrier & Tracking Ref" defaultValue="DHL Express Logistics (DHL-EXP-9921)" />
          </div>
        </Dialog>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

export interface StockRecord {
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
  { id: "st-5", sku: "SSD-NVME-64T", name: "64TB NVMe Enterprise Array", warehouse: "Frankfurt Hub (W-2)", onHand: 24, reserved: 6, available: 18, reorderPoint: 8 },
];

export function InventoryView() {
  const [stock, setStock] = useState<StockRecord[]>(initialStock);
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);

  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<StockRecord | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("10");
  const [adjustReason, setAdjustReason] = useState("Inbound Shipment Restock");

  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newWarehouse, setNewWarehouse] = useState("Dallas Primary (W-1)");
  const [newQty, setNewQty] = useState("50");
  const [newReorder, setNewReorder] = useState("15");

  const [feedback, setFeedback] = useState<string | null>(null);

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
    showFeedback(`Stock for ${selectedItemForAdjust.sku} updated by ${delta > 0 ? `+${delta}` : delta} units!`);
    setIsAdjustOpen(false);
    setSelectedItemForAdjust(null);
  };

  const handleDispatchTransfer = () => {
    showFeedback("Transfer dispatched: 10x SRV-NODE-01 to Frankfurt Hub (Tracking: DHL-EXP-9921)!");
    setIsTransferOpen(false);
  };

  const handleAddNewProduct = () => {
    if (!newSku || !newName) return;
    const qty = parseInt(newQty, 10) || 10;
    const item: StockRecord = {
      id: `st-${Date.now()}`,
      sku: newSku.toUpperCase(),
      name: newName,
      warehouse: newWarehouse,
      onHand: qty,
      reserved: 0,
      available: qty,
      reorderPoint: parseInt(newReorder, 10) || 5,
    };
    setStock([item, ...stock]);
    setIsNewProductOpen(false);
    setNewSku("");
    setNewName("");
    showFeedback(`Product ${item.sku} (${item.name}) registered to ${item.warehouse}!`);
  };

  const handleQuickRestock = (item: StockRecord) => {
    const restockQty = item.reorderPoint * 2;
    setStock((prev) =>
      prev.map((s) =>
        s.id === item.id
          ? { ...s, onHand: s.onHand + restockQty, available: s.available + restockQty }
          : s
      )
    );
    showFeedback(`Emergency restock order dispatched! +${restockQty} units allocated to ${item.sku}.`);
  };

  const handleExportCSV = () => {
    const headers = "SKU,ProductName,Warehouse,OnHand,Reserved,Available,ReorderPoint,Status\n";
    const rows = stock
      .map(
        (s) =>
          `"${s.sku}","${s.name}","${s.warehouse}",${s.onHand},${s.reserved},${s.available},${s.reorderPoint},"${s.available <= s.reorderPoint ? "LOW_STOCK" : "OPTIMAL"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Inventory CSV exported successfully!");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
  };

  const filtered = stock.filter((s) => {
    const matchesSearch =
      s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedWarehouse === "all") return true;
    return s.warehouse.includes(selectedWarehouse);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Multi-Warehouse Inventory & Fulfillment ({stock.length} Catalog SKUs)
            </h2>
            <Badge variant="purple" size="sm">Real-time Ledger</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock reservation, ledger movements, inter-warehouse transfers, and automated replenishment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            📥 Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(true)}>
            🔄 Transfer Stock
          </Button>
          <Button variant="default" size="sm" onClick={() => setIsNewProductOpen(true)}>
            + Add Catalog SKU
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Search & Warehouse Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search catalog by SKU or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: `All Warehouses (${stock.length})` },
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
                    <div className="flex items-center space-x-2">
                      <Badge variant="warning" dot size="sm">Low Stock (≤{item.reorderPoint})</Badge>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleQuickRestock(item)}
                        className="text-amber-400 hover:text-amber-300 text-[10px] p-1"
                      >
                        ⚡ Restock
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="success" dot size="sm">Optimal Level</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setSelectedItemForAdjust(item);
                      setIsAdjustOpen(true);
                    }}
                  >
                    Adjust Ledger ➔
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

      {/* Add New Product Dialog */}
      {isNewProductOpen && (
        <Dialog
          open={isNewProductOpen}
          onClose={() => setIsNewProductOpen(false)}
          title="Register Catalog Product SKU"
          description="Add enterprise hardware or component SKU to warehouse stock allocation."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewProductOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleAddNewProduct}>Save Product</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Product SKU (e.g. SRV-COMP-X9)"
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
            />
            <Input
              label="Product Description Name"
              placeholder="e.g. NextGen Liquid-Cooled Server Blade"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Primary Warehouse</label>
              <select
                value={newWarehouse}
                aria-label="Primary Warehouse"
                onChange={(e) => setNewWarehouse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="Dallas Primary (W-1)">Dallas Primary (W-1)</option>
                <option value="Frankfurt Hub (W-2)">Frankfurt Hub (W-2)</option>
                <option value="Singapore Central (W-3)">Singapore Central (W-3)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Initial Quantity On-Hand"
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
              />
              <Input
                label="Reorder Alert Threshold"
                type="number"
                value={newReorder}
                onChange={(e) => setNewReorder(e.target.value)}
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

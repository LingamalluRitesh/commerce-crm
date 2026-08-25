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

const mockStock: StockRecord[] = [
  { id: "st-1", sku: "SRV-NODE-01", name: "Enterprise Edge Node Server", warehouse: "Dallas Primary (W-1)", onHand: 42, reserved: 8, available: 34, reorderPoint: 15 },
  { id: "st-2", sku: "IOT-GW-MAX", name: "Industrial IoT Gateway Pro", warehouse: "Frankfurt Hub (W-2)", onHand: 120, reserved: 25, available: 95, reorderPoint: 30 },
  { id: "st-3", sku: "CAB-FIBER-10M", name: "Armored Fiber Cable 10m", warehouse: "Singapore Central (W-3)", onHand: 450, reserved: 40, available: 410, reorderPoint: 100 },
  { id: "st-4", sku: "PWR-RPS-850", name: "Redundant Power Supply 850W", warehouse: "Dallas Primary (W-1)", onHand: 8, reserved: 4, available: 4, reorderPoint: 10 },
];

export function InventoryView() {
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Multi-Warehouse Inventory & Fulfillment</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time stock reservation, immutable ledger movements, inter-warehouse transfers, and PO tracking.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(true)}>
            🔄 Inter-Warehouse Transfer
          </Button>
          <Button variant="default" size="sm">+ Purchase Order (PO)</Button>
        </div>
      </div>

      <Card variant="bordered">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU & Product Name</TableHead>
              <TableHead>Warehouse Location</TableHead>
              <TableHead>Quantity On Hand</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Health Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStock.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{item.sku}</div>
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.name}</div>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-400">{item.warehouse}</TableCell>
                <TableCell className="font-mono font-semibold text-xs">{item.onHand}</TableCell>
                <TableCell className="font-mono text-xs text-amber-600 dark:text-amber-400">{item.reserved}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">{item.available}</TableCell>
                <TableCell>
                  {item.available <= item.reorderPoint ? (
                    <Badge variant="warning" dot>Low Stock Warning</Badge>
                  ) : (
                    <Badge variant="success" dot>Optimal Level</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Transfer Dialog */}
      {isTransferOpen && (
        <Dialog
          open={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          size="md"
          title="Create Inter-Warehouse Stock Transfer"
          description="Initiate an atomic multi-item stock transfer between enterprise fulfillment hubs."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsTransferOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm">Dispatch Transfer</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Source Warehouse" defaultValue="Dallas Primary (W-1)" />
              <Input label="Destination Warehouse" defaultValue="Frankfurt Hub (W-2)" />
            </div>
            <Input label="SKU & Quantity" defaultValue="SRV-NODE-01 (10 units)" />
            <Input label="Carrier & Tracking Ref" defaultValue="DHL Express Logistics" />
          </div>
        </Dialog>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

interface OrderItem {
  id: string;
  orderNumber: string;
  customer: string;
  items: string;
  total: number;
  status: "CREATED" | "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "REFUNDED";
  carrier: string;
  date: string;
}

const initialOrders: OrderItem[] = [
  { id: "o1", orderNumber: "ORD-2026-00918", customer: "Alex Morgan", items: "1x Server Node X9, 2x Fiber Cable", total: 5089.00, status: "PAID", carrier: "FedEx Priority", date: "2026-08-25 10:30" },
  { id: "o2", orderNumber: "ORD-2026-00919", customer: "Elena Rostova", items: "5x Industrial IoT Gateway Pro", total: 6250.00, status: "PROCESSING", carrier: "DHL Express", date: "2026-08-25 09:15" },
  { id: "o3", orderNumber: "ORD-2026-00920", customer: "Hiroshi Tanaka", items: "2x 64TB NVMe Storage Array", total: 19000.00, status: "SHIPPED", carrier: "UPS Worldwide", date: "2026-08-24 16:40" },
  { id: "o4", orderNumber: "ORD-2026-00921", customer: "David Miller", items: "1x Precision Cooling Unit 5kW", total: 4200.00, status: "DELIVERED", carrier: "DB Schenker", date: "2026-08-24 11:20" },
];

export function CommerceView() {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const advanceOrderStatus = (orderId: string, nextStatus: OrderItem["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
  };

  const getBadgeVariant = (status: OrderItem["status"]) => {
    switch (status) {
      case "PAID":
      case "DELIVERED":
        return "success";
      case "SHIPPED":
      case "PROCESSING":
        return "purple";
      case "PAYMENT_PENDING":
        return "warning";
      case "REFUNDED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Omnichannel Commerce & Order Fulfillment
          </h2>
          <p className="text-xs text-slate-400">
            Strict order state machine progression, carrier tracking, and automated stock reservation.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Export Orders</Button>
          <Button variant="default" size="sm">+ New Omnichannel Order</Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card variant="bordered" className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Item Breakdown</TableHead>
              <TableHead>Gross Total</TableHead>
              <TableHead>Fulfillment Status</TableHead>
              <TableHead>Carrier / Tracking</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} className="hover:bg-slate-800/40 transition-colors">
                <TableCell className="font-mono font-bold text-xs text-indigo-400">
                  {o.orderNumber}
                </TableCell>
                <TableCell className="text-xs font-semibold text-white">
                  {o.customer}
                </TableCell>
                <TableCell className="text-xs text-slate-300">
                  {o.items}
                </TableCell>
                <TableCell className="font-mono font-bold text-xs text-emerald-400">
                  ${o.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(o.status)} size="sm" dot>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-400">
                  🚚 {o.carrier}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setSelectedOrder(o)}
                  >
                    Manage ➔
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Order State Stepper Modal */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Lifecycle — ${selectedOrder.orderNumber}`}
          description={`Customer: ${selectedOrder.customer} • Amount: $${selectedOrder.total.toFixed(2)}`}
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              <div className="flex space-x-2">
                {selectedOrder.status === "PAID" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => advanceOrderStatus(selectedOrder.id, "PROCESSING")}
                  >
                    Start Processing ➔
                  </Button>
                )}
                {selectedOrder.status === "PROCESSING" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => advanceOrderStatus(selectedOrder.id, "SHIPPED")}
                  >
                    Dispatch Shipment ➔
                  </Button>
                )}
                {selectedOrder.status === "SHIPPED" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => advanceOrderStatus(selectedOrder.id, "DELIVERED")}
                  >
                    Confirm Delivery ✓
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Stepper Bar */}
            <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold uppercase">
              {["CREATED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"].map((step, idx) => {
                const statuses = ["CREATED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
                const isPassed = statuses.indexOf(selectedOrder.status) >= idx;
                const isCurrent = selectedOrder.status === step;
                return (
                  <div key={step} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-colors ${
                        isPassed
                          ? "bg-indigo-500 shadow-glow-primary"
                          : "bg-slate-800"
                      }`}
                    />
                    <span className={isCurrent ? "text-indigo-400 font-black" : "text-slate-500"}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Items:</span>
                <span className="font-semibold text-white">{selectedOrder.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Carrier:</span>
                <span className="font-mono text-slate-200">{selectedOrder.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order Timestamp:</span>
                <span className="font-mono text-slate-400">{selectedOrder.date}</span>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

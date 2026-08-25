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
  customerName: string;
  totalAmount: number;
  itemCount: number;
  paymentStatus: "paid" | "pending" | "refunded";
  fulfillmentStatus: "created" | "processing" | "shipped" | "delivered";
  createdAt: string;
}

const mockOrders: OrderItem[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-98241",
    customerName: "Alex Morgan (Enterprise Cloud)",
    totalAmount: 1420.00,
    itemCount: 4,
    paymentStatus: "paid",
    fulfillmentStatus: "delivered",
    createdAt: "Today, 08:30 AM",
  },
  {
    id: "ord-2",
    orderNumber: "ORD-98242",
    customerName: "Elena Rostova (FinTech Global)",
    totalAmount: 899.50,
    itemCount: 2,
    paymentStatus: "paid",
    fulfillmentStatus: "shipped",
    createdAt: "Today, 10:15 AM",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-98243",
    customerName: "David Chen (DataMetrics)",
    totalAmount: 3200.00,
    itemCount: 8,
    paymentStatus: "pending",
    fulfillmentStatus: "processing",
    createdAt: "Yesterday, 04:45 PM",
  },
];

export function CommerceView() {
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const getFulfillmentBadge = (status: OrderItem["fulfillmentStatus"]) => {
    switch (status) {
      case "delivered":
        return <Badge variant="success" dot>Delivered</Badge>;
      case "shipped":
        return <Badge variant="info" dot>In Transit</Badge>;
      case "processing":
        return <Badge variant="warning" dot>Fulfillment Processing</Badge>;
      case "created":
        return <Badge variant="secondary" dot>Order Created</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Omnichannel Commerce & Orders</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catalog variant management, shopping cart checkouts, multi-stage order state machine, and refunds.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm">Catalog Manager</Button>
          <Button variant="default" size="sm">+ New Order</Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card variant="bordered">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Fulfillment State</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((ord) => (
              <TableRow key={ord.id}>
                <TableCell className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  {ord.orderNumber}
                </TableCell>
                <TableCell className="font-medium text-xs text-slate-800 dark:text-slate-200">
                  {ord.customerName}
                </TableCell>
                <TableCell className="text-xs">{ord.itemCount} units</TableCell>
                <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                  ${ord.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={ord.paymentStatus === "paid" ? "success" : "warning"} size="sm">
                    {ord.paymentStatus.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{getFulfillmentBadge(ord.fulfillmentStatus)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="xs" onClick={() => setSelectedOrder(ord)}>
                    Order Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          size="md"
          title={`Order Lifecycle — ${selectedOrder.orderNumber}`}
          description={`Created ${selectedOrder.createdAt} for ${selectedOrder.customerName}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>Close</Button>
              <Button variant="destructive" size="sm">Issue Partial Refund</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            {/* State Machine Stepper */}
            <div className="space-y-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Order State Progression</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">1. CREATED ✓</div>
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">2. PAID ✓</div>
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">3. SHIPPED ✓</div>
                <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">4. DELIVERED</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Net Amount:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Carrier Tracking Code:</span>
                <span className="font-mono font-semibold text-indigo-600">TRK-8829-USPS-EXP</span>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

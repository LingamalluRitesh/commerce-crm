"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

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
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState("");
  const [newItems, setNewItems] = useState("");
  const [newTotal, setNewTotal] = useState("3500.00");
  const [newCarrier, setNewCarrier] = useState("FedEx Priority");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const advanceOrderStatus = (orderId: string, nextStatus: OrderItem["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: nextStatus });
    }
    showFeedback(`Order status updated to ${nextStatus}`);
  };

  const handleCreateOrder = () => {
    if (!newCustomer || !newItems) return;
    const newOrd: OrderItem = {
      id: `o-${Date.now()}`,
      orderNumber: `ORD-2026-00${orders.length + 922}`,
      customer: newCustomer,
      items: newItems,
      total: parseFloat(newTotal) || 1000,
      status: "PAID",
      carrier: newCarrier,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setOrders([newOrd, ...orders]);
    setIsNewOrderOpen(false);
    setNewCustomer("");
    setNewItems("");
    showFeedback(`Order ${newOrd.orderNumber} placed and marked PAID!`);
  };

  const handleExportOrders = () => {
    const headers = "OrderNumber,Customer,Items,Total,Status,Carrier,Date\n";
    const rows = orders
      .map((o) => `"${o.orderNumber}","${o.customer}","${o.items}",${o.total},"${o.status}","${o.carrier}","${o.date}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Orders CSV exported successfully!");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredOrders = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

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
            Omnichannel Commerce & Order Fulfillment ({orders.length})
          </h2>
          <p className="text-xs text-slate-400">
            Strict order state machine progression, carrier tracking, and automated stock reservation.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportOrders}>
            Export Orders CSV
          </Button>
          <Button variant="default" size="sm" onClick={() => setIsNewOrderOpen(true)}>
            + New Omnichannel Order
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {["all", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === st
                ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {st === "all" ? `All Orders (${orders.length})` : st}
          </button>
        ))}
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
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((o) => (
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
                <TableCell className="text-right">
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

      {/* Create Order Dialog */}
      {isNewOrderOpen && (
        <Dialog
          open={isNewOrderOpen}
          onClose={() => setIsNewOrderOpen(false)}
          title="Create Omnichannel Customer Order"
          description="Provision a direct multi-item hardware/software order with immediate payment confirmation."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewOrderOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleCreateOrder}>Submit Order</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Customer Full Name"
              placeholder="e.g. Liam Vance"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
            />
            <Input
              label="Line Items Description"
              placeholder="e.g. 2x Enterprise Edge Node Server, 4x SFP+ Transceiver"
              value={newItems}
              onChange={(e) => setNewItems(e.target.value)}
            />
            <Input
              label="Gross Total ($)"
              type="number"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Carrier Logistics</label>
              <select
                value={newCarrier}
                aria-label="Carrier Logistics"
                onChange={(e) => setNewCarrier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="FedEx Priority">FedEx Priority Next Day</option>
                <option value="DHL Express">DHL Express International</option>
                <option value="UPS Worldwide">UPS Worldwide Saver</option>
                <option value="DB Schenker Freight">DB Schenker Heavy Freight</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}

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

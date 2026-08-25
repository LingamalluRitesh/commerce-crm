"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface CampaignItem {
  id: string;
  name: string;
  channel: "email" | "sms" | "push";
  targetSegment: string;
  sentCount: number;
  openRate: string;
  clickRate: string;
  status: "active" | "draft" | "completed";
}

const mockCampaigns: CampaignItem[] = [
  { id: "cmp-1", name: "Q3 Enterprise Upgrade Promotion", channel: "email", targetSegment: "High LTV VIP Customers", sentCount: 1450, openRate: "48.2%", clickRate: "18.5%", status: "active" },
  { id: "cmp-2", name: "Abandoned Cart 15% Discount SMS", channel: "sms", targetSegment: "Cart Dropped > $500", sentCount: 320, openRate: "98.0%", clickRate: "34.1%", status: "active" },
  { id: "cmp-3", name: "New Feature Announcement WebPush", channel: "push", targetSegment: "All Active Users", sentCount: 8900, openRate: "22.4%", clickRate: "9.1%", status: "completed" },
];

export function MarketingView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Marketing Campaigns & Dynamic Segments</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-channel campaign composer, rule-based audience segmentation, and promotional discount code manager.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm">Audience Segments</Button>
          <Button variant="default" size="sm">+ Launch Campaign</Button>
        </div>
      </div>

      <Card variant="bordered">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Target Audience</TableHead>
              <TableHead>Recipients Sent</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead>Click Rate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCampaigns.map((cmp) => (
              <TableRow key={cmp.id}>
                <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100">{cmp.name}</TableCell>
                <TableCell>
                  <Badge variant="purple" size="sm">{cmp.channel.toUpperCase()}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-400">{cmp.targetSegment}</TableCell>
                <TableCell className="font-mono text-xs">{cmp.sentCount.toLocaleString()}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">{cmp.openRate}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{cmp.clickRate}</TableCell>
                <TableCell>
                  <Badge variant={cmp.status === "active" ? "success" : "secondary"} size="sm">
                    {cmp.status.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

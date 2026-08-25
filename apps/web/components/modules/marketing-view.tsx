"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

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

const initialCampaigns: CampaignItem[] = [
  { id: "cmp-1", name: "Q3 Enterprise Upgrade Promotion", channel: "email", targetSegment: "High LTV VIP Customers", sentCount: 1450, openRate: "48.2%", clickRate: "18.5%", status: "active" },
  { id: "cmp-2", name: "Abandoned Cart 15% Discount SMS", channel: "sms", targetSegment: "Cart Dropped > $500", sentCount: 320, openRate: "98.0%", clickRate: "34.1%", status: "active" },
  { id: "cmp-3", name: "New Feature Announcement WebPush", channel: "push", targetSegment: "All Active Users", sentCount: 8900, openRate: "22.4%", clickRate: "9.1%", status: "completed" },
];

export function MarketingView() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"email" | "sms" | "push">("email");
  const [segment, setSegment] = useState("Enterprise Tier 1 Accounts");

  const handleLaunchCampaign = () => {
    if (!name) return;
    const newCmp: CampaignItem = {
      id: `cmp-${Date.now()}`,
      name,
      channel,
      targetSegment: segment,
      sentCount: channel === "email" ? 2400 : 850,
      openRate: "0.0%",
      clickRate: "0.0%",
      status: "active",
    };
    setCampaigns([newCmp, ...campaigns]);
    setIsNewOpen(false);
    setName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Marketing Campaigns & Dynamic Segments
          </h2>
          <p className="text-xs text-slate-400">
            Multi-channel campaign composer, rule-based audience segmentation, and promotional discount code manager.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm">Audience Segments</Button>
          <Button variant="default" size="sm" onClick={() => setIsNewOpen(true)}>
            + Launch Campaign
          </Button>
        </div>
      </div>

      <Card variant="bordered" className="overflow-hidden">
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
            {campaigns.map((cmp) => (
              <TableRow key={cmp.id} className="hover:bg-slate-800/40 transition-colors">
                <TableCell className="font-semibold text-xs text-white">{cmp.name}</TableCell>
                <TableCell>
                  <Badge variant="purple" size="sm">{cmp.channel.toUpperCase()}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-300">{cmp.targetSegment}</TableCell>
                <TableCell className="font-mono text-xs text-slate-300">{cmp.sentCount.toLocaleString()}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-emerald-400">{cmp.openRate}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-indigo-400">{cmp.clickRate}</TableCell>
                <TableCell>
                  <Badge variant={cmp.status === "active" ? "success" : "secondary"} size="sm" dot>
                    {cmp.status.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Campaign Launch Modal */}
      {isNewOpen && (
        <Dialog
          open={isNewOpen}
          onClose={() => setIsNewOpen(false)}
          title="Launch Marketing Campaign"
          description="Select multi-channel dispatch provider and audience rule."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleLaunchCampaign}>Launch Campaign 🚀</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Campaign Name"
              placeholder="e.g. Q4 Cloud Enterprise Incentive"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Dispatch Channel</label>
              <select
                value={channel}
                aria-label="Dispatch Channel"
                onChange={(e) => setChannel(e.target.value as "email" | "sms" | "push")}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="email">📧 SMTP Transactional Email</option>
                <option value="sms">📱 Twilio SMS Dispatch</option>
                <option value="push">🔔 WebPush Notification</option>
              </select>
            </div>
            <Input
              label="Target Audience Segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

export interface CampaignItem {
  id: string;
  name: string;
  channel: "email" | "sms" | "push";
  targetSegment: string;
  sentCount: number;
  openRate: string;
  clickRate: string;
  status: "active" | "draft" | "paused" | "completed";
}

interface SegmentItem {
  id: string;
  name: string;
  filterRule: string;
  audienceSize: number;
}

const initialCampaigns: CampaignItem[] = [
  { id: "cmp-1", name: "Q3 Enterprise Upgrade Promotion", channel: "email", targetSegment: "High LTV VIP Customers", sentCount: 1450, openRate: "48.2%", clickRate: "18.5%", status: "active" },
  { id: "cmp-2", name: "Abandoned Cart 15% Discount SMS", channel: "sms", targetSegment: "Cart Dropped > $500", sentCount: 320, openRate: "98.0%", clickRate: "34.1%", status: "active" },
  { id: "cmp-3", name: "New Feature Announcement WebPush", channel: "push", targetSegment: "All Active Users", sentCount: 8900, openRate: "22.4%", clickRate: "9.1%", status: "completed" },
  { id: "cmp-4", name: "Executive QBR Invitation Series", channel: "email", targetSegment: "Tier 1 Strategic Accounts", sentCount: 210, openRate: "64.8%", clickRate: "28.3%", status: "active" },
];

const initialSegments: SegmentItem[] = [
  { id: "seg-1", name: "Tier 1 Strategic VIPs", filterRule: "tier == 'Tier 1' AND health_score >= 80", audienceSize: 142 },
  { id: "seg-2", name: "High Churn Risk Accounts", filterRule: "health_score < 60 OR status == 'at_risk'", audienceSize: 28 },
  { id: "seg-3", name: "Enterprise E-Commerce Leads", filterRule: "industry == 'E-Commerce' AND ltv > 50000", audienceSize: 310 },
  { id: "seg-4", name: "All Active Omnichannel Users", filterRule: "status == 'active'", audienceSize: 1850 },
];

export function MarketingView() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [segments, setSegments] = useState<SegmentItem[]>(initialSegments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("all");

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isSegmentsOpen, setIsSegmentsOpen] = useState(false);
  const [isNewSegmentOpen, setIsNewSegmentOpen] = useState(false);

  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"email" | "sms" | "push">("email");
  const [segment, setSegment] = useState("Tier 1 Strategic VIPs");

  const [newSegName, setNewSegName] = useState("");
  const [newSegRule, setNewSegRule] = useState("");

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleLaunchCampaign = () => {
    if (!name) return;
    const newCmp: CampaignItem = {
      id: `cmp-${Date.now()}`,
      name,
      channel,
      targetSegment: segment,
      sentCount: channel === "email" ? 2400 : channel === "sms" ? 850 : 6200,
      openRate: "0.0%",
      clickRate: "0.0%",
      status: "active",
    };
    setCampaigns([newCmp, ...campaigns]);
    setIsNewOpen(false);
    setName("");
    showFeedback(`Campaign "${newCmp.name}" launched across ${channel.toUpperCase()}! 🚀`);
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === "active" ? "paused" : "active";
          showFeedback(`Campaign "${c.name}" is now ${nextStatus.toUpperCase()}`);
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleDeleteCampaign = (id: string, cName: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showFeedback(`Campaign "${cName}" removed`);
  };

  const handleSendTestBroadcast = (cName: string, ch: string) => {
    showFeedback(`Test dispatch for "${cName}" sent to test device via ${ch.toUpperCase()}!`);
  };

  const handleCreateSegment = () => {
    if (!newSegName) return;
    const seg: SegmentItem = {
      id: `seg-${Date.now()}`,
      name: newSegName,
      filterRule: newSegRule || "status == 'active'",
      audienceSize: Math.floor(Math.random() * 400) + 50,
    };
    setSegments([...segments, seg]);
    setIsNewSegmentOpen(false);
    setNewSegName("");
    setNewSegRule("");
    showFeedback(`Audience Segment "${seg.name}" defined with ${seg.audienceSize} accounts!`);
  };

  const handleExportCSV = () => {
    const headers = "Name,Channel,TargetSegment,SentCount,OpenRate,ClickRate,Status\n";
    const rows = campaigns
      .map(
        (c) =>
          `"${c.name}","${c.channel}","${c.targetSegment}",${c.sentCount},"${c.openRate}","${c.clickRate}","${c.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Marketing_Campaigns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Marketing campaigns CSV exported successfully!");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetSegment.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterChannel === "all") return true;
    return c.channel === filterChannel;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Marketing Campaigns & Dynamic Segments ({campaigns.length} Campaigns)
            </h2>
            <Badge variant="purple" size="sm">Multi-Channel Dispatch</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-channel campaign composer, rule-based audience segmentation, and promotional discount code manager.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSegmentsOpen(true)}>
            👥 Audience Segments ({segments.length})
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            📥 Export CSV
          </Button>
          <Button variant="default" size="sm" onClick={() => setIsNewOpen(true)}>
            + Launch Campaign
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Search & Channel Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search campaigns by name or target audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {[
            { id: "all", label: `All Channels (${campaigns.length})` },
            { id: "email", label: "📧 Email" },
            { id: "sms", label: "📱 SMS" },
            { id: "push", label: "🔔 WebPush" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterChannel(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterChannel === f.id
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              }`}
            >
              {f.label}
            </button>
          ))}
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((cmp) => (
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
                  <Badge
                    variant={
                      cmp.status === "active"
                        ? "success"
                        : cmp.status === "paused"
                        ? "warning"
                        : "secondary"
                    }
                    size="sm"
                    dot={cmp.status === "active"}
                  >
                    {cmp.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1.5">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleSendTestBroadcast(cmp.name, cmp.channel)}
                  >
                    Test ➔
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleToggleStatus(cmp.id)}
                  >
                    {cmp.status === "active" ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={() => handleDeleteCampaign(cmp.id, cmp.name)}
                  >
                    ✕
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Audience Segments Modal */}
      {isSegmentsOpen && (
        <Dialog
          open={isSegmentsOpen}
          onClose={() => setIsSegmentsOpen(false)}
          size="lg"
          title="Dynamic Audience Segments & Heuristics"
          description="Filter rules evaluated in real-time against Customer 360 attributes."
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => setIsNewSegmentOpen(true)}>
                + Create New Segment
              </Button>
              <Button variant="default" size="sm" onClick={() => setIsSegmentsOpen(false)}>
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            {segments.map((s) => (
              <div
                key={s.id}
                className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-white text-sm">{s.name}</div>
                  <div className="font-mono text-[11px] text-indigo-400 mt-0.5">Rule: {s.filterRule}</div>
                </div>
                <div className="text-right">
                  <Badge variant="purple" size="sm">{s.audienceSize} Accounts</Badge>
                  <div className="text-[10px] text-slate-400 mt-1">Live Synced</div>
                </div>
              </div>
            ))}
          </div>
        </Dialog>
      )}

      {/* Create New Segment Modal */}
      {isNewSegmentOpen && (
        <Dialog
          open={isNewSegmentOpen}
          onClose={() => setIsNewSegmentOpen(false)}
          title="Define Customer Segment Rule"
          description="Build boolean predicate for automated campaign audience filtering."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewSegmentOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleCreateSegment}>Save Segment</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Segment Name"
              placeholder="e.g. Q3 High Value Renewal Targets"
              value={newSegName}
              onChange={(e) => setNewSegName(e.target.value)}
            />
            <Input
              label="Filter Expression"
              placeholder="e.g. ltv > 100000 AND health_score >= 85"
              value={newSegRule}
              onChange={(e) => setNewSegRule(e.target.value)}
            />
          </div>
        </Dialog>
      )}

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
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Target Audience Segment</label>
              <select
                value={segment}
                aria-label="Target Audience Segment"
                onChange={(e) => setSegment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                {segments.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.audienceSize} Accounts)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

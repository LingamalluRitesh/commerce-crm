"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
}

const initialMessagesByChannel: Record<string, ChatMessage[]> = {
  "enterprise-sales": [
    { id: "m1", sender: "Sarah Connor (Account Exec)", avatar: "SC", text: "Stripe contract negotiations reached stage 4. We sent the formal quote PDF with the 5% tier discount.", timestamp: "10:30 AM" },
    { id: "m2", sender: "John Doe (Support Lead)", avatar: "JD", text: "Confirmed! We also resolved their webhook latency inquiry within the 4h SLA window.", timestamp: "10:35 AM" },
    { id: "m3", sender: "AI Deal Assistant", avatar: "AI", text: "✨ Lead propensity increased to 94%. Recommended next step: Request security sign-off.", timestamp: "10:36 AM" },
  ],
  "support-escalations": [
    { id: "m4", sender: "Elena Rostova", avatar: "ER", text: "Ticket #TK-2026-0042 high-bandwidth request is pending router port assignment.", timestamp: "09:12 AM" },
    { id: "m5", sender: "David Miller", avatar: "DM", text: "Dallas Mega-Hub switch SW-CORE-48X verified. Port #42 is ready.", timestamp: "09:45 AM" },
  ],
  "product-releases": [
    { id: "m6", sender: "Tech Lead", avatar: "TL", text: "🚀 Platform v2.4 successfully deployed to all multi-tenant nodes with zero downtime.", timestamp: "Yesterday" },
  ],
};

export function CommunicationView() {
  const [activeChannel, setActiveChannel] = useState("enterprise-sales");
  const [messagesByChannel, setMessagesByChannel] = useState(initialMessagesByChannel);
  const [inputVal, setInputVal] = useState("");

  const currentMessages = messagesByChannel[activeChannel] || [];

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "Sarah Connor (You)",
      avatar: "SC",
      text: inputVal.trim(),
      timestamp: "Just now",
    };

    const updated = {
      ...messagesByChannel,
      [activeChannel]: [...currentMessages, newMsg],
    };
    setMessagesByChannel(updated);
    setInputVal("");

    // Simulated Copilot response
    setTimeout(() => {
      setMessagesByChannel((prev) => ({
        ...prev,
        [activeChannel]: [
          ...prev[activeChannel],
          {
            id: `m-ai-${Date.now()}`,
            sender: "AI Team Assistant",
            avatar: "AI",
            text: `Acknowledged: "${newMsg.text.slice(0, 40)}..." logged to channel audit stream.`,
            timestamp: "Just now",
          },
        ],
      }));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Unified Communication & Collaboration
          </h2>
          <p className="text-xs text-slate-400">
            Real-time WebSocket chat channels, team message streams, and cross-channel deal collaboration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[580px]">
        {/* Channel Sidebar */}
        <Card variant="bordered" className="p-3 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Channels</span>
          <div className="space-y-1">
            {[
              { id: "enterprise-sales", label: "# enterprise-sales", online: 14 },
              { id: "support-escalations", label: "# support-escalations", online: 8 },
              { id: "product-releases", label: "# product-releases", online: 26 },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeChannel === ch.id
                    ? "bg-indigo-600/20 text-white border border-indigo-500/40 shadow-glow-primary"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>{ch.label}</span>
                <span className="text-[10px] font-mono text-slate-500">{ch.online} online</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Message View Area */}
        <Card variant="bordered" className="md:col-span-3 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">#{activeChannel}</span>
              <span className="text-xs text-emerald-400 font-bold">• Active Channel Stream</span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {currentMessages.map((m) => (
              <div key={m.id} className="flex items-start space-x-3 text-xs">
                <Avatar fallback={m.avatar} size="sm" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{m.sender}</span>
                    <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl text-slate-200 border border-slate-800/80 leading-relaxed">
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-800 flex space-x-2 bg-slate-900/40">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Send message to #${activeChannel}...`}
            />
            <Button variant="default" size="sm" onClick={handleSend}>
              Send ➔
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

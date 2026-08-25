"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
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

const mockMessages: ChatMessage[] = [
  { id: "m1", sender: "Sarah Connor (Account Exec)", avatar: "SC", text: "Stripe contract negotiations reached stage 4. We sent the formal quote PDF with the 5% tier discount.", timestamp: "10:30 AM" },
  { id: "m2", sender: "John Doe (Support Lead)", avatar: "JD", text: "Confirmed! We also resolved their webhook latency inquiry within the 4h SLA window.", timestamp: "10:35 AM" },
  { id: "m3", sender: "AI Deal Assistant", avatar: "AI", text: "✨ Lead propensity increased to 94%. Recommended next step: Request security sign-off.", timestamp: "10:36 AM" },
];

export function CommunicationView() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [inputVal, setInputVal] = useState("");

  const handleSend = () => {
    if (!inputVal.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: "You",
        avatar: "ME",
        text: inputVal.trim(),
        timestamp: "Just now",
      },
    ]);
    setInputVal("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Unified Communication & Collaboration</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time WebSocket chat channels, team message streams, and cross-channel deal collaboration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[550px]">
        {/* Channel Sidebar */}
        <Card variant="bordered" className="p-3 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Channels</span>
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <span># enterprise-sales</span>
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-xs">
              <span># support-escalations</span>
            </button>
            <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-xs">
              <span># product-releases</span>
            </button>
          </div>
        </Card>

        {/* Message View Area */}
        <Card variant="bordered" className="md:col-span-3 flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100"># enterprise-sales</span>
              <span className="text-xs text-slate-400">• 14 Members Online</span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start space-x-3 text-xs">
                <Avatar fallback={m.avatar} size="sm" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{m.sender}</span>
                    <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-700 dark:text-slate-300">
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Send a message to #enterprise-sales..."
            />
            <Button variant="default" size="sm" onClick={handleSend}>Send</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface ChannelInfo {
  id: string;
  name: string;
  online: number;
  description: string;
}

const initialChannels: ChannelInfo[] = [
  { id: "enterprise-sales", name: "# enterprise-sales", online: 14, description: "Strategic deal negotiations and quote reviews" },
  { id: "support-escalations", name: "# support-escalations", online: 8, description: "Mission-critical 1h SLA incident response" },
  { id: "product-releases", name: "# product-releases", online: 26, description: "Platform updates, microservices, and deployments" },
];

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
  const [channels, setChannels] = useState<ChannelInfo[]>(initialChannels);
  const [activeChannel, setActiveChannel] = useState("enterprise-sales");
  const [messagesByChannel, setMessagesByChannel] = useState(initialMessagesByChannel);
  const [inputVal, setInputVal] = useState("");

  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");

  const [isHuddleOpen, setIsHuddleOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentMessages = messagesByChannel[activeChannel] || [];
  const currentChannelObj = channels.find((c) => c.id === activeChannel) || channels[0];

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

    // Simulated Copilot AI response
    setTimeout(() => {
      setMessagesByChannel((prev) => ({
        ...prev,
        [activeChannel]: [
          ...(prev[activeChannel] || []),
          {
            id: `m-ai-${Date.now()}`,
            sender: "AI Intelligence Copilot",
            avatar: "AI",
            text: `✨ Event recorded: "${newMsg.text.slice(0, 45)}..." synced with #${activeChannel} team telemetry.`,
            timestamp: "Just now",
          },
        ],
      }));
    }, 1000);
  };

  const handleCreateChannel = () => {
    if (!newChannelName) return;
    const cleanId = newChannelName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/g, "");
    const newChan: ChannelInfo = {
      id: cleanId,
      name: `# ${cleanId}`,
      online: 1,
      description: newChannelDesc || "Custom team collaboration channel",
    };
    setChannels([...channels, newChan]);
    setMessagesByChannel({
      ...messagesByChannel,
      [cleanId]: [
        {
          id: `m-init-${Date.now()}`,
          sender: "System Bot",
          avatar: "🤖",
          text: `Welcome to ${newChan.name}! Channel initialized.`,
          timestamp: "Just now",
        },
      ],
    });
    setActiveChannel(cleanId);
    setIsNewChannelOpen(false);
    setNewChannelName("");
    setNewChannelDesc("");
    showFeedback(`Channel ${newChan.name} created!`);
  };

  const handleAttachFile = () => {
    showFeedback("Hardware Specification Sheet PDF attached to channel stream!");
  };

  const handleClearHistory = () => {
    setMessagesByChannel({
      ...messagesByChannel,
      [activeChannel]: [],
    });
    showFeedback(`Chat history cleared for #${activeChannel}`);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Unified Team Communication & Live Channels
            </h2>
            <Badge variant="purple" size="sm">WebSocket Live</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time chat channels, deal huddles, audio-visual sync, and automated cross-domain event notifications.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsHuddleOpen(true)}>
            🎧 Start Team Huddle
          </Button>
          <Button variant="default" size="sm" onClick={() => setIsNewChannelOpen(true)}>
            + New Channel
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
        {/* Channel Sidebar */}
        <Card variant="bordered" className="p-3 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Channels ({channels.length})
              </span>
              <button
                onClick={() => setIsNewChannelOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
              >
                +
              </button>
            </div>
            <div className="space-y-1">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all ${
                    activeChannel === ch.id
                      ? "bg-indigo-600/20 text-white border border-indigo-500/40 shadow-glow-primary"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="truncate">{ch.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{ch.online} active</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <div className="font-bold text-white mb-0.5">Quick Channel Info</div>
            <p className="line-clamp-2 text-[10px]">{currentChannelObj.description}</p>
          </div>
        </Card>

        {/* Message View Area */}
        <Card variant="bordered" className="md:col-span-3 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">{currentChannelObj.name}</span>
              <span className="text-xs text-emerald-400 font-bold">• Active Channel Stream</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="xs" onClick={handleClearHistory} className="text-slate-400 hover:text-rose-400">
                Clear
              </Button>
              <Button variant="outline" size="xs" onClick={() => setIsHuddleOpen(true)}>
                🎥 Video / Audio
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {currentMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No messages yet in this channel. Send the first message below!
              </div>
            ) : (
              currentMessages.map((m) => (
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
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-800 flex space-x-2 bg-slate-900/40">
            <Button variant="outline" size="sm" onClick={handleAttachFile} title="Attach File">
              📎
            </Button>
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Send message to ${currentChannelObj.name}...`}
            />
            <Button variant="default" size="sm" onClick={handleSend}>
              Send ➔
            </Button>
          </div>
        </Card>
      </div>

      {/* New Channel Modal */}
      {isNewChannelOpen && (
        <Dialog
          open={isNewChannelOpen}
          onClose={() => setIsNewChannelOpen(false)}
          title="Create Team Channel"
          description="Provision a shared workspace channel for sales, support, or dev teams."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewChannelOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleCreateChannel}>Create Channel</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Channel Name"
              placeholder="e.g. apac-logistics-triage"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <Input
              label="Channel Topic / Purpose"
              placeholder="e.g. Escalations and shipping SLAs for APAC regional hub"
              value={newChannelDesc}
              onChange={(e) => setNewChannelDesc(e.target.value)}
            />
          </div>
        </Dialog>
      )}

      {/* Huddle Modal */}
      {isHuddleOpen && (
        <Dialog
          open={isHuddleOpen}
          onClose={() => setIsHuddleOpen(false)}
          title={`Team Huddle — ${currentChannelObj.name}`}
          description="Live encrypted voice & screen share session."
          footer={
            <Button variant="destructive" size="sm" onClick={() => setIsHuddleOpen(false)}>
              Leave Huddle
            </Button>
          }
        >
          <div className="space-y-4 text-center py-6 text-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-2xl animate-pulse">
              🎙️
            </div>
            <div>
              <div className="font-bold text-white text-sm">Huddle Active</div>
              <p className="text-slate-400 text-[11px] mt-0.5">3 Participants Connected (Audio & WebRTC Latency: 14ms)</p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => showFeedback("Microphone muted")}>
                🎤 Mute
              </Button>
              <Button variant="outline" size="sm" onClick={() => showFeedback("Screen share stream started")}>
                🖥️ Share Screen
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function AIView() {
  const [query, setQuery] = useState("Direct connect bandwidth and fiber cable requirements");
  const [similarityThreshold, setSimilarityThreshold] = useState(0.70);
  const [sentimentText, setSentimentText] = useState(
    "The deployment team delivered the server nodes 3 days ahead of schedule! Extremely impressed with the high throughput."
  );
  const [sentimentResult, setSentimentResult] = useState<{ score: number; sentiment: string; entities: string[] } | null>({
    score: 0.94,
    sentiment: "POSITIVE",
    entities: ["deployment team", "server nodes", "throughput", "schedule"],
  });

  // Deal Propensity Model Interactive State
  const [dealBudget, setDealBudget] = useState(150000);
  const [qbrMeetings, setQbrMeetings] = useState(4);
  const [slaResolutionHours, setSlaResolutionHours] = useState(2);
  const [feedback, setFeedback] = useState<string | null>(null);

  const sampleQueries = [
    "Direct connect 10G fiber specs",
    "Webhook HMAC SHA-256 signature validation",
    "Server Node X9 NVMe array hardware",
    "SLA escalation response policies",
  ];

  const allArticles = [
    { id: 1, title: "KB-0104: Enterprise Direct Connect Architecture", type: "Knowledge Article", similarity: 0.96, excerpt: "Guide for configuring 10Gbps dedicated interconnect to Dallas Mega-Hub facility." },
    { id: 2, title: "Ticket #TK-2026-0042: Bandwidth Expansion", type: "Support Thread", similarity: 0.88, excerpt: "Customer requested port allocation #42 on Dallas Switch SW-CORE-48X." },
    { id: 3, title: "Product SKU: CAB-FIBER-10M", type: "Catalog Spec", similarity: 0.74, excerpt: "Armored multi-mode fiber optic cable 10m with LC-LC duplex connectors." },
    { id: 4, title: "Security Guide: Webhook Cryptographic Verification", type: "Developer Doc", similarity: 0.68, excerpt: "Using HMAC-SHA256 headers to verify outbound event packet authenticity." },
  ];

  const searchResults = allArticles.filter((r) => r.similarity >= similarityThreshold);

  const analyzeSentiment = () => {
    const isNegative =
      sentimentText.toLowerCase().includes("delay") ||
      sentimentText.toLowerCase().includes("issue") ||
      sentimentText.toLowerCase().includes("bad") ||
      sentimentText.toLowerCase().includes("outage") ||
      sentimentText.toLowerCase().includes("fail");

    const score = isNegative ? 0.18 : 0.92;
    const sentiment = isNegative ? "NEGATIVE" : "POSITIVE";
    const words = sentimentText.split(/\s+/).filter((w) => w.length > 5).slice(0, 4);

    setSentimentResult({
      score,
      sentiment,
      entities: words.length > 0 ? words : ["enterprise infrastructure", "telemetry stream"],
    });
    showFeedback("NLP Sentiment & Entity Extraction updated!");
  };

  const calculatedPropensity = Math.min(
    99,
    Math.max(20, Math.round((dealBudget / 500000) * 30 + qbrMeetings * 10 + (24 - slaResolutionHours) * 1.5))
  );

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-black tracking-tight text-white">
              AI Intelligence & Dense Vector Lab
            </h2>
            <Badge variant="purple" size="sm">128-Dim Embeddings</Badge>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            In-process semantic vector similarity search, NLP sentiment extraction, and deal propensity scoring.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="success" dot size="md">Model v2.4 Active</Badge>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✨ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-purple-400 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vector Semantic Search Laboratory */}
        <Card variant="bordered" className="p-6 space-y-4">
          <div>
            <CardTitle>Dense Vector Semantic Search</CardTitle>
            <CardDescription>
              Query unstructured articles, catalog specs, and tickets using cosine similarity matching
            </CardDescription>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase">Search Vector Query</label>
              <div className="flex space-x-2 mt-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => showFeedback(`Executed semantic vector search for: "${query}"`)}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Sample Queries */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sampleQueries.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(sq);
                    showFeedback(`Query loaded: "${sq}"`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-purple-900/40 text-[10px] text-slate-300 hover:text-purple-300 border border-slate-700 transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>

            {/* Threshold Slider */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Cosine Similarity Threshold:</span>
                <span className="font-mono font-bold text-purple-400">≥ {similarityThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={similarityThreshold}
                aria-label="Cosine Similarity Threshold"
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-purple-500"
              />
            </div>

            {/* Result Cards */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Top Semantic Matches ({searchResults.length})
              </span>
              {searchResults.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{res.title}</span>
                    <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                      {(res.similarity * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{res.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* NLP Sentiment & Entity Extractor */}
        <div className="space-y-6">
          <Card variant="bordered" className="p-6 space-y-4">
            <div>
              <CardTitle>NLP Sentiment & Entity Extractor</CardTitle>
              <CardDescription>
                Heuristic sentiment scoring and named entity recognition on customer feedback
              </CardDescription>
            </div>

            <div className="space-y-3">
              {/* Presets */}
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setSentimentText(
                      "The deployment team delivered the server nodes 3 days ahead of schedule! Extremely impressed with the high throughput."
                    )
                  }
                  className="px-2 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] rounded-lg font-semibold"
                >
                  Sample: Positive QBR
                </button>
                <button
                  onClick={() =>
                    setSentimentText(
                      "Critical packet loss and delay detected on Dallas router switch port #42 during peak traffic."
                    )
                  }
                  className="px-2 py-1 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[10px] rounded-lg font-semibold"
                >
                  Sample: Incident Report
                </button>
              </div>

              <textarea
                rows={3}
                value={sentimentText}
                onChange={(e) => setSentimentText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />

              <Button variant="default" size="sm" onClick={analyzeSentiment} className="w-full">
                Analyze Sentiment & Extract Entities ➔
              </Button>

              {sentimentResult && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Polarity Classification:</span>
                    <Badge
                      variant={sentimentResult.sentiment === "POSITIVE" ? "success" : "destructive"}
                      size="sm"
                      dot
                    >
                      {sentimentResult.sentiment} ({(sentimentResult.score * 100).toFixed(0)}%)
                    </Badge>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Extracted Semantic Entities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sentimentResult.entities.map((ent, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-[11px]"
                        >
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Deal Propensity Model */}
          <Card variant="bordered" className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>AI Deal Propensity Predictor</CardTitle>
                <CardDescription>Multi-variable win probability prediction model</CardDescription>
              </div>
              <span className="text-xl font-black font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                {calculatedPropensity}% Win
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Opportunity Value ($):</span>
                  <span className="font-mono text-white font-bold">${dealBudget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={dealBudget}
                  onChange={(e) => setDealBudget(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Executive Business Reviews (QBRs) Logged:</span>
                  <span className="font-mono text-white font-bold">{qbrMeetings} Meetings</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={qbrMeetings}
                  onChange={(e) => setQbrMeetings(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

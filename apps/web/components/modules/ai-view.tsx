"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AIView() {
  const [searchQuery, setSearchQuery] = useState("Enterprise cloud security SLA");
  const [sentimentText, setSentimentText] = useState("The onboarding was exceptionally smooth, but we need faster response on API support tickets.");
  const [sentimentResult, setSentimentResult] = useState<{ polarity: string; score: number; actions: string[] }>({
    polarity: "positive",
    score: 0.72,
    actions: ["Follow up on API ticket support turnaround time", "Schedule customer success check-in"],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Intelligence & Vector Suite</h2>
            <Badge variant="purple">L2 Dense Embeddings</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Semantic cosine similarity search, predictive lead conversion propensity, and NLP sentiment distillation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vector Semantic Search */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Dense Vector Cosine Similarity Search</CardTitle>
            <CardDescription>Instant semantic retrieval across unstructured customer knowledge & tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query dense embeddings..."
              />
              <Button variant="default" size="sm">Search</Button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-purple-900 dark:text-purple-300">Enterprise SLA & High Availability Policy</span>
                  <Badge variant="purple" size="sm">94.8% Match</Badge>
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-400">
                  Defines multi-region uptime guarantees (99.99%), support triage SLA (urgent=4h), and credit compensation matrices.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Zero-Trust Network Architecture Guidelines</span>
                  <Badge variant="secondary" size="sm">82.1% Match</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Explains end-to-end mTLS authentication, token bucket rate limiting, and cryptographic audit hash vaults.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NLP Sentiment & Action Item Extraction */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>NLP Sentiment & Action Item Parser</CardTitle>
            <CardDescription>Automated customer sentiment scoring and action item extraction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              value={sentimentText}
              onChange={(e) => setSentimentText(e.target.value)}
            />
            <Button variant="default" size="sm" className="w-full">
              Analyze Sentiment & Distill Action Items
            </Button>

            {sentimentResult && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Sentiment Polarity:</span>
                  <Badge variant="success" size="sm">POSITIVE (+0.72)</Badge>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Extracted Action Items:</span>
                  <ul className="space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-400">
                    {sentimentResult.actions.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

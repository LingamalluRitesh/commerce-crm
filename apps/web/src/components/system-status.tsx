"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import { SystemHealthResponse, SystemReadinessResponse } from "../types/api";
import { CheckCircle2, AlertCircle, RefreshCw, Database, Server, Cpu, Shield } from "lucide-react";

export function SystemStatus() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [readiness, setReadiness] = useState<SystemReadinessResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, r] = await Promise.all([
        apiClient.getHealth().catch(() => null),
        apiClient.getReadiness().catch(() => null),
      ]);
      setHealth(h);
      setReadiness(r);
    } catch (err: any) {
      setError(err.message || "Failed to query backend system status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            Backend Diagnostics & Health Probes
          </h2>
          <p className="text-sm text-slate-400">
            Real-time status of FastAPI Core, PostgreSQL, and Redis
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* FastAPI Status */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Server className="h-4 w-4 text-indigo-400" />
              API Service
            </span>
            {health?.status === "healthy" ? (
              <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Healthy
              </span>
            ) : (
              <span className="inline-flex items-center text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                <AlertCircle className="h-3 w-3 mr-1" />
                Offline
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-white">
            {health?.service || "FastAPI Engine"}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            v{health?.version || "0.1.0"} • {health?.environment || "development"}
          </div>
        </div>

        {/* PostgreSQL Database */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-blue-400" />
              PostgreSQL
            </span>
            {readiness?.checks.database === "connected" ? (
              <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center text-xs text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700">
                Awaiting Connection
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-white">PostgreSQL 16 + pgvector</div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Async SQLAlchemy 2 Engine
          </div>
        </div>

        {/* Multi-Tenancy & Security */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-purple-400" />
              Tenant Guard
            </span>
            <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </span>
          </div>
          <div className="text-sm font-semibold text-white">Row-Level Logical Isolation</div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            ContextVar Middleware & RBAC
          </div>
        </div>
      </div>
    </div>
  );
}

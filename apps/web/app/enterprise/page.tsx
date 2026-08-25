"use client";

import React, { useState } from "react";
import {
  Tag,
  FileCode2,
  RotateCcw,
  Network,
  Landmark,
  FileSpreadsheet,
  Compass,
  Handshake,
  ShieldAlert,
  CreditCard,
  TrendingDown,
  Boxes,
  FileText,
  Flame,
  Sparkles,
} from "lucide-react";

import { CouponMatrixOptimizerView } from "@/components/modules/coupon-matrix-optimizer-view";
import { B2BPunchoutCXMLView } from "@/components/modules/b2b-punchout-cxml-view";
import { ReverseLogisticsRMAView } from "@/components/modules/reverse-logistics-rma-view";
import { MultiEchelonInventoryView } from "@/components/modules/multi-echelon-inventory-view";
import { TreasuryLiquidityPoolingView } from "@/components/modules/treasury-liquidity-pooling-view";
import { IFRS15RevenueSchedulesView } from "@/components/modules/ifrs15-revenue-schedules-view";
import { CustomerJourneyAttributionView } from "@/components/modules/customer-journey-attribution-view";
import { PartnerPRMDealRegistrationView } from "@/components/modules/partner-prm-deal-registration-view";
import { GDPRDSARPrivacyView } from "@/components/modules/gdpr-dsar-privacy-view";
import { PCITokenizationVaultView } from "@/components/modules/pci-tokenization-vault-view";
import { TieredVolumePricingView } from "@/components/modules/tiered-volume-pricing-view";
import { Container3DPackingView } from "@/components/modules/container-3d-packing-view";
import { TaxNexusGovernanceView } from "@/components/modules/tax-nexus-governance-view";
import { PredictiveLeadScoringView } from "@/components/modules/predictive-lead-scoring-view";

const TABS = [
  { id: "coupons", label: "Coupon Optimizer", icon: Tag, component: CouponMatrixOptimizerView },
  { id: "pricing", label: "Volume Pricing", icon: TrendingDown, component: TieredVolumePricingView },
  { id: "punchout", label: "cXML PunchOut", icon: FileCode2, component: B2BPunchoutCXMLView },
  { id: "rma", label: "Reverse Logistics", icon: RotateCcw, component: ReverseLogisticsRMAView },
  { id: "meio", label: "Multi-Echelon (MEIO)", icon: Network, component: MultiEchelonInventoryView },
  { id: "packing", label: "3D Bin Packing", icon: Boxes, component: Container3DPackingView },
  { id: "treasury", label: "Treasury Sweeps", icon: Landmark, component: TreasuryLiquidityPoolingView },
  { id: "tax", label: "Tax Nexus (Wayfair)", icon: FileText, component: TaxNexusGovernanceView },
  { id: "ifrs15", label: "IFRS 15 Revenue", icon: FileSpreadsheet, component: IFRS15RevenueSchedulesView },
  { id: "attribution", label: "Attribution (MTA)", icon: Compass, component: CustomerJourneyAttributionView },
  { id: "leadscore", label: "Lead Scoring", icon: Flame, component: PredictiveLeadScoringView },
  { id: "prm", label: "Partner PRM", icon: Handshake, component: PartnerPRMDealRegistrationView },
  { id: "privacy", label: "GDPR / DSAR", icon: ShieldAlert, component: GDPRDSARPrivacyView },
  { id: "pci", label: "PCI Token Vault", icon: CreditCard, component: PCITokenizationVaultView },
];

export default function EnterprisePage() {
  const [activeTab, setActiveTab] = useState("coupons");

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || CouponMatrixOptimizerView;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" /> Enterprise Operating Platform
          </div>
          <h1 className="text-2xl font-extrabold text-white">CommerceCRM Enterprise Extended Suite</h1>
          <p className="text-sm text-slate-400">
            Next-generation domain engines for global supply chain, statutory revenue recognition, partner ecosystems & privacy governance.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-800/80 scrollbar-thin">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        <ActiveComponent />
      </div>
    </div>
  );
}

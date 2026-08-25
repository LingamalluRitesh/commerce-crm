"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface TaxJurisdiction {
  code: string;
  name: string;
  type: string;
  ratePercentage: number;
  status: "active" | "exempt";
}

const mockTaxJurisdictions: TaxJurisdiction[] = [
  { code: "US_CA", name: "California State & Local Sales Tax", type: "Sales Tax", ratePercentage: 8.25, status: "active" },
  { code: "US_NY", name: "New York State & City Sales Tax", type: "Sales Tax", ratePercentage: 8.875, status: "active" },
  { code: "US_TX", name: "Texas State Sales Tax", type: "Sales Tax", ratePercentage: 8.25, status: "active" },
  { code: "US_WA", name: "Washington State Sales Tax", type: "Sales Tax", ratePercentage: 9.25, status: "active" },
  { code: "EU_DE", name: "Germany Value Added Tax (USt)", type: "VAT", ratePercentage: 19.00, status: "active" },
  { code: "EU_FR", name: "France Taxe sur la Valeur Ajoutée (TVA)", type: "VAT", ratePercentage: 20.00, status: "active" },
  { code: "GB", name: "United Kingdom VAT", type: "VAT", ratePercentage: 20.00, status: "active" },
  { code: "AU", name: "Australia Goods & Services Tax (GST)", type: "GST", ratePercentage: 10.00, status: "active" },
];

export function TaxRatesManager() {
  return (
    <Card variant="bordered" className="p-6 space-y-4">
      <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
        <div>
          <CardTitle>Multi-Jurisdiction Enterprise Tax Schedules</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Real-time VAT, GST, and Sales Tax calculation rules with exemption certificate validation.</p>
        </div>
        <Button variant="default" size="sm">+ Add Jurisdiction Rule</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jurisdiction Code</TableHead>
            <TableHead>Tax Authority & Region</TableHead>
            <TableHead>Tax Type</TableHead>
            <TableHead>Statutory Rate</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTaxJurisdictions.map((j) => (
            <TableRow key={j.code}>
              <TableCell className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{j.code}</TableCell>
              <TableCell className="font-medium text-xs text-slate-800 dark:text-slate-200">{j.name}</TableCell>
              <TableCell className="text-xs">{j.type}</TableCell>
              <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">{j.ratePercentage.toFixed(2)}%</TableCell>
              <TableCell><Badge variant="success" size="sm">Active</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

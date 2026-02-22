"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Wallet, FileCheck, AlertTriangle } from "lucide-react";
import { formatLek } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { useSimulation } from "@/context/SimulationContext";
import { t } from "@/lib/i18n";

export function StatCards() {
  const { locale } = useLanguage();
  const { getDisplayStats, selectedMunicipalityId } = useSimulation();
  const strings = t[locale];
  const stats = useMemo(
    () => getDisplayStats(selectedMunicipalityId),
    [getDisplayStats, selectedMunicipalityId]
  );

  const sparkData = useMemo(
    () =>
      stats.spendingSparkline.map((value, i) => ({
        name: `Dita ${i + 1}`,
        value,
      })),
    [stats.spendingSparkline]
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {strings.totalBudget}
          </span>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatLek(stats.totalBudget)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {strings.totalBudgetSubtitle} · {stats.transactionsCount} {locale === "sq" ? "transaksione" : "transactions"}
          </p>
          <div className="h-[60px] mt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorBudget)"
                  strokeWidth={1}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [formatLek(value), "Shpenzim"]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {strings.activeContracts}
          </span>
          <FileCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.activeContracts}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {strings.activeContractsSubtitle}
          </p>
          <div className="h-[60px] mt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id="colorContracts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorContracts)"
                  strokeWidth={1}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [formatLek(value), "Vlerë"]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {strings.flaggedAnomalies}
          </span>
          <AlertTriangle className="h-4 w-4 text-gov-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.flaggedAnomalies}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {strings.flaggedSubtitle}
          </p>
          <div className="h-[60px] mt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorFlagged)"
                  strokeWidth={1}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                  }}
                  formatter={(value: number) => [value, "Raste"]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

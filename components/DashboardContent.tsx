"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { municipalities, type Transaction, type TransactionCategory } from "@/lib/mock-data";
import { useLanguage } from "@/components/LanguageProvider";
import { useSimulation } from "@/context/SimulationContext";
import { useReports } from "@/context/ReportsContext";
import { useProposalsAndVoting } from "@/context/ProposalsAndVotingContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TransactionTable } from "@/components/TransactionTable";
import { ReportAnomalyDialog } from "@/components/ReportAnomalyDialog";
import { formatLek } from "@/lib/utils";
import { Wallet, FolderKanban, MapPin } from "lucide-react";
import { SimulationControlPanel } from "@/components/SimulationControlPanel";
import { Button } from "@/components/ui/button";

const REGIONS = [
  "Shkodër", "Kukës", "Lezhë", "Dibër", "Durrës", "Tiranë",
  "Elbasan", "Fier", "Berat", "Korçë", "Vlorë", "Gjirokastër",
] as const;

const CATEGORIES: TransactionCategory[] = [
  "Arsim",
  "Infrastrukturë",
  "Shëndetësi",
  "Kultura",
  "Mjedisi",
  "Siguria",
  "Sport",
  "Administratë",
  "Rrugë",
  "Energji",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export function DashboardContent() {
  const [category, setCategory] = useState<string>("all");
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));
  const [reportTx, setReportTx] = useState<Transaction | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const { locale } = useLanguage();
  const {
    isRunning,
    municipalities: simMuns,
    projects,
    getDisplayTransactions,
    flagTransaction,
    selectedMunicipalityId,
    setSelectedMunicipalityId,
  } = useSimulation();
  const { addReport, getReportByTransactionId } = useReports();
  const {
    proposals,
    getTransactionVotes,
    voteVerification,
    voteAnomaly,
  } = useProposalsAndVoting();
  const { isGuest } = useAuth();
  const strings = t[locale];

  const handleGuestBlocked = useCallback(() => {
    toast.warning("⚠️ Ky veprim kërkon identifikim zyrtar për të parandaluar abuzimet.");
  }, []);

  const implementedProposalsCost = useMemo(
    () => proposals.filter((p) => p.status === "Implemented").reduce((s, p) => s + p.estimatedCost, 0),
    [proposals]
  );

  const onVoteVerification = useCallback(
    (transactionId: string) => {
      voteVerification(transactionId);
      toast.success("Vota juaj u regjistrua!");
    },
    [voteVerification]
  );
  const onVoteAnomaly = useCallback(
    (transactionId: string) => {
      const result = voteAnomaly(transactionId);
      if (result.alertTriggered) {
        toast.success("Anomalia u raportua në sistemin e riskut.");
      } else {
        toast.success("Raporti i anomalisë u regjistrua.");
      }
    },
    [voteAnomaly]
  );

  const muns = useMemo(() => municipalities(), []);
  const munIdToRegion = useMemo(() => {
    const map = new Map<string, string>();
    simMuns.forEach((m) => map.set(m.id, m.region));
    return map;
  }, [simMuns]);

  const totalRemainingBudget = useMemo(() => {
    if (selectedMunicipalityId) {
      const m = simMuns.find((x) => x.id === selectedMunicipalityId);
      return m ? m.budgetRemaining : 0;
    }
    const simRemaining = simMuns.reduce((s, m) => s + m.budgetRemaining, 0);
    return Math.max(0, simRemaining - implementedProposalsCost);
  }, [simMuns, selectedMunicipalityId, implementedProposalsCost]);

  const totalBudgetForProgress = useMemo(() => {
    if (selectedMunicipalityId) {
      const m = simMuns.find((x) => x.id === selectedMunicipalityId);
      return m ? m.budgetTotal : 0;
    }
    return simMuns.reduce((s, m) => s + m.budgetTotal, 0);
  }, [simMuns, selectedMunicipalityId]);

  const allTxs = useMemo(() => getDisplayTransactions(), [getDisplayTransactions]);

  const filteredTransactions = useMemo(() => {
    let list = allTxs;
    if (selectedMunicipalityId) {
      list = list.filter((t) => t.municipalityId === selectedMunicipalityId);
    }
    if (category !== "all") {
      list = list.filter((t) => t.category === category);
    }
    if (year !== "all") {
      list = list.filter((t) => t.date.startsWith(year));
    }
    return list;
  }, [allTxs, selectedMunicipalityId, category, year]);

  const spendingByRegion = useMemo(() => {
    const base = selectedMunicipalityId ? filteredTransactions : allTxs;
    const byRegion = new Map<string, number>();
    for (const tx of base) {
      const region = munIdToRegion.get(tx.municipalityId) ?? "Other";
      byRegion.set(region, (byRegion.get(region) ?? 0) + tx.amount);
    }
    return REGIONS.map((r) => ({
      name: r,
      total: byRegion.get(r) ?? 0,
    })).filter((d) => d.total > 0);
  }, [allTxs, filteredTransactions, selectedMunicipalityId, munIdToRegion]);

  const spendingByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of filteredTransactions) {
      const prev = map.get(tx.category) ?? 0;
      map.set(tx.category, prev + tx.amount);
    }
    return CATEGORIES.map((cat) => ({
      name: cat,
      total: map.get(cat) ?? 0,
    })).filter((d) => d.total > 0);
  }, [filteredTransactions]);

  const chartData = selectedMunicipalityId ? spendingByCategory : spendingByRegion;
  const chartTitle = selectedMunicipalityId
    ? strings.spendingByCategory
    : (locale === "sq" ? "Shpenzim sipas rajonit" : "Spending by Region");
  const chartSubtitle = selectedMunicipalityId
    ? strings.spendingByCategorySubtitle
    : (locale === "sq" ? "61 bashki të grupuara në 12 prefektura" : "61 municipalities grouped into 12 prefectures");

  const onReportAnomaly = useCallback((tx: Transaction) => {
    setReportTx(tx);
    setReportOpen(true);
  }, []);
  const onReportSubmit = useCallback(
    (payload: { citizenName: string; citizenEmail?: string; description: string; evidenceNote?: string; transaction: Transaction }) => {
      const { transaction } = payload;
      flagTransaction(transaction.id);
      addReport({
        citizenName: payload.citizenName,
        citizenEmail: payload.citizenEmail,
        category: transaction.category,
        description: payload.description,
        evidenceNote: payload.evidenceNote,
        date: new Date().toISOString(),
        transactionId: transaction.id,
        transactionDescription: transaction.description,
        transactionAmount: transaction.amount,
        institution: transaction.institution,
        notifyCitizen: false,
      });
    },
    [flagTransaction, addReport]
  );

  const getReportStatus = useCallback(
    (txId: string) => getReportByTransactionId(txId)?.status,
    [getReportByTransactionId]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{strings.dashboard}</h1>
        <p className="text-muted-foreground mt-1">
          {strings.dashboardSubtitle}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <SimulationControlPanel />
        {selectedMunicipalityId && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-gov-accent/50 text-gov-accent hover:bg-gov-accent/10"
            onClick={() => setSelectedMunicipalityId(null)}
          >
            <MapPin className="h-4 w-4" />
            {locale === "sq" ? "Kthehu në Pamjen Kombëtare" : "Back to National View"}
          </Button>
        )}
      </div>

      {isRunning && (
        <Card className="mb-6 border-green-500/40 bg-green-950/20">
          <CardContent className="flex flex-col gap-4 py-4">
            <div className="flex flex-row flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-200">
                    {selectedMunicipalityId
                      ? (locale === "sq" ? "Buxheti i mbetur (bashkia e zgjedhur)" : "Remaining budget (selected municipality)")
                      : (locale === "sq" ? "Buxheti i mbetur (simulimi)" : "Remaining budget (simulation)")}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {formatLek(totalRemainingBudget)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMunicipalityId
                      ? simMuns.find((m) => m.id === selectedMunicipalityId)?.nameSq
                      : (locale === "sq" ? "61 bashki · përditësuar në kohë reale" : "61 municipalities · updated in real time")}
                  </p>
                </div>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <FolderKanban className="h-4 w-4" />
                {locale === "sq" ? "Shiko projektet" : "View projects"} ({projects.length})
              </Link>
            </div>
            {totalBudgetForProgress > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {locale === "sq" ? "Shpenzim (depletion)" : "Spending (depletion)"}
                  {selectedMunicipalityId && ` · ${simMuns.find((m) => m.id === selectedMunicipalityId)?.nameSq}`}
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gov-navy-muted">
                  <div
                    className="h-full rounded-full bg-gov-accent transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (100 * (totalBudgetForProgress - totalRemainingBudget)) / totalBudgetForProgress)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar filters */}
        <aside className="space-y-4">
          <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{strings.filters}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  {strings.municipality}
                </label>
                <Select
                  value={selectedMunicipalityId ?? "all"}
                  onValueChange={(v) => setSelectedMunicipalityId(v === "all" ? null : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={strings.all} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{strings.all}</SelectItem>
                    {muns.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nameSq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  {strings.category}
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={strings.all} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{strings.all}</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  {strings.year}
                </label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={strings.all} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{strings.all}</SelectItem>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-8">
          {/* BarChart */}
          <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
            <CardHeader>
              <CardTitle className="text-foreground">
                {chartTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {chartSubtitle}
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(51,65,85,0.5)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickLine={{ stroke: "#475569" }}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickLine={{ stroke: "#475569" }}
                      tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f8fafc" }}
                      formatter={(value: number) => [formatLek(value), "Total"]}
                      labelFormatter={(label) => (selectedMunicipalityId ? `Kategoria: ${label}` : `Rajoni: ${label}`)}
                    />
                    <Bar
                      dataKey="total"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Shpenzim"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction table */}
          <Card
            id="transaksione"
            className="border-gov-navy-muted/50 bg-gov-navy-light/30"
          >
            <CardHeader>
              <CardTitle className="text-foreground">{strings.transactionTable}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredTransactions.length} {locale === "sq" ? "transaksione." : "transactions."} {strings.transactionTableSubtitle}
              </p>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={filteredTransactions}
                onReportAnomaly={onReportAnomaly}
                locale={locale}
                getReportStatus={getReportStatus}
                getTransactionVotes={getTransactionVotes}
                onVoteVerification={onVoteVerification}
                onVoteAnomaly={onVoteAnomaly}
                isGuest={isGuest}
                onGuestBlocked={handleGuestBlocked}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ReportAnomalyDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        transaction={reportTx}
        onReportSubmit={onReportSubmit}
      />
    </motion.div>
  );
}

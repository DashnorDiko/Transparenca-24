"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSimulation } from "@/context/SimulationContext";
import { useReports } from "@/context/ReportsContext";
import { formatLek, formatDateAlbanian } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import type { SimulationProject, ProjectReport, AnomalyFlag } from "@/lib/simulation-types";
import { ArrowLeft, AlertTriangle, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STATUS_LABELS: Record<SimulationProject["status"], string> = {
  Draft: "Draft",
  Bidding: "Bidding",
  Evaluation: "Evaluation",
  InProgress: "In progress",
  Completed: "Completed",
  Reported: "Reported",
};

const REPORT_REASON_LABELS: Record<ProjectReport["reason"], string> = {
  Corruption: "Corruption",
  Delay: "Delay",
  Irregularity: "Irregularity",
  Quality: "Quality",
  Other: "Other",
};

const REPORT_OUTCOME_LABELS: Record<ProjectReport["outcome"], string> = {
  UnderReview: "Under review",
  ContractCancelled: "Contract cancelled",
  RefundIssued: "Refund issued",
  PenaltyApplied: "Penalty applied",
  NoAction: "No action",
};

const ANOMALY_LABELS: Record<AnomalyFlag, string> = {
  OverpricedBid: "Overpriced bid",
  SingleBidder: "Single bidder",
  BudgetOverrun: "Budget overrun",
  Delay: "Delay",
  SuspiciousTransaction: "Suspicious transaction",
  CitizenReported: "Citizen reported",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getProjectById, getMunicipalityById } = useSimulation();
  const { reports } = useReports();
  const { locale } = useLanguage();
  const strings = t[locale];
  const project = getProjectById(id);
  const municipality = project ? getMunicipalityById(project.municipalityId) : null;

  if (!project) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-slate-400">
          {locale === "sq" ? "Projekti nuk u gjet." : "Project not found."}
        </p>
        <Link
          href="/projects"
          className="mt-4 inline-block text-blue-400 hover:underline"
        >
          {locale === "sq" ? "Kthehu te lista" : "Back to list"}
        </Link>
      </div>
    );
  }

  const selectedBid = project.selectedBidId
    ? project.bids.find((b) => b.id === project.selectedBidId)
    : null;

  const linkedReports = reports.filter(
    (r) => r.transactionDescription?.includes(project.title)
  );
  const allHistoryEntries = linkedReports.flatMap((r) =>
    r.history.map((h) => ({ ...h, reportId: r.id }))
  );
  allHistoryEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const projectLifecycleEvents: { time: string; action: string }[] = [
    { time: project.createdAt, action: "Projekti u krijua" },
    ...(project.biddingClosedAt
      ? [{ time: project.biddingClosedAt, action: "Ofertat u mbyllën" }]
      : []),
    ...(project.contractValue
      ? [{ time: project.biddingClosedAt || project.createdAt, action: "Fituesi u zgjodh" }]
      : []),
    ...(project.completedAt
      ? [{ time: project.completedAt, action: "Projekti u përfundua" }]
      : []),
    ...(project.report
      ? [{ time: project.report.reportedAt, action: "Raportuar (simulim)" }]
      : []),
  ];
  projectLifecycleEvents.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "sq" ? "Prapa" : "Back"}
        </button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Detajet</TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
        <Card className="border-2 border-slate-500 bg-slate-800/80">
          <CardHeader>
            <CardTitle className="text-xl text-white">{project.title}</CardTitle>
            <p className="text-sm text-slate-400">
              {municipality?.nameSq ?? project.municipalityId} ·{" "}
              {formatDateAlbanian(new Date(project.createdAt))}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-400">
                {strings.category}
              </h3>
              <p className="text-white">{project.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400">
                {locale === "sq" ? "Përshkrimi" : "Description"}
              </h3>
              <p className="text-slate-200">{project.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400">
                {locale === "sq" ? "Buxheti i alokuar" : "Allocated budget"}
              </h3>
              <p className="text-lg font-semibold text-blue-400">
                {formatLek(project.allocatedBudget)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400">
                {strings.status}
              </h3>
              <p
                className={
                  project.status === "Reported"
                    ? "text-amber-400"
                    : project.status === "Completed"
                      ? "text-green-400"
                      : "text-white"
                }
              >
                {STATUS_LABELS[project.status]}
              </p>
            </div>
            {project.anomalyFlags && project.anomalyFlags.length > 0 && (
              <div className="rounded-md border border-amber-500/40 bg-amber-950/20 p-3">
                <h3 className="text-sm font-medium text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {locale === "sq" ? "Shenja të rrezikut" : "Risk indicators"}
                </h3>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {project.anomalyFlags.map((flag) => (
                    <li key={flag}>
                      <span className="text-xs text-amber-200">
                        {ANOMALY_LABELS[flag]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-500 bg-slate-800/80">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {locale === "sq" ? "Ofertat e kompanive" : "Bidding companies"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.bids.length === 0 ? (
              <p className="text-slate-400">
                {locale === "sq" ? "Ende pa oferta." : "No bids yet."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600 hover:bg-transparent">
                    <TableHead className="text-slate-300">
                      {locale === "sq" ? "Renditja" : "Rank"}
                    </TableHead>
                    <TableHead className="text-slate-300">
                      {locale === "sq" ? "Kompania" : "Company"}
                    </TableHead>
                    <TableHead className="text-slate-300">
                      {strings.amount}
                    </TableHead>
                    <TableHead className="text-slate-300">
                      {locale === "sq" ? "Rreziku" : "Risk"}
                    </TableHead>
                    <TableHead className="text-slate-300">
                      {locale === "sq" ? "Korrupsioni" : "Corruption"}
                    </TableHead>
                    <TableHead className="w-[120px] text-slate-300">
                      {locale === "sq" ? "Statusi" : "Status"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...project.bids]
                    .sort((a, b) => a.amount - b.amount)
                    .map((b, idx) => (
                      <TableRow key={b.id} className="border-slate-600">
                        <TableCell className="text-slate-300">
                          #{b.rank ?? idx + 1}
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {b.companyName}
                        </TableCell>
                        <TableCell className="text-blue-400">
                          {formatLek(b.amount)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              (b.riskScore ?? 0) >= 70
                                ? "text-amber-400"
                                : (b.riskScore ?? 0) >= 40
                                  ? "text-yellow-400"
                                  : "text-slate-400"
                            }
                          >
                            {b.riskScore ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {typeof b.corruptionProbability === "number"
                            ? `${(b.corruptionProbability * 100).toFixed(0)}%`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {b.id === project.selectedBidId ? (
                            <span className="text-green-400">
                              {locale === "sq" ? "Fitues" : "Winner"}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {project.report && (
          <Card className="border-2 border-amber-500/50 bg-amber-950/20">
            <CardHeader>
              <CardTitle className="text-lg text-amber-400">
                {locale === "sq" ? "Raport" : "Report"}
              </CardTitle>
              <p className="text-sm text-slate-400">
                {formatDateAlbanian(new Date(project.report.reportedAt))}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-slate-400">
                  {locale === "sq" ? "Arsyeja" : "Reason"}
                </h3>
                <p className="text-amber-200">
                  {REPORT_REASON_LABELS[project.report.reason]}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">
                  {locale === "sq" ? "Detajet" : "Details"}
                </h3>
                <p className="text-slate-200">{project.report.details}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">
                  {locale === "sq" ? "Rezultati" : "Outcome"}
                </h3>
                <p className="text-slate-200">
                  {REPORT_OUTCOME_LABELS[project.report.outcome]}
                  {project.report.outcomeNote && (
                    <span className="block mt-1 text-slate-400 text-sm">
                      {project.report.outcomeNote}
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-2 border-slate-500 bg-slate-800/80">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <History className="h-5 w-5" />
                Rruga e Auditit
              </CardTitle>
              <p className="text-sm text-slate-400">
                Ngjarjet e projektit dhe përgjigjet zyrtare
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {projectLifecycleEvents.map((e, i) => (
                  <li key={`life-${i}`} className="flex gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0">
                      {new Date(e.time).toLocaleTimeString("sq-AL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-slate-200">– {e.action}</span>
                  </li>
                ))}
                {allHistoryEntries.map((entry) => (
                  <li key={entry.id} className="flex gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0">
                      {new Date(entry.timestamp).toLocaleTimeString("sq-AL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-slate-200">– {entry.action}</span>
                  </li>
                ))}
                {projectLifecycleEvents.length === 0 && allHistoryEntries.length === 0 && (
                  <li className="text-slate-400 text-sm">
                    Nuk ka ndodhje ende.
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Link
          href="/projects"
          className="text-sm font-medium text-blue-400 hover:underline"
        >
          {locale === "sq" ? "Lista e projekteve" : "Project list"}
        </Link>
      </div>
    </div>
  );
}

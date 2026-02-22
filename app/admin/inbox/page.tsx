"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  CheckCircle,
  Users,
  FileText,
  AlertOctagon,
  ImageIcon,
  Eye,
  FolderOpen,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReports } from "@/context/ReportsContext";
import { useProposalsAndVoting } from "@/context/ProposalsAndVotingContext";
import { formatLek, formatDateAlbanian, cn } from "@/lib/utils";
import type { CitizenReport, ReportResolutionStatus } from "@/lib/reports-types";
import { REPORT_STATUS_LABELS } from "@/lib/reports-types";
import { PROPOSAL_STATUS_LABELS } from "@/lib/proposals-types";
import type { CitizenProposal } from "@/lib/proposals-types";
import { OfficialResponseDialog } from "@/components/OfficialResponseDialog";

type InboxTab = "raportet" | "propozimet" | "risk";

/** Mock AI risk score 0–100 from transaction amount (for display). */
function getMockAiRiskScore(amount?: number): number {
  if (amount == null) return 45;
  if (amount >= 50_000_000) return 85;
  if (amount >= 20_000_000) return 70;
  if (amount >= 5_000_000) return 55;
  return 35;
}

function getStatusIcon(status: ReportResolutionStatus) {
  switch (status) {
    case "IMPLEMENTUAR":
      return <CheckCircle className="h-4 w-4" />;
    case "NE_DEBAT":
      return <Users className="h-4 w-4" />;
    case "UNDER_AUDIT":
      return <Eye className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getStatusClassName(status: ReportResolutionStatus): string {
  switch (status) {
    case "E_VERIFIKUAR":
      return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    case "NE_DEBAT":
      return "bg-purple-500/20 text-purple-400 border-purple-500/40";
    case "IMPLEMENTUAR":
      return "bg-green-500/20 text-green-400 border-green-500/40";
    case "UNDER_AUDIT":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "PENDING":
      return "bg-slate-500/20 text-slate-400 border-slate-500/40";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/40";
  }
}

export default function AdminInboxPage() {
  const { reports, recordAdminView } = useReports();
  const {
    proposals,
    getProposalsForReview,
    setProposalCostAndFinalVote,
    setProposalImplemented,
    transactionRiskAlerts,
    dismissRiskAlert,
  } = useProposalsAndVoting();
  const [tab, setTab] = useState<InboxTab>("raportet");
  const [responseReport, setResponseReport] = useState<CitizenReport | null>(null);
  const [responseOpen, setResponseOpen] = useState(false);
  const [costInputs, setCostInputs] = useState<Record<string, string>>({});

  const proposalsForReview = getProposalsForReview();
  const finalVoteProposals = proposals.filter((p) => p.status === "FinalVote");

  const handlePergjigju = useCallback((report: CitizenReport) => {
    recordAdminView(report.id);
    setResponseReport(report);
    setResponseOpen(true);
  }, [recordAdminView]);

  const handleResponseClose = useCallback((open: boolean) => {
    if (!open) setResponseReport(null);
    setResponseOpen(open);
  }, []);

  const handleSetCost = useCallback(
    (proposalId: string) => {
      const raw = costInputs[proposalId]?.replace(/\s/g, "") ?? "0";
      const cost = parseInt(raw, 10);
      if (isNaN(cost) || cost <= 0) return;
      setProposalCostAndFinalVote(proposalId, cost);
      setCostInputs((prev) => ({ ...prev, [proposalId]: "" }));
    },
    [costInputs, setProposalCostAndFinalVote]
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-100">
          <MessageSquare className="h-8 w-8 text-amber-500" />
          Inbox (Raportimet)
        </h1>
        <p className="mt-1 text-slate-400">
          Raportet e qytetarëve, propozimet për rishikim dhe njoftimet e rrezikut.
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        <Button
          variant={tab === "raportet" ? "default" : "ghost"}
          size="sm"
          className={tab === "raportet" ? "bg-slate-700" : "text-slate-400"}
          onClick={() => setTab("raportet")}
        >
          Raportet
        </Button>
        <Button
          variant={tab === "propozimet" ? "default" : "ghost"}
          size="sm"
          className={tab === "propozimet" ? "bg-slate-700" : "text-slate-400"}
          onClick={() => setTab("propozimet")}
        >
          Propozimet për Rishikim ({proposalsForReview.length})
        </Button>
        <Button
          variant={tab === "risk" ? "default" : "ghost"}
          size="sm"
          className={tab === "risk" ? "bg-slate-700" : "text-slate-400"}
          onClick={() => setTab("risk")}
        >
          Njoftime rreziku ({transactionRiskAlerts.length})
        </Button>
      </div>

      {tab === "raportet" && (
        <>
          {reports.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-16 w-16 text-slate-600" />
                <p className="mt-4 text-slate-400">
                  Nuk ka raporte ende. Raportet e qytetarëve do të shfaqen këtu.
                </p>
                <Link href="/admin">
                  <Button variant="outline" className="mt-4 border-slate-600 text-slate-300">
                    Kthehu te Paneli
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {reports.map((report) => {
                const aiScore = report.aiRiskScore ?? getMockAiRiskScore(report.transactionAmount);
                const isHighRisk = aiScore >= 70;
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-slate-700 bg-slate-800/50 overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex flex-row items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                              {report.citizenName}
                              <Badge variant="outline" className={getStatusClassName(report.status)}>
                                {getStatusIcon(report.status)}
                                <span className="ml-1">{REPORT_STATUS_LABELS[report.status]}</span>
                              </Badge>
                              {isHighRisk && (
                                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/40 gap-1">
                                  <AlertOctagon className="h-3.5 w-3.5" />
                                  Rrezik i lartë
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="mt-1 text-sm text-slate-500">
                              {report.category} · {formatDateAlbanian(new Date(report.date))}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handlePergjigju(report)}
                            className="shrink-0 bg-slate-700 hover:bg-slate-600 text-slate-100"
                          >
                            Përgjigju
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-slate-200">{report.description}</p>
                        <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                            Transaksioni i raportuar
                          </p>
                          <p className="text-sm font-medium text-slate-100">
                            {report.institution} – {formatLek(report.transactionAmount ?? 0)}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {report.transactionDescription}
                          </p>
                          <Link href="/dashboard#transaksione" className="text-xs text-amber-400 hover:underline mt-1 inline-block">
                            Shiko në Dashboard →
                          </Link>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            Rezultati AI (rrezik)
                          </span>
                          <div className="flex-1 h-2 max-w-[200px] rounded-full bg-slate-700 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                aiScore >= 70 ? "bg-red-500" : aiScore >= 50 ? "bg-amber-500" : "bg-slate-500"
                              )}
                              style={{ width: `${aiScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-300">{aiScore}/100</span>
                        </div>
                        <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Provat / Foto nga qytetari
                          </p>
                          {report.evidenceNote && (
                            <p className="text-sm text-slate-300 mb-2">{report.evidenceNote}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {(report.evidencePhotoUrls?.length ? report.evidencePhotoUrls : ["placeholder"]).map(
                              (url, i) =>
                                url === "placeholder" ? (
                                  <div
                                    key={i}
                                    className="w-20 h-20 rounded border border-dashed border-slate-600 bg-slate-800/50 flex items-center justify-center"
                                  >
                                    <span className="text-xs text-slate-500">Nuk ka foto</span>
                                  </div>
                                ) : (
                                  <div key={i} className="w-20 h-20 rounded border border-slate-600 bg-slate-800 overflow-hidden">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            Audit Trail
                          </p>
                          <ul className="space-y-1.5">
                            {report.history.map((entry) => (
                              <li key={entry.id} className="text-xs text-slate-400 flex items-center gap-2">
                                <span className="text-slate-500">{formatDateAlbanian(new Date(entry.timestamp))}</span>
                                <span className="text-slate-500">·</span>
                                <span>{entry.action}</span>
                                {entry.actor && (
                                  <>
                                    <span className="text-slate-500">·</span>
                                    <span className="text-slate-500">{entry.actor}</span>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {report.officialResponse && (
                          <div className="rounded-lg border border-green-700/50 bg-green-950/20 p-4">
                            <p className="text-xs font-medium text-green-400 mb-1">Përgjigja Zyrtare</p>
                            <p className="text-sm text-slate-200">{report.officialResponse}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "propozimet" && (
        <>
          {proposalsForReview.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderOpen className="h-16 w-16 text-slate-600" />
                <p className="mt-4 text-slate-400">
                  Nuk ka propozime që kanë arritur pragun e mbështetjes.
                </p>
                <Link href="/admin">
                  <Button variant="outline" className="mt-4 border-slate-600 text-slate-300">
                    Kthehu te Paneli
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {proposalsForReview.map((p) => (
                <Card key={p.id} className="border-slate-700 bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {p.title}
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/40">
                        {PROPOSAL_STATUS_LABELS[p.status]}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      {formatDateAlbanian(p.createdAt)} · {p.votesCount} / {p.threshold} vota
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300">{p.description}</p>
                    <div className="flex flex-wrap items-end gap-2">
                      <div className="flex-1 min-w-[140px]">
                        <label className="mb-1 block text-xs font-medium text-slate-400">
                          Cakto kosto (Lek)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="p.sh. 5000000"
                          value={costInputs[p.id] ?? ""}
                          onChange={(e) =>
                            setCostInputs((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="gap-2 bg-amber-600 hover:bg-amber-700"
                        onClick={() => handleSetCost(p.id)}
                      >
                        <Coins className="h-4 w-4" />
                        Kaloni për kosto
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Pas caktimit të kostos, propozimi kalon në fazën &quot;Voto përfundimtare&quot; për qytetarët.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {finalVoteProposals.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                Propozime në voto përfundimtare
              </h3>
              <div className="space-y-4">
                {finalVoteProposals.map((p) => (
                  <Card key={p.id} className="border-slate-700 bg-slate-800/50">
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-slate-200">{p.title}</p>
                        <p className="text-sm text-slate-400">
                          {formatLek(p.estimatedCost)} · {p.votesCount} vota
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setProposalImplemented(p.id)}
                      >
                        Shëno si të implementuar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Kur shënoni si të implementuar, kostoja zbritet nga buxheti nacional.
              </p>
            </div>
          )}
        </>
      )}

      {tab === "risk" && (
        <>
          {transactionRiskAlerts.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertOctagon className="h-16 w-16 text-slate-600" />
                <p className="mt-4 text-slate-400">
                  Nuk ka njoftime rreziku nga verifikimi social.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactionRiskAlerts.map((alert) => (
                <Card key={alert.id} className="border-red-900/50 bg-red-950/20">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-slate-200">
                        Transaksioni #{alert.transactionId}
                      </p>
                      <p className="text-sm text-slate-400">
                        Raporte anomalie: {alert.anomalyReportsCount} · Rezultati rreziku: {alert.riskScore}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDateAlbanian(alert.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400"
                      onClick={() => dismissRiskAlert(alert.id)}
                    >
                      Mbyll
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <OfficialResponseDialog
        open={responseOpen}
        onOpenChange={handleResponseClose}
        report={responseReport}
      />
    </div>
  );
}

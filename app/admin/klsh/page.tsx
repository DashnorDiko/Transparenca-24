"use client";

import { useState, useCallback } from "react";
import { Gavel, FileDown, Send, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReports } from "@/context/ReportsContext";
import { formatLek, formatDateAlbanian, cn } from "@/lib/utils";
import type { CitizenReport } from "@/lib/reports-types";

/** Digital Audit Package (JSON) sent to KLSH */
interface DigitalAuditPackage {
  version: string;
  generatedAt: string;
  protocolId: string | null;
  transaction: {
    id: string;
    institution?: string;
    amount: number;
    category: string;
    description?: string;
    date: string;
  };
  aiRiskFlags: {
    score: number;
    level: "low" | "medium" | "high";
  };
  citizenEvidence: {
    description: string;
    evidenceNote?: string;
    photoUrls: string[];
    reportedAt: string;
    citizenName: string;
  };
  adminReviewNotes?: string;
  reportId: string;
}

function buildDossier(report: CitizenReport): DigitalAuditPackage {
  const score = report.aiRiskScore ?? (report.transactionAmount && report.transactionAmount >= 10_000_000 ? 72 : 45);
  const level = score >= 70 ? "high" : score >= 50 ? "medium" : "low";
  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    protocolId: null,
    transaction: {
      id: report.transactionId,
      institution: report.institution,
      amount: report.transactionAmount ?? 0,
      category: report.category,
      description: report.transactionDescription,
      date: report.date,
    },
    aiRiskFlags: { score, level },
    citizenEvidence: {
      description: report.description,
      evidenceNote: report.evidenceNote,
      photoUrls: report.evidencePhotoUrls ?? [],
      reportedAt: report.date,
      citizenName: report.citizenName,
    },
    adminReviewNotes: report.adminNotes,
    reportId: report.id,
  };
}

const STEPS = [
  { key: "encrypt", label: "Po enkriptohet paketa...", duration: 1200 },
  { key: "connect", label: "Po lidhet me serverin e KLSH...", duration: 1500 },
  { key: "success", label: "Sukses: Protokolli KLSH-2026-AFX", duration: 0 },
] as const;

export default function AdminKLSHPage() {
  const { reports } = useReports();
  const verified = reports.filter((r) => r.status === "E_VERIFIKUAR");
  const [dossier, setDossier] = useState<DigitalAuditPackage | null>(null);
  const [sending, setSending] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [protocolId, setProtocolId] = useState<string | null>(null);

  const handleBuildDossier = useCallback((report: CitizenReport) => {
    setDossier(buildDossier(report));
    setSending(false);
    setStepIndex(0);
    setProtocolId(null);
  }, []);

  const handleDergoNeKLSH = useCallback(() => {
    if (!dossier) return;
    setSending(true);
    setStepIndex(0);
    const id = `KLSH-2026-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}X`;
    setProtocolId(id);

    let t = 0;
    STEPS.forEach((step, i) => {
      t += step.duration;
      setTimeout(() => setStepIndex(i + 1), t);
    });
    setTimeout(() => {
      setSending(false);
      setDossier((d) => (d ? { ...d, protocolId: id } : null));
    }, t + 500);
  }, [dossier]);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-100">
          <Gavel className="h-8 w-8 text-amber-500" />
          KLSH Pipeline
        </h1>
        <p className="mt-1 text-slate-400">
          Anomalitë e verifikuara. Ndërtoni Dossier Digjital dhe dërgoni në KLSH.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">
            Anomalitë të verifikuara
          </h2>
          {verified.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="py-12 text-center">
                <Gavel className="h-12 w-12 text-slate-600 mx-auto" />
                <p className="mt-3 text-slate-400">
                  Nuk ka raporte të verifikuara ende. Verifikoni raporte nga Inbox.
                </p>
              </CardContent>
            </Card>
          ) : (
            verified.map((report) => (
              <Card key={report.id} className="border-slate-700 bg-slate-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span className="text-slate-200">{report.citizenName}</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                      E Verifikuar
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    {report.institution} · {formatLek(report.transactionAmount ?? 0)} · {formatDateAlbanian(new Date(report.date))}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-slate-400 line-clamp-2">{report.description}</p>
                  <Button
                    size="sm"
                    className="mt-3 gap-2 bg-slate-700 hover:bg-slate-600 text-slate-100"
                    onClick={() => handleBuildDossier(report)}
                    disabled={sending}
                  >
                    <FileDown className="h-4 w-4" />
                    Ndërto Dossier
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:sticky lg:top-6">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                Dossier Digjital
              </CardTitle>
              <p className="text-xs text-slate-500">
                Paketa e auditit për KLSH (transaksion + AI + prova + shënime).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!dossier ? (
                <p className="text-sm text-slate-500">
                  Zgjidhni "Ndërto Dossier" te një raport i verifikuar.
                </p>
              ) : (
                <>
                  <pre className="text-[10px] bg-slate-900 rounded-lg p-3 overflow-auto max-h-[220px] text-slate-400 border border-slate-700">
                    {JSON.stringify(dossier, null, 2)}
                  </pre>
                  {sending ? (
                    <div className="space-y-2">
                      {STEPS.map((step, i) => (
                        <div
                          key={step.key}
                          className={cn(
                            "flex items-center gap-2 text-sm",
                            i < stepIndex ? "text-green-400" : i === stepIndex ? "text-amber-400" : "text-slate-500"
                          )}
                        >
                          {i < stepIndex ? (
                            <CheckCircle className="h-4 w-4 shrink-0" />
                          ) : i === stepIndex ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                          ) : (
                            <span className="w-4 h-4 shrink-0" />
                          )}
                          {step.label}
                        </div>
                      ))}
                    </div>
                  ) : dossier.protocolId ? (
                    <div className="rounded-lg border border-green-700/50 bg-green-950/20 p-3 flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-medium">{dossier.protocolId}</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={handleDergoNeKLSH}
                    >
                      <Send className="h-4 w-4" />
                      Dërgo në KLSH
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

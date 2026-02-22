"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Transaction } from "@/lib/mock-data";
import type {
  CitizenReport,
  ReportResolutionStatus,
  ReportHistoryEntry,
} from "@/lib/reports-types";

let reportCounter = 0;
let historyCounter = 0;
function nextReportId() {
  reportCounter += 1;
  return `report-${reportCounter}`;
}
function nextHistoryId() {
  historyCounter += 1;
  return `hist-${historyCounter}`;
}

function createHistoryEntry(action: string, actor?: string): ReportHistoryEntry {
  return {
    id: nextHistoryId(),
    timestamp: new Date().toISOString(),
    action,
    actor,
  };
}

interface ReportsContextValue {
  reports: CitizenReport[];
  addReport: (report: Omit<CitizenReport, "id" | "status" | "history">) => CitizenReport;
  updateReportResponse: (
    reportId: string,
    status: ReportResolutionStatus,
    officialResponse: string,
    notifyCitizen: boolean,
    adminNotes?: string
  ) => void;
  updateReportStatus: (reportId: string, status: ReportResolutionStatus, adminNotes?: string) => void;
  recordAdminView: (reportId: string, adminLabel?: string) => void;
  getReportByTransactionId: (txId: string) => CitizenReport | undefined;
  getReportsForTransaction: (txId: string) => CitizenReport[];
}

const REPORTS_STORAGE_KEY = "transparenca24_reports";

function loadReports(): CitizenReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as CitizenReport[];
    data.forEach((r) => {
      const n = parseInt(r.id.replace("report-", ""), 10);
      if (!isNaN(n) && n > reportCounter) reportCounter = n;
      r.history?.forEach((h) => {
        const hn = parseInt(h.id.replace("hist-", ""), 10);
        if (!isNaN(hn) && hn > historyCounter) historyCounter = hn;
      });
    });
    return data;
  } catch {
    return [];
  }
}

function saveReports(reports: CitizenReport[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch {}
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<CitizenReport[]>(loadReports);
  const reportsRef = useRef(reports);
  reportsRef.current = reports;

  const addReport = useCallback((data: Omit<CitizenReport, "id" | "status" | "history">) => {
    const entry = createHistoryEntry("Raportuar nga Qytetari", "Qytetari");
    const report: CitizenReport = {
      ...data,
      id: nextReportId(),
      status: "PENDING",
      history: [entry],
    };
    setReports((prev) => [report, ...prev]);
    return report;
  }, []);

  const actionForStatus = (status: ReportResolutionStatus): string => {
    switch (status) {
      case "E_VERIFIKUAR": return "E Verifikuar nga Bashkia";
      case "NE_DEBAT": return "Kaluar në Debat nga Bashkia";
      case "IMPLEMENTUAR": return "Implementuar nga Bashkia";
      case "UNDER_AUDIT": return "Nën Auditim – veprim i nisur nga Administrata";
      default: return "Në Pritje nga Bashkia";
    }
  };

  const updateReportResponse = useCallback(
    (reportId: string, status: ReportResolutionStatus, officialResponse: string, notifyCitizen: boolean, adminNotes?: string) => {
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== reportId) return r;
          const newEntry = createHistoryEntry(actionForStatus(status), "Bashkia");
          return {
            ...r,
            status,
            officialResponse: officialResponse || r.officialResponse,
            respondedAt: new Date().toISOString(),
            notifyCitizen,
            ...(adminNotes != null && adminNotes !== "" && { adminNotes }),
            history: [...r.history, newEntry],
          };
        })
      );
    },
    []
  );

  const updateReportStatus = useCallback(
    (reportId: string, status: ReportResolutionStatus, adminNotes?: string) => {
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== reportId) return r;
          const newEntry = createHistoryEntry(actionForStatus(status), "Administrator");
          return {
            ...r,
            status,
            ...(adminNotes != null && adminNotes !== "" && { adminNotes }),
            history: [...r.history, newEntry],
          };
        })
      );
    },
    []
  );

  const recordAdminView = useCallback((reportId: string, adminLabel = "Administrator") => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const newEntry = createHistoryEntry("Shikuar nga Admin", adminLabel);
        return { ...r, history: [...r.history, newEntry] };
      })
    );
  }, []);

  const getReportByTransactionId = useCallback((txId: string) => {
    return reportsRef.current.find((r) => r.transactionId === txId);
  }, []);

  const getReportsForTransaction = useCallback((txId: string) => {
    return reportsRef.current.filter((r) => r.transactionId === txId);
  }, []);

  useEffect(() => {
    if (reports.length > 0) saveReports(reports);
  }, [reports]);

  const value: ReportsContextValue = {
    reports,
    addReport,
    updateReportResponse,
    updateReportStatus,
    recordAdminView,
    getReportByTransactionId,
    getReportsForTransaction,
  };

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used within ReportsProvider");
  return ctx;
}

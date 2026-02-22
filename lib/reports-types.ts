/**
 * Interaction Layer: Citizen reports and official responses.
 * Status types for institution response workflow.
 */

import type { TransactionCategory } from "@/lib/mock-data";

/** Resolution status for citizen reports (institution response) */
export type ReportResolutionStatus =
  | "E_VERIFIKUAR"   // Verified
  | "NE_DEBAT"       // In Debate
  | "IMPLEMENTUAR"   // Implemented
  | "PENDING"        // Pending (Në Pritje)
  | "UNDER_AUDIT";  // Nën Auditim (Under Audit) – action being taken

export const REPORT_STATUS_LABELS: Record<ReportResolutionStatus, string> = {
  E_VERIFIKUAR: "E Verifikuar",
  NE_DEBAT: "Në Debat",
  IMPLEMENTUAR: "Implementuar",
  PENDING: "Në Pritje",
  UNDER_AUDIT: "Nën Auditim",
};

/** Audit trail entry for report history */
export interface ReportHistoryEntry {
  id: string;
  timestamp: string; // ISO
  action: string;    // e.g. "Raportuar nga Qytetari", "Kaluar në Debat nga Bashkia"
  actor?: string;    // "Qytetari", "Bashkia"
}

/** Citizen report submitted via Report Anomaly flow */
export interface CitizenReport {
  id: string;
  citizenName: string;
  citizenEmail?: string;
  category: TransactionCategory;
  description: string;
  evidenceNote?: string;
  /** Mock: AI risk score 0–100 (for admin inbox) */
  aiRiskScore?: number;
  /** Mock: citizen-uploaded photo URLs (for admin / KLSH dossier) */
  evidencePhotoUrls?: string[];
  date: string;           // ISO
  transactionId: string;
  transactionDescription?: string;
  transactionAmount?: number;
  institution?: string;
  status: ReportResolutionStatus;
  officialResponse?: string;
  respondedAt?: string;   // ISO
  notifyCitizen: boolean;
  history: ReportHistoryEntry[];
  /** Admin notes (for KLSH dossier) */
  adminNotes?: string;
}

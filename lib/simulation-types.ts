/**
 * Simulation types: projects, bids, companies, budget, reporting.
 * Reuses TransactionCategory from mock-data for consistency.
 */

import type { TransactionCategory } from "@/lib/mock-data";

export type ProjectStatus =
  | "Draft"       // Created, not yet open for bids
  | "Bidding"     // Open for bids
  | "Evaluation"  // Bids received, under evaluation
  | "InProgress"  // Winner selected, work in progress
  | "Completed"   // Finished successfully
  | "Reported";   // Reported (corruption, delay, irregularity)

export type ReportReason =
  | "Corruption"
  | "Delay"
  | "Irregularity"
  | "Quality"
  | "Other";

export type ReportOutcome =
  | "UnderReview"
  | "ContractCancelled"
  | "RefundIssued"
  | "PenaltyApplied"
  | "NoAction";

export interface Bid {
  id: string;
  companyId: string;
  companyName: string;
  amount: number; // Lek
  submittedAt: string; // ISO
  /** 0–100; higher = riskier */
  riskScore: number;
  /** 0–1; probability of corruption */
  corruptionProbability: number;
  /** 1-based rank by amount (lowest = 1) */
  rank?: number;
}

export interface ProjectReport {
  id: string;
  reason: ReportReason;
  details: string;
  outcome: ReportOutcome;
  reportedAt: string; // ISO
  outcomeNote?: string;
}

export interface SimulationProject {
  id: string;
  municipalityId: string;
  municipalityName: string;
  title: string;
  description: string;
  category: TransactionCategory;
  allocatedBudget: number; // Lek – deducted from municipality when created
  status: ProjectStatus;
  bids: Bid[];
  selectedBidId: string | null; // Winner bid id, set after evaluation
  createdAt: string; // ISO
  biddingClosedAt: string | null; // ISO, when moved to Evaluation
  completedAt: string | null; // ISO
  report: ProjectReport | null;
  /** Risk/anomaly flags (overpriced, single bidder, delay, etc.) */
  anomalyFlags: AnomalyFlag[];
  /** Contract value (winner bid amount) once awarded */
  contractValue: number | null;
  /** Progress payment step (0 = none, 1 = 30%, 2 = 60%, 3 = final) */
  paymentStep: number;
}

export interface SimulationCompany {
  id: string;
  name: string;
}

/** Municipality with fixed budget and real-time remaining (used by simulation) */
export interface SimulationMunicipality {
  id: string;
  name: string;
  nameSq: string;
  region: string;
  budgetTotal: number;   // Fixed total in Lek
  budgetRemaining: number; // Updated when projects are created/completed/reported
}

export interface ProjectNotification {
  id: string;
  projectId: string;
  projectTitle: string;
  municipalityName: string;
  budgetAmount: number; // Lek
  createdAt: number; // timestamp for ordering/dismiss
}

/** Simulation config (speed, corruption, frequency, municipality filter) */
export interface SimulationConfig {
  speed: number; // 1 = slow, 2 = normal, 3 = fast, 4 = very fast (tick interval ms derived)
  corruptionProbability: number; // 0–1, influences bid risk/corruption
  projectFrequency: number; // 0–1, probability of creating a project per tick
  selectedMunicipalityIds: string[] | "all"; // which municipalities can create projects
}

/** Anomaly flags for a project (risk detection) */
export type AnomalyFlag =
  | "OverpricedBid"
  | "SingleBidder"
  | "BudgetOverrun"
  | "Delay"
  | "SuspiciousTransaction"
  | "CitizenReported";

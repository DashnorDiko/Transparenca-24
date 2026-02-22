/**
 * Voting & Social Verification – Citizen Proposals and transaction vote data.
 */

export type CitizenProposalStatus =
  | "Proposed"      // I propozuar
  | "Supported"     // I mbështetur (votes reached)
  | "Costed"        // I kostohet (admin assigned cost)
  | "FinalVote"     // Voto përfundimtare
  | "Implemented";  // I implementuar

export const PROPOSAL_STATUS_LABELS: Record<CitizenProposalStatus, string> = {
  Proposed: "I propozuar",
  Supported: "I mbështetur",
  Costed: "I kostohet",
  FinalVote: "Voto përfundimtare",
  Implemented: "I implementuar",
};

export interface CitizenProposal {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;  // Lek – set when Costed
  votesCount: number;
  threshold: number;      // e.g. 100
  status: CitizenProposalStatus;
  createdAt: string;      // ISO
  costedAt?: string;      // ISO – when admin set cost
}

export interface TransactionVoteData {
  verificationVotes: number;
  anomalyReports: number;
  riskScore: number;      // 0–100, set to 90 when anomalyReports > 5
}

export interface TransactionRiskAlert {
  id: string;
  transactionId: string;
  transactionDescription?: string;
  amount?: number;
  riskScore: number;
  anomalyReportsCount: number;
  createdAt: string;      // ISO
}

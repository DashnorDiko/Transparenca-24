"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type {
  CitizenProposal,
  CitizenProposalStatus,
  TransactionVoteData,
  TransactionRiskAlert,
} from "@/lib/proposals-types";

const DEFAULT_THRESHOLD = 100;
const ANOMALY_ALERT_THRESHOLD = 5;
const RISK_SCORE_WHEN_ALERT = 90;

const STORAGE_KEYS = {
  proposals: "transparenca24_proposals",
  supportedIds: "transparenca24_supported_proposal_ids",
  transactionVotes: "transparenca24_tx_votes",
  riskAlerts: "transparenca24_risk_alerts",
};

let proposalCounter = 0;
let alertCounter = 0;
function nextProposalId() {
  proposalCounter += 1;
  return `prop-${proposalCounter}`;
}
function nextAlertId() {
  alertCounter += 1;
  return `alert-${alertCounter}`;
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as T;
    if (key === STORAGE_KEYS.proposals && Array.isArray(data)) {
      (data as CitizenProposal[]).forEach((p) => {
        const n = parseInt(p.id.replace("prop-", ""), 10);
        if (!isNaN(n) && n > proposalCounter) proposalCounter = n;
      });
    }
    return data;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

interface ProposalsAndVotingContextValue {
  proposals: CitizenProposal[];
  transactionVotes: Record<string, TransactionVoteData>;
  transactionRiskAlerts: TransactionRiskAlert[];
  addProposal: (title: string, description: string) => CitizenProposal;
  supportProposal: (proposalId: string) => { success: boolean; error?: string };
  setProposalCostAndFinalVote: (proposalId: string, estimatedCost: number) => void;
  incrementProposalVotes: (proposalId: string) => void;
  getProposalsForReview: () => CitizenProposal[];
  voteVerification: (transactionId: string) => void;
  voteAnomaly: (transactionId: string) => { alertTriggered: boolean };
  getTransactionVotes: (transactionId: string) => TransactionVoteData;
  dismissRiskAlert: (alertId: string) => void;
  setProposalImplemented: (proposalId: string) => void;
}

const ProposalsAndVotingContext = createContext<ProposalsAndVotingContextValue | null>(null);

export function ProposalsAndVotingProvider({ children }: { children: React.ReactNode }) {
  const [proposals, setProposals] = useState<CitizenProposal[]>(() =>
    loadJson<CitizenProposal[]>(STORAGE_KEYS.proposals, [])
  );
  const [userSupportedIds, setUserSupportedIds] = useState<Set<string>>(() => {
    const arr = loadJson<string[]>(STORAGE_KEYS.supportedIds, []);
    return new Set(arr);
  });
  const [transactionVotes, setTransactionVotes] = useState<Record<string, TransactionVoteData>>(() =>
    loadJson<Record<string, TransactionVoteData>>(STORAGE_KEYS.transactionVotes, {})
  );
  const [transactionRiskAlerts, setTransactionRiskAlerts] = useState<TransactionRiskAlert[]>(() =>
    loadJson<TransactionRiskAlert[]>(STORAGE_KEYS.riskAlerts, [])
  );
  useEffect(() => {
    saveJson(STORAGE_KEYS.proposals, proposals);
  }, [proposals]);
  useEffect(() => {
    saveJson(STORAGE_KEYS.supportedIds, Array.from(userSupportedIds));
  }, [userSupportedIds]);
  useEffect(() => {
    saveJson(STORAGE_KEYS.transactionVotes, transactionVotes);
  }, [transactionVotes]);
  useEffect(() => {
    saveJson(STORAGE_KEYS.riskAlerts, transactionRiskAlerts);
  }, [transactionRiskAlerts]);

  const getTransactionVotes = useCallback(
    (transactionId: string): TransactionVoteData => {
      return (
        transactionVotes[transactionId] ?? {
          verificationVotes: 0,
          anomalyReports: 0,
          riskScore: 0,
        }
      );
    },
    [transactionVotes]
  );

  const addProposal = useCallback((title: string, description: string): CitizenProposal => {
    const proposal: CitizenProposal = {
      id: nextProposalId(),
      title: title.trim(),
      description: description.trim(),
      estimatedCost: 0,
      votesCount: 0,
      threshold: DEFAULT_THRESHOLD,
      status: "Proposed",
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [proposal, ...prev]);
    return proposal;
  }, []);

  const incrementProposalVotes = useCallback((proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        const nextCount = p.votesCount + 1;
        const nextStatus: CitizenProposalStatus =
          nextCount >= p.threshold ? "Supported" : p.status;
        return { ...p, votesCount: nextCount, status: nextStatus };
      })
    );
  }, []);

  const supportProposal = useCallback(
    (proposalId: string): { success: boolean; error?: string } => {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal)
        return { success: false, error: "Propozimi nuk u gjet." };
      if (proposal.status !== "FinalVote")
        return { success: false, error: "Mund të mbështetni vetëm propozime në fazën e votimit përfundimtar." };
      if (userSupportedIds.has(proposalId))
        return { success: false, error: "E keni mbështetur tashmë këtë propozim." };
      setUserSupportedIds((prev) => new Set(prev).add(proposalId));
      return { success: true };
    },
    [proposals, userSupportedIds]
  );

  const setProposalCostAndFinalVote = useCallback((proposalId: string, estimatedCost: number) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposalId) return p;
        return {
          ...p,
          estimatedCost,
          status: "FinalVote" as CitizenProposalStatus,
          costedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const setProposalImplemented = useCallback((proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: "Implemented" as CitizenProposalStatus } : p))
    );
  }, []);

  const getProposalsForReview = useCallback(() => {
    return proposals.filter((p) => p.status === "Supported");
  }, [proposals]);

  const voteVerification = useCallback((transactionId: string) => {
    setTransactionVotes((prev) => {
      const cur = prev[transactionId] ?? { verificationVotes: 0, anomalyReports: 0, riskScore: 0 };
      return {
        ...prev,
        [transactionId]: { ...cur, verificationVotes: cur.verificationVotes + 1 },
      };
    });
  }, []);

  const voteAnomaly = useCallback((transactionId: string): { alertTriggered: boolean } => {
    const cur = transactionVotes[transactionId] ?? { verificationVotes: 0, anomalyReports: 0, riskScore: 0 };
    const nextReports = cur.anomalyReports + 1;
    const riskScore = nextReports > ANOMALY_ALERT_THRESHOLD ? RISK_SCORE_WHEN_ALERT : cur.riskScore;
    setTransactionVotes((prev) => ({
      ...prev,
      [transactionId]: { ...cur, anomalyReports: nextReports, riskScore },
    }));
    if (nextReports > ANOMALY_ALERT_THRESHOLD) {
      const alert: TransactionRiskAlert = {
        id: nextAlertId(),
        transactionId,
        riskScore: RISK_SCORE_WHEN_ALERT,
        anomalyReportsCount: nextReports,
        createdAt: new Date().toISOString(),
      };
      setTransactionRiskAlerts((a) => [alert, ...a]);
      return { alertTriggered: true };
    }
    return { alertTriggered: false };
  }, [transactionVotes]);

  const dismissRiskAlert = useCallback((alertId: string) => {
    setTransactionRiskAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const value: ProposalsAndVotingContextValue = {
    proposals,
    transactionVotes,
    transactionRiskAlerts,
    addProposal,
    supportProposal,
    setProposalCostAndFinalVote,
    incrementProposalVotes,
    getProposalsForReview,
    voteVerification,
    voteAnomaly,
    getTransactionVotes,
    dismissRiskAlert,
    setProposalImplemented,
  };

  return (
    <ProposalsAndVotingContext.Provider value={value}>
      {children}
    </ProposalsAndVotingContext.Provider>
  );
}

export function useProposalsAndVoting() {
  const ctx = useContext(ProposalsAndVotingContext);
  if (!ctx) throw new Error("useProposalsAndVoting must be used within ProposalsAndVotingProvider");
  return ctx;
}

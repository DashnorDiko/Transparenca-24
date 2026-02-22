"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  municipalities as getMunicipalitiesCached,
  transactions as getMockTransactions,
  contracts as getMockContracts,
  getAggregateStats,
  type Transaction,
  type Contract,
} from "@/lib/mock-data";
import { getMunicipalityListWithInitialBudget } from "@/lib/simulation";
import {
  createCompanies,
  tryCreateProject,
  tryAddBids,
  tryEvaluateOrStart,
  tryCompleteProject,
  tryReportProject,
  createContractFromProject,
  createPaymentTransaction,
  resetSimulationCounters,
  restoreSimulationCounters,
  getSimulationCounters,
  getProjectFrequencyMultiplier,
} from "@/lib/simulation-engine";
import {
  loadPersistedState,
  savePersistedStateDebounced,
  clearPersistedState,
  type PersistedSimulationState,
} from "@/lib/simulation-persistence";
import type {
  SimulationMunicipality,
  SimulationProject,
  SimulationCompany,
  ProjectNotification,
  SimulationConfig,
} from "@/lib/simulation-types";

function toSimulationMunicipalities(): SimulationMunicipality[] {
  const list = getMunicipalityListWithInitialBudget();
  return list.map((m) => ({
    id: m.id,
    name: m.name,
    nameSq: m.nameSq,
    region: m.region,
    budgetTotal: m.initialBudget,
    budgetRemaining: m.initialBudget,
  }));
}

const DEFAULT_CONFIG: SimulationConfig = {
  speed: 2,
  corruptionProbability: 0.3,
  projectFrequency: 0.4,
  selectedMunicipalityIds: "all",
};

function speedToMs(speed: number): number {
  const map: Record<number, number> = { 1: 4000, 2: 2500, 3: 1500, 4: 800 };
  return map[speed] ?? 2500;
}

interface SimulationState {
  municipalities: SimulationMunicipality[];
  projects: SimulationProject[];
  companies: SimulationCompany[];
  notifications: ProjectNotification[];
  transactions: Transaction[];
  contracts: Contract[];
  flaggedTransactionIds: Set<string>;
  config: SimulationConfig;
  isRunning: boolean;
  isPaused: boolean;
  selectedMunicipalityId: string | null;
}

interface SimulationContextValue extends SimulationState {
  setSelectedMunicipalityId: (id: string | null) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  setConfig: (c: Partial<SimulationConfig>) => void;
  dismissNotification: (id: string) => void;
  flagTransaction: (transactionId: string) => void;
  getMunicipalityById: (id: string) => SimulationMunicipality | undefined;
  getProjectById: (id: string) => SimulationProject | undefined;
  getDisplayTransactions: () => Transaction[];
  getDisplayTransactionsForFeed: (limit: number, municipalityId: string | null) => Transaction[];
  getDisplayContracts: () => Contract[];
  getDisplayStats: (filterMunicipalityId?: string | null) => {
    totalBudget: number;
    totalSpent: number;
    activeContracts: number;
    flaggedAnomalies: number;
    spendingSparkline: number[];
    transactionsCount: number;
  };
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

const TICK_MS = 2500;
const MAX_NOTIFICATIONS = 10;

function getInitialState(): {
  municipalities: SimulationMunicipality[];
  projects: SimulationProject[];
  transactions: Transaction[];
  contracts: Contract[];
  flaggedTransactionIds: Set<string>;
  config: SimulationConfig;
  selectedMunicipalityId: string | null;
} {
  if (typeof window === "undefined") {
    return {
      municipalities: toSimulationMunicipalities(),
      projects: [],
      transactions: [],
      contracts: [],
      flaggedTransactionIds: new Set(),
      config: DEFAULT_CONFIG,
      selectedMunicipalityId: null,
    };
  }
  const persisted = loadPersistedState();
  if (persisted && persisted.projects.length >= 0) {
    restoreSimulationCounters(persisted.counters);
    return {
      municipalities: persisted.municipalities as SimulationMunicipality[],
      projects: persisted.projects as SimulationProject[],
      transactions: persisted.transactions as Transaction[],
      contracts: persisted.contracts as Contract[],
      flaggedTransactionIds: new Set(persisted.flaggedTransactionIds),
      config: { ...DEFAULT_CONFIG, ...persisted.config },
      selectedMunicipalityId: null,
    };
  }
  return {
    municipalities: toSimulationMunicipalities(),
    projects: [],
    transactions: [],
    contracts: [],
    flaggedTransactionIds: new Set(),
    config: DEFAULT_CONFIG,
    selectedMunicipalityId: null,
  };
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const initial = getInitialState();
  const [municipalities, setMunicipalities] = useState<SimulationMunicipality[]>(initial.municipalities);
  const [projects, setProjects] = useState<SimulationProject[]>(initial.projects);
  const [companies] = useState<SimulationCompany[]>(() => createCompanies());
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [contracts, setContracts] = useState<Contract[]>(initial.contracts);
  const [flaggedTransactionIds, setFlaggedTransactionIds] = useState<Set<string>>(initial.flaggedTransactionIds);
  const [config, setConfigState] = useState<SimulationConfig>(initial.config);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(initial.selectedMunicipalityId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const municipalitiesRef = useRef(municipalities);
  const projectsRef = useRef(projects);
  const transactionsRef = useRef(transactions);
  const contractsRef = useRef(contracts);
  const configRef = useRef(config);
  municipalitiesRef.current = municipalities;
  projectsRef.current = projects;
  transactionsRef.current = transactions;
  contractsRef.current = contracts;
  configRef.current = config;

  const getMunicipalityById = useCallback((id: string) => {
    return municipalities.find((m) => m.id === id);
  }, [municipalities]);

  const getProjectById = useCallback((id: string) => {
    return projects.find((p) => p.id === id);
  }, [projects]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const setConfig = useCallback((c: Partial<SimulationConfig>) => {
    setConfigState((prev) => ({ ...prev, ...c }));
  }, []);

  const flagTransaction = useCallback((transactionId: string) => {
    setFlaggedTransactionIds((prev) => new Set(prev).add(transactionId));
  }, []);

  const tick = useCallback(() => {
    const prevMuns = municipalitiesRef.current;
    const prevProjects = projectsRef.current;
    const cfg = configRef.current;
    const actions: Array<"create" | "bids" | "evaluate" | "progress" | "complete" | "report"> = [
      "create",
      "bids",
      "evaluate",
      "progress",
      "complete",
      "report",
    ];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const frequencyMultiplier = getProjectFrequencyMultiplier();
    if (action === "create" && Math.random() < cfg.projectFrequency * frequencyMultiplier) {
      const result = tryCreateProject(prevMuns, prevProjects, companies, cfg);
      if (result.newProject) {
        const nextMuns = prevMuns.map((m) => {
          const upd = result.municipalityUpdates!.find((u) => u.id === m.id);
          if (upd?.budgetRemaining !== undefined)
            return { ...m, budgetRemaining: upd.budgetRemaining };
          return m;
        });
        setMunicipalities(nextMuns);
        setProjects((p) => [...p, result.newProject!]);
        if (result.notification) {
          setNotifications((n) => [
            result.notification!,
            ...n.slice(0, MAX_NOTIFICATIONS - 1),
          ]);
        }
        if (result.allocationTransaction) {
          setTransactions((t) => [result.allocationTransaction!, ...t]);
        }
      }
      return;
    }

    if (action === "bids" && Math.random() < 0.5) {
      const bidding = prevProjects.filter((p) => p.status === "Bidding");
      const project = bidding[Math.floor(Math.random() * bidding.length)];
      if (project) {
        const result = tryAddBids(project, companies, cfg.corruptionProbability);
        if (result) {
          setProjects((p) =>
            p.map((proj) =>
              proj.id === project.id
                ? { ...proj, bids: [...proj.bids, ...result!.bidsToAdd] }
                : proj
            )
          );
        }
      }
      return;
    }

    if (action === "evaluate" && Math.random() < 0.5) {
      const evaluable = prevProjects.filter(
        (p) => p.status === "Bidding" && p.bids.length >= 2
      );
      const evalOrStart = prevProjects.filter((p) => p.status === "Evaluation");
      const target = evaluable[0] || evalOrStart[0];
      if (target) {
        const result = tryEvaluateOrStart(target);
        if (result) {
          if (result.status === "Evaluation" && "rankedBids" in result) {
            setProjects((p) =>
              p.map((proj) => {
                if (proj.id !== target.id) return proj;
                return {
                  ...proj,
                  status: "Evaluation",
                  selectedBidId: result.selectedBidId,
                  biddingClosedAt: result.biddingClosedAt,
                  anomalyFlags: result.anomalyFlags,
                  bids: result.rankedBids,
                };
              })
            );
          } else if ("contractValue" in result) {
            const winner = target.bids.find((b) => b.id === target.selectedBidId);
            const contract = createContractFromProject(
              target,
              winner?.companyName ?? "Unknown",
              result.contractValue
            );
            setContracts((c) => [contract, ...c]);
            const statusRoll = Math.random();
            const txStatus: "Aprovuar" | "Në pritje" | "Anuluar" =
              statusRoll < 0.92 ? "Aprovuar" : statusRoll < 0.97 ? "Në pritje" : "Anuluar";
            const progressTx = createPaymentTransaction(
              target,
              Math.floor(result.contractValue * 0.3),
              `Pagesë e parë (30%) – ${target.title}`,
              txStatus
            );
            setTransactions((t) => [progressTx, ...t]);
            setProjects((p) =>
              p.map((proj) =>
                proj.id === target.id
                  ? {
                      ...proj,
                      status: "InProgress",
                      contractValue: result.contractValue,
                      paymentStep: 1,
                    }
                  : proj
              )
            );
          }
        }
      }
      return;
    }

    if (action === "progress" && Math.random() < 0.4) {
      const inProgress = prevProjects.filter((p) => p.status === "InProgress" && p.contractValue != null);
      const project = inProgress[Math.floor(Math.random() * inProgress.length)];
      if (project && project.contractValue != null) {
        const step = project.paymentStep;
        if (step === 1) {
          const amount = Math.floor(project.contractValue * 0.3);
          const statusRoll = Math.random();
          const txStatus: "Aprovuar" | "Në pritje" | "Anuluar" =
            statusRoll < 0.92 ? "Aprovuar" : statusRoll < 0.97 ? "Në pritje" : "Anuluar";
          const tx = createPaymentTransaction(
            project,
            amount,
            `Pagesë e dytë (60% total) – ${project.title}`,
            txStatus
          );
          setTransactions((t) => [tx, ...t]);
          setProjects((p) =>
            p.map((proj) =>
              proj.id === project.id ? { ...proj, paymentStep: 2 } : proj
            )
          );
        } else if (step === 2) {
          const amount = Math.floor(project.contractValue * 0.4);
          const statusRoll = Math.random();
          const txStatus: "Aprovuar" | "Në pritje" | "Anuluar" =
            statusRoll < 0.92 ? "Aprovuar" : statusRoll < 0.97 ? "Në pritje" : "Anuluar";
          const tx = createPaymentTransaction(
            project,
            amount,
            `Pagesë finale – ${project.title}`,
            txStatus
          );
          setTransactions((t) => [tx, ...t]);
          const addOverrun = Math.random() < 0.07;
          if (addOverrun) {
            const overrunAmount = Math.floor(project.contractValue * 0.08);
            const overrunTx = createPaymentTransaction(
              project,
              overrunAmount,
              `Rritje kostoje – ${project.title}`,
              "Aprovuar"
            );
            setTransactions((t) => [overrunTx, ...t]);
            setProjects((p) =>
              p.map((proj) =>
                proj.id === project.id
                  ? {
                      ...proj,
                      status: "Completed",
                      completedAt: new Date().toISOString(),
                      paymentStep: 3,
                      anomalyFlags: [...proj.anomalyFlags, "BudgetOverrun"],
                    }
                  : proj
              )
            );
          } else {
            setProjects((p) =>
              p.map((proj) =>
                proj.id === project.id
                  ? {
                      ...proj,
                      status: "Completed",
                      completedAt: new Date().toISOString(),
                      paymentStep: 3,
                    }
                  : proj
              )
            );
          }
        }
      }
      return;
    }

    if (action === "complete" && Math.random() < 0.2) {
      const inProgress = prevProjects.filter(
        (p) => p.status === "InProgress" && p.paymentStep === 2
      );
      const project = inProgress[Math.floor(Math.random() * inProgress.length)];
      if (project && tryCompleteProject(project)) {
        setProjects((p) =>
          p.map((proj) =>
            proj.id === project.id
              ? {
                  ...proj,
                  status: "Completed" as const,
                  completedAt: new Date().toISOString(),
                  paymentStep: 3,
                }
              : proj
          )
        );
      }
      return;
    }

    if (action === "report" && Math.random() < 0.2) {
      const reportable = prevProjects.filter(
        (p) =>
          (p.status === "InProgress" || p.status === "Completed") && !p.report
      );
      const project = reportable[Math.floor(Math.random() * reportable.length)];
      if (project) {
        const report = tryReportProject(project);
        if (report) {
          setProjects((p) =>
            p.map((proj) =>
              proj.id === project.id
                ? {
                    ...proj,
                    status: "Reported" as const,
                    report,
                    anomalyFlags: [...proj.anomalyFlags, "SuspiciousTransaction"],
                  }
                : proj
            )
          );
        }
      }
    }
  }, [companies]);

  const startSimulation = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, speedToMs(config.speed));
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isRunning, isPaused, config.speed, tick]);

  useEffect(() => {
    if (transactions.length === 0 && projects.length === 0) return;
    savePersistedStateDebounced({
      municipalities,
      projects,
      transactions,
      contracts,
      flaggedTransactionIds: Array.from(flaggedTransactionIds),
      config,
      counters: getSimulationCounters(),
    });
  }, [
    municipalities,
    projects,
    transactions,
    contracts,
    flaggedTransactionIds,
    config,
  ]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const pauseSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
  }, []);

  const resumeSimulation = useCallback(() => {
    if (!isRunning || !isPaused) return;
    const ms = speedToMs(configRef.current.speed);
    intervalRef.current = setInterval(tick, ms);
    setIsPaused(false);
  }, [isRunning, isPaused, tick]);

  const resetSimulation = useCallback(() => {
    stopSimulation();
    resetSimulationCounters();
    clearPersistedState();
    setMunicipalities(toSimulationMunicipalities());
    setProjects([]);
    setNotifications([]);
    setTransactions([]);
    setContracts([]);
    setFlaggedTransactionIds(new Set());
  }, [stopSimulation]);

  const getDisplayTransactions = useCallback((): Transaction[] => {
    if ((isRunning || transactions.length > 0) && transactions.length > 0) return transactions;
    return getMockTransactions();
  }, [isRunning, transactions]);

  const getDisplayTransactionsForFeed = useCallback(
    (limit: number, municipalityId: string | null): Transaction[] => {
      const list = getDisplayTransactions();
      let filtered = municipalityId ? list.filter((tx) => tx.municipalityId === municipalityId) : list;
      filtered = [...filtered].sort((a, b) => {
        const aFlag = flaggedTransactionIds.has(a.id) ? 1 : 0;
        const bFlag = flaggedTransactionIds.has(b.id) ? 1 : 0;
        if (bFlag !== aFlag) return bFlag - aFlag;
        if (b.amount !== a.amount) return b.amount - a.amount;
        return b.date.localeCompare(a.date);
      });
      return filtered.slice(0, limit);
    },
    [getDisplayTransactions, flaggedTransactionIds]
  );

  const getDisplayContracts = useCallback((): Contract[] => {
    if ((isRunning || contracts.length > 0) && contracts.length > 0) return contracts;
    return getMockContracts();
  }, [isRunning, contracts]);

  const getDisplayStats = useCallback(
    (filterMunicipalityId?: string | null) => {
      if ((isRunning || transactions.length > 0) && (transactions.length > 0 || projects.length > 0)) {
        const muns = filterMunicipalityId
          ? municipalities.filter((m) => m.id === filterMunicipalityId)
          : municipalities;
        const totalBudget = muns.reduce((s, m) => s + m.budgetTotal, 0);
        const totalSpent = muns.reduce((s, m) => s + (m.budgetTotal - m.budgetRemaining), 0);
        const munIds = new Set(muns.map((m) => m.id));
        const filteredTransactions = filterMunicipalityId
          ? transactions.filter((t) => t.municipalityId === filterMunicipalityId)
          : transactions;
        const filteredContracts = filterMunicipalityId
          ? contracts.filter((c) => c.municipalityId === filterMunicipalityId)
          : contracts;
        const filteredProjects = filterMunicipalityId
          ? projects.filter((p) => p.municipalityId === filterMunicipalityId)
          : projects;
        const flaggedAnomalies =
          filteredTransactions.filter((t) => flaggedTransactionIds.has(t.id)).length +
          filteredProjects.filter((p) => p.status === "Reported" || p.anomalyFlags.length > 0).length;
        const base = totalSpent / 365 || 1000;
        const spendingSparkline = [0.9, 1.1, 0.85, 1.05, 0.95, 1.0, 0.88].map((k) =>
          Math.round(base * k)
        );
        return {
          totalBudget,
          totalSpent,
          activeContracts: filteredContracts.length,
          flaggedAnomalies: Math.max(filterMunicipalityId ? 0 : 1, flaggedAnomalies),
          spendingSparkline,
          transactionsCount: filteredTransactions.length,
        };
      }
      return getAggregateStats();
    },
    [
      isRunning,
      municipalities,
      transactions,
      contracts.length,
      projects,
      flaggedTransactionIds,
    ]
  );

  const value: SimulationContextValue = {
    municipalities,
    projects,
    companies,
    notifications,
    transactions,
    contracts,
    flaggedTransactionIds,
    config,
    isRunning,
    isPaused,
    selectedMunicipalityId,
    setSelectedMunicipalityId,
    startSimulation,
    stopSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setConfig,
    dismissNotification,
    flagTransaction,
    getMunicipalityById,
    getProjectById,
    getDisplayTransactions,
    getDisplayTransactionsForFeed,
    getDisplayContracts,
    getDisplayStats,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}

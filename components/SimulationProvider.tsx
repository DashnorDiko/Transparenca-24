"use client";

import * as React from "react";
import { municipalities as getMunicipalities } from "@/lib/mock-data";
import type {
  SimulationProject,
  SimulationMunicipality,
  ProjectNotification,
  SimulationTransaction,
  SimulationContract,
  SimulationControls,
} from "@/lib/simulation-types";
import { DEFAULT_CONTROLS } from "@/lib/simulation-types";
import {
  simulationTick,
  getSimulationAggregateStats,
  resetEngineCounters,
} from "@/lib/simulation-engine";

export type SimulationAggregateStats = ReturnType<typeof getSimulationAggregateStats>;

type SimulationState = {
  municipalities: SimulationMunicipality[];
  projects: SimulationProject[];
  notifications: ProjectNotification[];
  transactions: SimulationTransaction[];
  contracts: SimulationContract[];
  controls: SimulationControls;
  isRunning: boolean;
};

type SimulationContextValue = SimulationState & {
  startSimulation: () => void;
  stopSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  setControls: (updates: Partial<SimulationControls>) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  /** When simulation has run, use these for dashboard/live feed; otherwise null */
  getAggregateStats: () => SimulationAggregateStats | null;
  /** Flag a project as reported by citizen (from Report Anomaly flow) */
  reportProjectByTransactionId: (transactionId: string) => void;
};

const SimulationContext = React.createContext<SimulationContextValue | null>(null);

function getInitialState(): SimulationState {
  const muns = getMunicipalities();
  const municipalities: SimulationMunicipality[] = muns.map((m) => ({
    id: m.id,
    name: m.name,
    nameSq: m.nameSq,
    region: m.region,
    initialBudget: m.budgetTotal,
    remainingBudget: m.budgetTotal,
  }));
  return {
    municipalities,
    projects: [],
    notifications: [],
    transactions: [],
    contracts: [],
    controls: { ...DEFAULT_CONTROLS },
    isRunning: false,
  };
}

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SimulationState>(getInitialState);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startSimulation = React.useCallback(() => {
    setState((s) => ({ ...s, isRunning: true, controls: { ...s.controls, paused: false } }));
  }, []);

  const stopSimulation = React.useCallback(() => {
    setState((s) => ({ ...s, isRunning: false, controls: { ...s.controls, paused: true } }));
  }, []);

  const pauseSimulation = React.useCallback(() => {
    setState((s) => ({ ...s, isRunning: false, controls: { ...s.controls, paused: true } }));
  }, []);

  const resumeSimulation = React.useCallback(() => {
    setState((s) => ({ ...s, isRunning: true, controls: { ...s.controls, paused: false } }));
  }, []);

  const resetSimulation = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    resetEngineCounters();
    setState(getInitialState());
  }, []);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const setControls = React.useCallback((updates: Partial<SimulationControls>) => {
    setState((s) => ({
      ...s,
      controls: { ...s.controls, ...updates },
    }));
  }, []);

  React.useEffect(() => {
    if (!state.isRunning || state.controls.paused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const ms = state.controls.speed;
    intervalRef.current = setInterval(() => {
      setState((s) => {
        const next = simulationTick(
          s.municipalities,
          s.projects,
          s.notifications,
          s.transactions,
          s.contracts,
          s.controls
        );
        return { ...s, ...next };
      });
    }, ms);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, state.controls.paused, state.controls.speed]);

  const markNotificationRead = React.useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const dismissNotification = React.useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const getAggregateStats = React.useCallback(() => {
    if (state.transactions.length === 0 && state.projects.length === 0) return null;
    return getSimulationAggregateStats(
      state.municipalities,
      state.transactions,
      state.contracts,
      state.projects
    );
  }, [
    state.municipalities,
    state.transactions,
    state.contracts,
    state.projects,
  ]);

  const reportProjectByTransactionId = React.useCallback((transactionId: string) => {
    setState((s) => {
      const tx = s.transactions.find((t) => t.id === transactionId);
      if (!tx?.projectId) return s;
      const project = s.projects.find((p) => p.id === tx.projectId);
      if (!project || project.report) return s;
      const mun = s.municipalities.find((m) => m.id === project.municipalityId);
      const report = {
        projectId: project.id,
        reason: "irregularity" as const,
        description: `Raport qytetari: ${tx.description}`,
        outcome: "Raport u regjistruar; në pritje të vendimit.",
        reportedAt: new Date().toISOString(),
        citizenReported: true,
      };
      const updatedProjects = s.projects.map((p) =>
        p.id === project.id ? { ...p, status: "reported" as const, report } : p
      );
      return { ...s, projects: updatedProjects };
    });
  }, []);

  const value: SimulationContextValue = {
    ...state,
    startSimulation,
    stopSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    setControls,
    markNotificationRead,
    dismissNotification,
    getAggregateStats,
    reportProjectByTransactionId,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = React.useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}

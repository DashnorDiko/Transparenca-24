/**
 * Simulation engine: create projects, bids, transactions, contracts; risk and anomaly.
 * Pure functions; state updates are applied by the SimulationContext.
 */

import type {
  TransactionCategory,
  Transaction,
  TransactionStatus,
  Contract,
} from "@/lib/mock-data";
import type {
  SimulationMunicipality,
  SimulationProject,
  SimulationCompany,
  Bid,
  ProjectReport,
  ProjectNotification,
  SimulationConfig,
  AnomalyFlag,
} from "./simulation-types";

const PROJECT_TITLES_SQ: { title: string; category: TransactionCategory }[] = [
  { title: "Ndërtim rrugë lokale", category: "Rrugë" },
  { title: "Furnizim pajisjesh mjekësore", category: "Shëndetësi" },
  { title: "Rinovim shkollash", category: "Arsim" },
  { title: "Sistem kanalizimi", category: "Infrastrukturë" },
  { title: "Ndriçim publik LED", category: "Infrastrukturë" },
  { title: "Videosurveillance qendër qytet", category: "Siguria" },
  { title: "Pastrimi i rrugëve", category: "Mjedisi" },
  { title: "Restaurim objekti kulturor", category: "Kultura" },
  { title: "Furnizim librash shkollore", category: "Arsim" },
  { title: "Trajnime për stafin", category: "Administratë" },
  { title: "Blerje pajisjesh shkollore", category: "Arsim" },
  { title: "Mirëmbajtje rrugësh komunale", category: "Rrugë" },
  { title: "Rinovim spitali rajonal", category: "Shëndetësi" },
  { title: "Pajisje sportive për shkolla", category: "Sport" },
  { title: "Reforestacion zonë malore", category: "Mjedisi" },
  { title: "Ndërtim ura lokale", category: "Infrastrukturë" },
  { title: "Furnizim ujë pijshëm", category: "Infrastrukturë" },
  { title: "Menaxhim mbeturina", category: "Mjedisi" },
  { title: "Ndriçim publik", category: "Infrastrukturë" },
  { title: "Rrugë e re lokale", category: "Rrugë" },
  { title: "Kompensim energjetik ndërtesave publike", category: "Energji" },
  { title: "Festival kulturor vjetor", category: "Kultura" },
  { title: "Pajisje mjekësore spitali", category: "Shëndetësi" },
  { title: "Program aftësimi për të rinj", category: "Arsim" },
  { title: "Sistem ujësjellës", category: "Infrastrukturë" },
  { title: "Parku i qendrës – rinovim", category: "Mjedisi" },
  { title: "Kamera sigurie rrugë kryesore", category: "Siguria" },
  { title: "Blerje autobuzi për transport urban", category: "Infrastrukturë" },
];

const CATEGORIES: TransactionCategory[] = [
  "Arsim", "Infrastrukturë", "Shëndetësi", "Kultura", "Mjedisi",
  "Siguria", "Sport", "Administratë", "Rrugë", "Energji",
];

const COMPANY_NAMES = [
  "Albanian Construction Co.",
  "Energji Shqiptare SH.P.K.",
  "Infrastruktura Plus",
  "Balkan Roads Ltd",
  "Shëndetësia Publike AL",
  "Edu AL Foundation",
  "Kultura & Trashëgimi",
  "Ujësjellës Jugor",
  "Pastrimi & Mjedisi",
  "Siguria & Teknologji",
  "Ndërtimorja e Re",
  "Albanian Tech Solutions",
  "Green Infrastructure AL",
  "Public Works Shqipëri",
  "Urban Development Co.",
];

const REPORT_REASONS: ProjectReport["reason"][] = ["Corruption", "Delay", "Irregularity", "Quality", "Other"];
const REPORT_OUTCOMES: ProjectReport["outcome"][] = ["UnderReview", "ContractCancelled", "RefundIssued", "PenaltyApplied", "NoAction"];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Weighted random choice; weights must be >= 0 */
function weightedChoice<T>(items: T[], getWeight: (item: T) => number): T {
  const weights = items.map((i) => Math.max(0, getWeight(i)));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Seasonal and category weights: education in Sept, infrastructure in summer, year-end spike in Dec */
function getCategoryWeights(month: number): Record<string, number> {
  const base: Record<string, number> = {
    Arsim: 1,
    Infrastrukturë: 1,
    Shëndetësi: 1,
    Kultura: 1,
    Mjedisi: 1,
    Siguria: 1,
    Sport: 1,
    Administratë: 1,
    Rrugë: 1,
    Energji: 1,
  };
  if (month === 8) base["Arsim"] = 2.2; // September – school year start
  if (month >= 5 && month <= 7) {
    base["Infrastrukturë"] = 1.6;
    base["Rrugë"] = 1.6; // Summer – construction season
  }
  if (month === 11) {
    Object.keys(base).forEach((k) => { base[k] *= 1.15; }); // December – budget closing
  }
  return base;
}

/** Fiscal year end: more project creation in Nov/Dec */
export function getProjectFrequencyMultiplier(): number {
  const d = new Date();
  const m = d.getMonth();
  if (m === 10) return 1.25; // November
  if (m === 11) return 1.4;  // December
  return 1;
}

let projectCounter = 0;
let bidCounter = 0;
let reportCounter = 0;
let notificationCounter = 0;
let transactionCounter = 0;
let contractCounter = 0;

export function resetSimulationCounters() {
  projectCounter = 0;
  bidCounter = 0;
  reportCounter = 0;
  notificationCounter = 0;
  transactionCounter = 0;
  contractCounter = 0;
}

/** Restore counters from persisted state so new IDs don't collide */
export function restoreSimulationCounters(counters: {
  project: number;
  bid: number;
  report: number;
  notification: number;
  transaction: number;
  contract: number;
}) {
  projectCounter = Math.max(projectCounter, counters.project);
  bidCounter = Math.max(bidCounter, counters.bid);
  reportCounter = Math.max(reportCounter, counters.report);
  notificationCounter = Math.max(notificationCounter, counters.notification);
  transactionCounter = Math.max(transactionCounter, counters.transaction);
  contractCounter = Math.max(contractCounter, counters.contract);
}

export function getSimulationCounters() {
  return {
    project: projectCounter,
    bid: bidCounter,
    report: reportCounter,
    notification: notificationCounter,
    transaction: transactionCounter,
    contract: contractCounter,
  };
}

function nextProjectId() {
  projectCounter += 1;
  return `proj-${projectCounter}`;
}
function nextBidId() {
  bidCounter += 1;
  return `bid-${bidCounter}`;
}
function nextReportId() {
  reportCounter += 1;
  return `rep-${reportCounter}`;
}
function nextNotificationId() {
  notificationCounter += 1;
  return `notif-${notificationCounter}`;
}
function nextTransactionId() {
  transactionCounter += 1;
  return `sim-tx-${transactionCounter}`;
}
function nextContractId() {
  contractCounter += 1;
  return `sim-contract-${contractCounter}`;
}

/** Create companies pool from names */
export function createCompanies(): SimulationCompany[] {
  return COMPANY_NAMES.map((name, i) => ({
    id: `company-${i + 1}`,
    name,
  }));
}

/** Try to create one new project; returns updates, optional notification, and allocation transaction. */
export function tryCreateProject(
  municipalities: SimulationMunicipality[],
  _projects: SimulationProject[],
  _companies: SimulationCompany[],
  config: SimulationConfig
): {
  municipalityUpdates: Partial<SimulationMunicipality>[];
  newProject: SimulationProject | null;
  notification: ProjectNotification | null;
  allocationTransaction: Transaction | null;
} {
  let withBudget = municipalities.filter((m) => m.budgetRemaining > 500_000);
  if (config.selectedMunicipalityIds !== "all" && config.selectedMunicipalityIds.length > 0) {
    const idSet = new Set(config.selectedMunicipalityIds);
    withBudget = withBudget.filter((m) => idSet.has(m.id));
  }
  if (withBudget.length === 0)
    return { municipalityUpdates: [], newProject: null, notification: null, allocationTransaction: null };

  // Larger municipalities (by budget) with more remaining budget are more likely to create projects
  const mun = weightedChoice(
    withBudget,
    (m) => m.budgetRemaining * Math.sqrt(1 + m.budgetTotal / 100_000_000)
  );
  const minAlloc = 200_000;
  const maxAlloc = Math.min(mun.budgetRemaining, 50_000_000);
  if (maxAlloc < minAlloc)
    return { municipalityUpdates: [], newProject: null, notification: null, allocationTransaction: null };

  const month = new Date().getMonth();
  const catWeights = getCategoryWeights(month);
  const category = weightedChoice(CATEGORIES, (c) => catWeights[c] ?? 1);
  const titlesForCategory = PROJECT_TITLES_SQ.filter((p) => p.category === category);
  const pool = titlesForCategory.length > 0 ? titlesForCategory : PROJECT_TITLES_SQ;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const title = picked.title;

  const baseBudget = randomBetween(minAlloc, maxAlloc);
  const variance = 0.9 + Math.random() * 0.2;
  const allocatedBudget = Math.floor(baseBudget * variance);
  const now = new Date().toISOString();
  const dateOnly = now.split("T")[0];

  const projectId = nextProjectId();
  const newProject: SimulationProject = {
    id: projectId,
    municipalityId: mun.id,
    municipalityName: mun.nameSq || mun.name,
    title,
    description: `${title} – projekt i bashkisë ${mun.nameSq || mun.name}. Buxheti i alokuar: ${allocatedBudget.toLocaleString()} Lek. Afati: 12 muaj.`,
    category,
    allocatedBudget,
    status: "Bidding",
    bids: [],
    selectedBidId: null,
    createdAt: now,
    biddingClosedAt: null,
    completedAt: null,
    report: null,
    anomalyFlags: [],
    contractValue: null,
    paymentStep: 0,
  };

  const municipalityUpdates: Partial<SimulationMunicipality>[] = [
    { id: mun.id, budgetRemaining: mun.budgetRemaining - allocatedBudget },
  ];

  const notification: ProjectNotification = {
    id: nextNotificationId(),
    projectId,
    projectTitle: newProject.title,
    municipalityName: newProject.municipalityName,
    budgetAmount: allocatedBudget,
    createdAt: Date.now(),
  };

  const allocationTransaction: Transaction = {
    id: nextTransactionId(),
    institution: `Bashkia ${mun.nameSq || mun.name}`,
    municipalityId: mun.id,
    amount: allocatedBudget,
    category,
    date: dateOnly,
    status: "Aprovuar",
    description: `Alokim buxheti – ${title}`,
  };

  return { municipalityUpdates, newProject, notification, allocationTransaction };
}

/** Add 2–5 bids with risk and corruption probability. corruptionConfig 0–1. */
export function tryAddBids(
  project: SimulationProject,
  companies: SimulationCompany[],
  corruptionConfig: number
): { bidsToAdd: Bid[] } | null {
  if (project.status !== "Bidding") return null;
  if (project.bids.length >= 5) return null;

  const numBids = randomBetween(2, 5) - project.bids.length;
  if (numBids <= 0) return null;

  const usedCompanyIds = new Set(project.bids.map((b) => b.companyId));
  const available = companies.filter((c) => !usedCompanyIds.has(c.id));
  if (available.length < numBids) return null;

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const now = new Date().toISOString();
  const bidsToAdd: Bid[] = [];

  for (let i = 0; i < numBids; i++) {
    const company = shuffled[i];
    const amount = randomBetween(
      Math.floor(project.allocatedBudget * 0.7),
      Math.floor(project.allocatedBudget * 1.15)
    );
    const baseCorruption = corruptionConfig * 0.5 + Math.random() * 0.3;
    const corruptionProbability = Math.min(1, Math.max(0, baseCorruption));
    const riskScore = Math.floor(20 + corruptionProbability * 80 + Math.random() * 15);
    bidsToAdd.push({
      id: nextBidId(),
      companyId: company.id,
      companyName: company.name,
      amount,
      submittedAt: now,
      riskScore: Math.min(100, riskScore),
      corruptionProbability,
    });
  }

  const sorted = [...project.bids, ...bidsToAdd].sort((a, b) => a.amount - b.amount);
  sorted.forEach((b, idx) => {
    const added = bidsToAdd.find((x) => x.id === b.id);
    if (added) added.rank = idx + 1;
  });

  return { bidsToAdd };
}

/** Move project from Bidding → Evaluation (select winner) or Evaluation → InProgress. Returns contractValue when moving to InProgress. */
export function tryEvaluateOrStart(
  project: SimulationProject
):
  | { selectedBidId: string; status: "Evaluation"; biddingClosedAt: string; anomalyFlags: AnomalyFlag[]; rankedBids: Bid[] }
  | { status: "InProgress"; contractValue: number }
  | null {
  if (project.status === "Bidding" && project.bids.length >= 2) {
    const rankedBids = [...project.bids]
      .sort((a, b) => a.amount - b.amount)
      .map((b, idx) => ({ ...b, rank: idx + 1 }));
    const winner = rankedBids[0];
    const anomalyFlags = computeAnomalyFlags({ ...project, bids: rankedBids });
    return {
      selectedBidId: winner.id,
      status: "Evaluation",
      biddingClosedAt: new Date().toISOString(),
      anomalyFlags,
      rankedBids,
    };
  }
  if (project.status === "Evaluation" && project.selectedBidId) {
    const winner = project.bids.find((b) => b.id === project.selectedBidId);
    const contractValue = winner ? winner.amount : 0;
    return { status: "InProgress", contractValue };
  }
  return null;
}

/** Compute anomaly flags for a project (overpriced, single bidder, etc.) */
export function computeAnomalyFlags(project: SimulationProject): AnomalyFlag[] {
  const flags: AnomalyFlag[] = [];
  if (project.bids.length === 1) flags.push("SingleBidder");
  const overpriced = project.bids.some((b) => b.amount > project.allocatedBudget * 1.1);
  if (overpriced) flags.push("OverpricedBid");
  return flags;
}

/** Move project from InProgress → Completed. */
export function tryCompleteProject(project: SimulationProject): boolean {
  if (project.status !== "InProgress") return false;
  return true;
}

/** Add report and set status to Reported for a Completed or InProgress project. */
export function tryReportProject(project: SimulationProject): ProjectReport | null {
  if (project.status !== "InProgress" && project.status !== "Completed") return null;
  if (project.report) return null;

  const now = new Date().toISOString();
  const reason = randomChoice(REPORT_REASONS);
  const outcome = randomChoice(REPORT_OUTCOMES);
  const details =
    reason === "Corruption"
      ? "Dyshime për marrëveshje të fshehta me kontraktuesin."
      : reason === "Delay"
        ? "Projekti ka kaluar afatin e planifikuar pa justifikim."
        : reason === "Irregularity"
          ? "Shkelje e procedurave të prokurimit."
          : reason === "Quality"
            ? "Cilësi e ulët e punës të verifikuar."
            : "Çështje të tjera të raportuara nga qytetarët.";

  return {
    id: nextReportId(),
    reason,
    details,
    outcome,
    reportedAt: now,
    outcomeNote: outcome === "ContractCancelled" ? "Kontrata u anulua; fondet u kthyen." : undefined,
  };
}

/** Create a Contract (mock-data shape) when project is awarded. */
export function createContractFromProject(
  project: SimulationProject,
  winnerName: string,
  contractValue: number
): Contract {
  const signedDate = new Date().toISOString().split("T")[0];
  return {
    id: nextContractId(),
    title: project.title,
    winner: winnerName,
    value: contractValue,
    municipalityId: project.municipalityId,
    signedDate,
    category: project.category,
  };
}

/** Create a progress or final payment transaction (mock-data Transaction). */
export function createPaymentTransaction(
  project: SimulationProject,
  amount: number,
  description: string,
  status: TransactionStatus = "Aprovuar"
): Transaction {
  const now = new Date().toISOString();
  const dateOnly = now.split("T")[0];
  return {
    id: nextTransactionId(),
    institution: `Bashkia ${project.municipalityName}`,
    municipalityId: project.municipalityId,
    amount,
    category: project.category,
    date: dateOnly,
    status,
    description,
  };
}

/**
 * LLogaria AL - Mock data engine
 * 61 Bashkitë (municipalities), transactions, and contracts for budget transparency MVP.
 * Municipality list and initial budgets come from @/lib/simulation for consistency.
 */

import { getMunicipalityListWithInitialBudget } from "@/lib/simulation";

export type Region =
  | "Shkodër"
  | "Kukës"
  | "Lezhë"
  | "Dibër"
  | "Durrës"
  | "Tiranë"
  | "Elbasan"
  | "Fier"
  | "Berat"
  | "Korçë"
  | "Vlorë"
  | "Gjirokastër";

export interface Municipality {
  id: string;
  name: string;
  nameSq: string;
  region: Region;
  population: number;
  budgetTotal: number; // Lek
  budgetSpent: number;
  contractsCount: number;
}

export type TransactionCategory =
  | "Arsim"
  | "Infrastrukturë"
  | "Shëndetësi"
  | "Kultura"
  | "Mjedisi"
  | "Siguria"
  | "Sport"
  | "Administratë"
  | "Rrugë"
  | "Energji";

export type TransactionStatus = "Aprovuar" | "Në pritje" | "Refuzuar" | "Anuluar";

export interface Transaction {
  id: string;
  institution: string;
  municipalityId: string;
  amount: number;
  category: TransactionCategory;
  date: string; // ISO
  status: TransactionStatus;
  description: string;
}

export interface Contract {
  id: string;
  title: string;
  winner: string;
  value: number; // Lek
  municipalityId: string;
  signedDate: string;
  category: TransactionCategory;
}

const REGIONS: Region[] = [
  "Shkodër", "Kukës", "Lezhë", "Dibër", "Durrës", "Tiranë",
  "Elbasan", "Fier", "Berat", "Korçë", "Vlorë", "Gjirokastër",
];

const MUNICIPALITY_NAMES: { name: string; nameSq: string; region: Region }[] = [
  { name: "Belsh", nameSq: "Belsh", region: "Elbasan" },
  { name: "Berat", nameSq: "Berat", region: "Berat" },
  { name: "Bulqizë", nameSq: "Bulqizë", region: "Dibër" },
  { name: "Cërrik", nameSq: "Cërrik", region: "Elbasan" },
  { name: "Delvinë", nameSq: "Delvinë", region: "Vlorë" },
  { name: "Devoll", nameSq: "Devoll", region: "Korçë" },
  { name: "Dibër", nameSq: "Dibër", region: "Dibër" },
  { name: "Dimal", nameSq: "Dimal", region: "Berat" },
  { name: "Divjakë", nameSq: "Divjakë", region: "Fier" },
  { name: "Dropull", nameSq: "Dropull", region: "Gjirokastër" },
  { name: "Durrës", nameSq: "Durrës", region: "Durrës" },
  { name: "Elbasan", nameSq: "Elbasan", region: "Elbasan" },
  { name: "Fier", nameSq: "Fier", region: "Fier" },
  { name: "Finiq", nameSq: "Finiq", region: "Vlorë" },
  { name: "Fushë-Arrëz", nameSq: "Fushë-Arrëz", region: "Shkodër" },
  { name: "Gjirokastër", nameSq: "Gjirokastër", region: "Gjirokastër" },
  { name: "Gramsh", nameSq: "Gramsh", region: "Elbasan" },
  { name: "Has", nameSq: "Has", region: "Kukës" },
  { name: "Himarë", nameSq: "Himarë", region: "Vlorë" },
  { name: "Kamëz", nameSq: "Kamëz", region: "Tiranë" },
  { name: "Kavajë", nameSq: "Kavajë", region: "Tiranë" },
  { name: "Këlcyrë", nameSq: "Këlcyrë", region: "Gjirokastër" },
  { name: "Klos", nameSq: "Klos", region: "Dibër" },
  { name: "Kolonjë", nameSq: "Kolonjë", region: "Korçë" },
  { name: "Konispol", nameSq: "Konispol", region: "Vlorë" },
  { name: "Korçë", nameSq: "Korçë", region: "Korçë" },
  { name: "Krujë", nameSq: "Krujë", region: "Durrës" },
  { name: "Kuçovë", nameSq: "Kuçovë", region: "Berat" },
  { name: "Kukës", nameSq: "Kukës", region: "Kukës" },
  { name: "Kurbin", nameSq: "Kurbin", region: "Lezhë" },
  { name: "Lezhë", nameSq: "Lezhë", region: "Lezhë" },
  { name: "Libohovë", nameSq: "Libohovë", region: "Gjirokastër" },
  { name: "Librazhd", nameSq: "Librazhd", region: "Elbasan" },
  { name: "Lushnjë", nameSq: "Lushnjë", region: "Fier" },
  { name: "Malësi e Madhe", nameSq: "Malësi e Madhe", region: "Shkodër" },
  { name: "Maliq", nameSq: "Maliq", region: "Korçë" },
  { name: "Mallakastër", nameSq: "Mallakastër", region: "Fier" },
  { name: "Mat", nameSq: "Mat", region: "Dibër" },
  { name: "Memaliaj", nameSq: "Memaliaj", region: "Gjirokastër" },
  { name: "Mirditë", nameSq: "Mirditë", region: "Lezhë" },
  { name: "Patos", nameSq: "Patos", region: "Fier" },
  { name: "Peqin", nameSq: "Peqin", region: "Elbasan" },
  { name: "Përmet", nameSq: "Përmet", region: "Gjirokastër" },
  { name: "Pogradec", nameSq: "Pogradec", region: "Korçë" },
  { name: "Poliçan", nameSq: "Poliçan", region: "Berat" },
  { name: "Prrenjas", nameSq: "Prrenjas", region: "Elbasan" },
  { name: "Pukë", nameSq: "Pukë", region: "Shkodër" },
  { name: "Pustec", nameSq: "Pustec", region: "Korçë" },
  { name: "Roskovec", nameSq: "Roskovec", region: "Fier" },
  { name: "Rrogozhinë", nameSq: "Rrogozhinë", region: "Tiranë" },
  { name: "Sarandë", nameSq: "Sarandë", region: "Vlorë" },
  { name: "Selenicë", nameSq: "Selenicë", region: "Vlorë" },
  { name: "Shijak", nameSq: "Shijak", region: "Durrës" },
  { name: "Shkodër", nameSq: "Shkodër", region: "Shkodër" },
  { name: "Skrapar", nameSq: "Skrapar", region: "Berat" },
  { name: "Tepelenë", nameSq: "Tepelenë", region: "Gjirokastër" },
  { name: "Tiranë", nameSq: "Tiranë", region: "Tiranë" },
  { name: "Tropojë", nameSq: "Tropojë", region: "Kukës" },
  { name: "Vau i Dejës", nameSq: "Vau i Dejës", region: "Shkodër" },
  { name: "Vlorë", nameSq: "Vlorë", region: "Vlorë" },
  { name: "Vorë", nameSq: "Vorë", region: "Tiranë" },
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate 61 municipalities with budget stats (initialBudget from simulation.ts). */
export function getMunicipalities(): Municipality[] {
  return getMunicipalityListWithInitialBudget().map((m) => ({
    id: m.id,
    name: m.name,
    nameSq: m.nameSq,
    region: m.region,
    population: randomBetween(5000, 600000),
    budgetTotal: m.initialBudget,
    budgetSpent: 0,
    contractsCount: 0,
  }));
}

const CATEGORIES: TransactionCategory[] = [
  "Arsim", "Infrastrukturë", "Shëndetësi", "Kultura", "Mjedisi",
  "Siguria", "Sport", "Administratë", "Rrugë", "Energji",
];

const STATUSES: TransactionStatus[] = ["Aprovuar", "Në pritje", "Refuzuar", "Anuluar"];

const DESCRIPTIONS = [
  "Blerje pajisjesh shkollore",
  "Mirëmbajtje rrugësh komunale",
  "Furnizim me energji elektrike ndërtesave publike",
  "Kontratë pastrimi hapësirash të përbashkëta",
  "Rinovim spitali rajonal",
  "Projekt kulturor - festival veror",
  "Pajisje sportive për shkolla",
  "Sistem videosurveillance",
  "Reforestacion zonë malore",
  "Stipendime studentë",
  "Ndërtim ura lokale",
  "Furnizim ujë pijshëm",
  "Trajnime për punonjës",
  "Blerje automjete shërbimi",
  "Restaurim monumentesh",
  "Menaxhim mbeturina",
  "Programe socialë për familje në nevojë",
  "Infrastrukturë interneti për shkolla",
  "Ndriçim publik",
  "Konsultime juridike",
];

/** Generate 50+ transactions */
export function getTransactions(): Transaction[] {
  const municipalities = getMunicipalities();
  const list: Transaction[] = [];
  const now = new Date();
  for (let i = 0; i < 55; i++) {
    const mun = randomChoice(municipalities);
    const date = new Date(now);
    date.setDate(date.getDate() - randomBetween(0, 365));
    list.push({
      id: `tx-${i + 1}`,
      institution: `Bashkia ${mun.name}`,
      municipalityId: mun.id,
      amount: randomBetween(100_000, 95_000_000),
      category: randomChoice(CATEGORIES),
      date: date.toISOString().split("T")[0],
      status: randomChoice(STATUSES),
      description: randomChoice(DESCRIPTIONS),
    });
  }
  return list.sort((a, b) => (b.date > a.date ? 1 : -1));
}

/** Generate 10 recent contracts */
export function getContracts(): Contract[] {
  const municipalities = getMunicipalities();
  const companies = [
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
  ];
  const titles = [
    "Ndërtim rrugë lokale",
    "Furnizim pajisjesh mjekësore",
    "Rinovim shkollash",
    "Sistem kanalizimi",
    "Ndriçim publik LED",
    "Videosurveillance qendër qytet",
    "Pastrimi i rrugëve",
    "Restaurim objekti kulturor",
    "Furnizim librash shkollore",
    "Trajnime për stafin",
  ];
  const list: Contract[] = [];
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const mun = municipalities[i % municipalities.length];
    const signed = new Date(now);
    signed.setDate(signed.getDate() - randomBetween(5, 120));
    list.push({
      id: `contract-${i + 1}`,
      title: titles[i],
      winner: companies[i],
      value: randomBetween(1_000_000, 80_000_000),
      municipalityId: mun.id,
      signedDate: signed.toISOString().split("T")[0],
      category: randomChoice(CATEGORIES),
    });
  }
  return list.sort((a, b) => (b.signedDate > a.signedDate ? 1 : -1));
}

// Pre-computed for consistent usage across app
let _municipalities: Municipality[] | null = null;
let _transactions: Transaction[] | null = null;
let _contracts: Contract[] | null = null;

export function municipalities(): Municipality[] {
  if (!_municipalities) _municipalities = getMunicipalities();
  return _municipalities;
}

export function transactions(): Transaction[] {
  if (!_transactions) _transactions = getTransactions();
  return _transactions;
}

export function contracts(): Contract[] {
  if (!_contracts) _contracts = getContracts();
  return _contracts;
}

/** Aggregate stats for StatCards */
export function getAggregateStats() {
  const muns = municipalities();
  const txs = transactions();
  const conts = contracts();
  const totalBudget = muns.reduce((s, m) => s + m.budgetTotal, 0);
  const totalSpent = muns.reduce((s, m) => s + m.budgetSpent, 0);
  const flaggedCount = Math.max(2, Math.floor(txs.length * 0.08));
  const base = totalSpent / 365;
  const spendingByDay = [0.9, 1.1, 0.85, 1.05, 0.95, 1.0, 0.88].map((k) =>
    Math.round(base * k)
  );
  return {
    totalBudget,
    totalSpent,
    activeContracts: conts.length,
    flaggedAnomalies: flaggedCount,
    spendingSparkline: spendingByDay,
    transactionsCount: txs.length,
  };
}

export type { Municipality as Mun, Transaction as Tx, Contract as ContractType };

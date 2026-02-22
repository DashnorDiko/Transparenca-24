/**
 * Municipality-granular simulation data: 61 Albanian municipalities with
 * size-based initial budgets. National totals are computed from this list
 * and from live simulation state (budgetRemaining).
 */

import type { Region } from "@/lib/mock-data";
import type { SimulationMunicipality } from "@/lib/simulation-types";

export interface MunicipalityBudgetEntry {
  id: string;
  name: string;
  nameSq: string;
  region: Region;
  initialBudget: number; // Lek
}

/** All 61 Albanian municipalities with fixed initialBudget by size (Tiranë ~100M, small ~5M). */
const MUNICIPALITY_BUDGETS: MunicipalityBudgetEntry[] = [
  { name: "Belsh", nameSq: "Belsh", region: "Elbasan", initialBudget: 8_000_000 },
  { name: "Berat", nameSq: "Berat", region: "Berat", initialBudget: 22_000_000 },
  { name: "Bulqizë", nameSq: "Bulqizë", region: "Dibër", initialBudget: 6_000_000 },
  { name: "Cërrik", nameSq: "Cërrik", region: "Elbasan", initialBudget: 10_000_000 },
  { name: "Delvinë", nameSq: "Delvinë", region: "Vlorë", initialBudget: 7_000_000 },
  { name: "Devoll", nameSq: "Devoll", region: "Korçë", initialBudget: 8_000_000 },
  { name: "Dibër", nameSq: "Dibër", region: "Dibër", initialBudget: 12_000_000 },
  { name: "Dimal", nameSq: "Dimal", region: "Berat", initialBudget: 6_000_000 },
  { name: "Divjakë", nameSq: "Divjakë", region: "Fier", initialBudget: 9_000_000 },
  { name: "Dropull", nameSq: "Dropull", region: "Gjirokastër", initialBudget: 5_000_000 },
  { name: "Durrës", nameSq: "Durrës", region: "Durrës", initialBudget: 55_000_000 },
  { name: "Elbasan", nameSq: "Elbasan", region: "Elbasan", initialBudget: 45_000_000 },
  { name: "Fier", nameSq: "Fier", region: "Fier", initialBudget: 38_000_000 },
  { name: "Finiq", nameSq: "Finiq", region: "Vlorë", initialBudget: 6_000_000 },
  { name: "Fushë-Arrëz", nameSq: "Fushë-Arrëz", region: "Shkodër", initialBudget: 7_000_000 },
  { name: "Gjirokastër", nameSq: "Gjirokastër", region: "Gjirokastër", initialBudget: 18_000_000 },
  { name: "Gramsh", nameSq: "Gramsh", region: "Elbasan", initialBudget: 8_000_000 },
  { name: "Has", nameSq: "Has", region: "Kukës", initialBudget: 6_000_000 },
  { name: "Himarë", nameSq: "Himarë", region: "Vlorë", initialBudget: 10_000_000 },
  { name: "Kamëz", nameSq: "Kamëz", region: "Tiranë", initialBudget: 28_000_000 },
  { name: "Kavajë", nameSq: "Kavajë", region: "Tiranë", initialBudget: 20_000_000 },
  { name: "Këlcyrë", nameSq: "Këlcyrë", region: "Gjirokastër", initialBudget: 6_000_000 },
  { name: "Klos", nameSq: "Klos", region: "Dibër", initialBudget: 7_000_000 },
  { name: "Kolonjë", nameSq: "Kolonjë", region: "Korçë", initialBudget: 8_000_000 },
  { name: "Konispol", nameSq: "Konispol", region: "Vlorë", initialBudget: 5_000_000 },
  { name: "Korçë", nameSq: "Korçë", region: "Korçë", initialBudget: 42_000_000 },
  { name: "Krujë", nameSq: "Krujë", region: "Durrës", initialBudget: 18_000_000 },
  { name: "Kuçovë", nameSq: "Kuçovë", region: "Berat", initialBudget: 10_000_000 },
  { name: "Kukës", nameSq: "Kukës", region: "Kukës", initialBudget: 15_000_000 },
  { name: "Kurbin", nameSq: "Kurbin", region: "Lezhë", initialBudget: 12_000_000 },
  { name: "Lezhë", nameSq: "Lezhë", region: "Lezhë", initialBudget: 16_000_000 },
  { name: "Libohovë", nameSq: "Libohovë", region: "Gjirokastër", initialBudget: 5_000_000 },
  { name: "Librazhd", nameSq: "Librazhd", region: "Elbasan", initialBudget: 14_000_000 },
  { name: "Lushnjë", nameSq: "Lushnjë", region: "Fier", initialBudget: 25_000_000 },
  { name: "Malësi e Madhe", nameSq: "Malësi e Madhe", region: "Shkodër", initialBudget: 12_000_000 },
  { name: "Maliq", nameSq: "Maliq", region: "Korçë", initialBudget: 14_000_000 },
  { name: "Mallakastër", nameSq: "Mallakastër", region: "Fier", initialBudget: 8_000_000 },
  { name: "Mat", nameSq: "Mat", region: "Dibër", initialBudget: 10_000_000 },
  { name: "Memaliaj", nameSq: "Memaliaj", region: "Gjirokastër", initialBudget: 7_000_000 },
  { name: "Mirditë", nameSq: "Mirditë", region: "Lezhë", initialBudget: 10_000_000 },
  { name: "Patos", nameSq: "Patos", region: "Fier", initialBudget: 18_000_000 },
  { name: "Peqin", nameSq: "Peqin", region: "Elbasan", initialBudget: 9_000_000 },
  { name: "Përmet", nameSq: "Përmet", region: "Gjirokastër", initialBudget: 8_000_000 },
  { name: "Pogradec", nameSq: "Pogradec", region: "Korçë", initialBudget: 16_000_000 },
  { name: "Poliçan", nameSq: "Poliçan", region: "Berat", initialBudget: 8_000_000 },
  { name: "Prrenjas", nameSq: "Prrenjas", region: "Elbasan", initialBudget: 10_000_000 },
  { name: "Pukë", nameSq: "Pukë", region: "Shkodër", initialBudget: 12_000_000 },
  { name: "Pustec", nameSq: "Pustec", region: "Korçë", initialBudget: 5_000_000 },
  { name: "Roskovec", nameSq: "Roskovec", region: "Fier", initialBudget: 10_000_000 },
  { name: "Rrogozhinë", nameSq: "Rrogozhinë", region: "Tiranë", initialBudget: 14_000_000 },
  { name: "Sarandë", nameSq: "Sarandë", region: "Vlorë", initialBudget: 22_000_000 },
  { name: "Selenicë", nameSq: "Selenicë", region: "Vlorë", initialBudget: 12_000_000 },
  { name: "Shijak", nameSq: "Shijak", region: "Durrës", initialBudget: 14_000_000 },
  { name: "Shkodër", nameSq: "Shkodër", region: "Shkodër", initialBudget: 48_000_000 },
  { name: "Skrapar", nameSq: "Skrapar", region: "Berat", initialBudget: 6_000_000 },
  { name: "Tepelenë", nameSq: "Tepelenë", region: "Gjirokastër", initialBudget: 10_000_000 },
  { name: "Tiranë", nameSq: "Tiranë", region: "Tiranë", initialBudget: 100_000_000 },
  { name: "Tropojë", nameSq: "Tropojë", region: "Kukës", initialBudget: 8_000_000 },
  { name: "Vau i Dejës", nameSq: "Vau i Dejës", region: "Shkodër", initialBudget: 10_000_000 },
  { name: "Vlorë", nameSq: "Vlorë", region: "Vlorë", initialBudget: 40_000_000 },
  { name: "Vorë", nameSq: "Vorë", region: "Tiranë", initialBudget: 18_000_000 },
].map((m, i) => ({ ...m, id: `mun-${i + 1}` }));

/** Get all 61 municipalities with their initial budget (for simulation init and map). */
export function getMunicipalityListWithInitialBudget(): MunicipalityBudgetEntry[] {
  return MUNICIPALITY_BUDGETS;
}

/** National total budget = sum of all 61 initial budgets. */
export function getNationalTotalBudget(): number {
  return MUNICIPALITY_BUDGETS.reduce((s, m) => s + m.initialBudget, 0);
}

/** National total spent = sum over all municipalities of (budgetTotal - budgetRemaining). */
export function getNationalTotalSpent(municipalities: SimulationMunicipality[]): number {
  return municipalities.reduce(
    (s, m) => s + (m.budgetTotal - m.budgetRemaining),
    0
  );
}

"use client";

import { useMemo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { formatLek } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { useSimulation } from "@/context/SimulationContext";
import { t } from "@/lib/i18n";
import type { SimulationMunicipality } from "@/lib/simulation-types";

const REGIONS = [
  "Shkodër", "Kukës", "Lezhë", "Dibër", "Durrës", "Tiranë",
  "Elbasan", "Fier", "Berat", "Korçë", "Vlorë", "Gjirokastër",
] as const;

type AlbaniaMapProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
};

/** Municipality filter: 61 municipalities grouped by region. Click to select, hover for remaining budget. */
export function AlbaniaMap({ selectedId, onSelect, className }: AlbaniaMapProps) {
  const { locale } = useLanguage();
  const { municipalities } = useSimulation();
  const strings = t[locale];
  const [hoverId, setHoverId] = useState<string | null>(null);

  const byId = useMemo(() => {
    const map = new Map<string, SimulationMunicipality>();
    municipalities.forEach((m) => map.set(m.id, m));
    return map;
  }, [municipalities]);

  const byRegion = useMemo(() => {
    const map = new Map<string, SimulationMunicipality[]>();
    for (const m of municipalities) {
      const list = map.get(m.region) ?? [];
      list.push(m);
      map.set(m.region, list);
    }
    for (const r of REGIONS) {
      const list = map.get(r) ?? [];
      list.sort((a, b) => a.nameSq.localeCompare(b.nameSq));
      map.set(r, list);
    }
    return map;
  }, [municipalities]);

  const handleClick = useCallback(
    (id: string) => {
      onSelect(selectedId === id ? null : id);
    },
    [selectedId, onSelect]
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-gov-navy-muted/50 bg-gov-navy-light/30 p-4",
        className
      )}
    >
      <p className="mb-3 text-sm text-muted-foreground">{strings.mapHint}</p>
      <div className="max-h-[420px] overflow-y-auto pr-1 space-y-4">
        {REGIONS.map((region) => {
          const list = byRegion.get(region) ?? [];
          if (list.length === 0) return null;
          return (
            <div key={region}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 sticky top-0 bg-gov-navy-light/95 py-0.5 z-[1]">
                {region}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {list.map((mun) => {
                  const isSelected = selectedId === mun.id;
                  const isHover = hoverId === mun.id;
                  const remaining = byId.get(mun.id)?.budgetRemaining ?? mun.budgetTotal;
                  return (
                    <button
                      key={mun.id}
                      type="button"
                      onClick={() => handleClick(mun.id)}
                      onMouseEnter={() => setHoverId(mun.id)}
                      onMouseLeave={() => setHoverId(null)}
                      title={`${mun.nameSq} · ${locale === "sq" ? "Buxheti i mbetur" : "Remaining"}: ${formatLek(remaining)}`}
                      className={cn(
                        "inline-flex flex-col items-start rounded-md border px-2.5 py-1.5 text-left transition-colors min-w-0 max-w-full",
                        "focus:outline-none focus:ring-2 focus:ring-gov-accent/50 focus:ring-offset-2 focus:ring-offset-gov-navy-light",
                        isSelected
                          ? "border-gov-accent bg-gov-accent/25 text-white"
                          : isHover
                            ? "border-gov-navy-muted bg-gov-navy/60 text-slate-200"
                            : "border-gov-navy-muted/50 bg-gov-navy/40 text-slate-300 hover:border-gov-navy-muted hover:bg-gov-navy/50"
                      )}
                    >
                      <span className="text-xs font-medium truncate max-w-[120px]" title={mun.nameSq}>
                        {mun.nameSq}
                      </span>
                      {(isHover || isSelected) && (
                        <span className="text-[10px] text-gov-accent mt-0.5 truncate max-w-[120px]">
                          {formatLek(remaining)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {selectedId && (
        <p className="mt-3 text-sm text-gov-accent">
          {strings.selected}:{" "}
          {municipalities.find((m) => m.id === selectedId)?.nameSq ?? selectedId}
        </p>
      )}
    </div>
  );
}

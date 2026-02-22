"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLek, formatDateAlbanian } from "@/lib/utils";
import { useSimulation } from "@/context/SimulationContext";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";
import type { Transaction } from "@/lib/mock-data";

type LiveFeedProps = {
  municipalityId: string | null;
  limit?: number;
};

function statusVariant(
  status: Transaction["status"]
): "default" | "secondary" | "warning" | "destructive" | "success" {
  switch (status) {
    case "Aprovuar":
      return "success";
    case "Në pritje":
      return "warning";
    case "Refuzuar":
    case "Anuluar":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: Transaction["status"], locale: "sq" | "en"): string {
  const key = status === "Aprovuar" ? "statusApproved" : status === "Në pritje" ? "statusPending" : status === "Refuzuar" ? "statusRejected" : "statusCancelled";
  return t[locale][key];
}

const LARGE_AMOUNT_THRESHOLD = 5_000_000;

export function LiveFeed({ municipalityId, limit = 12 }: LiveFeedProps) {
  const { locale } = useLanguage();
  const { getDisplayTransactionsForFeed, flaggedTransactionIds, getMunicipalityById } = useSimulation();
  const strings = t[locale];
  const items = useMemo(
    () => getDisplayTransactionsForFeed(limit, municipalityId),
    [municipalityId, limit, getDisplayTransactionsForFeed]
  );

  return (
    <Card className="border-gov-navy-muted/50 bg-gov-navy-light/30">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold text-foreground">{strings.recentTransactions}</h3>
        <p className="text-sm text-muted-foreground">
          {strings.recentTransactionsSubtitle}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {items.map((tx) => {
            const isFlagged = flaggedTransactionIds.has(tx.id);
            const isLarge = tx.amount >= LARGE_AMOUNT_THRESHOLD;
            const showAlert = isFlagged || isLarge;
            return (
              <li
                key={tx.id}
                className={`flex flex-col gap-1 rounded-lg border p-3 text-sm transition-colors ${
                  showAlert
                    ? isFlagged
                      ? "border-amber-500/50 bg-amber-950/20"
                      : "border-blue-500/30 bg-blue-950/10"
                    : "border-gov-navy-muted/30 bg-gov-navy/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block font-semibold text-gov-accent truncate">
                      {getMunicipalityById(tx.municipalityId)?.nameSq ?? tx.institution}
                    </span>
                    <span className="text-xs text-muted-foreground truncate block">
                      {tx.institution}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {showAlert && (
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          isFlagged ? "bg-amber-500/30 text-amber-300" : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {isFlagged ? (locale === "sq" ? "Shënuar" : "Flagged") : (locale === "sq" ? "E madhe" : "Large")}
                      </span>
                    )}
                    <Badge variant={statusVariant(tx.status)}>
                      {getStatusLabel(tx.status, locale)}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs line-clamp-1">
                  {tx.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gov-accent font-medium">
                    {formatLek(tx.amount)}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDateAlbanian(new Date(tx.date))}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{tx.category}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

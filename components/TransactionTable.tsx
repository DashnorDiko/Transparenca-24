"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatLek, formatDateAlbanian } from "@/lib/utils";
import type { Transaction } from "@/lib/mock-data";
import { Flag, ThumbsUp, FlagTriangleRight, Lock } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";
import type { ReportResolutionStatus } from "@/lib/reports-types";
import type { TransactionVoteData } from "@/lib/proposals-types";

type DisplayStatus = Transaction["status"] | ReportResolutionStatus;

function getStatusLabel(status: DisplayStatus, locale: Locale): string {
  if (status === "E_VERIFIKUAR") return "E Verifikuar";
  if (status === "NE_DEBAT") return "Në Debat";
  if (status === "IMPLEMENTUAR") return "Implementuar";
  if (status === "UNDER_AUDIT") return "Nën Auditim";
  if (status === "PENDING") return "Në Pritje";
  if (status === "Aprovuar") return t[locale].statusApproved;
  if (status === "Në pritje") return t[locale].statusPending;
  if (status === "Refuzuar") return t[locale].statusRejected;
  return t[locale].statusCancelled;
}

function getStatusClassName(status: DisplayStatus): string {
  switch (status) {
    case "E_VERIFIKUAR":
      return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    case "NE_DEBAT":
      return "bg-purple-500/20 text-purple-400 border-purple-500/40";
    case "IMPLEMENTUAR":
      return "bg-green-500/20 text-green-400 border-green-500/40";
    case "UNDER_AUDIT":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "PENDING":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "Aprovuar":
      return "bg-green-500/20 text-green-400 border-green-500/40";
    case "Në pritje":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "Refuzuar":
    case "Anuluar":
      return "bg-red-500/20 text-red-400 border-red-500/40";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/40";
  }
}

const GUEST_TOOLTIP = "Identifikohuni për të raportuar";

type TransactionTableProps = {
  transactions: Transaction[];
  onReportAnomaly: (tx: Transaction) => void;
  locale: Locale;
  getReportStatus?: (transactionId: string) => ReportResolutionStatus | undefined;
  getTransactionVotes?: (transactionId: string) => TransactionVoteData;
  onVoteVerification?: (transactionId: string) => void;
  onVoteAnomaly?: (transactionId: string) => void | { alertTriggered: boolean };
  /** When true, report and verification actions are disabled and show tooltip */
  isGuest?: boolean;
  /** Called when guest clicks a gated action (to show toast) */
  onGuestBlocked?: () => void;
};

export function TransactionTable({
  transactions,
  onReportAnomaly,
  locale,
  getReportStatus,
  getTransactionVotes,
  onVoteVerification,
  onVoteAnomaly,
  isGuest = false,
  onGuestBlocked,
}: TransactionTableProps) {
  const strings = t[locale];
  const getDisplayStatus = (tx: Transaction): DisplayStatus =>
    getReportStatus?.(tx.id) ?? tx.status;
  const showVerifikimi = Boolean(getTransactionVotes && onVoteVerification && onVoteAnomaly);
  const handleGuestClick = () => {
    if (isGuest && onGuestBlocked) onGuestBlocked();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gov-navy-muted hover:bg-transparent">
          <TableHead>{strings.institution}</TableHead>
          <TableHead>{strings.amount}</TableHead>
          <TableHead>{strings.category}</TableHead>
          <TableHead>{strings.date}</TableHead>
          <TableHead>{strings.status}</TableHead>
          {showVerifikimi && (
            <TableHead className="w-[120px]">
              <span className="inline-flex items-center gap-1">
                Verifikimi <Lock className="h-3 w-3 text-muted-foreground" />
              </span>
            </TableHead>
          )}
          <TableHead className="w-[120px]">
            <span className="inline-flex items-center gap-1">
              {strings.actions} <Lock className="h-3 w-3 text-muted-foreground" />
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => {
          const votes = showVerifikimi ? getTransactionVotes!(tx.id) : null;
          return (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">
                <div>
                  <p className="text-foreground">{tx.institution}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {tx.description}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-gov-accent font-medium">
                {formatLek(tx.amount)}
              </TableCell>
              <TableCell>{tx.category}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateAlbanian(new Date(tx.date))}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusClassName(getDisplayStatus(tx))}>
                  {getStatusLabel(getDisplayStatus(tx), locale)}
                </Badge>
              </TableCell>
              {showVerifikimi && votes && (
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-green-500 hover:bg-green-500/10 disabled:opacity-50"
                      title={isGuest ? GUEST_TOOLTIP : "E saktë"}
                      disabled={isGuest}
                      onClick={() => (isGuest ? handleGuestClick() : onVoteVerification!(tx.id))}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-amber-500 hover:bg-amber-500/10 disabled:opacity-50"
                      title={isGuest ? GUEST_TOOLTIP : "Anomali"}
                      disabled={isGuest}
                      onClick={() => (isGuest ? handleGuestClick() : onVoteAnomaly!(tx.id))}
                    >
                      <FlagTriangleRight className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-0.5">
                      {votes.verificationVotes} / {votes.anomalyReports}
                    </span>
                  </div>
                </TableCell>
              )}
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gov-warning hover:text-gov-warning hover:bg-gov-warning/10 disabled:opacity-50"
                  title={isGuest ? GUEST_TOOLTIP : undefined}
                  disabled={isGuest}
                  onClick={() => (isGuest ? handleGuestClick() : onReportAnomaly(tx))}
                >
                  <Flag className="h-3.5 w-3.5" />
                  {strings.reportAnomaly}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

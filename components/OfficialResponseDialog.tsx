"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReports } from "@/context/ReportsContext";
import type { CitizenReport, ReportResolutionStatus } from "@/lib/reports-types";
import { REPORT_STATUS_LABELS } from "@/lib/reports-types";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type OfficialResponseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: CitizenReport | null;
};

const STATUS_OPTIONS: ReportResolutionStatus[] = [
  "PENDING",
  "UNDER_AUDIT",
  "E_VERIFIKUAR",
  "NE_DEBAT",
  "IMPLEMENTUAR",
];

export function OfficialResponseDialog({
  open,
  onOpenChange,
  report,
}: OfficialResponseDialogProps) {
  const [status, setStatus] = useState<ReportResolutionStatus>("NE_DEBAT");
  const [officialResponse, setOfficialResponse] = useState("");
  const [notifyCitizen, setNotifyCitizen] = useState(true);
  const { updateReportResponse } = useReports();

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setStatus("NE_DEBAT");
      setOfficialResponse("");
      setNotifyCitizen(true);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (!report) return;
    updateReportResponse(report.id, status, officialResponse, notifyCitizen);
    toast.success("Përgjigja u dërgua dhe statusi u përditësua!");
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" showClose={true}>
        <DialogHeader>
          <DialogTitle>Dërgo Përgjigje Zyrtare</DialogTitle>
          <DialogDescription>
            {report && (
              <span>
                Raport nga {report.citizenName} – {report.transactionDescription?.slice(0, 50)}...
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Ndrysho statusin
            </label>
            <Select value={status} onValueChange={(v) => setStatus(v as ReportResolutionStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {REPORT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Përgjigja Zyrtare
            </label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-gov-navy-muted bg-gov-navy/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-accent"
              placeholder="Shkruani përgjigjen zyrtare për qytetarin..."
              value={officialResponse}
              onChange={(e) => setOfficialResponse(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify-citizen"
              checked={notifyCitizen}
              onChange={(e) => setNotifyCitizen(e.target.checked)}
              className="h-4 w-4 rounded border-gov-navy-muted accent-gov-accent"
            />
            <label htmlFor="notify-citizen" className="text-sm text-muted-foreground">
              Njofto Qytetarin
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Anulo
          </Button>
          <Button onClick={handleSubmit} className="gap-1">
            Dërgo Përgjigjen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

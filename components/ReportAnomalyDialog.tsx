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
import { Input } from "@/components/ui/input";
import { type Transaction } from "@/lib/mock-data";
import { formatLek } from "@/lib/utils";
import { Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

type Step = 1 | 2 | 3;

export type ReportSubmitPayload = {
  citizenName: string;
  citizenEmail?: string;
  description: string;
  evidenceNote?: string;
  transaction: Transaction;
};

type ReportAnomalyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onReportSubmit?: (payload: ReportSubmitPayload) => void;
};

export function ReportAnomalyDialog({
  open,
  onOpenChange,
  transaction,
  onReportSubmit,
}: ReportAnomalyDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [description, setDescription] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const { locale } = useLanguage();
  const strings = t[locale];

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setStep(1);
      setDescription("");
      setEvidenceNote("");
      setContactName("");
      setContactEmail("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (transaction && onReportSubmit) {
      onReportSubmit({
        citizenName: contactName || (locale === "sq" ? "Anonim" : "Anonymous"),
        citizenEmail: contactEmail || undefined,
        description,
        evidenceNote: evidenceNote || undefined,
        transaction,
      });
    }
    alert(strings.reportSuccess);
    handleClose(false);
  };

  const next = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
    else handleSubmit();
  };
  const prev = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showClose={true}>
        <DialogHeader>
          <DialogTitle>{strings.reportDialogTitle}</DialogTitle>
          <DialogDescription>
            {transaction && (
              <span>
                {strings.reportDialogDescription}: {transaction.institution} –{" "}
                {formatLek(transaction.amount)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">{strings.reportStep1}</p>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-gov-navy-muted bg-gov-navy/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-accent"
              placeholder={strings.reportPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">{strings.reportStep2}</p>
            <div className="rounded-lg border border-dashed border-gov-navy-muted bg-gov-navy/30 p-6 text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {strings.reportEvidenceHint}
              </p>
              <Input
                className="mt-2"
                placeholder="URL ose emër skedari"
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">{strings.reportStep3}</p>
            <div className="space-y-3">
              <Input
                placeholder={locale === "sq" ? "Emri juaj" : "Your name"}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {strings.reportContactOptional}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 ? (
            <Button variant="outline" onClick={prev} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {strings.reportBack}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleClose(false)}>
              {strings.reportCancel}
            </Button>
          )}
          <Button onClick={next} className="gap-1">
            {step === 3 ? strings.reportSubmit : strings.reportNext}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

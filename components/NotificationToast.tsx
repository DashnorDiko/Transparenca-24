"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectNotification as Notif } from "@/lib/simulation-types";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

const AUTO_DISMISS_MS = 3000;

type Props = {
  notifications: Notif[];
  onDismiss: (id: string) => void;
};

export function NotificationToast({ notifications, onDismiss }: Props) {
  const { locale } = useLanguage();
  const strings = t[locale];
  const scheduledRef = useRef<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    notifications.forEach((n) => {
      if (scheduledRef.current.has(n.id)) return;
      scheduledRef.current.add(n.id);
      const timeout = setTimeout(() => {
        onDismiss(n.id);
        timeoutsRef.current.delete(n.id);
        scheduledRef.current.delete(n.id);
      }, AUTO_DISMISS_MS);
      timeoutsRef.current.set(n.id, timeout);
    });
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
      scheduledRef.current.clear();
    };
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-auto">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-gov-navy-muted bg-gov-navy-light shadow-lg overflow-hidden flex flex-col"
          >
            <Link
              href={`/projects/${n.projectId}`}
              className="flex items-start gap-3 p-3 hover:bg-gov-navy-muted/50 transition-colors block flex-1"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gov-accent/20 text-gov-accent">
                <FolderPlus className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gov-accent truncate">
                  {n.municipalityName}
                </p>
                <p className="text-xs font-medium text-foreground truncate mt-0.5">
                  {locale === "sq" ? "Projekt i ri" : "New project"}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {n.projectTitle}
                </p>
                <p className="text-xs font-medium text-gov-accent mt-1">
                  {typeof n.budgetAmount === "number"
                    ? new Intl.NumberFormat("sq-AL", { maximumFractionDigits: 0 }).format(n.budgetAmount) + " Lek"
                    : ""}
                </p>
              </div>
            </Link>
            <div className="flex justify-end px-2 pb-2 pt-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() => onDismiss(n.id)}
                aria-label={strings.close}
              >
                <X className="h-3.5 w-3 mr-1" />
                {strings.close}
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

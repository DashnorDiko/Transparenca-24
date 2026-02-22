"use client";

import Link from "next/link";
import { useSimulation } from "@/components/SimulationProvider";
import { X, FilePlus } from "lucide-react";
import { cn, formatLek } from "@/lib/utils";

export function NotificationToaster() {
  const { notifications, markNotificationRead, dismissNotification } = useSimulation();

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed left-4 top-20 z-[100] flex max-h-[70vh] w-[340px] flex-col gap-2 overflow-y-auto rounded-lg border-2 border-slate-600 bg-slate-900 shadow-xl"
      aria-label="Project notifications"
    >
      <div className="sticky top-0 flex items-center justify-between border-b border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200">
        <span className="flex items-center gap-2">
          <FilePlus className="h-4 w-4" />
          New projects
        </span>
      </div>
      <ul className="flex flex-col gap-1 p-2">
        {notifications.slice(0, 20).map((n) => (
          <li key={n.id}>
            <div
              className={cn(
                "group flex items-start gap-2 rounded-md border border-slate-600 bg-slate-800/80 p-3 transition hover:bg-slate-700/80",
                !n.read && "border-l-4 border-l-blue-500"
              )}
            >
              <Link
                href={`/projects/${n.projectId}`}
                className="min-w-0 flex-1"
                onClick={() => markNotificationRead(n.id)}
              >
                <p className="font-medium text-white truncate">{n.projectTitle}</p>
                <p className="text-xs text-slate-400">{n.municipalityName}</p>
                <p className="text-xs text-blue-400 font-medium mt-0.5">{formatLek(n.budgetAmount)}</p>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  dismissNotification(n.id);
                }}
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-600 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

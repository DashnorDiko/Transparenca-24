"use client";

import { useSimulation } from "@/context/SimulationContext";
import { NotificationToast } from "@/components/NotificationToast";

/** Renders simulation UI: notification toasts (top-left). */
export function SimulationUI() {
  const { notifications, dismissNotification } = useSimulation();
  return (
    <NotificationToast
      notifications={notifications}
      onDismiss={dismissNotification}
    />
  );
}

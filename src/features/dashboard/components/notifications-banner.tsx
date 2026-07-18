import Link from "next/link";
import { AlertCircle, Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type DashboardNotification = {
  id: string;
  variant: "default" | "destructive";
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
};

/** Purely presentational — the rules that decide which notifications apply
 * live in the page (derived from data already fetched there, no extra queries). */
export function NotificationsBanner({ notifications }: { notifications: DashboardNotification[] }) {
  if (notifications.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((notification) => {
        const Icon = notification.variant === "destructive" ? AlertCircle : Info;
        return (
          <Alert key={notification.id} variant={notification.variant}>
            <Icon />
            <AlertTitle>{notification.title}</AlertTitle>
            <AlertDescription>
              {notification.message}
              {notification.actionHref && notification.actionLabel && (
                <>
                  {" "}
                  <Link href={notification.actionHref}>{notification.actionLabel}</Link>
                </>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}

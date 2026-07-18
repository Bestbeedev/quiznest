import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Building2,
  CreditCard,
  LayoutDashboard,
  ScrollText,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export const ADMIN_NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { label: "Organisations", href: "/admin/organizations", icon: Building2 },
  { label: "Utilisateurs", href: "/admin/users", icon: Users },
  { label: "Abonnements", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Paiements", href: "/admin/payments", icon: Wallet },
  { label: "Revenus", href: "/admin/revenue", icon: TrendingUp },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
  { label: "Activité", href: "/admin/activity", icon: Activity },
];

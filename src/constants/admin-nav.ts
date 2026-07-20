import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Banknote,
  Building2,
  CreditCard,
  IdCard,
  LayoutDashboard,
  PackagePlus,
  ScrollText,
  Settings,
  Tag,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Plateforme",
    items: [
      { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Organisations", href: "/admin/organizations", icon: Building2 },
      { label: "Utilisateurs", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Plans", href: "/admin/plans", icon: Tag },
      { label: "Abonnements", href: "/admin/subscriptions", icon: CreditCard },
      { label: "Paiements", href: "/admin/payments", icon: Banknote },
      { label: "Revenus", href: "/admin/revenue", icon: TrendingUp },
      { label: "Coupons", href: "/admin/coupons", icon: Ticket },
      { label: "Wallet", href: "/admin/wallet", icon: Wallet },
      { label: "Pay-as-you-go", href: "/admin/addons", icon: PackagePlus },
      { label: "Pass", href: "/admin/passes", icon: IdCard },
    ],
  },
  {
    label: "Système",
    items: [
      { label: "Logs", href: "/admin/logs", icon: ScrollText },
      { label: "Activité", href: "/admin/activity", icon: Activity },
      { label: "Paramètres", href: "/admin/settings", icon: Settings },
    ],
  },
];

/** Flat list kept for backward compatibility (e.g. mobile nav that doesn't need groups). */
export const ADMIN_NAV: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

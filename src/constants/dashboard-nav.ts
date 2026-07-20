import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  Puzzle,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

export const DASHBOARD_NAV: { label: string; href: string; icon: LucideIcon; exact?: boolean }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Quiz", href: "/dashboard/quiz", icon: ListChecks },
  { label: "Questions", href: "/dashboard/questions", icon: HelpCircle },
  { label: "Participants", href: "/dashboard/participants", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "IA", href: "/dashboard/ai", icon: Sparkles },
  { label: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Modules", href: "/dashboard/addons", icon: Puzzle },
  { label: "Abonnement", href: "/dashboard/billing", icon: CreditCard },
];

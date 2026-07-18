import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  Users,
} from "lucide-react";

export const DASHBOARD_NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Quiz", href: "/dashboard/quiz", icon: ListChecks },
  { label: "Questions", href: "/dashboard/questions", icon: HelpCircle },
  { label: "Participants", href: "/dashboard/participants", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "IA", href: "/dashboard/ai", icon: Sparkles },
  { label: "Abonnement", href: "/dashboard/billing", icon: CreditCard },
];

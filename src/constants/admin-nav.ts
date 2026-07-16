import type { LucideIcon } from "lucide-react";
import { Building2, LayoutDashboard, Users } from "lucide-react";

export const ADMIN_NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { label: "Organisations", href: "/admin/organizations", icon: Building2 },
  { label: "Utilisateurs", href: "/admin/users", icon: Users },
];

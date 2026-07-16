import { DASHBOARD_NAV } from "@/constants/dashboard-nav";
import { SidebarNav } from "@/components/shared/sidebar-nav";

export function DashboardNav({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return <SidebarNav items={DASHBOARD_NAV} onNavigate={onNavigate} collapsed={collapsed} />;
}

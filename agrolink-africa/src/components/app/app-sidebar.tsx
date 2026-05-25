import { Link, useRouterState } from "@tanstack/react-router";
import { Sprout, LogOut } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth, roleLabel } from "@/store/auth";
import { useNavigate } from "@tanstack/react-router";
import { getFilteredSidebarGroups } from "@/lib/sidebar-config";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const isActive = (url: string) => path === url || path.startsWith(url + "/");

  const sidebarGroups = user ? getFilteredSidebarGroups(user.role) : [];

  const renderGroup = (label: string, items: any[]) => (
    <SidebarGroup key={label}>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url ?? item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <Sprout className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">AgroLinkAfrica</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Zimbabwe Registry</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {sidebarGroups.map((group) => (
          // use group.label as stable key (labels are static in config)
          renderGroup(group.label, group.items)
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <div className="px-2 py-2 space-y-2">
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{user.fullName}</span>
                <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">{roleLabel(user.role)}</span>
              </div>
            )}
            <button
              onClick={() => { logout(); navigate({ to: "/login" }); }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

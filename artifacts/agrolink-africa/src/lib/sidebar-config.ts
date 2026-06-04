import type { UserRole } from "@/types";
import { canAccessModule } from "./roles";
import { LayoutDashboard, Users, Hop as Home, PackageCheck, Warehouse as WhIcon, Map as MapIcon, ChartBar as BarChart3, UserCog, Settings, Sprout, LogOut, Truck, Heart, User, Bell, FileText, Search } from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon: any;
  requiredModule?: string;
  requiredPermission?: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

/**
 * Role-based sidebar navigation configuration
 * Each role sees only the navigation items relevant to their permissions
 */
export const SIDEBAR_CONFIG: Record<UserRole, SidebarGroup[]> = {
  super_admin: [
    {
      label: "Operations",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
        { title: "Farmer Registry", url: "/farmers", icon: Users, requiredModule: "farmers" },
        { title: "Households", url: "/households", icon: Home, requiredModule: "households" },
        { title: "Distributions", url: "/distributions", icon: PackageCheck, requiredModule: "distributions" },
        { title: "Warehouses", url: "/warehouses", icon: WhIcon, requiredModule: "warehouses" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "GIS Overview", url: "/gis", icon: MapIcon, requiredModule: "gis" },
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "User Management", url: "/users", icon: UserCog, requiredModule: "users" },
        { title: "Settings", url: "/settings", icon: Settings, requiredModule: "settings" },
      ],
    },
  ],
  national_admin: [
    {
      label: "Operations",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
        { title: "Farmer Registry", url: "/farmers", icon: Users, requiredModule: "farmers" },
        { title: "Households", url: "/households", icon: Home, requiredModule: "households" },
        { title: "Distributions", url: "/distributions", icon: PackageCheck, requiredModule: "distributions" },
        { title: "Warehouses", url: "/warehouses", icon: WhIcon, requiredModule: "warehouses" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "GIS Overview", url: "/gis", icon: MapIcon, requiredModule: "gis" },
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "User Management", url: "/users", icon: UserCog, requiredModule: "users" },
        { title: "Settings", url: "/settings", icon: Settings, requiredModule: "settings" },
      ],
    },
  ],
  provincial_admin: [
    {
      label: "Operations",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
        { title: "Farmer Registry", url: "/farmers", icon: Users, requiredModule: "farmers" },
        { title: "Households", url: "/households", icon: Home, requiredModule: "households" },
        { title: "Distributions", url: "/distributions", icon: PackageCheck, requiredModule: "distributions" },
        { title: "Warehouses", url: "/warehouses", icon: WhIcon, requiredModule: "warehouses" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "GIS Overview", url: "/gis", icon: MapIcon, requiredModule: "gis" },
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "User Management", url: "/users", icon: UserCog, requiredModule: "users" },
        { title: "Settings", url: "/settings", icon: Settings, requiredModule: "settings" },
      ],
    },
  ],
  district_officer: [
    {
      label: "Operations",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
        { title: "Farmer Registry", url: "/farmers", icon: Users, requiredModule: "farmers" },
        { title: "Households", url: "/households", icon: Home, requiredModule: "households" },
        { title: "Distributions", url: "/distributions", icon: PackageCheck, requiredModule: "distributions" },
        { title: "Warehouses", url: "/warehouses", icon: WhIcon, requiredModule: "warehouses" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "GIS Overview", url: "/gis", icon: MapIcon, requiredModule: "gis" },
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
  ],
  ward_officer: [
    {
      label: "Operations",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
        { title: "Farmer Registry", url: "/farmers", icon: Users, requiredModule: "farmers" },
        { title: "Households", url: "/households", icon: Home, requiredModule: "households" },
        { title: "Distributions", url: "/distributions", icon: PackageCheck, requiredModule: "distributions" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
  ],
  extension_officer: [
    {
      label: "Operations",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
        { title: "Farmer Registry", url: "/farmers", icon: Users, requiredModule: "farmers" },
        { title: "Households", url: "/households", icon: Home, requiredModule: "households" },
        { title: "Distributions", url: "/distributions", icon: PackageCheck, requiredModule: "distributions" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "GIS Overview", url: "/gis", icon: MapIcon, requiredModule: "gis" },
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
  ],
  warehouse_manager: [
    {
      label: "Operations",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
        { title: "Warehouses", url: "/warehouses", icon: WhIcon, requiredModule: "warehouses" },
        { title: "Distributions", url: "/distributions", icon: PackageCheck, requiredModule: "distributions" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "Settings", url: "/settings", icon: Settings, requiredModule: "settings" },
      ],
    },
  ],
  ngo_partner: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "GIS Overview", url: "/gis", icon: MapIcon, requiredModule: "gis" },
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
  ],
  supplier: [
    {
      label: "Operations",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "Orders", url: "/distributions", icon: Truck, requiredModule: "distributions" },
        { title: "Inventory", url: "/warehouses", icon: WhIcon, requiredModule: "warehouses" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Reports & Analytics", url: "/reports", icon: BarChart3, requiredModule: "reports" },
      ],
    },
  ],
  farmer: [
    {
      label: "My Farm",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiredModule: "dashboard" },
        { title: "My Profile", url: "/farmers", icon: User, requiredModule: "farmers" },
        { title: "Beneficiary Lookup", url: "/lookup", icon: Search, requiredModule: "farmers" },
        { title: "Allocations", url: "/distributions", icon: PackageCheck, requiredModule: "distributions" },
        { title: "Notifications", url: "/settings", icon: Bell, requiredModule: "settings" },
      ],
    },
  ],
};

/**
 * Get sidebar configuration for a role
 */
export function getSidebarConfig(role: UserRole): SidebarGroup[] {
  return SIDEBAR_CONFIG[role] ?? [];
}

/**
 * Filter sidebar items based on user permissions
 */
export function filterSidebarItems(items: SidebarItem[], role: UserRole): SidebarItem[] {
  return items.filter((item) => {
    if (item.requiredModule && !canAccessModule(role, item.requiredModule)) {
      return false;
    }
    return true;
  });
}

/**
 * Get filtered sidebar groups for a role
 */
export function getFilteredSidebarGroups(role: UserRole): SidebarGroup[] {
  const config = getSidebarConfig(role);
  return config
    .map((group) => ({
      label: group.label,
      items: filterSidebarItems(group.items, role),
    }))
    .filter((group) => group.items.length > 0);
}

import { Users, Home, PackageCheck, MapPin, Sprout, AlertCircle, TrendingUp, FileText, Truck, Bell, User } from "lucide-react";
import { KpiCard } from "@/components/app/kpi-card";
import type { UserRole } from "@/types";

export interface DashboardWidgetConfig {
  type: "kpi" | "chart" | "table" | "alert";
  title: string;
  icon?: any;
  dataKey?: string;
  permission?: string;
}

/**
 * Role-based dashboard widget configurations
 * Each role sees different widgets based on their permissions and needs
 */
export const DASHBOARD_WIDGETS: Record<UserRole, DashboardWidgetConfig[]> = {
  super_admin: [
    { type: "kpi", title: "Total Farmers", icon: Users, dataKey: "farmers", permission: "farmers:view" },
    { type: "kpi", title: "Households", icon: Home, dataKey: "households", permission: "households:view" },
    { type: "kpi", title: "Input Allocations", icon: PackageCheck, dataKey: "allocations", permission: "distributions:view" },
    { type: "kpi", title: "Active Districts", icon: MapPin, dataKey: "activeDistricts", permission: "farmers:view" },
    { type: "kpi", title: "Villages Covered", icon: Sprout, dataKey: "villages", permission: "farmers:view" },
    { type: "kpi", title: "Pending Approvals", icon: AlertCircle, dataKey: "pendingApprovals", permission: "distributions:approve" },
  ],
  national_admin: [
    { type: "kpi", title: "Total Farmers", icon: Users, dataKey: "farmers", permission: "farmers:view" },
    { type: "kpi", title: "Households", icon: Home, dataKey: "households", permission: "households:view" },
    { type: "kpi", title: "Input Allocations", icon: PackageCheck, dataKey: "allocations", permission: "distributions:view" },
    { type: "kpi", title: "Active Districts", icon: MapPin, dataKey: "activeDistricts", permission: "farmers:view" },
    { type: "kpi", title: "Villages Covered", icon: Sprout, dataKey: "villages", permission: "farmers:view" },
    { type: "kpi", title: "Pending Approvals", icon: AlertCircle, dataKey: "pendingApprovals", permission: "distributions:approve" },
  ],
  provincial_admin: [
    { type: "kpi", title: "Total Farmers", icon: Users, dataKey: "farmers", permission: "farmers:view" },
    { type: "kpi", title: "Households", icon: Home, dataKey: "households", permission: "households:view" },
    { type: "kpi", title: "Input Allocations", icon: PackageCheck, dataKey: "allocations", permission: "distributions:view" },
    { type: "kpi", title: "Active Districts", icon: MapPin, dataKey: "activeDistricts", permission: "farmers:view" },
    { type: "kpi", title: "Pending Approvals", icon: AlertCircle, dataKey: "pendingApprovals", permission: "distributions:approve" },
  ],
  district_officer: [
    { type: "kpi", title: "Total Farmers", icon: Users, dataKey: "farmers", permission: "farmers:view" },
    { type: "kpi", title: "Households", icon: Home, dataKey: "households", permission: "households:view" },
    { type: "kpi", title: "Pending Allocations", icon: AlertCircle, dataKey: "pendingAllocations", permission: "distributions:create" },
    { type: "kpi", title: "Collected Allocations", icon: PackageCheck, dataKey: "collectedAllocations", permission: "distributions:verify" },
    { type: "kpi", title: "Villages Covered", icon: Sprout, dataKey: "villages", permission: "farmers:view" },
    { type: "kpi", title: "Low Stock Alerts", icon: AlertCircle, dataKey: "lowStock", permission: "warehouses:view" },
  ],
  ward_officer: [
    { type: "kpi", title: "Total Farmers", icon: Users, dataKey: "farmers", permission: "farmers:view" },
    { type: "kpi", title: "Households", icon: Home, dataKey: "households", permission: "households:view" },
    { type: "kpi", title: "Pending Allocations", icon: AlertCircle, dataKey: "pendingAllocations", permission: "distributions:create" },
    { type: "kpi", title: "Collected Allocations", icon: PackageCheck, dataKey: "collectedAllocations", permission: "distributions:verify" },
    { type: "kpi", title: "Pending Distributions", icon: AlertCircle, dataKey: "pending", permission: "distributions:view" },
  ],
  extension_officer: [
    { type: "kpi", title: "Total Farmers", icon: Users, dataKey: "farmers", permission: "farmers:view" },
    { type: "kpi", title: "Households", icon: Home, dataKey: "households", permission: "households:view" },
    { type: "kpi", title: "Inputs Distributed", icon: PackageCheck, dataKey: "distributed", permission: "distributions:view" },
  ],
  warehouse_manager: [
    { type: "kpi", title: "Warehouses Managed", icon: PackageCheck, dataKey: "warehouses", permission: "warehouses:view" },
    { type: "kpi", title: "Stock on Hand", icon: PackageCheck, dataKey: "stock", permission: "warehouses:view" },
    { type: "kpi", title: "Pending Collections", icon: AlertCircle, dataKey: "pendingCollections", permission: "distributions:verify" },
    { type: "kpi", title: "Collections Today", icon: PackageCheck, dataKey: "collectionsToday", permission: "distributions:verify" },
    { type: "kpi", title: "Low Stock Alerts", icon: AlertCircle, dataKey: "lowStock", permission: "warehouses:manage_stock" },
  ],
  ngo_partner: [
    { type: "kpi", title: "Program Coverage", icon: MapPin, dataKey: "coverage", permission: "ngo:analytics" },
    { type: "kpi", title: "Beneficiaries Reached", icon: Users, dataKey: "beneficiaries", permission: "ngo:analytics" },
    { type: "kpi", title: "Impact Score", icon: TrendingUp, dataKey: "impact", permission: "ngo:analytics" },
    { type: "kpi", title: "Reports Generated", icon: FileText, dataKey: "reports", permission: "ngo:reports" },
  ],
  supplier: [
    { type: "kpi", title: "Active Orders", icon: Truck, dataKey: "orders", permission: "supplier:orders" },
    { type: "kpi", title: "Inventory Level", icon: PackageCheck, dataKey: "inventory", permission: "supplier:inventory" },
    { type: "kpi", title: "Pending Deliveries", icon: Truck, dataKey: "deliveries", permission: "supplier:orders" },
    { type: "kpi", title: "Revenue", icon: TrendingUp, dataKey: "revenue", permission: "supplier:orders" },
  ],
  farmer: [
    { type: "kpi", title: "My Allocations", icon: PackageCheck, dataKey: "allocations", permission: "farmer:allocations" },
    { type: "kpi", title: "Farm Status", icon: Sprout, dataKey: "farmStatus", permission: "farmer:profile" },
    { type: "kpi", title: "Upcoming Distributions", icon: PackageCheck, dataKey: "upcoming", permission: "farmer:allocations" },
    { type: "kpi", title: "Notifications", icon: Bell, dataKey: "notifications", permission: "farmer:notifications" },
  ],
};

/**
 * Get dashboard widgets for a role
 */
export function getDashboardWidgets(role: UserRole): DashboardWidgetConfig[] {
  return DASHBOARD_WIDGETS[role] ?? [];
}

/**
 * Mock data for dashboard widgets based on role
 * In production, this would come from actual data sources
 */
export function getDashboardWidgetData(role: UserRole, dataKey: string): { value: string | number; delta?: number; hint?: string } {
  const mockData: Record<UserRole, Record<string, any>> = {
    super_admin: {
      farmers: { value: 320, delta: 4.2, hint: "vs last month" },
      households: { value: 120, delta: 2.8, hint: "registered" },
      allocations: { value: 187, delta: 11.5, hint: "this season" },
      activeDistricts: { value: 8, hint: "of 10 total" },
      villages: { value: 45, hint: "of 60 mapped" },
      pendingApprovals: { value: 33, delta: -6.1, hint: "needs action" },
    },
    national_admin: {
      farmers: { value: 320, delta: 4.2, hint: "vs last month" },
      households: { value: 120, delta: 2.8, hint: "registered" },
      allocations: { value: 187, delta: 11.5, hint: "this season" },
      activeDistricts: { value: 8, hint: "of 10 total" },
      villages: { value: 45, hint: "of 60 mapped" },
      pendingApprovals: { value: 33, delta: -6.1, hint: "needs action" },
    },
    provincial_admin: {
      farmers: { value: 85, delta: 5.1, hint: "in province" },
      households: { value: 32, delta: 3.2, hint: "registered" },
      allocations: { value: 48, delta: 12.3, hint: "this season" },
      activeDistricts: { value: 3, hint: "of 4 total" },
      pendingApprovals: { value: 8, delta: -4.5, hint: "needs action" },
    },
    district_officer: {
      farmers: { value: 42, delta: 6.8, hint: "in district" },
      households: { value: 18, delta: 4.1, hint: "registered" },
      pendingAllocations: { value: 12, delta: 8.5, hint: "awaiting approval" },
      collectedAllocations: { value: 24, delta: 15.2, hint: "this season" },
      villages: { value: 12, hint: "of 15 mapped" },
      lowStock: { value: 3, hint: "items" },
    },
    ward_officer: {
      farmers: { value: 18, delta: 8.5, hint: "in ward" },
      households: { value: 7, delta: 5.3, hint: "registered" },
      pendingAllocations: { value: 5, delta: 12.3, hint: "awaiting approval" },
      collectedAllocations: { value: 10, delta: 18.7, hint: "this season" },
      pending: { value: 2, delta: -2.1, hint: "needs action" },
    },
    extension_officer: {
      farmers: { value: 35, delta: 7.2, hint: "assigned" },
      households: { value: 14, delta: 4.8, hint: "registered" },
      distributed: { value: 22, delta: 14.5, hint: "this season" },
    },
    warehouse_manager: {
      warehouses: { value: 3, hint: "managed" },
      stock: { value: "124.5t", hint: "on hand" },
      pendingCollections: { value: 12, hint: "awaiting pickup" },
      collectionsToday: { value: 8, delta: 15.2, hint: "today" },
      lowStock: { value: 4, hint: "items" },
    },
    ngo_partner: {
      coverage: { value: "78%", delta: 5.2, hint: "target area" },
      beneficiaries: { value: 2450, delta: 12.8, hint: "reached" },
      impact: { value: "8.4", delta: 3.1, hint: "score" },
      reports: { value: 12, hint: "generated" },
    },
    supplier: {
      orders: { value: 18, delta: 15.3, hint: "active" },
      inventory: { value: "45.2t", hint: "available" },
      deliveries: { value: 6, hint: "scheduled" },
      revenue: { value: "$45.2k", delta: 8.7, hint: "this month" },
    },
    farmer: {
      allocations: { value: 3, hint: "received" },
      farmStatus: { value: "Active", hint: "2.5 ha" },
      upcoming: { value: 1, hint: "scheduled" },
      notifications: { value: 2, hint: "unread" },
    },
  };

  return mockData[role]?.[dataKey] ?? { value: "N/A" };
}

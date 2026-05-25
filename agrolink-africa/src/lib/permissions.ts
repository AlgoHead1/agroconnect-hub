import type { UserRole } from "@/types";

/**
 * Permission definitions for the AgroLinkAfrica system
 * Each permission represents a specific action or capability
 */
export type Permission =
  // Dashboard permissions
  | "dashboard:view"
  | "dashboard:analytics"
  // Farmer management
  | "farmers:view"
  | "farmers:create"
  | "farmers:edit"
  | "farmers:delete"
  // Household management
  | "households:view"
  | "households:create"
  | "households:edit"
  // Distribution management
  | "distributions:view"
  | "distributions:create"
  | "distributions:approve"
  | "distributions:verify"
  // Warehouse management
  | "warehouses:view"
  | "warehouses:create"
  | "warehouses:edit"
  | "warehouses:manage_stock"
  // GIS and mapping
  | "gis:view"
  | "gis:edit"
  // Reports and analytics
  | "reports:view"
  | "reports:export"
  | "reports:advanced"
  // User management
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "users:assign_roles"
  // System settings
  | "settings:view"
  | "settings:edit"
  | "settings:system"
  // NGO partner specific
  | "ngo:analytics"
  | "ngo:reports"
  // Supplier specific
  | "supplier:orders"
  | "supplier:inventory"
  // Farmer specific
  | "farmer:profile"
  | "farmer:allocations"
  | "farmer:notifications";

/**
 * Role-to-permission mapping
 * Defines which permissions each role has access to
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "dashboard:view",
    "dashboard:analytics",
    "farmers:view",
    "farmers:create",
    "farmers:edit",
    "farmers:delete",
    "households:view",
    "households:create",
    "households:edit",
    "distributions:view",
    "distributions:create",
    "distributions:approve",
    "distributions:verify",
    "warehouses:view",
    "warehouses:create",
    "warehouses:edit",
    "warehouses:manage_stock",
    "gis:view",
    "gis:edit",
    "reports:view",
    "reports:export",
    "reports:advanced",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "users:assign_roles",
    "settings:view",
    "settings:edit",
    "settings:system",
  ],
  national_admin: [
    "dashboard:view",
    "dashboard:analytics",
    "farmers:view",
    "farmers:create",
    "farmers:edit",
    "households:view",
    "households:create",
    "households:edit",
    "distributions:view",
    "distributions:create",
    "distributions:approve",
    "warehouses:view",
    "warehouses:create",
    "warehouses:edit",
    "gis:view",
    "reports:view",
    "reports:export",
    "reports:advanced",
    "users:view",
    "users:create",
    "users:edit",
    "settings:view",
    "settings:edit",
  ],
  provincial_admin: [
    "dashboard:view",
    "dashboard:analytics",
    "farmers:view",
    "farmers:create",
    "farmers:edit",
    "households:view",
    "households:create",
    "households:edit",
    "distributions:view",
    "distributions:create",
    "distributions:approve",
    "warehouses:view",
    "gis:view",
    "reports:view",
    "reports:export",
    "users:view",
    "settings:view",
  ],
  district_officer: [
    "dashboard:view",
    "farmers:view",
    "farmers:create",
    "farmers:edit",
    "households:view",
    "households:create",
    "distributions:view",
    "distributions:create",
    "warehouses:view",
    "gis:view",
    "reports:view",
    "settings:view",
  ],
  ward_officer: [
    "dashboard:view",
    "farmers:view",
    "farmers:create",
    "farmers:edit",
    "households:view",
    "households:create",
    "distributions:view",
    "distributions:create",
    "reports:view",
  ],
  extension_officer: [
    "dashboard:view",
    "farmers:view",
    "farmers:edit",
    "households:view",
    "distributions:view",
    "gis:view",
    "reports:view",
  ],
  warehouse_manager: [
    "dashboard:view",
    "warehouses:view",
    "warehouses:manage_stock",
    "distributions:view",
    "distributions:verify",
    "reports:view",
    "settings:view",
  ],
  ngo_partner: [
    "dashboard:view",
    "dashboard:analytics",
    "gis:view",
    "reports:view",
    "reports:export",
    "ngo:analytics",
    "ngo:reports",
  ],
  supplier: [
    "dashboard:view",
    "supplier:orders",
    "supplier:inventory",
    "warehouses:view",
    "reports:view",
  ],
  farmer: [
    "dashboard:view",
    "farmer:profile",
    "farmer:allocations",
    "farmer:notifications",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

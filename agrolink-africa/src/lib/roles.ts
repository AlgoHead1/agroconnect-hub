import type { UserRole } from "@/types";
import { ROLE_PERMISSIONS, getRolePermissions } from "./permissions";

/**
 * Role metadata and configuration
 */
export interface RoleConfig {
  label: string;
  description: string;
  level: number; // Higher = more privileges
  category: "admin" | "field" | "operational" | "partner" | "beneficiary";
  icon?: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  super_admin: {
    label: "Super Admin",
    description: "Full system access with all privileges",
    level: 100,
    category: "admin",
    icon: "shield",
  },
  national_admin: {
    label: "National Admin",
    description: "National-level oversight and management",
    level: 90,
    category: "admin",
    icon: "globe",
  },
  provincial_admin: {
    label: "Provincial Admin",
    description: "Provincial-level coordination and oversight",
    level: 80,
    category: "admin",
    icon: "map",
  },
  district_officer: {
    label: "District Officer",
    description: "District-level field operations management",
    level: 70,
    category: "field",
    icon: "building",
  },
  ward_officer: {
    label: "Ward Officer",
    description: "Ward-level field operations and data collection",
    level: 60,
    category: "field",
    icon: "home",
  },
  extension_officer: {
    label: "Extension Officer",
    description: "Agricultural extension and farmer support",
    level: 50,
    category: "field",
    icon: "sprout",
  },
  warehouse_manager: {
    label: "Warehouse Manager",
    description: "Warehouse operations and inventory management",
    level: 65,
    category: "operational",
    icon: "package",
  },
  ngo_partner: {
    label: "NGO Partner",
    description: "Partner organization with analytics and reporting access",
    level: 40,
    category: "partner",
    icon: "heart",
  },
  supplier: {
    label: "Supplier",
    description: "Input supplier with order and inventory access",
    level: 35,
    category: "partner",
    icon: "truck",
  },
  farmer: {
    label: "Farmer",
    description: "Registered farmer with profile and allocation access",
    level: 10,
    category: "beneficiary",
    icon: "user",
  },
};

/**
 * Get role configuration
 */
export function getRoleConfig(role: UserRole): RoleConfig {
  return ROLE_CONFIG[role];
}

/**
 * Get role label
 */
export function getRoleLabel(role: UserRole): string {
  return ROLE_CONFIG[role]?.label ?? role;
}

/**
 * Check if one role has higher privilege level than another
 */
export function hasHigherPrivilege(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_CONFIG[roleA].level > ROLE_CONFIG[roleB].level;
}

/**
 * Get all roles in a category
 */
export function getRolesByCategory(category: RoleConfig["category"]): UserRole[] {
  return (Object.entries(ROLE_CONFIG) as [UserRole, RoleConfig][])
    .filter(([, config]) => config.category === category)
    .map(([role]) => role);
}

/**
 * Get accessible modules for a role based on permissions
 */
export function getAccessibleModules(role: UserRole): string[] {
  const permissions = getRolePermissions(role);
  const modules = new Set<string>();

  permissions.forEach((permission) => {
    const module = permission.split(":")[0];
    modules.add(module);
  });

  return Array.from(modules);
}

/**
 * Check if role can access a specific route/module
 */
export function canAccessModule(role: UserRole, module: string): boolean {
  const accessibleModules = getAccessibleModules(role);
  return accessibleModules.includes(module);
}

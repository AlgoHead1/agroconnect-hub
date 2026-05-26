import type { UserRole } from "@/types";
import { hasPermission } from "./permissions";
import { canAccessModule } from "./roles";

/**
 * Route configuration with permission requirements
 */
export interface RouteConfig {
  path: string;
  module: string;
  requiredPermissions?: string[];
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Define protected routes and their access requirements
 */
export const PROTECTED_ROUTES: RouteConfig[] = [
  { path: "/dashboard", module: "dashboard", requiredPermissions: ["dashboard:view"] },
  { path: "/farmers", module: "farmers", requiredPermissions: ["farmers:view"] },
  { path: "/farmers/new", module: "farmers", requiredPermissions: ["farmers:create"] },
  { path: "/farmers/$farmerId", module: "farmers", requiredPermissions: ["farmers:view"] },
  { path: "/households", module: "households", requiredPermissions: ["households:view"] },
  { path: "/distributions", module: "distributions", requiredPermissions: ["distributions:view"] },
  { path: "/warehouses", module: "warehouses", requiredPermissions: ["warehouses:view"] },
  { path: "/gis", module: "gis", requiredPermissions: ["gis:view"] },
  { path: "/reports", module: "reports", requiredPermissions: ["reports:view"] },
  { path: "/users", module: "users", requiredPermissions: ["users:view"] },
  { path: "/settings", module: "settings", requiredPermissions: ["settings:view"] },
];

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(
  role: UserRole,
  path: string,
): { allowed: boolean; redirectTo?: string } {
  // Sort by descending specificity (longer paths first) so /farmers/new is
  // matched before /farmers when both would match via startsWith.
  const route = [...PROTECTED_ROUTES]
    .sort((a, b) => b.path.length - a.path.length)
    .find((r) => path === r.path || path.startsWith(r.path + "/") || path.startsWith(r.path));
  
  if (!route) {
    // Route not in protected list, allow by default
    return { allowed: true };
  }

  // Check role-based access
  if (route.allowedRoles && !route.allowedRoles.includes(role)) {
    return { allowed: false, redirectTo: "/dashboard" };
  }

  // Check permission-based access
  if (route.requiredPermissions) {
    const hasAllPerms = route.requiredPermissions.every((perm) =>
      hasPermission(role, perm as any),
    );
    if (!hasAllPerms) {
      return { allowed: false, redirectTo: "/dashboard" };
    }
  }

  return { allowed: true };
}

/**
 * Get accessible routes for a role
 */
export function getAccessibleRoutes(role: UserRole): string[] {
  return PROTECTED_ROUTES.filter((route) => {
    if (route.allowedRoles && !route.allowedRoles.includes(role)) {
      return false;
    }
    if (route.requiredPermissions) {
      return route.requiredPermissions.every((perm) =>
        hasPermission(role, perm as any),
      );
    }
    return true;
  }).map((route) => route.path);
}

/**
 * Get default redirect route for a role
 */
export function getDefaultRouteForRole(role: UserRole): string {
  const accessibleRoutes = getAccessibleRoutes(role);
  return accessibleRoutes[0] ?? "/dashboard";
}

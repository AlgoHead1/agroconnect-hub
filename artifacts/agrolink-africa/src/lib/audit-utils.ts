import type { AllocationAuditEntry } from "@/types";
import { useAuth } from "@/store/auth";
import { DEMO_USER_LIST } from "@/store/auth";
import { ROLE_CONFIG } from "./roles";

/**
 * Resolve user information for an audit entry
 */
export function resolveAuditEntry(entry: AllocationAuditEntry): AllocationAuditEntry {
  const user = DEMO_USER_LIST.find((u) => u.id === entry.userId);
  
  return {
    ...entry,
    userName: entry.userName || user?.fullName || entry.userId,
    userRole: entry.userRole || (user?.role ? ROLE_CONFIG[user.role]?.label : undefined),
  };
}

/**
 * Format audit entry for display
 */
export function formatAuditEntry(entry: AllocationAuditEntry): string {
  const resolved = resolveAuditEntry(entry);
  const date = new Date(entry.timestamp);
  const time = date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = date.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric" 
  });
  
  return `${resolved.userName} (${resolved.userRole}) · ${dateStr} at ${time}`;
}

/**
 * Get stage label for display
 */
export function getStageLabelUppercase(stage: string): string {
  const labels: Record<string, string> = {
    "created": "Created",
    "approved": "Approved",
    "distributed": "Distributed",
    "collected": "Collected",
    "cancelled": "Cancelled",
  };
  return labels[stage] || stage;
}

/**
 * Get stage color for badge display
 */
export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    "created": "bg-blue-100 text-blue-800",
    "approved": "bg-green-100 text-green-800",
    "distributed": "bg-purple-100 text-purple-800",
    "collected": "bg-emerald-100 text-emerald-800",
    "cancelled": "bg-red-100 text-red-800",
  };
  return colors[stage] || "bg-gray-100 text-gray-800";
}

/**
 * Get stage icon name
 */
export function getStageIcon(stage: string): string {
  const icons: Record<string, string> = {
    "created": "CheckCircle2",
    "approved": "ShieldCheck",
    "distributed": "Truck",
    "collected": "PackageCheck",
    "cancelled": "AlertTriangle",
  };
  return icons[stage] || "CircleDot";
}

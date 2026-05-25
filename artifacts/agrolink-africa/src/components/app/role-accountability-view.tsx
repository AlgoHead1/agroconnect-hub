import React from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Allocation, UserRole } from "@/types";
import { DEMO_USER_LIST } from "@/store/auth";
import { ROLE_CONFIG } from "@/lib/roles";

interface RoleAccountabilityViewProps {
  allocations: Allocation[];
  userRole: UserRole;
}

export function RoleAccountabilityView({ allocations, userRole }: RoleAccountabilityViewProps) {
  const getRelevantAllocations = (): Allocation[] => {
    switch (userRole) {
      case "district_officer":
        // Show allocations created by district officers (approvals)
        return allocations.filter((a) => {
          const approver = DEMO_USER_LIST.find((u) => u.id === a.approvedBy);
          return approver?.role === "district_officer" || a.allocationStatus === "pending";
        });
      
      case "warehouse_manager":
        // Show distributions and stock movements
        return allocations.filter((a) => 
          a.allocationStatus === "approved" || a.allocationStatus === "distributed" || a.allocationStatus === "collected"
        );
      
      case "ngo_partner":
        // Show vulnerability analytics and beneficiary data
        return allocations.filter((a) => 
          a.allocationStatus !== "cancelled"
        );
      
      case "extension_officer":
        // Show farmer allocations and compliance
        return allocations.filter((a) =>
          a.allocationStatus === "distributed" || a.allocationStatus === "collected"
        );
      
      default:
        return allocations;
    }
  };

  const getMetrics = () => {
    const relevant = getRelevantAllocations();
    const metrics: Record<string, number | string> = {};

    switch (userRole) {
      case "district_officer":
        metrics["Pending Approvals"] = relevant.filter((a) => a.allocationStatus === "pending").length;
        metrics["Approved This Week"] = relevant.filter((a) => {
          const approved = a.approvedAt ? new Date(a.approvedAt) : null;
          if (!approved) return false;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return approved >= weekAgo;
        }).length;
        metrics["Total Managed"] = relevant.length;
        break;

      case "warehouse_manager":
        metrics["Ready to Distribute"] = relevant.filter((a) => a.allocationStatus === "approved").length;
        metrics["In Transit"] = relevant.filter((a) => a.allocationStatus === "distributed").length;
        metrics["Collected"] = relevant.filter((a) => a.allocationStatus === "collected").length;
        break;

      case "ngo_partner":
        metrics["Vulnerable Beneficiaries"] = relevant.length; // Placeholder
        metrics["Allocations Tracked"] = relevant.length;
        metrics["Transparency Score"] = "98%"; // Placeholder
        break;

      case "extension_officer":
        metrics["Distributed to Farmers"] = relevant.filter((a) => a.allocationStatus === "distributed").length;
        metrics["Collection Confirmed"] = relevant.filter((a) => a.allocationStatus === "collected").length;
        break;
    }

    return metrics;
  };

  const metrics = getMetrics();
  const roleLabel = ROLE_CONFIG[userRole]?.label || userRole;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{roleLabel} Accountability</h3>
        <Badge variant="outline" className="text-xs">{userRole.replace(/_/g, " ")}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="p-2 bg-muted/50 rounded text-center">
            <div className="text-xs text-muted-foreground">{key}</div>
            <div className="text-sm font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      {getRelevantAllocations().length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          <p className="font-medium mb-1">Recent Activity</p>
          {getRelevantAllocations().slice(0, 2).map((a) => (
            <div key={a.id} className="flex justify-between text-[10px] py-0.5">
              <span className="truncate">{a.allocationCode}</span>
              <span className="text-muted-foreground">{format(new Date(a.createdAt), "MMM d")}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

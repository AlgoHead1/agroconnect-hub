import React from "react";
import { format } from "date-fns";
import { CheckCircle2, ShieldCheck, Truck, PackageCheck, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AllocationAuditEntry } from "@/types";
import { resolveAuditEntry, getStageLabelUppercase, getStageColor } from "@/lib/audit-utils";
import { DEMO_USER_LIST } from "@/store/auth";
import { ROLE_CONFIG } from "@/lib/roles";

interface AuditTimelineProps {
  entries?: AllocationAuditEntry[];
  compact?: boolean;
}

const stageIcons: Record<string, React.ReactNode> = {
  "created": <CheckCircle2 className="h-5 w-5" />,
  "approved": <ShieldCheck className="h-5 w-5" />,
  "distributed": <Truck className="h-5 w-5" />,
  "collected": <PackageCheck className="h-5 w-5" />,
  "cancelled": <AlertTriangle className="h-5 w-5" />,
};

const stageColors: Record<string, string> = {
  "created": "text-blue-600",
  "approved": "text-green-600",
  "distributed": "text-purple-600",
  "collected": "text-emerald-600",
  "cancelled": "text-red-600",
};

export function AuditTimeline({ entries = [], compact = false }: AuditTimelineProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No audit history available
      </div>
    );
  }

  // Reverse to show newest first
  const sorted = [...entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (compact) {
    return (
      <div className="space-y-2">
        {sorted.map((entry, idx) => {
          const user = DEMO_USER_LIST.find((u) => u.id === entry.userId);
          const userName = user?.fullName || entry.userId;
          const userRole = user?.role ? ROLE_CONFIG[user.role]?.label : "";
          const stageName = getStageLabelUppercase(entry.stage);
          
          return (
            <div key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
              <div className={`flex-shrink-0 ${stageColors[entry.stage] || "text-gray-600"}`}>
                {stageIcons[entry.stage] || <CheckCircle2 className="h-4 w-4" />}
              </div>
              <span>
                <strong>{stageName}</strong> by {userName} ({userRole}) — {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map((entry, idx) => {
        const user = DEMO_USER_LIST.find((u) => u.id === entry.userId);
        const userName = user?.fullName || entry.userId;
        const userRole = user?.role ? ROLE_CONFIG[user.role]?.label : "";
        const stageName = getStageLabelUppercase(entry.stage);
        const timestamp = new Date(entry.timestamp);
        
        return (
          <div key={idx} className="flex gap-4">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div className={`flex-shrink-0 ${stageColors[entry.stage] || "text-gray-600"}`}>
                {stageIcons[entry.stage] || <CheckCircle2 className="h-6 w-6" />}
              </div>
              {idx < sorted.length - 1 && (
                <div className="w-0.5 h-12 bg-gray-200 my-2" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="bg-gray-100">
                  {stageName}
                </Badge>
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">
                  {userRole && `(${userRole})`}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(timestamp, "MMMM d, yyyy · h:mm a")}
              </div>
              {entry.notes && (
                <div className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                  {entry.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

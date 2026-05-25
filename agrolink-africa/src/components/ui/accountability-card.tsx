import React from "react";
import { format } from "date-fns";
import { User, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Allocation } from "@/types";
import { DEMO_USER_LIST } from "@/store/auth";
import { ROLE_CONFIG } from "@/lib/roles";

interface AccountabilityCardProps {
  allocation: Allocation;
  compact?: boolean;
}

export function AccountabilityCard({ allocation, compact = false }: AccountabilityCardProps) {
  const getOfficerInfo = (userId?: string) => {
    if (!userId) return null;
    const user = DEMO_USER_LIST.find((u) => u.id === userId);
    return {
      name: user?.fullName || userId,
      role: user?.role ? ROLE_CONFIG[user.role]?.label : undefined,
      email: user?.email,
    };
  };

  const stages = [
    {
      label: "Created",
      userId: allocation.createdBy,
      timestamp: allocation.createdAt,
      icon: "CheckCircle2",
      color: "text-blue-600",
    },
    {
      label: "Approved",
      userId: allocation.approvedBy,
      timestamp: allocation.approvedAt,
      icon: "ShieldCheck",
      color: "text-green-600",
      optional: true,
    },
    {
      label: "Distributed",
      userId: allocation.distributedBy,
      timestamp: allocation.distributedAt,
      icon: "Truck",
      color: "text-purple-600",
      optional: true,
    },
    {
      label: "Collected",
      userId: allocation.collectedBy,
      timestamp: allocation.collectedAt,
      icon: "PackageCheck",
      color: "text-emerald-600",
      optional: true,
    },
  ];

  if (compact) {
    return (
      <div className="space-y-2 text-sm">
        {stages.map((stage) => {
          const officer = getOfficerInfo(stage.userId);
          if (!officer && stage.optional) return null;

          return (
            <div key={stage.label} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
              <div className={`flex-shrink-0 mt-0.5 ${stage.color}`}>
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs">{stage.label}</div>
                {officer ? (
                  <div className="text-xs text-gray-600">
                    {officer.name} {officer.role && `(${officer.role})`}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic">Pending</div>
                )}
                {stage.timestamp && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(stage.timestamp), "MMM d, yyyy h:mm a")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Allocation Accountability Trail</h3>
        </div>

        {stages.map((stage) => {
          const officer = getOfficerInfo(stage.userId);
          if (!officer && stage.optional) return null;

          return (
            <div key={stage.label} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
              <div className={`flex-shrink-0 mt-1 ${stage.color}`}>
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{stage.label}</Badge>
                  {!officer && stage.optional && (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </div>
                {officer && (
                  <>
                    <div className="font-medium text-sm">{officer.name}</div>
                    {officer.role && (
                      <div className="text-sm text-gray-600">{officer.role}</div>
                    )}
                    {officer.email && (
                      <div className="text-xs text-gray-500">{officer.email}</div>
                    )}
                  </>
                )}
                {stage.timestamp && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(stage.timestamp), "MMMM d, yyyy · h:mm a")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

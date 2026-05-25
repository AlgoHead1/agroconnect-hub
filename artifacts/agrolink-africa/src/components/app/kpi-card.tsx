import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number; // percent
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "earth" | "warning" | "success";
}

const toneClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  earth: "bg-earth/10 text-earth",
  warning: "bg-warning/10 text-warning-foreground",
  success: "bg-success/10 text-success",
};

export function KpiCard({ label, value, delta, hint, icon: Icon, tone = "primary" }: KpiCardProps) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-md ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
      <div className="flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={`inline-flex items-center gap-0.5 font-medium ${positive ? "text-success" : "text-destructive"}`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}

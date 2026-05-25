import { Construction } from "lucide-react";
import { PageHeader } from "./page-header";
import { Card } from "@/components/ui/card";

interface ModulePlaceholderProps {
  title: string;
  breadcrumb: string;
  description: string;
  plannedFeatures: string[];
}

export function ModulePlaceholder({ title, breadcrumb, description, plannedFeatures }: ModulePlaceholderProps) {
  return (
    <div className="flex flex-col">
      <PageHeader title={title} breadcrumb={breadcrumb} description={description} />
      <div className="p-6">
        <Card className="p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-warning/10 text-warning-foreground shrink-0">
              <Construction className="h-5 w-5" />
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Module scaffolded — Data & routing available</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This module provides the data model and routes required for integration. For the demo, use the Dashboard and Reports pages for operational views. Interactive module UI will be enabled post-demo if needed.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Planned in Phase 2</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {plannedFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

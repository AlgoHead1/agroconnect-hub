import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { MapPin, Users, Home, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { useFarmers } from "@/store/farmers";
import { useDistributions } from "@/store/distributions";
import { provinces, districts, wards } from "@/lib/zimbabwe-geo";
import { households } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/gis")({
  component: GisPage,
});

function GisPage() {
  const farmers = useFarmers((s) => s.farmers);
  const allocations = useDistributions((s) => s.allocations);

  const provinceStats = useMemo(() => {
    return provinces.map((p) => {
      const provinceFarmers = farmers.filter((f) => f.provinceId === p.id);
      const provinceDistricts = districts.filter((d) => d.provinceId === p.id);
      const provinceWards = wards.filter((w) =>
        provinceDistricts.some((d) => d.id === w.districtId)
      );
      const provinceHouseholds = households.filter((h) =>
        provinceFarmers.some((f) => f.villageId === h.villageId)
      );
      const provinceAllocations = allocations.filter((a) =>
        provinceFarmers.some((f) => f.id === a.farmerId)
      );
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        farmers: provinceFarmers.length,
        districts: provinceDistricts.length,
        wards: provinceWards.length,
        households: provinceHouseholds.length,
        allocations: provinceAllocations.length,
        vulnerable: provinceFarmers.filter((f) => f.vulnerabilityTags && f.vulnerabilityTags.length > 0).length,
      };
    }).sort((a, b) => b.farmers - a.farmers);
  }, [farmers, allocations]);

  const totals = useMemo(() => ({
    farmers: farmers.length,
    districts: new Set(farmers.map((f) => f.districtId)).size,
    wards: new Set(farmers.map((f) => f.wardId)).size,
    allocations: allocations.length,
    provinces: provinceStats.filter((p) => p.farmers > 0).length,
    vulnerable: farmers.filter((f) => f.vulnerabilityTags && f.vulnerabilityTags.length > 0).length,
  }), [farmers, allocations, provinceStats]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Geographic Coverage Overview"
        breadcrumb="Insights"
        description="Province, district, and ward coverage summaries for registered farmers and input allocations."
      />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<MapPin className="h-4 w-4" />}
            label="Active Provinces"
            value={totals.provinces}
            hint="of 10 total"
            tone="primary"
          />
          <SummaryCard
            icon={<Users className="h-4 w-4" />}
            label="Registered Farmers"
            value={totals.farmers.toLocaleString()}
            hint={`${totals.vulnerable} with vulnerability flags`}
            tone="earth"
          />
          <SummaryCard
            icon={<Home className="h-4 w-4" />}
            label="Districts Covered"
            value={totals.districts}
            hint={`across ${totals.wards} wards`}
            tone="success"
          />
          <SummaryCard
            icon={<PackageCheck className="h-4 w-4" />}
            label="Total Allocations"
            value={totals.allocations.toLocaleString()}
            hint="input distributions issued"
            tone="primary"
          />
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Coverage by Province</h3>
            <p className="text-xs text-muted-foreground">
              Farmer registration, household coverage, and allocation totals per province
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Province</th>
                  <th className="px-5 py-3 font-medium text-right">Farmers</th>
                  <th className="px-5 py-3 font-medium text-right">Districts</th>
                  <th className="px-5 py-3 font-medium text-right">Wards</th>
                  <th className="px-5 py-3 font-medium text-right">Households</th>
                  <th className="px-5 py-3 font-medium text-right">Allocations</th>
                  <th className="px-5 py-3 font-medium text-right">Vulnerable</th>
                  <th className="px-5 py-3 font-medium">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {provinceStats.map((p) => {
                  const maxFarmers = provinceStats[0]?.farmers || 1;
                  const pct = Math.round((p.farmers / maxFarmers) * 100);
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-5 py-3 font-medium text-foreground">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{p.code}</span>
                        {p.name}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-medium">
                        {p.farmers > 0 ? p.farmers : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{p.districts}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{p.wards}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{p.households}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{p.allocations}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{p.vulnerable}</td>
                      <td className="px-5 py-3 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-1">Ward Coverage</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {totals.wards} of {wards.length} wards have registered farmers
            </p>
            <div className="space-y-3">
              {provinceStats.filter((p) => p.farmers > 0).slice(0, 6).map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className="text-muted-foreground tabular-nums">{p.wards} wards · {p.farmers} farmers</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.round((p.farmers / totals.farmers) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-1">Vulnerability Summary</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {totals.vulnerable} of {totals.farmers} registered farmers carry at least one vulnerability flag
            </p>
            <div className="space-y-3">
              {provinceStats.filter((p) => p.vulnerable > 0).slice(0, 6).map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground">{p.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {p.vulnerable} ({p.farmers > 0 ? Math.round((p.vulnerable / p.farmers) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-destructive/70 rounded-full"
                      style={{ width: `${p.farmers > 0 ? Math.round((p.vulnerable / p.farmers) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  tone: "primary" | "earth" | "success";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    earth: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  }[tone];

  return (
    <Card className="p-4 flex items-start gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </Card>
  );
}

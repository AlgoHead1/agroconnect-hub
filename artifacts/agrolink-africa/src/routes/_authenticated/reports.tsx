import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFarmers } from "@/store/farmers";
import { provinces, districts, getProvince } from "@/lib/zimbabwe-geo";
import { distributions } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const farmers = useFarmers((s) => s.farmers);

  const provinceRows = useMemo(() => provinces.map((p) => {
    const fs = farmers.filter((f) => f.provinceId === p.id);
    const dists = distributions.filter((d) => fs.some((f) => f.id === d.farmerId));
    return {
      id: p.id,
      name: p.name,
      farmers: fs.length,
      male: fs.filter((f) => f.gender === "M").length,
      female: fs.filter((f) => f.gender === "F").length,
      ha: fs.reduce((s, f) => s + f.farmSizeHa, 0),
      dists: dists.length,
    };
  }).sort((a, b) => b.farmers - a.farmers), [farmers]);

  const districtRows = useMemo(() => districts.map((d) => {
    const fs = farmers.filter((f) => f.districtId === d.id);
    return {
      id: d.id,
      name: d.name,
      province: getProvince(d.provinceId)?.name ?? "",
      farmers: fs.length,
      ha: fs.reduce((s, f) => s + f.farmSizeHa, 0),
    };
  }).sort((a, b) => b.farmers - a.farmers).slice(0, 15), [farmers]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Reports & Analytics"
        breadcrumb="Insights"
        description="Province- and district-level performance summaries, ready for export."
        actions={<Button variant="outline"><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>}
      />
      <div className="p-6 space-y-6">
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Province Performance</h3>
            <p className="text-xs text-muted-foreground">All 10 provinces · Session data</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Province</th>
                  <th className="px-5 py-3 font-medium text-right">Farmers</th>
                  <th className="px-5 py-3 font-medium text-right">Male</th>
                  <th className="px-5 py-3 font-medium text-right">Female</th>
                  <th className="px-5 py-3 font-medium text-right">Total Hectares</th>
                  <th className="px-5 py-3 font-medium text-right">Distributions</th>
                </tr>
              </thead>
              <tbody>
                {provinceRows.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.farmers.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{r.male}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{r.female}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.ha.toFixed(1)} ha</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.dists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Top Districts by Farmer Count</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">District</th>
                  <th className="px-5 py-3 font-medium">Province</th>
                  <th className="px-5 py-3 font-medium text-right">Farmers</th>
                  <th className="px-5 py-3 font-medium text-right">Total Hectares</th>
                </tr>
              </thead>
              <tbody>
                {districtRows.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.province}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.farmers}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{r.ha.toFixed(1)} ha</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

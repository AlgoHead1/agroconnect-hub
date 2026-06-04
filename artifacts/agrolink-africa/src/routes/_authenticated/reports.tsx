import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download, Leaf, TreePine, Flame, ShieldCheck, TriangleAlert as AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarmers } from "@/store/farmers";
import { useSustainability } from "@/store/sustainability";
import { provinces, districts, getProvince } from "@/lib/zimbabwe-geo";
import { distributions } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const farmers = useFarmers((s) => s.farmers);
  const sustainability = useSustainability();

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

  // Sustainability metrics
  const sustainabilityData = useMemo(() => {
    const { productionProfiles, fuelRecords, woodlots, labourRecords, childLabourRecords, scorecards } = sustainability;
    const tobaccoFarmers = new Set(productionProfiles.filter((p) => p.commodityType === "Tobacco").map((p) => p.farmerId));
    const cottonFarmers = new Set(productionProfiles.filter((p) => p.commodityType === "Cotton").map((p) => p.farmerId));

    const totalTreesPlanted = woodlots.reduce((s, w) => s + w.treesPlanted, 0);
    const totalTreesSurviving = woodlots.reduce((s, w) => s + w.treesSurviving, 0);
    const survivalRate = totalTreesPlanted > 0 ? ((totalTreesSurviving / totalTreesPlanted) * 100).toFixed(1) : "0";

    const altFuelTypes = ["Biochar Briquettes", "Sawdust Briquettes", "Corn Cob Briquettes", "Cotton Stalk Briquettes", "Macadamia Shells", "Solar Assisted"];
    const altFuelQty = fuelRecords.filter((f) => altFuelTypes.includes(f.fuelType)).reduce((s, f) => s + f.quantity, 0);
    const totalFuelQty = fuelRecords.reduce((s, f) => s + f.quantity, 0) || 1;
    const altFuelPct = ((altFuelQty / totalFuelQty) * 100).toFixed(1);

    const woodFuelQty = fuelRecords.filter((f) => f.fuelType === "Wood Fuel").reduce((s, f) => s + f.quantity, 0);
    const coalQty = fuelRecords.filter((f) => f.fuelType === "Coal").reduce((s, f) => s + f.quantity, 0);

    const compliantLabour = labourRecords.filter((l) => l.complianceStatus === "Compliant").length;
    const partialLabour = labourRecords.filter((l) => l.complianceStatus === "Partially Compliant").length;
    const highRiskLabour = labourRecords.filter((l) => l.complianceStatus === "High Risk").length;

    const compliantChild = childLabourRecords.filter((c) => c.complianceStatus === "Compliant").length;
    const partialChild = childLabourRecords.filter((c) => c.complianceStatus === "Partially Compliant").length;
    const highRiskChild = childLabourRecords.filter((c) => c.childLabourRisk === "High").length;

    const compliantScores = scorecards.filter((s) => s.overallRating === "Compliant").length;
    const partialScores = scorecards.filter((s) => s.overallRating === "Partially Compliant").length;
    const highRiskScores = scorecards.filter((s) => s.overallRating === "High Risk").length;

    // Fuel breakdown by type
    const fuelByType = new Map<string, number>();
    fuelRecords.forEach((f) => fuelByType.set(f.fuelType, (fuelByType.get(f.fuelType) ?? 0) + f.quantity));
    const fuelBreakdown = Array.from(fuelByType.entries())
      .map(([type, qty]) => ({ type, qty }))
      .sort((a, b) => b.qty - a.qty);

    // Commodity breakdown
    const commodityBreakdown = new Map<string, number>();
    productionProfiles.forEach((p) => commodityBreakdown.set(p.commodityType, (commodityBreakdown.get(p.commodityType) ?? 0) + 1));
    const commodityRows = Array.from(commodityBreakdown.entries())
      .map(([type, count]) => ({ type, count, farmers: type === "Tobacco" ? tobaccoFarmers.size : type === "Cotton" ? cottonFarmers.size : count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSustainabilityFarmers: new Set(productionProfiles.map((p) => p.farmerId)).size,
      tobaccoFarmers: tobaccoFarmers.size, cottonFarmers: cottonFarmers.size,
      totalTreesPlanted, totalTreesSurviving, survivalRate,
      altFuelPct, woodFuelQty, coalQty, fuelBreakdown,
      compliantLabour, partialLabour, highRiskLabour, totalLabour: labourRecords.length,
      compliantChild, partialChild, highRiskChild, totalChild: childLabourRecords.length,
      compliantScores, partialScores, highRiskScores, totalScores: scorecards.length,
      commodityRows,
      totalWoodlotArea: woodlots.reduce((s, w) => s + w.areaHa, 0).toFixed(1),
    };
  }, [sustainability]);

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

        {/* Sustainability Overview KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Sustainability Farmers</p>
                <p className="text-2xl font-semibold tabular-nums">{sustainabilityData.totalSustainabilityFarmers}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{sustainabilityData.tobaccoFarmers} Tobacco · {sustainabilityData.cottonFarmers} Cotton</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                <TreePine className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Woodlots</p>
                <p className="text-2xl font-semibold tabular-nums">{sustainabilityData.totalTreesPlanted.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{sustainabilityData.totalTreesSurviving.toLocaleString()} surviving ({sustainabilityData.survivalRate}%) · {sustainabilityData.totalWoodlotArea} ha</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Alt. Fuel Adoption</p>
                <p className="text-2xl font-semibold tabular-nums">{sustainabilityData.altFuelPct}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Wood: {sustainabilityData.woodFuelQty.toLocaleString()} kg · Coal: {sustainabilityData.coalQty.toLocaleString()} kg</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Compliance Rate</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {sustainabilityData.totalLabour > 0 ? Math.round((sustainabilityData.compliantLabour / sustainabilityData.totalLabour) * 100) : 0}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Labour: {sustainabilityData.compliantLabour}/{sustainabilityData.totalLabour} · Child: {sustainabilityData.compliantChild}/{sustainabilityData.totalChild}</p>
          </Card>
        </div>

        {/* Sustainability Detail Tables */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Commodity Breakdown</h3>
              <p className="text-xs text-muted-foreground">Farmers by commodity type</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Commodity</th>
                    <th className="px-5 py-3 font-medium text-right">Profiles</th>
                    <th className="px-5 py-3 font-medium text-right">Farmers</th>
                  </tr>
                </thead>
                <tbody>
                  {sustainabilityData.commodityRows.map((r) => (
                    <tr key={r.type} className="border-t border-border hover:bg-muted/40">
                      <td className="px-5 py-3 font-medium text-foreground">{r.type}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{r.count}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{r.farmers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Fuel Usage Breakdown</h3>
              <p className="text-xs text-muted-foreground">By fuel type (kg)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Fuel Type</th>
                    <th className="px-5 py-3 font-medium text-right">Quantity (kg)</th>
                    <th className="px-5 py-3 font-medium text-right">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {sustainabilityData.fuelBreakdown.map((r) => {
                    const isAlternative = !["Wood Fuel", "Coal"].includes(r.type);
                    return (
                      <tr key={r.type} className="border-t border-border hover:bg-muted/40">
                        <td className="px-5 py-3 font-medium text-foreground">{r.type}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{r.qty.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right">
                          <Badge variant={isAlternative ? "default" : "secondary"} className="text-[10px] font-normal">
                            {isAlternative ? "Alternative" : "Traditional"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Labour & Child Labour Compliance */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Labour Compliance</h3>
              <p className="text-xs text-muted-foreground">{sustainabilityData.totalLabour} records assessed</p>
            </div>
            <div className="p-5 space-y-3">
              <ComplianceRow label="Compliant" count={sustainabilityData.compliantLabour} total={sustainabilityData.totalLabour} color="green" />
              <ComplianceRow label="Partially Compliant" count={sustainabilityData.partialLabour} total={sustainabilityData.totalLabour} color="yellow" />
              <ComplianceRow label="High Risk" count={sustainabilityData.highRiskLabour} total={sustainabilityData.totalLabour} color="red" />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Child Labour Safeguards</h3>
              <p className="text-xs text-muted-foreground">{sustainabilityData.totalChild} records assessed</p>
            </div>
            <div className="p-5 space-y-3">
              <ComplianceRow label="Compliant" count={sustainabilityData.compliantChild} total={sustainabilityData.totalChild} color="green" />
              <ComplianceRow label="Partially Compliant" count={sustainabilityData.partialChild} total={sustainabilityData.totalChild} color="yellow" />
              <ComplianceRow label="High Risk" count={sustainabilityData.highRiskChild} total={sustainabilityData.totalChild} color="red" />
            </div>
          </Card>
        </div>

        {/* Sustainability Ratings */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Sustainability Ratings Distribution</h3>
            <p className="text-xs text-muted-foreground">{sustainabilityData.totalScores} scorecards calculated</p>
          </div>
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-3xl font-bold text-green-700 tabular-nums">{sustainabilityData.compliantScores}</p>
                <p className="text-sm font-medium text-green-700 mt-1">Compliant</p>
                <p className="text-xs text-green-600">Overall score ≥ 65</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <p className="text-3xl font-bold text-yellow-700 tabular-nums">{sustainabilityData.partialScores}</p>
                <p className="text-sm font-medium text-yellow-700 mt-1">Partially Compliant</p>
                <p className="text-xs text-yellow-600">Overall score 40–64</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50">
                <p className="text-3xl font-bold text-red-700 tabular-nums">{sustainabilityData.highRiskScores}</p>
                <p className="text-sm font-medium text-red-700 mt-1">High Risk</p>
                <p className="text-xs text-red-600">Overall score 1–39</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ComplianceRow({ label, count, total, color }: { label: string; count: number; total: number; color: "green" | "yellow" | "red" }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const colors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };
  const textColors = {
    green: "text-green-700",
    yellow: "text-yellow-700",
    red: "text-red-700",
  };
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className={`font-medium ${textColors[color]}`}>{label}</span>
        <span className="text-muted-foreground tabular-nums">{count} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

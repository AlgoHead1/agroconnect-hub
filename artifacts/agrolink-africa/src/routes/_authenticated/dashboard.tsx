import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Home, PackageCheck, MapPin, Sprout, AlertCircle, Plus, Truck, QrCode, Calendar, TrendingUp, FileText, Package } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { PageHeader } from "@/components/app/page-header";
import { KpiCard } from "@/components/app/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFarmers } from "@/store/farmers";
import { useAuth } from "@/store/auth";
import { useDistributions } from "@/store/distributions";
import { useWarehouses } from "@/store/warehouses";
import { households, distributions, inputItems } from "@/lib/mock-data";
import { provinces, districts, villages, getProvince, getDistrict } from "@/lib/zimbabwe-geo";
import { useMemo } from "react";
import { getDashboardWidgets, getDashboardWidgetData } from "@/components/dashboard/dashboard-widgets";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const farmers = useFarmers((s) => s.farmers);
  const user = useAuth((s) => s.user);
  const hasPermission = useAuth((s) => s.hasPermission);
  const allocations = useDistributions((s) => s.allocations);

  if (!user) return null;
  const warehouses = useWarehouses((s) => s.warehouses);
  const inputs = useWarehouses((s) => s.inputs);

  const stats = useMemo(() => {
    const activeDistricts = new Set(farmers.map((f) => f.districtId)).size;
    const pending = distributions.filter((d) => d.status === "Pending").length;
    return {
      farmers: farmers.length,
      households: households.length,
      distributed: distributions.filter((d) => d.status !== "Pending").length,
      activeDistricts,
      villages: new Set(farmers.map((f) => f.villageId)).size,
      pending,
    };
  }, [farmers]);

  const farmersByProvince = useMemo(() => {
    const map = new Map<string, number>();
    farmers.forEach((f) => map.set(f.provinceId, (map.get(f.provinceId) ?? 0) + 1));
    return provinces
      .map((p) => ({ name: p.name.replace("Mashonaland ", "M.").replace("Matabeleland ", "Mt."), count: map.get(p.id) ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [farmers]);

  const genderData = useMemo(() => {
    const m = farmers.filter((f) => f.gender === "M").length;
    const f = farmers.filter((x) => x.gender === "F").length;
    return [
      { name: "Male", value: m, color: "var(--chart-1)" },
      { name: "Female", value: f, color: "var(--chart-3)" },
    ];
  }, [farmers]);

  const cropData = useMemo(() => {
    const map = new Map<string, number>();
    farmers.forEach((f) => f.crops.forEach((c) => map.set(c, (map.get(c) ?? 0) + 1)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [farmers]);

  const distributionTrend = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleString("en", { month: "short" }),
      count: 0,
    }));
    distributions.forEach((d) => {
      const m = new Date(d.distributedAt).getMonth();
      months[m].count += 1;
    });
    return months;
  }, []);

  const recentFarmers = useMemo(
    () => [...farmers].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)).slice(0, 6),
    [farmers],
  );

  const recentDistributions = useMemo(
    () => [...distributions].sort((a, b) => b.distributedAt.localeCompare(a.distributedAt)).slice(0, 6),
    [],
  );

  const lowStock = inputs.filter((i) => i.stockOnHand <= i.reorderLevel * 2).slice(0, 4);

  // Get role-based dashboard widgets
  const dashboardWidgets = user ? getDashboardWidgets(user.role) : [];

  // Role-specific data
  const pendingCollections = useMemo(
    () => allocations.filter((a) => a.allocationStatus === "approved").slice(0, 6),
    [allocations],
  );

  const farmerAllocations = useMemo(() => 
    user?.role === "farmer" && user.id
      ? allocations.filter((a) => a.farmerId === user.id).slice(0, 6)
      : [],
    [allocations, user]
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        title={user?.role === "warehouse_manager" ? "Warehouse Operations" : 
              user?.role === "farmer" ? "My Farm Dashboard" :
              user?.role === "ngo_partner" ? "Impact Dashboard" :
              "Operations Dashboard"}
        breadcrumb="Overview"
        description={
          user?.role === "warehouse_manager" ? "Manage inventory, track collections, and monitor stock levels." :
          user?.role === "farmer" ? "View your allocations, collection dates, and farm status." :
          user?.role === "ngo_partner" ? "Track program impact, beneficiary reach, and regional coverage." :
          "Real-time view of farmer registration, household coverage, and input distribution across Zimbabwe."
        }
        actions={
          user?.role === "warehouse_manager" ? (
            <Button asChild>
              <Link to="/distributions"><Package className="h-4 w-4 mr-1.5" />Process Collection</Link>
            </Button>
          ) : user?.role === "district_officer" ? (
            <Button asChild>
              <Link to="/distributions"><Plus className="h-4 w-4 mr-1.5" />Create Allocation</Link>
            </Button>
          ) : user && hasPermission("farmers:create") ? (
            <Button asChild>
              <Link to="/farmers/new"><Plus className="h-4 w-4 mr-1.5" />Register farmer</Link>
            </Button>
          ) : null
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards - Role-based */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {dashboardWidgets.map((widget) => {
            const widgetData = getDashboardWidgetData(user?.role || "", widget.dataKey || "");
            return (
              <KpiCard
                key={widget.title}
                label={widget.title}
                value={widgetData.value}
                delta={widgetData.delta}
                hint={widgetData.hint}
                icon={widget.icon}
                tone="primary"
              />
            );
          })}
        </div>

        {/* Charts row 1 */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <ChartHeader title="Farmers by Province" subtitle="Distribution of registered farmers across provinces" />
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={farmersByProvince} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <ChartHeader title="Gender Breakdown" subtitle="All registered farmers" />
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {genderData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <ChartHeader title="Input Distribution Trends" subtitle="Monthly distribution volume — 2024" />
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={distributionTrend} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="var(--earth)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--earth)" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <ChartHeader title="Crop Distribution" subtitle="Most cultivated crops" />
            <div className="mt-4 space-y-3">
              {cropData.slice(0, 6).map((c) => {
                const max = cropData[0].value;
                const pct = (c.value / max) * 100;
                return (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span className="text-muted-foreground tabular-nums">{c.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Tables + alerts - Role-specific */}
        {user?.role === "warehouse_manager" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <ChartHeader title="Pending Collections" subtitle={`${pendingCollections.length} allocations ready for pickup`} />
                <Button variant="ghost" size="sm" asChild><Link to="/distributions">View all</Link></Button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-2.5 font-medium">Allocation Code</th>
                    <th className="px-5 py-2.5 font-medium">Input</th>
                    <th className="px-5 py-2.5 font-medium">Quantity</th>
                    <th className="px-5 py-2.5 font-medium">Collection Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCollections.map((a) => {
                    const input = inputs.find((i) => i.id === a.inputId);
                    return (
                      <tr key={a.id} className="border-t border-border hover:bg-muted/40">
                        <td className="px-5 py-3 font-mono text-xs text-foreground">{a.allocationCode}</td>
                        <td className="px-5 py-3 text-foreground">{input?.name}</td>
                        <td className="px-5 py-3 tabular-nums">{a.quantity} {input?.unit}</td>
                        <td className="px-5 py-3 text-foreground">{new Date(a.collectionDate).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>

            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <ChartHeader title="Stock Alerts" subtitle="Inputs at or near reorder level" />
              </div>
              <ul className="divide-y divide-border">
                {lowStock.map((item) => {
                  const ratio = item.stockOnHand / item.reorderLevel;
                  const critical = ratio < 1.2;
                  return (
                    <li key={item.id} className="px-5 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category} · {item.stockOnHand.toLocaleString()} {item.unit} on hand</p>
                      </div>
                      <Badge variant={critical ? "destructive" : "secondary"} className="shrink-0">
                        {critical ? "Critical" : "Low"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        ) : user?.role === "farmer" ? (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <ChartHeader title="My Allocations" subtitle={`${farmerAllocations.length} allocations assigned to you`} />
              <Button variant="ghost" size="sm" asChild><Link to="/distributions">View all</Link></Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left text-xs uppercase tracking-wider">
                  <th className="px-5 py-2.5 font-medium">Allocation Code</th>
                  <th className="px-5 py-2.5 font-medium">Input</th>
                  <th className="px-5 py-2.5 font-medium">Quantity</th>
                  <th className="px-5 py-2.5 font-medium">Collection Date</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {farmerAllocations.map((a) => {
                  const input = inputs.find((i) => i.id === a.inputId);
                  return (
                    <tr key={a.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-5 py-3 font-mono text-xs text-foreground">{a.allocationCode}</td>
                      <td className="px-5 py-3 text-foreground">{input?.name}</td>
                      <td className="px-5 py-3 tabular-nums">{a.quantity} {input?.unit}</td>
                      <td className="px-5 py-3 text-foreground">{new Date(a.collectionDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <Badge variant={a.allocationStatus === "collected" ? "default" : a.allocationStatus === "approved" ? "secondary" : "outline"}>
                          {a.allocationStatus}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : user?.role === "ngo_partner" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <ChartHeader title="Program Impact" subtitle="Regional distribution summary" />
                <Button variant="ghost" size="sm" asChild><Link to="/reports">View reports</Link></Button>
              </div>
              <div className="p-5 space-y-4">
                {provinces.slice(0, 5).map((p) => {
                  const provinceFarmers = farmers.filter((f) => f.provinceId === p.id).length;
                  const maxFarmers = Math.max(...provinces.map((pr) => farmers.filter((f) => f.provinceId === pr.id).length));
                  const pct = maxFarmers > 0 ? (provinceFarmers / maxFarmers) * 100 : 0;
                  return (
                    <div key={p.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="text-muted-foreground tabular-nums">{provinceFarmers} beneficiaries</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <ChartHeader title="Quick Actions" subtitle="Common tasks" />
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/reports"><FileText className="h-4 w-4 mr-2" />Generate Report</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/gis"><MapPin className="h-4 w-4 mr-2" />View Coverage Map</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/distributions"><TrendingUp className="h-4 w-4 mr-2" />Analytics Dashboard</Link>
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <ChartHeader title="Recent Registrations" subtitle={`${recentFarmers.length} most recent farmers`} />
                <Button variant="ghost" size="sm" asChild><Link to="/farmers">View all</Link></Button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-2.5 font-medium">Farmer</th>
                    <th className="px-5 py-2.5 font-medium">Location</th>
                    <th className="px-5 py-2.5 font-medium">Farm</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFarmers.map((f) => (
                    <tr key={f.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <Link to="/farmers/$farmerId" params={{ farmerId: f.id }} className="font-medium text-foreground hover:text-primary">
                          {f.firstName} {f.lastName}
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono">{f.farmerCode}</p>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {getDistrict(f.districtId)?.name}
                        <p className="text-xs text-muted-foreground">{getProvince(f.provinceId)?.name}</p>
                      </td>
                      <td className="px-5 py-3 tabular-nums text-foreground">{f.farmSizeHa} ha</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <ChartHeader title="Stock Alerts" subtitle="Inputs at or near reorder level" />
              </div>
              <ul className="divide-y divide-border">
                {lowStock.map((item) => {
                  const ratio = item.stockOnHand / item.reorderLevel;
                  const critical = ratio < 1.2;
                  return (
                    <li key={item.id} className="px-5 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category} · {item.stockOnHand.toLocaleString()} {item.unit} on hand</p>
                      </div>
                      <Badge variant={critical ? "destructive" : "secondary"} className="shrink-0">
                        {critical ? "Critical" : "Low"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        )}

        {/* Distributions + GIS placeholder */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <ChartHeader title="Recent Distributions" subtitle="Most recent input issuances" />
              <Button variant="ghost" size="sm" asChild><Link to="/distributions">View all</Link></Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left text-xs uppercase tracking-wider">
                  <th className="px-5 py-2.5 font-medium">Batch</th>
                  <th className="px-5 py-2.5 font-medium">Input</th>
                  <th className="px-5 py-2.5 font-medium">Qty</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDistributions.map((d) => {
                  const item = inputItems.find((i) => i.id === d.inputId);
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-5 py-3 font-mono text-xs text-foreground">{d.batchCode}</td>
                      <td className="px-5 py-3 text-foreground">{item?.name}</td>
                      <td className="px-5 py-3 tabular-nums">{d.quantity} {item?.unit}</td>
                      <td className="px-5 py-3">
                        <Badge variant={d.status === "Verified" ? "default" : d.status === "Issued" ? "secondary" : "outline"}>
                          {d.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card className="p-5 flex flex-col">
            <ChartHeader title="GIS Coverage" subtitle="Farmer distribution by geography" />
            <div className="mt-4 flex-1 min-h-[260px] rounded-md border border-dashed border-border bg-gradient-to-br from-primary/5 to-earth/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: "radial-gradient(circle at 25% 35%, var(--primary) 1px, transparent 2px), radial-gradient(circle at 60% 55%, var(--earth) 1px, transparent 2px), radial-gradient(circle at 75% 25%, var(--primary) 1px, transparent 2px), radial-gradient(circle at 40% 75%, var(--earth) 1px, transparent 2px)",
                backgroundSize: "60px 60px",
              }} />
              <div className="relative text-center">
                <MapPin className="h-7 w-7 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Leaflet integration ready</p>
                <p className="text-xs text-muted-foreground">Interactive map in Phase 2</p>
                <Button variant="link" size="sm" asChild className="mt-1"><Link to="/gis">Open GIS module</Link></Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  fontSize: "12px",
  color: "var(--popover-foreground)",
};

function ChartHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-0.5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

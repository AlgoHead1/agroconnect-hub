import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Users as UsersIcon, ShieldAlert, Home } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/app/kpi-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useHouseholds } from "@/store/households";
import { useFarmers } from "@/store/farmers";
import {
  provinces, districts, getProvince, getDistrict, getVillage, getWard,
  wardsByDistrict, villagesByWard,
} from "@/lib/zimbabwe-geo";
import type { VulnerabilityCategory } from "@/types";

export const Route = createFileRoute("/_authenticated/households")({
  component: HouseholdsPage,
});

const VULNS: VulnerabilityCategory[] = ["None", "Elderly", "Child-headed", "Disability", "Widow", "Chronically Ill"];

function HouseholdsPage() {
  const households = useHouseholds((s) => s.households);
  const addHousehold = useHouseholds((s) => s.addHousehold);
  const farmers = useFarmers((s) => s.farmers);

  const [q, setQ] = useState("");
  const [provinceId, setProvinceId] = useState("all");
  const [vuln, setVuln] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return households.filter((h) => {
      if (provinceId !== "all" && h.provinceId !== provinceId) return false;
      if (vuln !== "all" && h.vulnerabilityCategory !== vuln) return false;
      if (!needle) return true;
      const head = farmers.find((f) => f.id === h.headFarmerId);
      return (
        h.householdCode.toLowerCase().includes(needle) ||
        (head && `${head.firstName} ${head.lastName}`.toLowerCase().includes(needle))
      );
    });
  }, [households, farmers, q, provinceId, vuln]);

  const vulnerable = households.filter((h) => h.vulnerabilityCategory !== "None").length;
  const totalMembers = households.reduce((s, h) => s + h.memberCount, 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Household Registry"
        breadcrumb="Operations"
        description="Track households, vulnerability categories, and household heads across all wards."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1.5" />Register household</Button>
            </DialogTrigger>
            <NewHouseholdDialog onCreate={(data) => { addHousehold(data); setOpen(false); toast.success("Household registered"); }} />
          </Dialog>
        }
      />

      <div className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label="Total households" value={households.length.toLocaleString()} icon={Home} />
          <KpiCard label="Vulnerable households" value={vulnerable.toLocaleString()} hint={`${Math.round((vulnerable / households.length) * 100)}% flagged`} icon={ShieldAlert} />
          <KpiCard label="Total members" value={totalMembers.toLocaleString()} hint={`${(totalMembers / households.length).toFixed(1)} avg per household`} icon={UsersIcon} />
        </div>

        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by household code or head name…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={provinceId} onValueChange={setProvinceId}>
              <SelectTrigger className="w-full lg:w-48"><SelectValue placeholder="Province" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All provinces</SelectItem>
                {provinces.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={vuln} onValueChange={setVuln}>
              <SelectTrigger className="w-full lg:w-48"><SelectValue placeholder="Vulnerability" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any category</SelectItem>
                {VULNS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-left text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-5 py-3 font-medium">Head of Household</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Vulnerability</th>
                  <th className="px-5 py-3 font-medium text-right">Members</th>
                  <th className="px-5 py-3 font-medium text-right">Linked Farmers</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-muted-foreground">No households match your filters.</td></tr>
                ) : filtered.slice(0, 50).map((h) => {
                  const head = farmers.find((f) => f.id === h.headFarmerId);
                  const linked = farmers.filter((f) => f.householdId === h.id).length;
                  return (
                    <tr key={h.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-5 py-3 font-mono text-xs text-primary">{h.householdCode}</td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {head ? `${head.firstName} ${head.lastName}` : "—"}
                        {head && <p className="text-xs text-muted-foreground font-mono">{head.farmerCode}</p>}
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {getProvince(h.provinceId)?.name}
                        <p className="text-xs text-muted-foreground">{getDistrict(h.districtId)?.name} · {getVillage(h.villageId)?.name}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={h.vulnerabilityCategory === "None" ? "secondary" : "destructive"} className="text-[10px] font-normal">
                          {h.vulnerabilityCategory}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{h.memberCount}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{linked}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 50 && (
            <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              Showing 50 of {filtered.length.toLocaleString()} — refine filters to narrow results.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function NewHouseholdDialog({ onCreate }: { onCreate: (h: Parameters<ReturnType<typeof useHouseholds.getState>["addHousehold"]>[0]) => void }) {
  const farmers = useFarmers((s) => s.farmers);
  const [headFarmerId, setHeadFarmerId] = useState("");
  const [memberCount, setMemberCount] = useState(3);
  const [vulnerability, setVulnerability] = useState<VulnerabilityCategory>("None");
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [wardId, setWardId] = useState("");
  const [villageId, setVillageId] = useState("");
  const [addressNote, setAddressNote] = useState("");

  const districtOptions = provinceId ? districts.filter((d) => d.provinceId === provinceId) : [];
  const wardOptions = districtId ? wardsByDistrict(districtId) : [];
  const villageOptions = wardId ? villagesByWard(wardId) : [];

  // Auto-fill location from selected head farmer
  const onHeadSelect = (id: string) => {
    setHeadFarmerId(id);
    const f = farmers.find((x) => x.id === id);
    if (f) {
      setProvinceId(f.provinceId);
      setDistrictId(f.districtId);
      setWardId(f.wardId);
      setVillageId(f.villageId);
    }
  };

  const submit = () => {
    if (!headFarmerId || !villageId) { toast.error("Head of household and village are required"); return; }
    onCreate({ headFarmerId, memberCount, vulnerabilityCategory: vulnerability, provinceId, districtId, wardId, villageId, addressNote });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Register new household</DialogTitle></DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label>Head of household</Label>
          <Select value={headFarmerId} onValueChange={onHeadSelect}>
            <SelectTrigger><SelectValue placeholder="Select registered farmer…" /></SelectTrigger>
            <SelectContent>
              {farmers.slice(0, 100).map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.firstName} {f.lastName} · {f.farmerCode}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label>Member count</Label>
            <Input type="number" min={1} value={memberCount} onChange={(e) => setMemberCount(parseInt(e.target.value) || 1)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Vulnerability</Label>
            <Select value={vulnerability} onValueChange={(v) => setVulnerability(v as VulnerabilityCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{VULNS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label>Province</Label>
            <Select value={provinceId} onValueChange={(v) => { setProvinceId(v); setDistrictId(""); setWardId(""); setVillageId(""); }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{provinces.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>District</Label>
            <Select value={districtId} onValueChange={(v) => { setDistrictId(v); setWardId(""); setVillageId(""); }} disabled={!provinceId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{districtOptions.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Ward</Label>
            <Select value={wardId} onValueChange={(v) => { setWardId(v); setVillageId(""); }} disabled={!districtId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{wardOptions.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Village</Label>
            <Select value={villageId} onValueChange={setVillageId} disabled={!wardId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{villageOptions.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label>Address note (optional)</Label>
          <Input value={addressNote} onChange={(e) => setAddressNote(e.target.value)} placeholder="Landmark or directions" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Register household</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Silence unused import warnings for helpers retained for future use
void getWard;

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, Download, Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VulnerabilityTags } from "@/components/ui/vulnerability-tags";
import { calculateEligibility, getEligibilityColor } from "@/lib/eligibility-rules";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useFarmers } from "@/store/farmers";
import { usePrograms } from "@/store/programs";
import { useDistributions } from "@/store/distributions";
import { provinces, districts, getProvince, getDistrict, getWard, getVillage } from "@/lib/zimbabwe-geo";
import type { CommodityType } from "@/types";

export const Route = createFileRoute("/_authenticated/farmers")({
  component: FarmersPage,
});

const PAGE_SIZE = 12;

function FarmersPage() {
  const farmers = useFarmers((s) => s.farmers);
  const searchBeneficiaries = useFarmers((s) => s.searchBeneficiaries);
  const { programs, getParticipationsByProgram } = usePrograms();
  const allocations = useDistributions((s) => s.allocations);
  const [q, setQ] = useState("");
  const [provinceId, setProvinceId] = useState<string>("all");
  const [districtId, setDistrictId] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");
  const [commodityType, setCommodityType] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = farmers;

    // Apply location/gender/commodity filters first (cheap)
    if (provinceId !== "all") result = result.filter((f) => f.provinceId === provinceId);
    if (districtId !== "all") result = result.filter((f) => f.districtId === districtId);
    if (gender !== "all") result = result.filter((f) => f.gender === gender);
    if (commodityType !== "all") {
      const ct = commodityType as CommodityType;
      result = result.filter((f) => {
        if (f.crops.includes(ct as any)) return true;
        const farmerProgramIds = new Set(
          allocations.filter((a) => a.farmerId === f.id && a.programId).map((a) => a.programId!)
        );
        return programs.some((p) => farmerProgramIds.has(p.id) && p.commodityType === ct);
      });
    }

    const needle = q.trim().toLowerCase();
    if (!needle) return result;

    // Check if query matches a program code/name — if so, find farmers in that program
    const matchingProgram = programs.find(
      (p) => p.programCode.toLowerCase().includes(needle) || p.programName.toLowerCase().includes(needle)
    );
    if (matchingProgram) {
      const programFarmerIds = new Set(getParticipationsByProgram(matchingProgram.id).map((p) => p.farmerId));
      const programAllocFarmerIds = new Set(
        allocations.filter((a) => a.programId === matchingProgram.id).map((a) => a.farmerId)
      );
      const programIds = new Set([...programFarmerIds, ...programAllocFarmerIds]);
      if (programIds.size > 0) {
        return result.filter((f) => programIds.has(f.id));
      }
    }

    // Standard multi-field search including village and ward names
    return result.filter((f) => {
      const village = getVillage(f.villageId);
      const ward = getWard(f.wardId);
      return (
        f.id.toLowerCase().includes(needle) ||
        f.farmerCode.toLowerCase().includes(needle) ||
        f.firstName.toLowerCase().includes(needle) ||
        f.lastName.toLowerCase().includes(needle) ||
        f.nationalId.toLowerCase().includes(needle) ||
        f.phone.includes(needle) ||
        (village?.name.toLowerCase().includes(needle)) ||
        (ward?.name.toLowerCase().includes(needle))
      );
    });
  }, [farmers, q, provinceId, districtId, gender, commodityType, programs, getParticipationsByProgram, allocations]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const districtOptions = provinceId === "all" ? districts : districts.filter((d) => d.provinceId === provinceId);
  const filtersApplied = q.trim().length > 0 || provinceId !== "all" || districtId !== "all" || gender !== "all" || commodityType !== "all";

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Farmer Registry"
        breadcrumb="Operations"
        description={`${farmers.length.toLocaleString()} farmers registered across ${new Set(farmers.map((f) => f.districtId)).size} districts.`}
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4 mr-1.5" />Export</Button>
            <Button asChild><Link to="/farmers/new"><Plus className="h-4 w-4 mr-1.5" />Register farmer</Link></Button>
          </>
        }
      />

      <div className="p-6 space-y-4">
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, phone, village, ward, or program code…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 lg:flex gap-2">
              <Select value={provinceId} onValueChange={(v) => { setProvinceId(v); setDistrictId("all"); setPage(1); }}>
                <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Province" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All provinces</SelectItem>
                  {provinces.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={districtId} onValueChange={(v) => { setDistrictId(v); setPage(1); }}>
                <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="District" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All districts</SelectItem>
                  {districtOptions.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={gender} onValueChange={(v) => { setGender(v); setPage(1); }}>
                <SelectTrigger className="w-full lg:w-32"><SelectValue placeholder="Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any gender</SelectItem>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
              <Select value={commodityType} onValueChange={(v) => { setCommodityType(v); setPage(1); }}>
                <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Commodity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All commodities</SelectItem>
                  <SelectItem value="Tobacco">Tobacco</SelectItem>
                  <SelectItem value="Cotton">Cotton</SelectItem>
                  <SelectItem value="Maize">Maize</SelectItem>
                  <SelectItem value="Soybean">Soybean</SelectItem>
                  <SelectItem value="Groundnuts">Groundnuts</SelectItem>
                  <SelectItem value="Horticulture">Horticulture</SelectItem>
                  <SelectItem value="Livestock">Livestock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                <tr className="text-left text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Farmer Code</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">National ID</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Province / District</th>
                  <th className="px-5 py-3 font-medium">Village</th>
                  <th className="px-5 py-3 font-medium">Eligibility</th>
                  <th className="px-5 py-3 font-medium">Latest Allocation</th>
                  <th className="px-5 py-3 font-medium">Crops</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-10 w-10 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          {filtersApplied
                            ? "No farmers match your current search or filters. Try clearing filters or broaden your search."
                            : "No farmers registered yet."}
                        </p>
                        {!filtersApplied ? (
                          <p className="text-xs text-muted-foreground/70">Create a registration to begin building the farmer registry in your area.</p>
                        ) : (
                          <p className="text-xs text-muted-foreground/70">Tip: search by name, ID, phone, village, ward, or program code.</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Button size="sm" asChild><Link to="/farmers/new"><Plus className="h-4 w-4 mr-1.5" />Register Farmer</Link></Button>
                          <Button size="sm" variant="outline" onClick={() => { setProvinceId("all"); setDistrictId("all"); setGender("all"); setCommodityType("all"); setQ(""); }}>
                            Clear filters
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((f) => {
                    const eligibility = calculateEligibility(f);
                    const village = getVillage(f.villageId);
                    const latestAlloc = allocations
                      .filter((a) => a.farmerId === f.id)
                      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
                    return (
                      <tr key={f.id} className="border-t border-border hover:bg-muted/40">
                        <td className="px-5 py-3 font-mono text-xs">
                          <Link to="/farmers/$farmerId" params={{ farmerId: f.id }} className="text-primary hover:underline">
                            {f.farmerCode}
                          </Link>
                        </td>
                        <td className="px-5 py-3 font-medium text-foreground">{f.firstName} {f.lastName}</td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{f.nationalId}</td>
                        <td className="px-5 py-3 font-mono text-xs text-foreground">{f.phone}</td>
                        <td className="px-5 py-3 text-foreground">
                          {getProvince(f.provinceId)?.name}
                          <p className="text-xs text-muted-foreground">{getDistrict(f.districtId)?.name}</p>
                        </td>
                        <td className="px-5 py-3 text-foreground text-xs">{village?.name}</td>
                        <td className="px-5 py-3">
                          <Badge className={`text-[10px] font-normal ${eligibility.status === "Eligible" ? "bg-green-50 text-green-700 border-green-200" : eligibility.status === "Waitlisted" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`} variant="outline">
                            {eligibility.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          {latestAlloc ? (
                            <Badge variant="secondary" className="text-[10px] font-normal">{latestAlloc.allocationStatus}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {f.crops.slice(0, 2).map((c) => (
                              <Badge key={c} variant="secondary" className="text-[10px] font-normal">{c}</Badge>
                            ))}
                            {f.crops.length > 2 && (
                              <Badge variant="outline" className="text-[10px] font-normal">+{f.crops.length - 2}</Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-sm">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(safePage - 1) * PAGE_SIZE + 1}</span>–
              <span className="font-medium text-foreground">{Math.min(safePage * PAGE_SIZE, filtered.length)}</span> of{" "}
              <span className="font-medium text-foreground">{filtered.length.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">Page {safePage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={safePage === totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


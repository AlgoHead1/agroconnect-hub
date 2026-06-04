import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { useMemo } from "react";
import { ArrowLeft, Printer, Sprout, MapPin, Phone, IdCard, Calendar, Wheat, PackageCheck, QrCode, CircleCheck as CheckCircle2, Hop as Home, Users, Droplet, Award, FileText, TreePine, Flame, Shield, Baby, Leaf, ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VulnerabilityTags } from "@/components/ui/vulnerability-tags";
import { AuditTimeline } from "@/components/ui/audit-timeline";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFarmers } from "@/store/farmers";
import { useDistributions } from "@/store/distributions";
import { useWarehouses } from "@/store/warehouses";
import { useAuth } from "@/store/auth";
import { usePrograms } from "@/store/programs";
import { useSustainability } from "@/store/sustainability";
import { getProvince, getDistrict, getWard, getVillage } from "@/lib/zimbabwe-geo";
import { calculateEligibility, getEligibilityColor, getEligibilityBgColor } from "@/lib/eligibility-rules";
import { households, distributions, inputItems } from "@/lib/mock-data";
import { format } from "date-fns";
import type { AllocationStatus, SustainabilityComplianceStatus } from "@/types";

export const Route = createFileRoute("/_authenticated/farmers/$farmerId")({
  component: FarmerProfile,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <p className="text-lg font-medium">Farmer not found</p>
      <Button asChild className="mt-4"><Link to="/farmers">Back to registry</Link></Button>
    </div>
  ),
});

function FarmerProfile() {
  const { farmerId } = Route.useParams();
  const farmer = useFarmers((s) => s.getById(farmerId));
  const { getAllocationsByFarmer } = useDistributions();
  const { inputs, warehouses } = useWarehouses();
  const { getParticipationsByFarmer } = usePrograms();
  const receipts = usePrograms((s) => s.getReceiptsByFarmer(farmerId));
  const sustainability = useSustainability();

  if (!farmer) throw notFound();

  const eligibility = calculateEligibility(farmer);
  const programParticipations = getParticipationsByFarmer(farmer.id);
  const farmerAllocations = getAllocationsByFarmer(farmer.id);
  const farmerDistributions = distributions.filter((d) => d.farmerId === farmer.id);

  const province = getProvince(farmer.provinceId);
  const district = getDistrict(farmer.districtId);
  const ward = getWard(farmer.wardId);
  const village = getVillage(farmer.villageId);
  const household = households.find((h) => h.id === farmer.householdId);
  const birthYear = new Date(farmer.dob).getFullYear();
  const age = new Date().getFullYear() - birthYear;

  // Determine if sustainability tab should appear
  const sustainabilityApplicable = useMemo(() => {
    const programCommodityTypes = programParticipations
      .map((p) => p.commodityType)
      .filter(Boolean) as string[];
    return sustainability.isSustainabilityApplicable(farmer.crops, programCommodityTypes as any[]);
  }, [farmer.crops, programParticipations, sustainability]);

  const qrPayload = JSON.stringify({
    code: farmer.farmerCode, id: farmer.id,
    name: `${farmer.firstName} ${farmer.lastName}`,
    nid: farmer.nationalId, p: province?.code,
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title={`${farmer.firstName} ${farmer.lastName}`}
        breadcrumb={`Operations · Farmer Registry · ${farmer.farmerCode}`}
        description={`Registered ${new Date(farmer.registeredAt).toLocaleDateString()} · ${village?.name}`}
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1.5" />Print card</Button>
            <Button variant="ghost" asChild><Link to="/farmers"><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Link></Button>
          </>
        }
      />

      <div className="p-6 grid gap-6 lg:grid-cols-3">
        {/* Main tabbed content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="identity" className="space-y-4">
            <TabsList>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="allocations">Allocations</TabsTrigger>
              {sustainabilityApplicable && (
                <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
              )}
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
            </TabsList>

            <TabsContent value="identity">
              <IdentityTab
                farmer={farmer} province={province} district={district}
                ward={ward} village={village} household={household}
                age={age} eligibility={eligibility}
              />
            </TabsContent>

            <TabsContent value="programs">
              <ProgramsTab participations={programParticipations} />
            </TabsContent>

            <TabsContent value="allocations">
              <AllocationsTab
                allocations={farmerAllocations} inputs={inputs} warehouses={warehouses}
                distributions={farmerDistributions}
              />
            </TabsContent>

            {sustainabilityApplicable && (
              <TabsContent value="sustainability">
                <SustainabilityTab farmerId={farmer.id} farmerCode={farmer.farmerCode} crops={farmer.crops} />
              </TabsContent>
            )}

            <TabsContent value="receipts">
              <ReceiptsTab receipts={receipts} />
            </TabsContent>
          </Tabs>
        </div>

        {/* QR Card sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80">AgroLinkAfrica</p>
                <p className="text-sm font-semibold">Farmer Identity Card</p>
              </div>
            </div>
            <div className="bg-background text-foreground rounded-md p-4 flex flex-col items-center gap-3">
              <QRCodeSVG value={qrPayload} size={160} bgColor="#ffffff" fgColor="#1a3a25" level="M" />
              <div className="text-center">
                <p className="font-semibold text-sm">{farmer.firstName} {farmer.lastName}</p>
                <p className="text-xs font-mono text-muted-foreground">{farmer.farmerCode}</p>
              </div>
            </div>
            <p className="text-[10px] text-center mt-3 opacity-80">
              Scan to verify identity at distribution point
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── IDENTITY TAB ────────────────────────────────────────────────

function IdentityTab({ farmer, province, district, ward, village, household, age, eligibility }: any) {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold shrink-0">
          {farmer.firstName[0]}{farmer.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold">{farmer.firstName} {farmer.lastName}</h2>
          <p className="text-sm text-muted-foreground font-mono">{farmer.farmerCode}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="secondary">{farmer.gender === "M" ? "Male" : farmer.gender === "F" ? "Female" : "Other"}</Badge>
            <Badge variant="outline">{age} years</Badge>
            <Badge variant="outline">{farmer.farmSizeHa} ha</Badge>
            {farmer.vulnerabilityTags?.map((tag: string) => (
              <Badge key={tag} variant="destructive" className="text-[10px] font-normal">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Detail icon={IdCard} label="National ID" value={farmer.nationalId} mono />
        <Detail icon={Phone} label="Phone" value={farmer.phone} mono />
        <Detail icon={Calendar} label="Date of birth" value={new Date(farmer.dob).toLocaleDateString()} />
        <Detail icon={Sprout} label="Farm size" value={`${farmer.farmSizeHa} hectares`} />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />Location</h3>
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm space-y-1">
          <p><span className="text-muted-foreground">Province:</span> <span className="font-medium">{province?.name}</span></p>
          <p><span className="text-muted-foreground">District:</span> <span className="font-medium">{district?.name}</span></p>
          <p><span className="text-muted-foreground">Ward:</span> <span className="font-medium">{ward?.name}</span></p>
          <p><span className="text-muted-foreground">Village:</span> <span className="font-medium">{village?.name}</span></p>
          {farmer.gpsLat && farmer.gpsLng && (
            <p className="font-mono text-xs text-muted-foreground pt-1">
              GPS: {farmer.gpsLat.toFixed(5)}, {farmer.gpsLng.toFixed(5)}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Wheat className="h-4 w-4 text-primary" />Crops</h3>
          <div className="flex flex-wrap gap-1.5">
            {farmer.crops.map((c: string) => <Badge key={c} variant="secondary">{c}</Badge>)}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Livestock</h3>
          <div className="flex flex-wrap gap-1.5">
            {farmer.livestock.length ? farmer.livestock.map((l: string) => <Badge key={l} variant="outline">{l}</Badge>)
              : <span className="text-sm text-muted-foreground">None recorded</span>}
          </div>
        </div>
      </div>

      {household && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Household</h3>
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-mono text-xs text-muted-foreground">{household.householdCode}</p>
            <p className="mt-0.5"><span className="text-muted-foreground">Members:</span> <span className="font-medium">{household.memberCount}</span></p>
            <p><span className="text-muted-foreground">Category:</span> <span className="font-medium">{household.vulnerabilityCategory}</span></p>
          </div>
        </div>
      )}

      {(farmer.householdSize || farmer.dependentsUnder18 || farmer.dependentsOver60 || farmer.femaleHeadedHousehold || farmer.youthHeadedHousehold) && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Home className="h-4 w-4 text-primary" />Household Profile</h3>
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm space-y-2">
            {farmer.householdSize && <p><span className="text-muted-foreground">Household Size:</span> <span className="font-medium">{farmer.householdSize} people</span></p>}
            {farmer.dependentsUnder18 && <p><span className="text-muted-foreground">Dependents Under 18:</span> <span className="font-medium">{farmer.dependentsUnder18}</span></p>}
            {farmer.dependentsOver60 && <p><span className="text-muted-foreground">Dependents Over 60:</span> <span className="font-medium">{farmer.dependentsOver60}</span></p>}
            {farmer.femaleHeadedHousehold && <p><Badge variant="secondary" className="text-[10px]">Female-headed Household</Badge></p>}
            {farmer.youthHeadedHousehold && <p><Badge variant="secondary" className="text-[10px]">Youth-headed Household</Badge></p>}
          </div>
        </div>
      )}

      {(farmer.landOwnershipType || farmer.irrigationAccess) && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2"><Droplet className="h-4 w-4 text-primary" />Production Profile</h3>
          <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm space-y-2">
            {farmer.landOwnershipType && <p><span className="text-muted-foreground">Land Ownership:</span> <span className="font-medium">{farmer.landOwnershipType}</span></p>}
            {farmer.irrigationAccess && <p><span className="text-muted-foreground">Irrigation Access:</span> <span className="font-medium">{farmer.irrigationAccess}</span></p>}
          </div>
        </div>
      )}

      <div className={`border-2 rounded-lg p-4 ${getEligibilityBgColor(eligibility.status)}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><Award className="h-4 w-4" />Eligibility Status</h3>
            <p className="text-xs text-muted-foreground mt-1">Program participation determination</p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${getEligibilityColor(eligibility.status)}`}>{eligibility.status}</p>
            <p className="text-xs text-muted-foreground">Score: {eligibility.score}/100</p>
          </div>
        </div>
        {eligibility.reasons.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Scoring factors:</p>
            <ul className="text-xs space-y-0.5">
              {eligibility.reasons.map((reason: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-primary">•</span><span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── PROGRAMS TAB ────────────────────────────────────────────────

function ProgramsTab({ participations }: { participations: any[] }) {
  if (participations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ClipboardCheck className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No program participations recorded.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {participations.map((p) => (
        <Card key={p.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">{p.programName}</h3>
              <p className="text-xs font-mono text-muted-foreground">{p.programCode}</p>
              {p.commodityType && <Badge variant="secondary" className="text-[10px] font-normal">{p.commodityType}</Badge>}
              {p.contractor && <p className="text-xs text-muted-foreground">Contractor: {p.contractor}</p>}
            </div>
            <div className="text-right space-y-1">
              <Badge variant="outline" className="text-[10px] font-normal">{p.eligibilityStatus}</Badge>
              {p.eligibilityScore !== undefined && (
                <p className="text-xs text-muted-foreground">Score: {p.eligibilityScore}</p>
              )}
            </div>
          </div>
          <div className="mt-3 grid gap-2 grid-cols-2 text-xs text-muted-foreground">
            <p>Funding: {p.fundingSource}</p>
            {p.implementingPartner && <p>Partner: {p.implementingPartner}</p>}
            {p.season && <p>Season: {p.season}</p>}
            <p>Enrolled: {format(new Date(p.enrolledDate), "dd MMM yyyy")}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── ALLOCATIONS TAB ─────────────────────────────────────────────

function AllocationsTab({ allocations, inputs, warehouses, distributions }: any) {
  return (
    <div className="space-y-6">
      {allocations.length === 0 && distributions.length === 0 ? (
        <Card className="p-8 text-center">
          <PackageCheck className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No allocations or distributions recorded.</p>
        </Card>
      ) : (
        <>
          {allocations.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold">Allocations ({allocations.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Code</th>
                    <th className="px-5 py-3 font-medium">Input</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((a: any) => {
                    const item = inputs.find((i: any) => i.id === a.inputId);
                    return (
                      <tr key={a.id} className="border-t border-border hover:bg-muted/40">
                        <td className="px-5 py-3 font-mono text-xs">{a.allocationCode}</td>
                        <td className="px-5 py-3 text-foreground">{item?.name}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{a.quantity} {item?.unit}</td>
                        <td className="px-5 py-3">{getAllocationBadge(a.allocationStatus)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
          {distributions.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold">Distribution History ({distributions.length})</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Batch</th>
                    <th className="px-5 py-3 font-medium">Input</th>
                    <th className="px-5 py-3 font-medium text-right">Qty</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.slice(0, 20).map((d: any) => {
                    const item = inputItems.find((i: any) => i.id === d.inputId);
                    return (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/40">
                        <td className="px-5 py-3 font-mono text-xs">{d.batchCode}</td>
                        <td className="px-5 py-3 text-foreground">{item?.name}</td>
                        <td className="px-5 py-3 text-right tabular-nums">{d.quantity} {item?.unit}</td>
                        <td className="px-5 py-3">
                          <Badge variant={d.status === "Verified" ? "default" : "outline"} className="text-[10px] font-normal">{d.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ─── SUSTAINABILITY TAB ──────────────────────────────────────────

function SustainabilityTab({ farmerId, farmerCode, crops }: { farmerId: string; farmerCode: string; crops: string[] }) {
  const sustainability = useSustainability();
  const profiles = sustainability.getProductionProfilesByFarmer(farmerId);
  const woodlots = sustainability.getWoodlotsByFarmer(farmerId);
  const fuelRecords = sustainability.getFuelRecordsByFarmer(farmerId);
  const labour = sustainability.getLabourRecord(farmerId);
  const childLabour = sustainability.getChildLabourRecord(farmerId);

  // Read existing scorecard (pure read, no state mutation)
  const commodityType = profiles[0]?.commodityType || (crops.includes("Tobacco") ? "Tobacco" as const : crops.includes("Cotton") ? "Cotton" as const : "Tobacco" as const);
  const scorecard = sustainability.getScorecard(farmerId);
  const passport = sustainability.getPassport(farmerId, farmerCode);

  if (!scorecard) {
    return (
      <Card className="p-8 text-center">
        <Leaf className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">Sustainability scorecard not yet calculated.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sustainability Scorecard */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4"><Leaf className="h-4 w-4 text-green-600" />Sustainability Scorecard</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <ScoreGauge label="Environmental" score={scorecard.environmentalScore} color="text-green-600" bg="bg-green-50" />
          <ScoreGauge label="Social" score={scorecard.socialScore} color="text-blue-600" bg="bg-blue-50" />
          <ScoreGauge label="Compliance" score={scorecard.complianceScore} color="text-amber-600" bg="bg-amber-50" />
          <div className={`rounded-lg p-4 ${getComplianceBg(scorecard.overallRating)}`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Overall</p>
            <p className="text-2xl font-bold mt-1">{scorecard.overallScore}</p>
            <p className={`text-xs font-medium mt-1 ${getComplianceColor(scorecard.overallRating)}`}>{scorecard.overallRating}</p>
          </div>
        </div>
      </Card>

      {/* Production Profile */}
      {profiles.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Sprout className="h-4 w-4 text-green-600" />Production Profile</h3>
          {profiles.map((p) => (
            <div key={p.id} className="grid gap-3 sm:grid-cols-3 text-sm">
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Commodity</span><p className="font-medium">{p.commodityType}</p></div>
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Area</span><p className="font-medium">{p.areaHa} ha</p></div>
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Contractor</span><p className="font-medium">{p.contractor || "None"}</p></div>
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Expected Yield</span><p className="font-medium">{p.expectedYieldKg?.toLocaleString() || "—"} kg</p></div>
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Actual Yield</span><p className="font-medium">{p.actualYieldKg?.toLocaleString() || "—"} kg</p></div>
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Grade</span><p className="font-medium">{p.grade || "—"}</p></div>
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Bales</span><p className="font-medium">{p.numberOfBales || "—"}</p></div>
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Season</span><p className="font-medium">{p.marketingSeason || "—"}</p></div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Contract</span>
                <p><Badge variant={p.contractStatus === "Active" ? "default" : "secondary"} className="text-[10px] font-normal">{p.contractStatus || "None"}</Badge></p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Fuel Usage Registry */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Flame className="h-4 w-4 text-orange-600" />Fuel Usage Registry</h3>
        {fuelRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fuel records.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="text-left text-xs uppercase tracking-wider border-b">
                <th className="py-2 font-medium">Fuel Type</th>
                <th className="py-2 font-medium text-right">Quantity</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {fuelRecords.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="py-2">
                    <Badge variant={r.fuelType === "Wood Fuel" ? "destructive" : r.fuelType === "Coal" ? "secondary" : "outline"} className="text-[10px] font-normal">
                      {r.fuelType}
                    </Badge>
                  </td>
                  <td className="py-2 text-right tabular-nums">{r.quantity.toLocaleString()} {r.unit}</td>
                  <td className="py-2 text-xs text-muted-foreground">{format(new Date(r.dateUsed), "dd MMM yyyy")}</td>
                  <td className="py-2 text-xs text-muted-foreground">{r.source || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Woodlot Registry */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><TreePine className="h-4 w-4 text-green-600" />Woodlot Registry</h3>
        {woodlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No woodlots recorded.</p>
        ) : (
          <div className="space-y-3">
            {woodlots.map((w) => (
              <div key={w.id} className="rounded-md border border-border bg-muted/30 p-4 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs text-muted-foreground">{w.woodlotCode}</p>
                  <Badge variant="outline" className="text-[10px] font-normal">{w.treeSpecies}</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <p><span className="text-muted-foreground">Area:</span> <span className="font-medium">{w.areaHa} ha</span></p>
                  <p><span className="text-muted-foreground">Planted:</span> <span className="font-medium">{w.treesPlanted.toLocaleString()}</span></p>
                  <p><span className="text-muted-foreground">Surviving:</span> <span className="font-medium">{w.treesSurviving.toLocaleString()} ({Math.round((w.treesSurviving / w.treesPlanted) * 100)}%)</span></p>
                  <p><span className="text-muted-foreground">Planted:</span> <span className="font-medium">{format(new Date(w.plantingDate), "dd MMM yyyy")}</span></p>
                  {w.estimatedFuelYieldTonnes && <p><span className="text-muted-foreground">Est. Yield:</span> <span className="font-medium">{w.estimatedFuelYieldTonnes} t</span></p>}
                  {w.verifier && <p><span className="text-muted-foreground">Verified by:</span> <span className="font-medium">{w.verifier}</span></p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Labour Compliance */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Shield className="h-4 w-4 text-blue-600" />Labour Compliance</h3>
        {labour ? (
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Permanent</span><p className="font-medium">{labour.permanentWorkers}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Seasonal</span><p className="font-medium">{labour.seasonalWorkers}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Youth</span><p className="font-medium">{labour.youthWorkers}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">PPE</span><p><Badge variant={labour.ppeAvailable ? "default" : "destructive"} className="text-[10px] font-normal">{labour.ppeAvailable ? "Available" : "Missing"}</Badge></p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Declaration</span><p><Badge variant={labour.labourDeclarationSigned ? "default" : "destructive"} className="text-[10px] font-normal">{labour.labourDeclarationSigned ? "Signed" : "Not Signed"}</Badge></p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span><p><ComplianceBadge status={labour.complianceStatus} /></p></div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No labour compliance record.</p>
        )}
      </Card>

      {/* Child Labour Safeguards */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3"><Baby className="h-4 w-4 text-rose-600" />Child Labour Safeguards</h3>
        {childLabour ? (
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Risk Level</span><p><Badge variant={childLabour.childLabourRisk === "Low" ? "default" : childLabour.childLabourRisk === "Medium" ? "secondary" : "destructive"} className="text-[10px] font-normal">{childLabour.childLabourRisk}</Badge></p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Training</span><p><Badge variant={childLabour.trainingCompleted ? "default" : "destructive"} className="text-[10px] font-normal">{childLabour.trainingCompleted ? "Completed" : "Not Completed"}</Badge></p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span><p><ComplianceBadge status={childLabour.complianceStatus} /></p></div>
            {childLabour.followUpDate && <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Follow-up</span><p className="font-medium">{format(new Date(childLabour.followUpDate), "dd MMM yyyy")}</p></div>}
            {childLabour.comments && <div className="sm:col-span-2"><span className="text-xs text-muted-foreground uppercase tracking-wider">Notes</span><p className="text-xs text-muted-foreground">{childLabour.comments}</p></div>}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No child labour safeguard record.</p>
        )}
      </Card>

      {/* Sustainability Passport */}
      {passport && (
        <Card className="p-5 border-2 border-primary/20">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4"><FileText className="h-4 w-4 text-primary" />Sustainability Passport</h3>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Farmer ID</span><p className="font-mono text-xs">{passport.farmerCode}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Commodity</span><p className="font-medium">{passport.commodityType}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Primary Fuel</span><p className="font-medium">{passport.primaryFuelType}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Alt. Fuel %</span><p className="font-medium">{passport.alternativeFuelPercentage}%</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Trees Planted</span><p className="font-medium">{passport.totalTreesPlanted.toLocaleString()}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Trees Surviving</span><p className="font-medium">{passport.totalTreesSurviving.toLocaleString()}</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Woodlot Area</span><p className="font-medium">{passport.totalWoodlotAreaHa} ha</p></div>
            <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Rating</span><p><ComplianceBadge status={passport.scorecard?.overallRating || "Not Assessed"} /></p></div>
            {passport.lastVerificationDate && (
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Last Verified</span><p className="font-medium">{format(new Date(passport.lastVerificationDate), "dd MMM yyyy")}</p></div>
            )}
            {passport.verificationOfficer && (
              <div><span className="text-xs text-muted-foreground uppercase tracking-wider">Officer</span><p className="font-medium">{passport.verificationOfficer}</p></div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── RECEIPTS TAB ────────────────────────────────────────────────

function ReceiptsTab({ receipts }: { receipts: any[] }) {
  if (receipts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No receipts issued yet.</p>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {receipts.map((r: any) => (
        <Card key={r.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-xs text-foreground">{r.receiptNumber}</p>
              <p className="text-xs text-primary font-medium">Verification: {r.verificationCode}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(r.date), "dd MMM yyyy")} &middot; {r.items.length} item(s) &middot; {r.deliveryMethod}</p>
              {r.items.map((item: any, i: number) => (
                <p key={i} className="text-xs text-muted-foreground ml-2">
                  {item.inputName}: {item.quantity} {item.unit}
                </p>
              ))}
              {r.acknowledgementData && (
                <div className="mt-2 text-xs border-t pt-2">
                  <p className="text-muted-foreground">Acknowledged by {r.acknowledgementData.acknowledgedBy} via {r.acknowledgementData.acknowledgedVia}</p>
                </div>
              )}
            </div>
            <Badge className={r.status === "Acknowledged"
              ? "text-[10px] font-normal bg-green-50 text-green-700 border-green-200"
              : "text-[10px] font-normal bg-yellow-50 text-yellow-700 border-yellow-200"
            } variant="outline">
              {r.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────

function Detail({ icon: Icon, label, value, mono }: { icon: typeof IdCard; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3 w-3" />{label}
      </p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function ScoreGauge({ label, score, color, bg }: { label: string; score: number; color: string; bg: string }) {
  return (
    <div className={`rounded-lg p-4 ${bg}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{score}</p>
      <div className="mt-2 h-1.5 rounded-full bg-white/50 overflow-hidden">
        <div className={`h-full rounded-full ${color === "text-green-600" ? "bg-green-600" : color === "text-blue-600" ? "bg-blue-600" : "bg-amber-600"}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ComplianceBadge({ status }: { status: SustainabilityComplianceStatus }) {
  const cls = status === "Compliant"
    ? "bg-green-50 text-green-700 border-green-200"
    : status === "Partially Compliant"
    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
    : status === "High Risk"
    ? "bg-red-50 text-red-700 border-red-200"
    : "bg-gray-50 text-gray-700 border-gray-200";
  return <Badge variant="outline" className={`text-[10px] font-normal ${cls}`}>{status}</Badge>;
}

function getAllocationBadge(status: AllocationStatus) {
  switch (status) {
    case "pending": return <Badge variant="secondary" className="text-[10px] font-normal">Pending</Badge>;
    case "approved": return <Badge className="text-[10px] font-normal bg-primary/15 text-primary border-primary/20" variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case "collected": return <Badge className="text-[10px] font-normal bg-success/15 text-success border-success/20" variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Collected</Badge>;
    case "partially_collected": return <Badge variant="outline" className="text-[10px] font-normal">Partial</Badge>;
    case "cancelled": return <Badge variant="destructive" className="text-[10px] font-normal">Cancelled</Badge>;
    case "expired": return <Badge variant="secondary" className="text-[10px] font-normal">Expired</Badge>;
    default: return <Badge variant="secondary" className="text-[10px] font-normal">{status}</Badge>;
  }
}

function getComplianceColor(status: SustainabilityComplianceStatus): string {
  switch (status) {
    case "Compliant": return "text-green-600";
    case "Partially Compliant": return "text-yellow-600";
    case "High Risk": return "text-red-600";
    default: return "text-gray-600";
  }
}

function getComplianceBg(status: SustainabilityComplianceStatus): string {
  switch (status) {
    case "Compliant": return "bg-green-50 border border-green-200";
    case "Partially Compliant": return "bg-yellow-50 border border-yellow-200";
    case "High Risk": return "bg-red-50 border border-red-200";
    default: return "bg-gray-50";
  }
}

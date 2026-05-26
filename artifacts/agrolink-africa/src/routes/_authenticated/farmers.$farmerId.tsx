import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Printer, Sprout, MapPin, Phone, IdCard, Calendar, Wheat, PackageCheck, QrCode, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VulnerabilityTags } from "@/components/ui/vulnerability-tags";
import { AuditTimeline } from "@/components/ui/audit-timeline";
import { useFarmers } from "@/store/farmers";
import { useDistributions } from "@/store/distributions";
import { useWarehouses } from "@/store/warehouses";
import { useAuth } from "@/store/auth";
import { getProvince, getDistrict, getWard, getVillage } from "@/lib/zimbabwe-geo";
import { households, distributions, inputItems } from "@/lib/mock-data";
import { format } from "date-fns";
import type { AllocationStatus } from "@/types";

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
  const { allocations, getAllocationsByFarmer } = useDistributions();
  const { inputs, warehouses } = useWarehouses();
  const user = useAuth((s) => s.user);
  const hasPermission = useAuth((s) => s.hasPermission);
  
  if (!farmer) throw notFound();

  const household = households.find((h) => h.id === farmer.householdId);
  const farmerDistributions = distributions.filter((d) => d.farmerId === farmer.id);
  const farmerAllocations = getAllocationsByFarmer(farmer.id);
  const province = getProvince(farmer.provinceId);
  const district = getDistrict(farmer.districtId);
  const ward = getWard(farmer.wardId);
  const village = getVillage(farmer.villageId);
  // Compute age using year difference to avoid Date.now() during render (SSR-safe enough for demo).
  const birthYear = new Date(farmer.dob).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  const qrPayload = JSON.stringify({
    code: farmer.farmerCode,
    id: farmer.id,
    name: `${farmer.firstName} ${farmer.lastName}`,
    nid: farmer.nationalId,
    p: province?.code,
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
        {/* Profile */}
        <Card className="lg:col-span-2 p-6 space-y-6">
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
                {farmer.vulnerabilityTags && farmer.vulnerabilityTags.length > 0 && (
                  farmer.vulnerabilityTags.map((tag) => (
                    <Badge key={tag} variant="destructive" className="text-[10px] font-normal">{tag}</Badge>
                  ))
                )}
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
                {farmer.crops.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Livestock</h3>
              <div className="flex flex-wrap gap-1.5">
                {farmer.livestock.length ? farmer.livestock.map((l) => <Badge key={l} variant="outline">{l}</Badge>)
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
        </Card>

        {/* QR Card */}
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

          {farmerAllocations.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-3">Allocations</h3>
              <div className="space-y-4">
                {farmerAllocations.slice(0, 3).map((a) => {
                  const item = inputs.find((i) => i.id === a.inputId);
                  const wh = warehouses.find((w) => w.id === a.warehouseId);
                  return (
                    <div key={a.id} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{item?.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{a.allocationCode}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {a.quantity} {item?.unit} @ {wh?.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {getAllocationBadge(a.allocationStatus)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        Created: {format(new Date(a.createdAt), "dd MMM yyyy h:mm a")} · 
                        {a.createdBy && ` by ${a.createdBy}`}
                      </div>
                      {a.auditHistory && a.auditHistory.length > 0 && (
                        <div className="border-t pt-2">
                          <AuditTimeline entries={a.auditHistory} compact />
                        </div>
                      )}
                    </div>
                  );
                })}
                {farmerAllocations.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    +{farmerAllocations.length - 3} more allocations
                  </p>
                )}
              </div>
            </Card>
          )}

          {farmerDistributions.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-3">Distribution History</h3>
              <ul className="space-y-2">
                {farmerDistributions.slice(0, 5).map((d) => {
                  const item = inputItems.find((i) => i.id === d.inputId);
                  return (
                    <li key={d.id} className="flex items-start justify-between gap-2 text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item?.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{d.batchCode}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="tabular-nums text-xs">{d.quantity} {item?.unit}</p>
                        <Badge variant={d.status === "Verified" ? "default" : "outline"} className="text-[10px] mt-0.5">{d.status}</Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

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

function getAllocationBadge(status: AllocationStatus) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="text-[10px] font-normal">Pending</Badge>;
    case "approved":
      return <Badge className="text-[10px] font-normal bg-primary/15 text-primary border-primary/20" variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case "collected":
      return <Badge className="text-[10px] font-normal bg-success/15 text-success border-success/20" variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Collected</Badge>;
    case "partially_collected":
      return <Badge variant="outline" className="text-[10px] font-normal">Partial</Badge>;
    case "cancelled":
      return <Badge variant="destructive" className="text-[10px] font-normal">Cancelled</Badge>;
    case "expired":
      return <Badge variant="secondary" className="text-[10px] font-normal">Expired</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px] font-normal">{status}</Badge>;
  }
}

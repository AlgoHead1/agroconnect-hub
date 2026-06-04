import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
import { Search, FileText, QrCode, CheckCircle2, XCircle, ArrowRight, User } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFarmers } from "@/store/farmers";
import { usePrograms } from "@/store/programs";
import { useDistributions } from "@/store/distributions";
import { calculateEligibility, getEligibilityColor } from "@/lib/eligibility-rules";
import { getProvince, getDistrict, getWard, getVillage } from "@/lib/zimbabwe-geo";
import { format } from "date-fns";
import type { Receipt } from "@/types";

export const Route = createFileRoute("/_authenticated/lookup")({
  component: LookupPage,
});

function LookupPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Beneficiary Lookup"
        breadcrumb="Verification"
        description="Search beneficiaries by ID, national ID, or phone. Verify receipts by number or verification code."
      />
      <div className="p-6 space-y-6">
        <Tabs defaultValue="beneficiary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="beneficiary">Beneficiary Search</TabsTrigger>
            <TabsTrigger value="receipt">Receipt Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="beneficiary">
            <BeneficiarySearch />
          </TabsContent>

          <TabsContent value="receipt">
            <ReceiptVerification />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BeneficiarySearch() {
  const [q, setQ] = useState("");
  const farmers = useFarmers((s) => s.farmers);
  const searchBeneficiaries = useFarmers((s) => s.searchBeneficiaries);
  const allocations = useDistributions((s) => s.allocations);
  const { programs, getParticipationsByFarmer } = usePrograms();
  const { getReceiptsByFarmer } = usePrograms();

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return searchBeneficiaries(q);
  }, [q, searchBeneficiaries]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter Farmer ID, National ID, phone, village, or ward…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {results.length === 0 && q.trim() && (
        <Card className="p-8 text-center">
          <User className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No beneficiaries found matching "{q}"</p>
        </Card>
      )}

      <div className="space-y-3">
        {results.map((farmer) => {
          const eligibility = calculateEligibility(farmer);
          const province = getProvince(farmer.provinceId);
          const district = getDistrict(farmer.districtId);
          const ward = getWard(farmer.wardId);
          const village = getVillage(farmer.villageId);
          const participations = getParticipationsByFarmer(farmer.id);
          const farmerAllocations = allocations.filter((a) => a.farmerId === farmer.id);
          const latestAlloc = farmerAllocations.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

          return (
            <Card key={farmer.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                      {farmer.firstName[0]}{farmer.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <Link to="/farmers/$farmerId" params={{ farmerId: farmer.id }} className="font-medium text-foreground hover:text-primary">
                        {farmer.firstName} {farmer.lastName}
                      </Link>
                      <p className="text-xs font-mono text-muted-foreground">{farmer.farmerCode}</p>
                    </div>
                  </div>

                  <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">National ID</span>
                      <p className="font-mono text-xs">{farmer.nationalId}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Phone</span>
                      <p className="font-mono text-xs">{farmer.phone}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Location</span>
                      <p className="text-xs">
                        {province?.name} &middot; {district?.name}
                        {village && <span className="text-muted-foreground"> &middot; {village.name}</span>}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Eligibility</span>
                      <p className={`text-xs font-medium ${getEligibilityColor(eligibility.status)}`}>
                        {eligibility.status} ({eligibility.score})
                      </p>
                    </div>
                  </div>

                  {participations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider mr-1 self-center">Programs:</span>
                      {participations.slice(0, 3).map((p) => (
                        <Badge key={p.id} variant="secondary" className="text-[10px] font-normal">
                          {p.programCode} — {p.programName}
                        </Badge>
                      ))}
                      {participations.length > 3 && (
                        <Badge variant="outline" className="text-[10px] font-normal">+{participations.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground uppercase tracking-wider">Latest allocation:</span>
                    {latestAlloc ? (
                      <Badge variant="secondary" className="text-[10px] font-normal">{latestAlloc.allocationStatus}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild>
                  <Link to="/farmers/$farmerId" params={{ farmerId: farmer.id }}>
                    Open <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ReceiptVerification() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const { receipts, getReceiptByVerificationCode, getReceiptByNumber, searchReceipts } = usePrograms();
  const farmers = useFarmers((s) => s.farmers);
  const allocations = useDistributions((s) => s.allocations);

  const foundReceipt = useMemo(() => {
    if (!query.trim()) return null;
    const trimmed = query.trim();
    // Try verification code first (RCPT-XXXXX format)
    if (trimmed.toUpperCase().startsWith("RCPT-")) {
      return getReceiptByVerificationCode(trimmed);
    }
    // Try receipt number (RCP-YYYY-XXXXXX format)
    if (trimmed.toUpperCase().startsWith("RCP-")) {
      return getReceiptByNumber(trimmed);
    }
    // General search
    const results = searchReceipts(trimmed);
    return results[0] || null;
  }, [query, getReceiptByVerificationCode, getReceiptByNumber, searchReceipts]);

  const handleSearch = useCallback(() => {
    setSearched(true);
  }, []);

  const beneficiary = foundReceipt ? farmers.find((f) => f.id === foundReceipt.beneficiaryId) : null;
  const allocation = foundReceipt ? allocations.find((a) => a.farmerId === foundReceipt.beneficiaryId) : null;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter Receipt Number (RCP-2026-000001) or Verification Code (RCPT-8F29X)"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
              className="pl-9"
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            />
          </div>
          <Button onClick={handleSearch}>Verify</Button>
        </div>
      </Card>

      {searched && !foundReceipt && query.trim() && (
        <Card className="p-8 text-center">
          <XCircle className="h-8 w-8 mx-auto text-destructive/50 mb-2" />
          <p className="text-sm font-medium text-foreground">Receipt not found</p>
          <p className="text-xs text-muted-foreground mt-1">Check the receipt number or verification code and try again.</p>
        </Card>
      )}

      {foundReceipt && (
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                Receipt Verified
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Receipt details confirmed</p>
            </div>
            <Badge className={foundReceipt.status === "Acknowledged"
              ? "text-[10px] font-normal bg-green-50 text-green-700 border-green-200"
              : "text-[10px] font-normal bg-yellow-50 text-yellow-700 border-yellow-200"
            } variant="outline">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {foundReceipt.status}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
            <ReceiptField label="Receipt Number" value={foundReceipt.receiptNumber} mono />
            <ReceiptField label="Verification Code" value={foundReceipt.verificationCode} mono highlight />
            <ReceiptField label="Issue Date" value={format(new Date(foundReceipt.date), "dd MMM yyyy")} />
            <ReceiptField label="Delivery Method" value={foundReceipt.deliveryMethod} />
          </div>

          {beneficiary && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Beneficiary</p>
              <Link to="/farmers/$farmerId" params={{ farmerId: beneficiary.id }} className="text-sm font-medium text-primary hover:underline">
                {beneficiary.firstName} {beneficiary.lastName}
              </Link>
              <p className="text-xs font-mono text-muted-foreground">{beneficiary.farmerCode}</p>
              <p className="text-xs text-muted-foreground">{getProvince(beneficiary.provinceId)?.name} &middot; {getDistrict(beneficiary.districtId)?.name}</p>
            </div>
          )}

          {foundReceipt.items && foundReceipt.items.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Items</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                    <th className="py-2 text-left font-medium">Input</th>
                    <th className="py-2 text-right font-medium">Quantity</th>
                    <th className="py-2 text-right font-medium">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {foundReceipt.items.map((item, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-2 text-foreground">{item.inputName}</td>
                      <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                      <td className="py-2 text-right text-muted-foreground">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {foundReceipt.acknowledgementData && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Acknowledgement</p>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Acknowledged by:</span> {foundReceipt.acknowledgementData.acknowledgedBy}</p>
                <p><span className="text-muted-foreground">Via:</span> {foundReceipt.acknowledgementData.acknowledgedVia}</p>
                <p><span className="text-muted-foreground">At:</span> {format(new Date(foundReceipt.acknowledgementData.acknowledgedAt), "dd MMM yyyy hh:mm a")}</p>
                {foundReceipt.acknowledgementData.message && (
                  <p className="italic text-muted-foreground">"{foundReceipt.acknowledgementData.message}"</p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function ReceiptField({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`mt-0.5 text-sm ${mono ? "font-mono" : ""} ${highlight ? "font-semibold text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

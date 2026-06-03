import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Plus, Search, PackageCheck, ShieldCheck, Clock, CircleCheck as CheckCircle2, QrCode, Calendar, User, MapPin, Truck, TriangleAlert as AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuditTimeline } from "@/components/ui/audit-timeline";
import { AccountabilityCard } from "@/components/ui/accountability-card";
import { RoleAccountabilityView } from "@/components/app/role-accountability-view";
import { KpiCard } from "@/components/app/kpi-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useDistributions } from "@/store/distributions";
import { useFarmers } from "@/store/farmers";
import { useWarehouses } from "@/store/warehouses";
import { useAuth } from "@/store/auth";
import { useHouseholds } from "@/store/households";
import { usePrograms } from "@/store/programs";
import { format } from "date-fns";
import type { Allocation, AllocationStatus } from "@/types";
import { HierarchicalSelector, type HierarchicalSelection } from "@/components/forms/hierarchical-selector";

export const Route = createFileRoute("/_authenticated/distributions")({
  component: DistributionsPage,
});

function DistributionsPage() {
  const { distributions, addDistribution, verify, allocations, createAllocation, approveAllocation, confirmCollection, distributeAllocation, cancelAllocation, getAuditHistory } = useDistributions();
  const farmers = useFarmers((s) => s.farmers);
  const households = useHouseholds((s) => s.households);
  const { inputs, warehouses } = useWarehouses();
  const user = useAuth((s) => s.user);
  const hasPermission = useAuth((s) => s.hasPermission);

  const [activeTab, setActiveTab] = useState("allocations");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [whFilter, setWhFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [allocationOpen, setAllocationOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchicalSelection>({});
  const [showHierarchyFilter, setShowHierarchyFilter] = useState(false);

  // Filter distributions
  const filteredDistributions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return distributions.filter((d) => {
      if (status !== "all" && d.status !== status) return false;
      if (whFilter !== "all" && d.warehouseId !== whFilter) return false;
      if (!needle) return true;
      const f = farmers.find((x) => x.id === d.farmerId);
      return (
        d.batchCode.toLowerCase().includes(needle) ||
        (f && (`${f.firstName} ${f.lastName}`.toLowerCase().includes(needle) || f.farmerCode.toLowerCase().includes(needle)))
      );
    });
  }, [distributions, farmers, q, status, whFilter]);

  // Filter allocations with hierarchical filters
  const filteredAllocations = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allocations.filter((a) => {
      if (status !== "all" && a.allocationStatus !== status) return false;
      if (whFilter !== "all" && a.warehouseId !== whFilter) return false;
      
      // Hierarchical filters
      if (hierarchyFilter.provinceId) {
        const f = farmers.find((x) => x.id === a.farmerId);
        if (!f || f.provinceId !== hierarchyFilter.provinceId) return false;
      }
      if (hierarchyFilter.districtId) {
        const f = farmers.find((x) => x.id === a.farmerId);
        if (!f || f.districtId !== hierarchyFilter.districtId) return false;
      }
      if (hierarchyFilter.wardId) {
        const f = farmers.find((x) => x.id === a.farmerId);
        if (!f || f.wardId !== hierarchyFilter.wardId) return false;
      }
      if (hierarchyFilter.villageId) {
        const f = farmers.find((x) => x.id === a.farmerId);
        if (!f || f.villageId !== hierarchyFilter.villageId) return false;
      }
      if (hierarchyFilter.householdId && a.householdId !== hierarchyFilter.householdId) return false;
      if (hierarchyFilter.farmerId && a.farmerId !== hierarchyFilter.farmerId) return false;
      
      if (!needle) return true;
      const f = farmers.find((x) => x.id === a.farmerId);
      return (
        a.allocationCode.toLowerCase().includes(needle) ||
        (f && (`${f.firstName} ${f.lastName}`.toLowerCase().includes(needle) || f.farmerCode.toLowerCase().includes(needle)))
      );
    });
  }, [allocations, farmers, q, status, whFilter, hierarchyFilter]);

  const pendingDist = distributions.filter((d) => d.status === "Pending").length;
  const issuedDist = distributions.filter((d) => d.status === "Issued").length;
  const verifiedDist = distributions.filter((d) => d.status === "Verified").length;
  const totalUnits = distributions.reduce((s, d) => s + d.quantity, 0);

  const pendingAlloc = allocations.filter((a) => a.allocationStatus === "pending").length;
  const approvedAlloc = allocations.filter((a) => a.allocationStatus === "approved").length;
  const collectedAlloc = allocations.filter((a) => a.allocationStatus === "collected").length;
  const totalAllocUnits = allocations.reduce((s, a) => s + a.quantity, 0);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Input Distributions & Allocations"
        breadcrumb="Operations"
        description="Allocate, issue and verify agricultural inputs to registered farmers."
        actions={
          <div className="flex gap-2">
            {activeTab === "allocations" && hasPermission("distributions:create") && (
              <Dialog open={allocationOpen} onOpenChange={setAllocationOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-1.5" />New Allocation</Button>
                </DialogTrigger>
                <NewAllocationDialog onCreate={(data) => { createAllocation(data); setAllocationOpen(false); toast.success("Allocation created"); }} />
              </Dialog>
            )}
            {activeTab === "distributions" && hasPermission("distributions:create") && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-1.5" />New distribution</Button>
                </DialogTrigger>
                <NewDistributionDialog onCreate={(data) => { addDistribution(data); setOpen(false); toast.success("Distribution issued"); }} />
              </Dialog>
            )}
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><QrCode className="h-4 w-4 mr-1.5" />Verify by code</Button>
              </DialogTrigger>
              <VerifyDialog onVerify={(id) => { verify(id); setVerifyOpen(false); toast.success("Distribution verified"); }} />
            </Dialog>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="allocations">Allocations ({allocations.length})</TabsTrigger>
            <TabsTrigger value="distributions">Distributions ({distributions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="allocations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-5">
              <KpiCard label="Total Allocations" value={allocations.length.toLocaleString()} icon={PackageCheck} hint={`${totalAllocUnits.toLocaleString()} units`} />
              <KpiCard label="Pending" value={pendingAlloc} icon={Clock} tone="warning" />
              <KpiCard label="Approved" value={approvedAlloc} icon={ShieldCheck} tone="primary" />
              <KpiCard label="Collected" value={collectedAlloc} icon={CheckCircle2} tone="success" />
              {user && (
                <RoleAccountabilityView allocations={allocations} userRole={user.role} />
              )}
            </div>

            <Card className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by allocation code, farmer name or code…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="collected">Collected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={whFilter} onValueChange={setWhFilter}>
                    <SelectTrigger className="w-full lg:w-56"><SelectValue placeholder="Warehouse" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All warehouses</SelectItem>
                      {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setShowHierarchyFilter(!showHierarchyFilter)}>
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {showHierarchyFilter ? "Hide" : "Location Filters"}
                  </Button>
                  {(Object.values(hierarchyFilter).some(v => v)) && (
                    <Button variant="ghost" size="sm" onClick={() => setHierarchyFilter({})}>
                      Clear filters
                    </Button>
                  )}
                </div>
                {showHierarchyFilter && (
                  <div className="border-t pt-4">
                    <HierarchicalSelector
                      selection={hierarchyFilter}
                      onChange={setHierarchyFilter}
                      showFarmer={true}
                      showHousehold={false}
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr className="text-left text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 font-medium">Allocation Code</th>
                      <th className="px-5 py-3 font-medium">Farmer</th>
                      <th className="px-5 py-3 font-medium">Input</th>
                      <th className="px-5 py-3 font-medium text-right">Quantity</th>
                      <th className="px-5 py-3 font-medium">Collection Date</th>
                      <th className="px-5 py-3 font-medium">Warehouse</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAllocations.length === 0 ? (
                      <tr><td colSpan={8} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <PackageCheck className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">No allocations found</p>
                          <p className="text-xs text-muted-foreground/70">Create your first allocation to assign inputs to farmers</p>
                          {hasPermission("distributions:create") && (
                            <Button size="sm" onClick={() => setAllocationOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Create Allocation</Button>
                          )}
                        </div>
                      </td></tr>
                    ) : filteredAllocations.slice(0, 50).map((a) => {
                      const f = farmers.find((x) => x.id === a.farmerId);
                      const inp = inputs.find((i) => i.id === a.inputId);
                      const wh = warehouses.find((w) => w.id === a.warehouseId);
                      return (
                        <tr key={a.id} className="border-t border-border hover:bg-muted/40">
                          <td className="px-5 py-3 font-mono text-xs text-primary">{a.allocationCode}</td>
                          <td className="px-5 py-3">
                            {f ? (
                              <Link to="/farmers/$farmerId" params={{ farmerId: f.id }} className="font-medium text-foreground hover:underline">
                                {f.firstName} {f.lastName}
                              </Link>
                            ) : "—"}
                            {f && <p className="text-xs font-mono text-muted-foreground">{f.farmerCode}</p>}
                          </td>
                          <td className="px-5 py-3 text-foreground">{inp?.name}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{a.quantity} {inp?.unit}</td>
                          <td className="px-5 py-3 text-muted-foreground">{format(new Date(a.collectionDate), "dd MMM yyyy")}</td>
                          <td className="px-5 py-3 text-muted-foreground text-xs">{wh?.name}</td>
                          <td className="px-5 py-3">
                            {getAllocationBadge(a.allocationStatus)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="ghost" onClick={() => { setSelectedAllocation(a); setQrOpen(true); }}>
                                <QrCode className="h-3.5 w-3.5" />
                              </Button>
                              {a.allocationStatus === "pending" && hasPermission("distributions:approve") && (
                                <Button size="sm" variant="ghost" onClick={() => { approveAllocation(a.id, user?.id || "system"); toast.success("Allocation approved"); }}>
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve
                                </Button>
                              )}
                              {a.allocationStatus === "approved" && hasPermission("distributions:verify") && (
                                <Button size="sm" variant="ghost" onClick={() => { distributeAllocation(a.id, user?.id || "system"); toast.success("Allocation distributed"); }}>
                                  <Truck className="h-3.5 w-3.5 mr-1" />Distribute
                                </Button>
                              )}
                              {a.allocationStatus === "distributed" && hasPermission("distributions:verify") && (
                                <Button size="sm" variant="ghost" onClick={() => { confirmCollection(a.id, user?.id || "system"); toast.success("Collection confirmed"); }}>
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Collect
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredAllocations.length > 50 && (
                <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                  Showing 50 of {filteredAllocations.length.toLocaleString()} — refine filters to narrow results.
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="distributions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <KpiCard label="Total distributions" value={distributions.length.toLocaleString()} icon={PackageCheck} hint={`${totalUnits.toLocaleString()} units`} />
              <KpiCard label="Pending" value={pendingDist} icon={Clock} tone="warning" />
              <KpiCard label="Issued" value={issuedDist} icon={PackageCheck} tone="primary" />
              <KpiCard label="Verified" value={verifiedDist} icon={ShieldCheck} tone="success" />
            </div>

            <Card className="p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by batch code, farmer name or code…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Issued">Issued</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={whFilter} onValueChange={setWhFilter}>
                  <SelectTrigger className="w-full lg:w-56"><SelectValue placeholder="Warehouse" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All warehouses</SelectItem>
                    {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr className="text-left text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 font-medium">Batch</th>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Farmer</th>
                      <th className="px-5 py-3 font-medium">Input</th>
                      <th className="px-5 py-3 font-medium text-right">Quantity</th>
                      <th className="px-5 py-3 font-medium">Warehouse</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDistributions.length === 0 ? (
                      <tr><td colSpan={8} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <PackageCheck className="h-10 w-10 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">No distributions found</p>
                          <p className="text-xs text-muted-foreground/70">Issue your first distribution to deliver inputs to farmers</p>
                          {hasPermission("distributions:create") && (
                            <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Create Distribution</Button>
                          )}
                        </div>
                      </td></tr>
                    ) : filteredDistributions.slice(0, 50).map((d) => {
                      const f = farmers.find((x) => x.id === d.farmerId);
                      const inp = inputs.find((i) => i.id === d.inputId);
                      const wh = warehouses.find((w) => w.id === d.warehouseId);
                      return (
                        <tr key={d.id} className="border-t border-border hover:bg-muted/40">
                          <td className="px-5 py-3 font-mono text-xs text-primary">{d.batchCode}</td>
                          <td className="px-5 py-3 text-muted-foreground">{format(new Date(d.distributedAt), "dd MMM yyyy")}</td>
                          <td className="px-5 py-3">
                            {f ? (
                              <Link to="/farmers/$farmerId" params={{ farmerId: f.id }} className="font-medium text-foreground hover:underline">
                                {f.firstName} {f.lastName}
                              </Link>
                            ) : "—"}
                            {f && <p className="text-xs font-mono text-muted-foreground">{f.farmerCode}</p>}
                          </td>
                          <td className="px-5 py-3 text-foreground">{inp?.name}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{d.quantity} {inp?.unit}</td>
                          <td className="px-5 py-3 text-muted-foreground text-xs">{wh?.name}</td>
                          <td className="px-5 py-3">
                            {d.status === "Verified" ? (
                              <Badge className="text-[10px] font-normal bg-success/15 text-success border-success/20" variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>
                            ) : d.status === "Issued" ? (
                              <Badge className="text-[10px] font-normal" variant="default">Issued</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] font-normal">Pending</Badge>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            {d.status === "Issued" && (
                              <Button size="sm" variant="ghost" onClick={() => { verify(d.id); toast.success("Verified"); }}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Verify
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredDistributions.length > 50 && (
                <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                  Showing 50 of {filteredDistributions.length.toLocaleString()} — refine filters to narrow results.
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code & Audit Timeline Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Allocation Details & Audit Trail</DialogTitle>
            <DialogDescription>QR code, accountability info & complete workflow timeline</DialogDescription>
          </DialogHeader>
          {selectedAllocation && (
            <div className="space-y-6 py-4">
              {/* QR Code */}
              <div className="flex flex-col items-center space-y-3">
                <div className="w-40 h-40 bg-white border-2 border-border flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs font-mono text-muted-foreground">{selectedAllocation.allocationCode}</p>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">{selectedAllocation.allocationCode}</p>
                  <p className="text-xs text-muted-foreground">Status: <span className="capitalize font-medium">{selectedAllocation.allocationStatus}</span></p>
                </div>
              </div>

              {/* Accountability */}
              <AccountabilityCard allocation={selectedAllocation} compact={true} />

              {/* Audit Timeline */}
              {selectedAllocation.auditHistory && selectedAllocation.auditHistory.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">Complete Audit Timeline</h4>
                  <AuditTimeline entries={selectedAllocation.auditHistory} compact={false} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getAllocationBadge(status: AllocationStatus) {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="text-[10px] font-normal">Pending</Badge>;
    case "approved":
      return <Badge className="text-[10px] font-normal bg-primary/15 text-primary border-primary/20" variant="outline"><ShieldCheck className="h-3 w-3 mr-1" />Approved</Badge>;
    case "distributed":
      return <Badge className="text-[10px] font-normal bg-blue/15 text-blue border-blue/20" variant="outline"><Truck className="h-3 w-3 mr-1" />Distributed</Badge>;
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

function NewAllocationDialog({
  onCreate,
}: {
  onCreate: (d: Omit<Allocation, "id" | "allocationCode" | "allocationStatus" | "createdAt" | "qrCode">) => void;
}) {
  const { inputs, warehouses } = useWarehouses();
  const { programs, officers } = usePrograms();
  const user = useAuth((s) => s.user);

  const [hierarchy, setHierarchy] = useState<HierarchicalSelection>({});
  const [inputId, setInputId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [collectionDate, setCollectionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [programId, setProgramId] = useState("");
  const [officerId, setOfficerId] = useState("");

  const selectedInput = inputs.find((i) => i.id === inputId);

  const submit = () => {
    if (!hierarchy.farmerId || !inputId || !warehouseId || !collectionDate || quantity <= 0) {
      toast.error("Fill all required fields");
      return;
    }
    if (selectedInput && quantity > selectedInput.stockOnHand) {
      toast.error("Quantity exceeds available stock");
      return;
    }
    const selectedProgram = programId ? programs.find((p) => p.id === programId) : undefined;
    onCreate({
      farmerId: hierarchy.farmerId!,
      householdId: hierarchy.householdId,
      warehouseId,
      inputId,
      quantity,
      collectionDate: new Date(collectionDate).toISOString(),
      notes: notes || undefined,
      createdBy: user?.id || "system",
      programId: selectedProgram?.id,
      programName: selectedProgram?.programName,
      programCode: selectedProgram?.programCode,
      fundingSource: selectedProgram?.fundingSource,
      implementingPartner: selectedProgram?.implementingPartner,
      assignedOfficerId: officerId || undefined,
    });
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>New Allocation</DialogTitle>
        <DialogDescription>Create a new input allocation for a farmer. QR code will be generated automatically.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-2 max-h-[60vh] overflow-y-auto">
        <div className="grid gap-4">
          <Label className="text-sm font-semibold">Location & Farmer Selection</Label>
          <HierarchicalSelector
            selection={hierarchy}
            onChange={setHierarchy}
            showFarmer={true}
            showHousehold={true}
          />
        </div>
        <div className="grid gap-4 border-t pt-4">
          <div className="grid gap-1.5">
            <Label>Input</Label>
            <Select value={inputId} onValueChange={setInputId}>
              <SelectTrigger><SelectValue placeholder="Select input" /></SelectTrigger>
              <SelectContent>
                {inputs.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} ({i.stockOnHand.toLocaleString()} {i.unit} available)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Quantity {selectedInput && <span className="text-muted-foreground font-normal">({selectedInput.unit})</span>}</Label>
              <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Warehouse</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Collection Date</Label>
            <Input type="date" value={collectionDate} onChange={(e) => setCollectionDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="grid gap-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any additional notes..." rows={2} />
          </div>

          <div className="border-t pt-4 grid gap-4">
            <h4 className="text-sm font-semibold">Program Participation (Optional)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-sm">Program</Label>
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.programName} ({p.programCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-sm">Extension Officer</Label>
                <Select value={officerId} onValueChange={setOfficerId}>
                  <SelectTrigger><SelectValue placeholder="Select officer" /></SelectTrigger>
                  <SelectContent>
                    {officers.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter><Button onClick={submit}>Create Allocation</Button></DialogFooter>
    </DialogContent>
  );
}

function NewDistributionDialog({
  onCreate,
}: {
  onCreate: (d: { farmerId: string; inputId: string; quantity: number; warehouseId: string; officerId: string }) => void;
}) {
  const farmers = useFarmers((s) => s.farmers);
  const { inputs, warehouses } = useWarehouses();
  const [farmerId, setFarmerId] = useState("");
  const [inputId, setInputId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [farmerQ, setFarmerQ] = useState("");
  const [farmerIdDirect, setFarmerIdDirect] = useState("");

  const farmerOptions = useMemo(() => {
    const raw = (farmerQ || farmerIdDirect).trim();
    const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const needle = normalize(raw);
    return farmers.filter((f) => {
      if (!needle) return true;
      const fid = normalize(f.id);
      const fcode = normalize(f.farmerCode);
      const nid = normalize(f.nationalId || "");
      const fullname = `${f.firstName} ${f.lastName}`.toLowerCase();
      return (
        fid.includes(needle) ||
        fcode.includes(needle) ||
        nid.includes(needle) ||
        fullname.includes(raw.toLowerCase())
      );
    }).slice(0, 30);
  }, [farmers, farmerQ, farmerIdDirect]);

  // Auto-select matching farmer when a direct ID or national ID is entered
  useEffect(() => {
    const raw = (farmerIdDirect || "").trim();
    if (!raw) {
      // clear selection when direct field emptied
      setFarmerId("");
      setFarmerQ("");
      return;
    }
    const normalize = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
    const needle = normalize(raw);
    const match = farmers.find((f) => {
      const fid = normalize(f.id);
      const fcode = normalize(f.farmerCode);
      const nid = normalize(f.nationalId || "");
      return fid === needle || fcode === needle || nid === needle;
    });
    if (match) {
      setFarmerId(match.id);
      setFarmerQ(`${match.firstName} ${match.lastName} · ${match.farmerCode}`);
    }
  }, [farmerIdDirect, farmers, setFarmerId]);

  const selectedInput = inputs.find((i) => i.id === inputId);

  const submit = () => {
    const chosen = (farmerIdDirect || "").trim() ? (farmerIdDirect || "").trim() : farmerId;
    if (!chosen || !inputId || !warehouseId || quantity <= 0) { toast.error("Fill all fields"); return; }
    // validate farmer exists
    const matched = farmers.find((f) => f.id === chosen || f.farmerCode.toLowerCase() === chosen.toLowerCase());
    if (!matched) { toast.error("Farmer ID not found"); return; }
    if (selectedInput && quantity > selectedInput.stockOnHand) { toast.error("Quantity exceeds available stock"); return; }
    onCreate({ farmerId: matched.id, inputId, warehouseId, quantity, officerId: "current-user" });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>New distribution</DialogTitle>
        <DialogDescription>Issue an input to a registered farmer. Stock will be deducted automatically.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label>Farmer ID or Search (Zimbabwe ID accepted)</Label>
          <div className="flex gap-2">
            <Input value={farmerIdDirect} onChange={(e) => setFarmerIdDirect(e.target.value)} placeholder="Punch Farmer ID or National ID" className="font-mono w-48" />
            <Input value={farmerQ} onChange={(e) => setFarmerQ(e.target.value)} placeholder="Or search by name/code" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Format examples: farmer ID `f-123`, farmer code `FARM-ZW-000123`, or Zimbabwe national ID (e.g. <span className="font-mono">89-123456A</span> or <span className="font-mono">901234567A</span>).</p>
          <Select value={farmerId} onValueChange={setFarmerId}>
            <SelectTrigger><SelectValue placeholder="Select farmer" /></SelectTrigger>
            <SelectContent>
              {farmerOptions.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.firstName} {f.lastName} · {f.farmerCode}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Input</Label>
          <Select value={inputId} onValueChange={setInputId}>
            <SelectTrigger><SelectValue placeholder="Select input" /></SelectTrigger>
            <SelectContent>
              {inputs.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name} ({i.stockOnHand.toLocaleString()} {i.unit} available)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label>Quantity {selectedInput && <span className="text-muted-foreground font-normal">({selectedInput.unit})</span>}</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter><Button onClick={submit}>Issue distribution</Button></DialogFooter>
    </DialogContent>
  );
}

function VerifyDialog({ onVerify }: { onVerify: (id: string) => void }) {
  const { distributions, allocations } = useDistributions();
  const [code, setCode] = useState("");
  const [verifyType, setVerifyType] = useState<"distribution" | "allocation">("distribution");

  const submit = () => {
    if (verifyType === "distribution") {
      const match = distributions.find((d) => d.batchCode.toLowerCase() === code.trim().toLowerCase() || d.id === code.trim());
      if (!match) { toast.error("No distribution found for that code"); return; }
      if (match.status === "Verified") { toast.info("Already verified"); return; }
      onVerify(match.id);
    } else {
      const match = allocations.find((a) => a.allocationCode.toLowerCase() === code.trim().toLowerCase() || a.id === code.trim());
      if (!match) { toast.error("No allocation found for that code"); return; }
      if (match.allocationStatus === "collected") { toast.info("Already collected"); return; }
      toast.info("Allocation verification requires approval workflow");
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Verify distribution</DialogTitle>
        <DialogDescription>Enter a batch code (e.g. scanned from a QR receipt) to mark the distribution as verified.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label>Verification Type</Label>
          <Select value={verifyType} onValueChange={(v: any) => setVerifyType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="distribution">Distribution</SelectItem>
              <SelectItem value="allocation">Allocation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>{verifyType === "distribution" ? "Batch code" : "Allocation code"}</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={verifyType === "distribution" ? "BCH-2024-0001" : "ALLOC-ZW-000001"} />
        </div>
      </div>
      <DialogFooter><Button onClick={submit}><CheckCircle2 className="h-4 w-4 mr-1.5" />Verify</Button></DialogFooter>
    </DialogContent>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Minus, Warehouse as WhIcon, Package, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiCard } from "@/components/app/kpi-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useWarehouses } from "@/store/warehouses";
import { getDistrict, getProvince } from "@/lib/zimbabwe-geo";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/warehouses")({
  component: WarehousesPage,
});

function WarehousesPage() {
  const { warehouses, inputs, movements, recordMovement } = useWarehouses();
  const [selectedWh, setSelectedWh] = useState(warehouses[0]?.id ?? "");
  const [moveOpen, setMoveOpen] = useState(false);

  const totalStock = inputs.reduce((s, i) => s + i.stockOnHand, 0);
  const lowStock = inputs.filter((i) => i.stockOnHand < i.reorderLevel).length;
  const totalCapacity = warehouses.reduce((s, w) => s + w.capacityTons, 0);

  const filteredMovements = useMemo(
    () => movements.filter((m) => m.warehouseId === selectedWh).slice(0, 30),
    [movements, selectedWh],
  );

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Warehouse Management"
        breadcrumb="Operations"
        description="Manage depots, inventory levels, and stock movements across regional warehouses."
        actions={
          <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
            <DialogTrigger asChild>
              <Button><ArrowLeftRight className="h-4 w-4 mr-1.5" />Record movement</Button>
            </DialogTrigger>
            <StockMovementDialog
              defaultWarehouse={selectedWh}
              onSubmit={(data) => { recordMovement(data); setMoveOpen(false); toast.success(`Stock ${data.type} recorded`); }}
            />
          </Dialog>
        }
      />

      <div className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Warehouses" value={warehouses.length} icon={WhIcon} />
          <KpiCard label="Stock items" value={inputs.length} icon={Package} />
          <KpiCard label="Total units on hand" value={totalStock.toLocaleString()} icon={Package} tone="success" />
          <KpiCard label="Low-stock alerts" value={lowStock} hint={`of ${inputs.length} items`} icon={AlertTriangle} tone="warning" />
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
            <TabsTrigger value="movements">Stock movements</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Input</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium text-right">Stock on hand</th>
                    <th className="px-5 py-3 font-medium text-right">Reorder level</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inputs.map((i) => {
                    const low = i.stockOnHand < i.reorderLevel;
                    const pct = Math.min(100, (i.stockOnHand / (i.reorderLevel * 3)) * 100);
                    return (
                      <tr key={i.id} className="border-t border-border hover:bg-muted/40">
                        <td className="px-5 py-3 font-medium text-foreground">{i.name}</td>
                        <td className="px-5 py-3"><Badge variant="secondary" className="text-[10px] font-normal">{i.category}</Badge></td>
                        <td className="px-5 py-3 text-right tabular-nums">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 h-1.5 bg-muted rounded overflow-hidden">
                              <div className={`h-full ${low ? "bg-destructive" : "bg-success"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span>{i.stockOnHand.toLocaleString()} {i.unit}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{i.reorderLevel.toLocaleString()} {i.unit}</td>
                        <td className="px-5 py-3">
                          {low ? (
                            <Badge variant="destructive" className="text-[10px] font-normal"><AlertTriangle className="h-3 w-3 mr-1" />Low</Badge>
                          ) : (
                            <Badge className="text-[10px] font-normal bg-success/15 text-success border-success/20" variant="outline">In stock</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="warehouses">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {warehouses.map((w) => (
                <Card key={w.id} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{w.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getProvince(w.provinceId)?.name} · {getDistrict(w.districtId)?.name}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <WhIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wider">Capacity</p>
                      <p className="font-semibold text-foreground tabular-nums text-base">{w.capacityTons.toLocaleString()} t</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wider">Manager</p>
                      <p className="font-medium text-foreground text-sm">{w.manager}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    {movements.filter((m) => m.warehouseId === w.id).length} movements logged
                  </div>
                </Card>
              ))}
              <Card className="p-5 flex items-center justify-center text-center border-dashed">
                <div className="space-y-2">
                  <Plus className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Add warehouse</p>
                  <p className="text-xs text-muted-foreground/70">Available to Super Admin</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="movements">
            <Card className="p-4 mb-3 flex items-center gap-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Warehouse</Label>
              <Select value={selectedWh} onValueChange={setSelectedWh}>
                <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Card>
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Reference</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Input</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-16 text-center text-sm text-muted-foreground">No movements for this warehouse.</td></tr>
                  ) : filteredMovements.map((m) => {
                    const inp = inputs.find((i) => i.id === m.inputId);
                    return (
                      <tr key={m.id} className="border-t border-border hover:bg-muted/40">
                        <td className="px-5 py-3 font-mono text-xs text-primary">{m.reference}</td>
                        <td className="px-5 py-3 text-muted-foreground">{format(new Date(m.date), "dd MMM yyyy")}</td>
                        <td className="px-5 py-3 text-foreground">{inp?.name}</td>
                        <td className="px-5 py-3">
                          {m.type === "IN" ? (
                            <Badge className="text-[10px] font-normal bg-success/15 text-success border-success/20" variant="outline"><Plus className="h-3 w-3 mr-1" />IN</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] font-normal"><Minus className="h-3 w-3 mr-1" />{m.type}</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums font-medium">{m.quantity.toLocaleString()} {inp?.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StockMovementDialog({
  defaultWarehouse,
  onSubmit,
}: {
  defaultWarehouse: string;
  onSubmit: (data: { warehouseId: string; inputId: string; type: "IN" | "OUT"; quantity: number; reference?: string }) => void;
}) {
  const { warehouses, inputs } = useWarehouses();
  const [warehouseId, setWarehouseId] = useState(defaultWarehouse);
  const [inputId, setInputId] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState(100);

  const submit = () => {
    if (!warehouseId || !inputId || quantity <= 0) { toast.error("Fill all fields"); return; }
    onSubmit({ warehouseId, inputId, type, quantity });
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Record stock movement</DialogTitle></DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <Label>Warehouse</Label>
          <Select value={warehouseId} onValueChange={setWarehouseId}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Input item</Label>
          <Select value={inputId} onValueChange={setInputId}>
            <SelectTrigger><SelectValue placeholder="Select input" /></SelectTrigger>
            <SelectContent>{inputs.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "IN" | "OUT")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Stock IN</SelectItem>
                <SelectItem value="OUT">Stock OUT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Quantity</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} />
          </div>
        </div>
      </div>
      <DialogFooter><Button onClick={submit}>Record movement</Button></DialogFooter>
    </DialogContent>
  );
}

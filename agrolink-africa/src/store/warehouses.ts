import { create } from "zustand";
import type { Warehouse, InputItem, StockMovement } from "@/types";
import {
  warehouses as seedWarehouses,
  inputItems as seedInputs,
  stockMovements as seedMovements,
} from "@/lib/mock-data";

interface WarehousesState {
  warehouses: Warehouse[];
  inputs: InputItem[];
  movements: StockMovement[];
  recordMovement: (m: Omit<StockMovement, "id" | "date">) => StockMovement;
  getWarehouse: (id: string) => Warehouse | undefined;
  getInput: (id: string) => InputItem | undefined;
}

function pad(n: number, w: number) { return n.toString().padStart(w, "0"); }

export const useWarehouses = create<WarehousesState>((set, get) => ({
  warehouses: seedWarehouses,
  inputs: seedInputs,
  movements: seedMovements,
  recordMovement: (data) => {
    const next = get().movements.length + 1;
    const m: StockMovement = {
      ...data,
      id: `sm-${next}`,
      date: new Date().toISOString(),
      reference: data.reference ?? `MV-${pad(next, 5)}`,
    };
    const delta = data.type === "IN" ? data.quantity : -data.quantity;
    set({
      movements: [m, ...get().movements],
      inputs: get().inputs.map((i) =>
        i.id === data.inputId ? { ...i, stockOnHand: Math.max(0, i.stockOnHand + delta) } : i,
      ),
    });
    return m;
  },
  getWarehouse: (id) => get().warehouses.find((w) => w.id === id),
  getInput: (id) => get().inputs.find((i) => i.id === id),
}));

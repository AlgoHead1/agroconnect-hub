import { create } from "zustand";
import type { Distribution, Allocation, AllocationStatus, DistributionEvent, AllocationAuditEntry } from "@/types";
import { distributions as seedDistributions } from "@/lib/mock-data";
import { useWarehouses } from "./warehouses";

interface DistributionsState {
  distributions: Distribution[];
  allocations: Allocation[];
  events: DistributionEvent[];
  addDistribution: (d: Omit<Distribution, "id" | "batchCode" | "distributedAt" | "status">) => Distribution;
  verify: (id: string) => void;
  getById: (id: string) => Distribution | undefined;
  byFarmer: (farmerId: string) => Distribution[];
  // Allocation methods
  createAllocation: (data: Omit<Allocation, "id" | "allocationCode" | "allocationStatus" | "createdAt" | "auditHistory" | "qrCode">) => Allocation;
  approveAllocation: (id: string, userId: string) => void;
  distributeAllocation: (id: string, userId: string, notes?: string) => void;
  confirmCollection: (id: string, userId: string) => void;
  cancelAllocation: (id: string, userId: string) => void;
  getAllocationByCode: (code: string) => Allocation | undefined;
  getAllocationsByFarmer: (farmerId: string) => Allocation[];
  getAllocationsByWarehouse: (warehouseId: string) => Allocation[];
  getAuditHistory: (allocationId: string) => AllocationAuditEntry[];
}

function pad(n: number, w: number) { return n.toString().padStart(w, "0"); }

function generateQRCode(allocation: Allocation): string {
  // Encode allocation data as JSON string for QR code
  const qrData = JSON.stringify({
    id: allocation.id,
    code: allocation.allocationCode,
    farmerId: allocation.farmerId,
    warehouseId: allocation.warehouseId,
    status: allocation.allocationStatus,
  });
  return btoa(qrData); // Base64 encode for QR display
}

export const useDistributions = create<DistributionsState>((set, get) => ({
  distributions: seedDistributions,
  allocations: [],
  events: [],
  addDistribution: (data) => {
    const next = get().distributions.length + 1;
    const dist: Distribution = {
      ...data,
      id: `dist-${next}`,
      batchCode: `BCH-${new Date().getFullYear()}-${pad(next, 4)}`,
      status: "Issued",
      distributedAt: new Date().toISOString(),
    };
    // Deduct stock via warehouse store
    useWarehouses.getState().recordMovement({
      warehouseId: data.warehouseId,
      inputId: data.inputId,
      type: "OUT",
      quantity: data.quantity,
      reference: dist.batchCode,
    });
    set({ distributions: [dist, ...get().distributions] });
    return dist;
  },
  verify: (id) => {
    set({
      distributions: get().distributions.map((d) =>
        d.id === id ? { ...d, status: "Verified" } : d,
      ),
    });
  },
  getById: (id) => get().distributions.find((d) => d.id === id),
  byFarmer: (farmerId) => get().distributions.filter((d) => d.farmerId === farmerId),
  // Allocation methods
  createAllocation: (data) => {
    const next = get().allocations.length + 1;
    const allocation: Allocation = {
      ...data,
      id: `alloc-${next}`,
      allocationCode: `ALLOC-ZW-${pad(next, 6)}`,
      allocationStatus: "pending",
      createdAt: new Date().toISOString(),
      auditHistory: [{
        stage: "created",
        userId: data.createdBy,
        timestamp: new Date().toISOString(),
      }],
      qrCode: "", // Will be set after creation
    };
    allocation.qrCode = generateQRCode(allocation);
    
    // Record creation event
    const event: DistributionEvent = {
      id: `evt-${get().events.length + 1}`,
      allocationId: allocation.id,
      eventType: "created",
      timestamp: new Date().toISOString(),
      userId: data.createdBy,
    };
    
    set({ 
      allocations: [allocation, ...get().allocations],
      events: [event, ...get().events],
    });
    return allocation;
  },
  approveAllocation: (id, userId) => {
    const now = new Date().toISOString();
    set({
      allocations: get().allocations.map((a) => {
        if (a.id === id) {
          const updated = { ...a, allocationStatus: "approved" as AllocationStatus, approvedBy: userId, approvedAt: now };
          updated.auditHistory = [...(a.auditHistory || []), {
            stage: "approved",
            userId,
            timestamp: now,
          }];
          return updated;
        }
        return a;
      }),
      events: [
        {
          id: `evt-${get().events.length + 1}`,
          allocationId: id,
          eventType: "approved",
          timestamp: now,
          userId,
        },
        ...get().events,
      ],
    });
  },
  distributeAllocation: (id, userId, notes) => {
    const now = new Date().toISOString();
    set({
      allocations: get().allocations.map((a) => {
        if (a.id === id) {
          const updated = { ...a, allocationStatus: "distributed" as AllocationStatus, distributedBy: userId, distributedAt: now };
          updated.auditHistory = [...(a.auditHistory || []), {
            stage: "distributed",
            userId,
            timestamp: now,
            notes,
          }];
          return updated;
        }
        return a;
      }),
      events: [
        {
          id: `evt-${get().events.length + 1}`,
          allocationId: id,
          eventType: "distributed",
          timestamp: now,
          userId,
          notes,
        },
        ...get().events,
      ],
    });
  },
  confirmCollection: (id, userId) => {
    const allocation = get().allocations.find((a) => a.id === id);
    if (!allocation) return;
    
    const now = new Date().toISOString();
    
    // Deduct stock via warehouse store
    useWarehouses.getState().recordMovement({
      warehouseId: allocation.warehouseId,
      inputId: allocation.inputId,
      type: "OUT",
      quantity: allocation.quantity,
      reference: allocation.allocationCode,
    });
    
    set({
      allocations: get().allocations.map((a) => {
        if (a.id === id) {
          const updated = { ...a, allocationStatus: "collected" as AllocationStatus, collectedAt: now, collectedBy: userId };
          updated.auditHistory = [...(a.auditHistory || []), {
            stage: "collected",
            userId,
            timestamp: now,
          }];
          return updated;
        }
        return a;
      }),
      events: [
        {
          id: `evt-${get().events.length + 1}`,
          allocationId: id,
          eventType: "collected",
          timestamp: now,
          userId,
        },
        ...get().events,
      ],
    });
  },
  cancelAllocation: (id, userId) => {
    const now = new Date().toISOString();
    set({
      allocations: get().allocations.map((a) => {
        if (a.id === id) {
          const updated = { ...a, allocationStatus: "cancelled" as AllocationStatus };
          updated.auditHistory = [...(a.auditHistory || []), {
            stage: "cancelled",
            userId,
            timestamp: now,
          }];
          return updated;
        }
        return a;
      }),
      events: [
        {
          id: `evt-${get().events.length + 1}`,
          allocationId: id,
          eventType: "cancelled",
          timestamp: now,
          userId,
        },
        ...get().events,
      ],
    });
  },
  getAllocationByCode: (code) => get().allocations.find((a) => a.allocationCode === code),
  getAllocationsByFarmer: (farmerId) => get().allocations.filter((a) => a.farmerId === farmerId),
  getAllocationsByWarehouse: (warehouseId) => get().allocations.filter((a) => a.warehouseId === warehouseId),
  getAuditHistory: (allocationId) => {
    const alloc = get().allocations.find((a) => a.id === allocationId);
    return alloc?.auditHistory || [];
  },
}));

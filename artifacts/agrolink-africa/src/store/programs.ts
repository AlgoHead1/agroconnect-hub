import { create } from "zustand";
import type { Program, ProgramParticipation, Receipt, ReceiptAuditEntry, ExtensionOfficer } from "@/types";

interface ProgramsState {
  programs: Program[];
  participations: ProgramParticipation[];
  receipts: Receipt[];
  officers: ExtensionOfficer[];

  // Program methods
  addProgram: (p: Omit<Program, "id">) => Program;
  getProgram: (id: string) => Program | undefined;
  updateProgram: (id: string, updates: Partial<Program>) => void;

  // Participation methods
  enrollFarmer: (participation: Omit<ProgramParticipation, "id" | "enrolledDate">) => ProgramParticipation;
  updateParticipation: (id: string, updates: Partial<ProgramParticipation>) => void;
  getParticipationsByFarmer: (farmerId: string) => ProgramParticipation[];
  getParticipationsByProgram: (programId: string) => ProgramParticipation[];

  // Receipt methods
  createReceipt: (farmerId: string, items: any[], issuedBy: string) => Receipt;
  acknowledgeReceipt: (receiptId: string, acknowledgedBy: string, method: string, message?: string) => void;
  getReceiptsByFarmer: (farmerId: string) => Receipt[];
  getReceipt: (id: string) => Receipt | undefined;

  // Officer methods
  addOfficer: (officer: Omit<ExtensionOfficer, "id">) => ExtensionOfficer;
  getOfficer: (id: string) => ExtensionOfficer | undefined;
}

function pad(n: number, w: number) {
  return n.toString().padStart(w, "0");
}

export const usePrograms = create<ProgramsState>((set, get) => ({
  programs: [
    {
      id: "prog-1",
      programName: "Pfumvudza 2026",
      programCode: "PFUM-26",
      fundingSource: "Government",
      implementingPartner: "Ministry of Agriculture",
      startDate: new Date(2026, 0, 1).toISOString(),
      endDate: new Date(2026, 11, 31).toISOString(),
      season: "2026 Summer",
      status: "Active",
    },
    {
      id: "prog-2",
      programName: "Summer Inputs 2026",
      programCode: "SUM-26",
      fundingSource: "NGO",
      implementingPartner: "World Food Programme",
      startDate: new Date(2026, 0, 15).toISOString(),
      endDate: new Date(2026, 3, 30).toISOString(),
      season: "2026 Summer",
      status: "Active",
    },
    {
      id: "prog-3",
      programName: "Cotton Recovery Programme",
      programCode: "CRP-26",
      fundingSource: "International",
      implementingPartner: "FAO",
      startDate: new Date(2026, 3, 1).toISOString(),
      season: "2026",
      status: "Active",
    },
  ],
  participations: [],
  receipts: [],
  officers: [
    {
      id: "off-1",
      name: "John Mlambo",
      phone: "+263712345678",
      districtId: "dist-1",
      wardId: "ward-1",
    },
    {
      id: "off-2",
      name: "Mary Ndaba",
      phone: "+263712345679",
      districtId: "dist-2",
      wardId: "ward-5",
    },
  ],

  addProgram: (data) => {
    const program: Program = {
      ...data,
      id: `prog-${get().programs.length + 1}`,
    };
    set({ programs: [program, ...get().programs] });
    return program;
  },

  getProgram: (id) => get().programs.find((p) => p.id === id),

  updateProgram: (id, updates) => {
    set({
      programs: get().programs.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  },

  enrollFarmer: (data) => {
    const participation: ProgramParticipation = {
      ...data,
      id: `part-${get().participations.length + 1}`,
      enrolledDate: new Date().toISOString(),
    };
    set({ participations: [participation, ...get().participations] });
    return participation;
  },

  updateParticipation: (id, updates) => {
    set({
      participations: get().participations.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  },

  getParticipationsByFarmer: (farmerId) =>
    get().participations.filter((p) => p.farmerId === farmerId),

  getParticipationsByProgram: (programId) =>
    get().participations.filter((p) => p.programId === programId),

  createReceipt: (farmerId, items, issuedBy) => {
    const next = get().receipts.length + 1;
    const receipt: Receipt = {
      id: `rcpt-${next}`,
      receiptNumber: `RCP-${new Date().getFullYear()}-${pad(next, 6)}`,
      date: new Date().toISOString(),
      beneficiaryId: farmerId,
      items,
      issuedBy,
      deliveryMethod: "Print",
      estimatedTotalValue: items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0),
      status: "Pending",
      auditHistory: [
        {
          action: "created",
          userId: issuedBy,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };
    set({ receipts: [receipt, ...get().receipts] });
    return receipt;
  },

  acknowledgeReceipt: (receiptId, acknowledgedBy, method, message) => {
    const now = new Date().toISOString();
    set({
      receipts: get().receipts.map((r) => {
        if (r.id === receiptId) {
          const updated = { ...r, status: "Acknowledged" as const };
          updated.acknowledgementData = {
            acknowledgedBy,
            acknowledgedAt: now,
            acknowledgedVia: method as any,
            message,
          };
          updated.auditHistory = [
            ...(r.auditHistory || []),
            {
              action: "acknowledged",
              userId: acknowledgedBy,
              timestamp: now,
              notes: message,
            },
          ];
          return updated;
        }
        return r;
      }),
    });
  },

  getReceiptsByFarmer: (farmerId) => get().receipts.filter((r) => r.beneficiaryId === farmerId),

  getReceipt: (id) => get().receipts.find((r) => r.id === id),

  addOfficer: (data) => {
    const officer: ExtensionOfficer = {
      ...data,
      id: `off-${get().officers.length + 1}`,
    };
    set({ officers: [officer, ...get().officers] });
    return officer;
  },

  getOfficer: (id) => get().officers.find((o) => o.id === id),
}));

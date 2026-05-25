import { create } from "zustand";
import type { Farmer, VulnerabilityTag } from "@/types";
import { farmers as seedFarmers } from "@/lib/mock-data";

interface FarmersState {
  farmers: Farmer[];
  addFarmer: (f: Omit<Farmer, "id" | "farmerCode" | "registeredAt" | "registeredBy">) => Farmer;
  updateFarmer: (id: string, updates: Partial<Farmer>) => void;
  getById: (id: string) => Farmer | undefined;
  checkDuplicates: (nationalId: string, phone?: string, householdId?: string) => { isDuplicate: boolean; conflicts: string[]; matches?: Farmer[] };
  addVulnerabilityTag: (farmerId: string, tag: VulnerabilityTag) => void;
  removeVulnerabilityTag: (farmerId: string, tag: VulnerabilityTag) => void;
  setVulnerabilityTags: (farmerId: string, tags: VulnerabilityTag[]) => void;
}

function pad(n: number, w: number) { return n.toString().padStart(w, "0"); }

export const useFarmers = create<FarmersState>((set, get) => ({
  farmers: seedFarmers,
  addFarmer: (data) => {
    const next = get().farmers.length + 1;
    const farmer: Farmer = {
      ...data,
      id: `f-${next}`,
      farmerCode: `FARM-ZW-${pad(next, 6)}`,
      registeredAt: new Date().toISOString(),
      registeredBy: "current-user",
    };
    set({ farmers: [farmer, ...get().farmers] });
    return farmer;
  },
  updateFarmer: (id, updates) => {
    set({
      farmers: get().farmers.map((f) => f.id === id ? { ...f, ...updates } : f),
    });
  },
  getById: (id) => get().farmers.find((f) => f.id === id),
  checkDuplicates: (nationalId, phone, householdId) => {
    const conflicts: string[] = [];
    const matches: Farmer[] = [];
    const existing = get().farmers;
    
    // Check national ID
    const nationIdMatch = existing.find((f) => f.nationalId === nationalId);
    if (nationIdMatch) {
      conflicts.push("National ID already registered");
      matches.push(nationIdMatch);
    }
    
    // Check phone
    if (phone) {
      const phoneMatch = existing.find((f) => f.phone === phone);
      if (phoneMatch) {
        conflicts.push("Phone number already registered");
        if (!matches.includes(phoneMatch)) matches.push(phoneMatch);
      }
    }
    
    // Check household ID
    if (householdId) {
      const householdMatch = existing.find((f) => f.householdId === householdId);
      if (householdMatch) {
        conflicts.push("Farmer already linked to this household");
        if (!matches.includes(householdMatch)) matches.push(householdMatch);
      }
    }
    
    return {
      isDuplicate: conflicts.length > 0,
      conflicts,
      matches: matches.length > 0 ? matches : undefined,
    };
  },
  addVulnerabilityTag: (farmerId, tag) => {
    set({
      farmers: get().farmers.map((f) => {
        if (f.id === farmerId) {
          const tags = f.vulnerabilityTags || [];
          if (!tags.includes(tag)) {
            return { ...f, vulnerabilityTags: [...tags, tag] };
          }
        }
        return f;
      }),
    });
  },
  removeVulnerabilityTag: (farmerId, tag) => {
    set({
      farmers: get().farmers.map((f) => {
        if (f.id === farmerId) {
          const tags = f.vulnerabilityTags || [];
          return { ...f, vulnerabilityTags: tags.filter((t) => t !== tag) };
        }
        return f;
      }),
    });
  },
  setVulnerabilityTags: (farmerId, tags) => {
    set({
      farmers: get().farmers.map((f) => 
        f.id === farmerId ? { ...f, vulnerabilityTags: tags.length > 0 ? tags : undefined } : f
      ),
    });
  },
}));

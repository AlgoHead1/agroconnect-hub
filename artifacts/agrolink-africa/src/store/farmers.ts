import { create } from "zustand";
import type { Farmer, VulnerabilityTag } from "@/types";
import { farmers as seedFarmers } from "@/lib/mock-data";
import { getVillage, getWard } from "@/lib/zimbabwe-geo";

interface FarmersState {
  farmers: Farmer[];
  addFarmer: (f: Omit<Farmer, "id" | "farmerCode" | "registeredAt" | "registeredBy">) => Farmer;
  updateFarmer: (id: string, updates: Partial<Farmer>) => void;
  getById: (id: string) => Farmer | undefined;
  checkDuplicates: (nationalId: string, phone?: string, householdId?: string) => { isDuplicate: boolean; conflicts: string[]; matches?: Farmer[] };
  addVulnerabilityTag: (farmerId: string, tag: VulnerabilityTag) => void;
  removeVulnerabilityTag: (farmerId: string, tag: VulnerabilityTag) => void;
  setVulnerabilityTags: (farmerId: string, tags: VulnerabilityTag[]) => void;
  searchBeneficiaries: (query: string) => Farmer[];
  getFarmerByNationalId: (nationalId: string) => Farmer | undefined;
  getFarmerByPhone: (phone: string) => Farmer | undefined;
}

// Indexed lookup maps for O(1) access at scale (500k+, 1M+, 5M+)
const idIndex = new Map<string, Farmer>();
const nationalIdIndex = new Map<string, Farmer>();
const phoneIndex = new Map<string, Farmer>();

function indexFarmer(f: Farmer) {
  idIndex.set(f.id, f);
  nationalIdIndex.set(f.nationalId, f);
  phoneIndex.set(f.phone, f);
}

// Build initial indexes from seed data
seedFarmers.forEach(indexFarmer);

function pad(n: number, w: number) { return n.toString().padStart(w, "0"); }

let farmerSeq = seedFarmers.length;

export const useFarmers = create<FarmersState>((set, get) => ({
  farmers: seedFarmers,
  addFarmer: (data) => {
    farmerSeq += 1;
    const farmer: Farmer = {
      ...data,
      id: `f-${farmerSeq}`,
      farmerCode: `FARM-ZW-${pad(farmerSeq, 6)}`,
      registeredAt: new Date().toISOString(),
      registeredBy: "current-user",
    };
    indexFarmer(farmer);
    set({ farmers: [farmer, ...get().farmers] });
    return farmer;
  },
  updateFarmer: (id, updates) => {
    const updated = get().farmers.map((f) => f.id === id ? { ...f, ...updates } : f);
    const updatedFarmer = updated.find((f) => f.id === id);
    if (updatedFarmer) indexFarmer(updatedFarmer);
    set({ farmers: updated });
  },
  getById: (id) => idIndex.get(id),
  checkDuplicates: (nationalId, phone, householdId) => {
    const conflicts: string[] = [];
    const matches: Farmer[] = [];

    const nidMatch = nationalIdIndex.get(nationalId);
    if (nidMatch) {
      conflicts.push("National ID already registered");
      matches.push(nidMatch);
    }

    if (phone) {
      const phoneMatch = phoneIndex.get(phone);
      if (phoneMatch) {
        conflicts.push("Phone number already registered");
        if (!matches.includes(phoneMatch)) matches.push(phoneMatch);
      }
    }

    if (householdId) {
      const existing = get().farmers;
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
            const updated = { ...f, vulnerabilityTags: [...tags, tag] };
            indexFarmer(updated);
            return updated;
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
          const updated = { ...f, vulnerabilityTags: tags.filter((t) => t !== tag) };
          indexFarmer(updated);
          return updated;
        }
        return f;
      }),
    });
  },
  setVulnerabilityTags: (farmerId, tags) => {
    set({
      farmers: get().farmers.map((f) => {
        if (f.id === farmerId) {
          const updated = { ...f, vulnerabilityTags: tags.length > 0 ? tags : undefined };
          indexFarmer(updated);
          return updated;
        }
        return f;
      }),
    });
  },

  searchBeneficiaries: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    // O(1) index lookups first
    const byId = idIndex.get(q) || idIndex.get(`f-${q}`);
    if (byId) return [byId];

    const byNid = nationalIdIndex.get(q);
    if (byNid) return [byNid];

    const byPhone = phoneIndex.get(q);
    if (byPhone) return [byPhone];

    // Fallback to linear scan for partial matches
    return get().farmers.filter((f) => {
      const village = getVillage(f.villageId);
      const ward = getWard(f.wardId);
      return (
        f.farmerCode.toLowerCase().includes(q) ||
        f.nationalId.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.firstName.toLowerCase().includes(q) ||
        f.lastName.toLowerCase().includes(q) ||
        (village?.name.toLowerCase().includes(q)) ||
        (ward?.name.toLowerCase().includes(q))
      );
    }).slice(0, 30);
  },

  getFarmerByNationalId: (nationalId) => nationalIdIndex.get(nationalId.trim()),

  getFarmerByPhone: (phone) => phoneIndex.get(phone.trim()),
}));

import { create } from "zustand";
import type { Household, VulnerabilityTag } from "@/types";
import { households as seedHouseholds } from "@/lib/mock-data";

interface HouseholdsState {
  households: Household[];
  addHousehold: (h: Omit<Household, "id" | "householdCode" | "createdAt">) => Household;
  updateHousehold: (id: string, updates: Partial<Household>) => void;
  getById: (id: string) => Household | undefined;
  addVulnerabilityTag: (householdId: string, tag: VulnerabilityTag) => void;
  removeVulnerabilityTag: (householdId: string, tag: VulnerabilityTag) => void;
  setVulnerabilityTags: (householdId: string, tags: VulnerabilityTag[]) => void;
}

function pad(n: number, w: number) { return n.toString().padStart(w, "0"); }

export const useHouseholds = create<HouseholdsState>((set, get) => ({
  households: seedHouseholds,
  addHousehold: (data) => {
    const next = get().households.length + 1;
    const hh: Household = {
      ...data,
      id: `h-${next}`,
      householdCode: `HH-ZW-${pad(next, 5)}`,
      createdAt: new Date().toISOString(),
    };
    set({ households: [hh, ...get().households] });
    return hh;
  },
  updateHousehold: (id, updates) => {
    set({
      households: get().households.map((h) => h.id === id ? { ...h, ...updates } : h),
    });
  },
  getById: (id) => get().households.find((h) => h.id === id),
  addVulnerabilityTag: (householdId, tag) => {
    set({
      households: get().households.map((h) => {
        if (h.id === householdId) {
          const tags = h.vulnerabilityTags || [];
          if (!tags.includes(tag)) {
            return { ...h, vulnerabilityTags: [...tags, tag] };
          }
        }
        return h;
      }),
    });
  },
  removeVulnerabilityTag: (householdId, tag) => {
    set({
      households: get().households.map((h) => {
        if (h.id === householdId) {
          const tags = h.vulnerabilityTags || [];
          return { ...h, vulnerabilityTags: tags.filter((t) => t !== tag) };
        }
        return h;
      }),
    });
  },
  setVulnerabilityTags: (householdId, tags) => {
    set({
      households: get().households.map((h) => 
        h.id === householdId ? { ...h, vulnerabilityTags: tags.length > 0 ? tags : undefined } : h
      ),
    });
  },
}));

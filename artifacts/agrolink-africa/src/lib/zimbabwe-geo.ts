import type { Province, District, Ward, Village } from "@/types";

export const provinces: Province[] = [
  { id: "p-har", code: "HAR", name: "Harare" },
  { id: "p-byo", code: "BYO", name: "Bulawayo" },
  { id: "p-man", code: "MAN", name: "Manicaland" },
  { id: "p-mac", code: "MAC", name: "Mashonaland Central" },
  { id: "p-mae", code: "MAE", name: "Mashonaland East" },
  { id: "p-maw", code: "MAW", name: "Mashonaland West" },
  { id: "p-mac2", code: "MSC", name: "Masvingo" },
  { id: "p-mn", code: "MTN", name: "Matabeleland North" },
  { id: "p-ms", code: "MTS", name: "Matabeleland South" },
  { id: "p-mid", code: "MID", name: "Midlands" },
];

// Representative sample (NOT exhaustive — Phase 2 expands)
export const districts: District[] = [
  { id: "d-mut", provinceId: "p-man", name: "Mutare" },
  { id: "d-chip", provinceId: "p-man", name: "Chipinge" },
  { id: "d-mak", provinceId: "p-man", name: "Makoni" },
  { id: "d-bin", provinceId: "p-mac", name: "Bindura" },
  { id: "d-shg", provinceId: "p-mac", name: "Shamva" },
  { id: "d-mar", provinceId: "p-mae", name: "Marondera" },
  { id: "d-gor", provinceId: "p-mae", name: "Goromonzi" },
  { id: "d-chg", provinceId: "p-maw", name: "Chegutu" },
  { id: "d-kar", provinceId: "p-maw", name: "Kariba" },
  { id: "d-mas", provinceId: "p-mac2", name: "Masvingo" },
  { id: "d-chir", provinceId: "p-mac2", name: "Chiredzi" },
  { id: "d-gwe", provinceId: "p-mid", name: "Gweru" },
  { id: "d-kwe", provinceId: "p-mid", name: "Kwekwe" },
  { id: "d-hwa", provinceId: "p-mn", name: "Hwange" },
  { id: "d-byo", provinceId: "p-byo", name: "Bulawayo Urban" },
  { id: "d-har", provinceId: "p-har", name: "Harare Urban" },
  { id: "d-gwd", provinceId: "p-ms", name: "Gwanda" },
];

export const wards: Ward[] = districts.flatMap((d, di) =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `w-${d.id}-${i + 1}`,
    districtId: d.id,
    number: i + 1,
    name: `${d.name} Ward ${i + 1}`,
  })),
);

export const villages: Village[] = wards.flatMap((w) =>
  Array.from({ length: 3 }, (_, i) => ({
    id: `v-${w.id}-${i + 1}`,
    wardId: w.id,
    name: `${w.name.split(" Ward")[0]} Village ${w.number}-${String.fromCharCode(65 + i)}`,
  })),
);

export const getProvince = (id: string) => provinces.find((p) => p.id === id);
export const getDistrict = (id: string) => districts.find((d) => d.id === id);
export const getWard = (id: string) => wards.find((w) => w.id === id);
export const getVillage = (id: string) => villages.find((v) => v.id === id);

export const districtsByProvince = (pid: string) => districts.filter((d) => d.provinceId === pid);
export const wardsByDistrict = (did: string) => wards.filter((w) => w.districtId === did);
export const villagesByWard = (wid: string) => villages.filter((v) => v.wardId === wid);

// Helper functions for households and farmers filtering (to be used with stores)
export const householdsByVillage = (villageId: string, households: any[]) => 
  households.filter((h) => h.villageId === villageId);

export const farmersByHousehold = (householdId: string, farmers: any[]) => 
  farmers.filter((f) => f.householdId === householdId);

export const farmersByVillage = (villageId: string, farmers: any[]) => 
  farmers.filter((f) => f.villageId === villageId);

export const farmersByWard = (wardId: string, farmers: any[]) => 
  farmers.filter((f) => f.wardId === wardId);

export const farmersByDistrict = (districtId: string, farmers: any[]) => 
  farmers.filter((f) => f.districtId === districtId);

export const farmersByProvince = (provinceId: string, farmers: any[]) => 
  farmers.filter((f) => f.provinceId === provinceId);

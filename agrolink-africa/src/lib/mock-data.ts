import type {
  Farmer, Household, InputItem, Warehouse, Distribution, StockMovement,
  Crop, Livestock, Gender, VulnerabilityCategory, InputCategory,
  Allocation, AllocationStatus, DistributionEvent, VulnerabilityTag,
} from "@/types";
import { provinces, districts, wards, villages } from "./zimbabwe-geo";

// Deterministic PRNG for stable mock data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

const firstNamesM = ["Tendai","Tinashe","Farai","Tatenda","Blessing","Tafadzwa","Munashe","Simba","Takudzwa","Kudzai","Nyasha","Tawanda"];
const firstNamesF = ["Chipo","Rumbidzai","Tariro","Vimbai","Rutendo","Tsitsi","Memory","Nyaradzo","Shamiso","Anesu","Ruvarashe","Tanaka"];
const lastNames = ["Moyo","Ncube","Dube","Sibanda","Mhlanga","Chiweshe","Mukamuri","Chirwa","Marufu","Zvobgo","Mutasa","Gumbo","Mavhura","Madziva"];

const cropsAll: Crop[] = ["Maize","Tobacco","Cotton","Soybean","Sorghum","Wheat","Groundnut","Sunflower"];
const livestockAll: Livestock[] = ["Cattle","Goats","Sheep","Poultry","Pigs"];
const vulns: VulnerabilityCategory[] = ["None","None","None","Elderly","Child-headed","Disability","Widow","Chronically Ill"];
const vulnTags: Array<any> = [
  "Women-led household", "Elderly", "Youth", "Disabled", "Climate-affected", "Child-headed household",
];

function pickMany<T>(arr: T[], min: number, max: number): T[] {
  const n = Math.floor(rand() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function pad(n: number, w: number) { return n.toString().padStart(w, "0"); }

const NUM_HOUSEHOLDS = 120;
const NUM_FARMERS = 320;

export const households: Household[] = [];
export const farmers: Farmer[] = [];

for (let i = 0; i < NUM_FARMERS; i++) {
  const village = pick(villages);
  const ward = wards.find((w) => w.id === village.wardId)!;
  const district = districts.find((d) => d.id === ward.districtId)!;
  const gender: Gender = rand() < 0.45 ? "M" : "F";
  const first = pick(gender === "M" ? firstNamesM : firstNamesF);
  const last = pick(lastNames);
  const year = 1955 + Math.floor(rand() * 50);
  const tags = rand() < 0.25 ? pickMany(vulnTags, 1, 2) : [];
  farmers.push({
    id: `f-${i + 1}`,
    farmerCode: `FARM-ZW-${pad(i + 1, 6)}`,
    firstName: first,
    lastName: last,
    gender,
    dob: `${year}-${pad(Math.floor(rand() * 12) + 1, 2)}-${pad(Math.floor(rand() * 27) + 1, 2)}`,
    nationalId: `${pad(Math.floor(rand() * 99) + 1, 2)}-${pad(Math.floor(rand() * 999999), 6)}${String.fromCharCode(65 + Math.floor(rand()*26))}${pad(Math.floor(rand()*99),2)}`,
    phone: `+2637${Math.floor(rand() * 9) + 1}${pad(Math.floor(rand() * 9999999), 7)}`,
    provinceId: district.provinceId,
    districtId: district.id,
    wardId: ward.id,
    villageId: village.id,
    gpsLat: -17 - rand() * 5,
    gpsLng: 25 + rand() * 8,
    farmSizeHa: +(0.5 + rand() * 12).toFixed(2),
    crops: pickMany(cropsAll, 1, 3),
    livestock: rand() < 0.7 ? pickMany(livestockAll, 1, 3) : [],
    registeredAt: new Date(2024, Math.floor(rand() * 12), Math.floor(rand() * 27) + 1).toISOString(),
    registeredBy: "system",
    vulnerabilityTags: tags.length > 0 ? tags : undefined,
  });
}

for (let i = 0; i < NUM_HOUSEHOLDS; i++) {
  const head = farmers[Math.floor(rand() * farmers.length)];
  const tags = rand() < 0.3 ? pickMany(vulnTags, 1, 2) : [];
  const hh: Household = {
    id: `h-${i + 1}`,
    householdCode: `HH-ZW-${pad(i + 1, 5)}`,
    headFarmerId: head.id,
    memberCount: Math.floor(rand() * 9) + 2,
    vulnerabilityCategory: pick(vulns),
    villageId: head.villageId,
    wardId: head.wardId,
    districtId: head.districtId,
    provinceId: head.provinceId,
    createdAt: new Date(2024, Math.floor(rand() * 12), 1).toISOString(),
    vulnerabilityTags: tags.length > 0 ? tags : undefined,
  };
  households.push(hh);
  // assign nearby farmers (1-4) to this household
  const candidates = farmers.filter((f) => !f.householdId && f.villageId === head.villageId).slice(0, Math.floor(rand() * 4) + 1);
  candidates.forEach((f) => { f.householdId = hh.id; });
}

export const inputItems: InputItem[] = [
  { id: "i-1", name: "Maize Seed (Pioneer PHB 30G19)", category: "Seed", unit: "kg", stockOnHand: 12450, reorderLevel: 2000 },
  { id: "i-2", name: "Compound D Fertilizer", category: "Fertilizer", unit: "kg", stockOnHand: 84300, reorderLevel: 10000 },
  { id: "i-3", name: "Ammonium Nitrate", category: "Fertilizer", unit: "kg", stockOnHand: 56700, reorderLevel: 10000 },
  { id: "i-4", name: "Glyphosate Herbicide", category: "Chemicals", unit: "L", stockOnHand: 1840, reorderLevel: 500 },
  { id: "i-5", name: "Sorghum Seed (Macia)", category: "Seed", unit: "kg", stockOnHand: 3200, reorderLevel: 500 },
  { id: "i-6", name: "Stock Feed (Layers Mash)", category: "Feed", unit: "kg", stockOnHand: 9800, reorderLevel: 1500 },
  { id: "i-7", name: "Drip Irrigation Kit (0.5ha)", category: "Irrigation", unit: "kit", stockOnHand: 120, reorderLevel: 25 },
  { id: "i-8", name: "Cotton Seed (Quton)", category: "Seed", unit: "kg", stockOnHand: 4100, reorderLevel: 800 },
];

export const warehouses: Warehouse[] = [
  { id: "wh-1", name: "Harare Central Depot", provinceId: "p-har", districtId: "d-har", capacityTons: 2500, manager: "T. Marufu" },
  { id: "wh-2", name: "Bindura Regional", provinceId: "p-mac", districtId: "d-bin", capacityTons: 1200, manager: "R. Sibanda" },
  { id: "wh-3", name: "Mutare Regional", provinceId: "p-man", districtId: "d-mut", capacityTons: 1500, manager: "C. Mukamuri" },
  { id: "wh-4", name: "Gweru Distribution Hub", provinceId: "p-mid", districtId: "d-gwe", capacityTons: 1800, manager: "B. Ncube" },
  { id: "wh-5", name: "Masvingo Depot", provinceId: "p-mac2", districtId: "d-mas", capacityTons: 1000, manager: "F. Dube" },
];

export const distributions: Distribution[] = [];
for (let i = 0; i < 220; i++) {
  const f = farmers[Math.floor(rand() * farmers.length)];
  const inp = pick(inputItems);
  const wh = pick(warehouses);
  const statusRoll = rand();
  distributions.push({
    id: `dist-${i + 1}`,
    batchCode: `BCH-2024-${pad(Math.floor(rand() * 50) + 1, 4)}`,
    farmerId: f.id,
    inputId: inp.id,
    quantity: Math.floor(rand() * 50) + 5,
    warehouseId: wh.id,
    status: statusRoll < 0.15 ? "Pending" : statusRoll < 0.6 ? "Issued" : "Verified",
    distributedAt: new Date(2024, Math.floor(rand() * 12), Math.floor(rand() * 27) + 1).toISOString(),
    officerId: "off-1",
  });
}

export const stockMovements: StockMovement[] = [];
for (let i = 0; i < 80; i++) {
  const wh = pick(warehouses);
  const inp = pick(inputItems);
  stockMovements.push({
    id: `sm-${i + 1}`,
    warehouseId: wh.id,
    inputId: inp.id,
    type: rand() < 0.4 ? "IN" : "OUT",
    quantity: Math.floor(rand() * 2000) + 50,
    date: new Date(2024, Math.floor(rand() * 12), Math.floor(rand() * 27) + 1).toISOString(),
    reference: `MV-${pad(i + 1, 5)}`,
  });
}

export const CATEGORIES: InputCategory[] = ["Seed","Fertilizer","Chemicals","Feed","Irrigation"];

// Allocation mock data
export const allocations: Allocation[] = [];
export const allocationEvents: DistributionEvent[] = [];

// Generate realistic allocation data
for (let i = 1; i <= 50; i++) {
  const f = farmers[Math.floor(rand() * farmers.length)];
  const inp = pick(inputItems);
  const wh = pick(warehouses);
  const statusRoll = rand();
  let status: AllocationStatus = "pending";
  
  if (statusRoll < 0.25) status = "pending";
  else if (statusRoll < 0.5) status = "approved";
  else if (statusRoll < 0.75) status = "distributed";
  else if (statusRoll < 0.88) status = "collected";
  else if (statusRoll < 0.94) status = "cancelled";
  else status = "expired";
  
  const collectionDate = new Date(2024, Math.floor(rand() * 12), Math.floor(rand() * 27) + 1);
  const createdAt = new Date(collectionDate);
  createdAt.setDate(createdAt.getDate() - Math.floor(rand() * 14) - 1);
  
  // Build audit history
  const auditHistory: any[] = [
    { stage: "created", userId: "off-1", userName: "T. Marufu", userRole: "Officer", timestamp: createdAt.toISOString() }
  ];
  
  if (status !== "pending") {
    auditHistory.push({
      stage: "approved",
      userId: "off-2",
      userName: "R. Sibanda",
      userRole: "Manager",
      timestamp: new Date(createdAt.getTime() + 86400000).toISOString(),
      notes: "Approved for distribution"
    });
  }
  
  if (status === "distributed" || status === "collected" || status === "cancelled") {
    const distributedAt = new Date(createdAt.getTime() + 172800000);
    auditHistory.push({
      stage: "distributed",
      userId: "wh-1",
      userName: "T. Nkomo",
      userRole: "Warehouse Manager",
      timestamp: distributedAt.toISOString(),
      notes: "Ready for collection"
    });
  }
  
  if (status === "collected") {
    const collectedAt = new Date(createdAt.getTime() + 259200000);
    auditHistory.push({
      stage: "collected",
      userId: "wh-1",
      userName: "T. Nkomo",
      userRole: "Warehouse Manager",
      timestamp: collectedAt.toISOString(),
      notes: "Confirmed collection"
    });
  }
  
  if (status === "cancelled") {
    auditHistory.push({
      stage: "cancelled",
      userId: "off-1",
      userName: "T. Marufu",
      userRole: "Officer",
      timestamp: new Date(createdAt.getTime() + 172800000).toISOString(),
      notes: "Cancelled due to unavailability"
    });
  }
  
  const allocation: Allocation = {
    id: `alloc-${i}`,
    allocationCode: `ALLOC-ZW-${pad(i, 6)}`,
    farmerId: f.id,
    householdId: f.householdId,
    warehouseId: wh.id,
    inputId: inp.id,
    quantity: Math.floor(rand() * 50) + 5,
    collectionDate: collectionDate.toISOString(),
    allocationStatus: status,
    notes: status === "cancelled" ? "Cancelled due to unavailability" : undefined,
    createdBy: "off-1",
    createdAt: createdAt.toISOString(),
    approvedBy: status !== "pending" ? "off-2" : undefined,
    approvedAt: status !== "pending" ? new Date(createdAt.getTime() + 86400000).toISOString() : undefined,
    distributedBy: status === "distributed" || status === "collected" ? "wh-1" : undefined,
    distributedAt: status === "distributed" || status === "collected" ? new Date(createdAt.getTime() + 172800000).toISOString() : undefined,
    collectedAt: status === "collected" ? new Date(createdAt.getTime() + 259200000).toISOString() : undefined,
    collectedBy: status === "collected" ? "wh-1" : undefined,
    auditHistory: auditHistory,
    qrCode: "", // Will be generated by store
  };
  
  allocations.push(allocation);
  
  // Add events
  allocationEvents.push({
    id: `evt-${allocationEvents.length + 1}`,
    allocationId: allocation.id,
    eventType: "created",
    timestamp: allocation.createdAt,
    userId: allocation.createdBy,
  });
  
  if (allocation.approvedAt) {
    allocationEvents.push({
      id: `evt-${allocationEvents.length + 1}`,
      allocationId: allocation.id,
      eventType: "approved",
      timestamp: allocation.approvedAt,
      userId: allocation.approvedBy!,
    });
  }
  
  if (allocation.distributedAt) {
    allocationEvents.push({
      id: `evt-${allocationEvents.length + 1}`,
      allocationId: allocation.id,
      eventType: "distributed",
      timestamp: allocation.distributedAt,
      userId: allocation.distributedBy!,
    });
  }
  
  if (allocation.collectedAt) {
    allocationEvents.push({
      id: `evt-${allocationEvents.length + 1}`,
      allocationId: allocation.id,
      eventType: "collected",
      timestamp: allocation.collectedAt,
      userId: allocation.collectedBy!,
    });
  }
  
  if (status === "cancelled") {
    allocationEvents.push({
      id: `evt-${allocationEvents.length + 1}`,
      allocationId: allocation.id,
      eventType: "cancelled",
      timestamp: new Date(createdAt.getTime() + 172800000).toISOString(),
      userId: "off-1",
    });
  }
}

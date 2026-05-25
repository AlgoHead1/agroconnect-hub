export type UserRole =
  | "super_admin"
  | "national_admin"
  | "provincial_admin"
  | "district_officer"
  | "ward_officer"
  | "extension_officer"
  | "warehouse_manager"
  | "ngo_partner"
  | "supplier"
  | "farmer";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  province?: string;
  district?: string;
}

export interface Province { id: string; name: string; code: string; }
export interface District { id: string; name: string; provinceId: string; }
export interface Ward { id: string; name: string; number: number; districtId: string; }
export interface Village { id: string; name: string; wardId: string; }

export type Gender = "M" | "F" | "Other";
export type Crop = "Maize" | "Tobacco" | "Cotton" | "Soybean" | "Sorghum" | "Wheat" | "Groundnut" | "Sunflower";
export type Livestock = "Cattle" | "Goats" | "Sheep" | "Poultry" | "Pigs";
export type VulnerabilityCategory = "None" | "Elderly" | "Child-headed" | "Disability" | "Widow" | "Chronically Ill";
export type VulnerabilityTag =
  | "Women-led household"
  | "Elderly"
  | "Youth"
  | "Disabled"
  | "Climate-affected"
  | "Child-headed household";

export interface Farmer {
  id: string;
  farmerCode: string; // FARM-ZW-XXXXXX
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string; // ISO
  nationalId: string;
  phone: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  villageId: string;
  householdId?: string;
  gpsLat?: number;
  gpsLng?: number;
  farmSizeHa: number;
  crops: Crop[];
  livestock: Livestock[];
  vulnerabilityTags?: VulnerabilityTag[];
  profilePhotoUrl?: string;
  registeredAt: string;
  registeredBy: string;
}

export interface Household {
  id: string;
  householdCode: string;
  headFarmerId: string;
  memberCount: number;
  vulnerabilityCategory: VulnerabilityCategory;
  vulnerabilityTags?: VulnerabilityTag[];
  villageId: string;
  wardId: string;
  districtId: string;
  provinceId: string;
  addressNote?: string;
  createdAt: string;
}

export type InputCategory = "Seed" | "Fertilizer" | "Chemicals" | "Feed" | "Irrigation";

export interface InputItem {
  id: string;
  name: string;
  category: InputCategory;
  unit: string; // kg, L, bag, kit
  stockOnHand: number;
  reorderLevel: number;
}

export interface Warehouse {
  id: string;
  name: string;
  provinceId: string;
  districtId: string;
  capacityTons: number;
  manager: string;
}

export interface StockMovement {
  id: string;
  warehouseId: string;
  inputId: string;
  type: "IN" | "OUT" | "TRANSFER";
  quantity: number;
  date: string;
  reference?: string;
}

export interface Distribution {
  id: string;
  batchCode: string;
  farmerId: string;
  inputId: string;
  quantity: number;
  warehouseId: string;
  status: "Pending" | "Issued" | "Verified";
  distributedAt: string;
  officerId: string;
}

// Allocation system types
export type AllocationStatus = "pending" | "approved" | "distributed" | "partially_collected" | "collected" | "expired" | "cancelled";

export interface Allocation {
  id: string;
  allocationCode: string; // ALLOC-ZW-XXXXXX
  farmerId: string;
  householdId?: string;
  warehouseId: string;
  inputId: string;
  quantity: number;
  collectionDate: string; // ISO date
  allocationStatus: AllocationStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  distributedBy?: string;
  distributedAt?: string;
  collectedAt?: string;
  collectedBy?: string;
  auditHistory?: AllocationAuditEntry[];
  qrCode?: string; // Encoded allocation data
}

export interface AllocationAuditEntry {
  stage: "created" | "approved" | "distributed" | "collected" | "cancelled";
  userId: string;
  userName?: string; // For UI: resolved from auth store
  userRole?: string;
  timestamp: string;
  notes?: string;
}

export interface DistributionEvent {
  id: string;
  allocationId: string;
  eventType: "created" | "approved" | "distributed" | "collected" | "cancelled" | "expired";
  timestamp: string;
  userId: string;
  notes?: string;
}

export interface WarehouseStock {
  warehouseId: string;
  inputId: string;
  quantity: number;
  lastUpdated: string;
}

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

export type IrrigationAccess = "None" | "Rainfed" | "Borehole" | "River" | "Dam" | "Drip" | "Pivot";
export type LandOwnershipType = "Own" | "Leased" | "Communal" | "Sharecrop" | "Rented" | "Inherited";

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

  // Farm & Production Profile
  farmSizeHa: number;
  landOwnershipType?: LandOwnershipType;
  irrigationAccess?: IrrigationAccess;
  crops: Crop[];
  livestock: Livestock[];

  // Household Profile
  householdSize?: number; // Total people in household
  dependentsUnder18?: number; // Children under 18
  dependentsOver60?: number; // Elderly dependents
  femaleHeadedHousehold?: boolean; // Female-headed indicator
  youthHeadedHousehold?: boolean; // Youth (18-35) headed indicator

  // Additional fields
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

  // Program participation
  programId?: string;
  programName?: string;
  programCode?: string;
  fundingSource?: string;
  implementingPartner?: string;
  assignedOfficerId?: string; // Extension officer

  // Receipt generation
  receiptNumber?: string;
  receiptStatus?: ReceiptStatus;
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

// Program/Campaign extension for allocations
export type EligibilityStatus = "Eligible" | "Waitlisted" | "Not Eligible";
export type DeliveryMethod = "SMS" | "WhatsApp" | "Email" | "Print";
export type ReceiptStatus = "Pending" | "Acknowledged";

export interface Program {
  id: string;
  programName: string;
  programCode: string;
  fundingSource: string;
  implementingPartner?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  season?: string;
  status?: "Active" | "Completed" | "Paused";
}

export interface ExtensionOfficer {
  id: string;
  name: string;
  phone?: string;
  districtId: string;
  wardId?: string;
}

// Program participation tracking
export interface ProgramParticipation {
  id: string;
  farmerId: string;
  programId?: string;
  programName: string;
  programCode: string;
  fundingSource: string;
  implementingPartner?: string;
  assignedOfficerId?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  season?: string;
  eligibilityStatus: EligibilityStatus;
  eligibilityScore?: number; // 0-100, optional computed score
  enrolledDate: string; // ISO
}

// Receipt & Acknowledgement for items issued
export interface Receipt {
  id: string;
  receiptNumber: string; // Format: RCP-YYYY-XXXXXX
  date: string; // ISO
  beneficiaryId: string; // Farmer ID
  programId?: string;
  items: ReceiptItem[];
  issuedBy: string; // User ID
  deliveryMethod: DeliveryMethod;
  estimatedTotalValue?: number;
  status: ReceiptStatus;
  acknowledgementData?: ReceiptAcknowledgement;
  auditHistory?: ReceiptAuditEntry[];
  createdAt: string; // ISO
}

export interface ReceiptItem {
  inputId: string;
  inputName: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
}

export interface ReceiptAcknowledgement {
  acknowledgedBy: string; // Farmer or representative
  acknowledgedAt: string; // ISO
  acknowledgedVia: DeliveryMethod; // How was it acknowledged
  message?: string; // Optional acknowledgement message/feedback
}

export interface ReceiptAuditEntry {
  action: "created" | "sent" | "acknowledged" | "cancelled";
  userId: string;
  userName?: string;
  timestamp: string;
  notes?: string;
}

import { create } from "zustand";
import type {
  CommodityProductionProfile, FuelUsageRecord, WoodlotRecord,
  LabourComplianceRecord, ChildLabourSafeguardRecord,
  SustainabilityScorecard, SustainabilityPassport, VerificationRecord,
  CommodityType, SustainabilityComplianceStatus,
} from "@/types";

interface SustainabilityState {
  productionProfiles: CommodityProductionProfile[];
  fuelRecords: FuelUsageRecord[];
  woodlots: WoodlotRecord[];
  labourRecords: LabourComplianceRecord[];
  childLabourRecords: ChildLabourSafeguardRecord[];
  scorecards: SustainabilityScorecard[];
  verifications: VerificationRecord[];

  addProductionProfile: (profile: Omit<CommodityProductionProfile, "id" | "recordedAt">) => CommodityProductionProfile;
  getProductionProfilesByFarmer: (farmerId: string) => CommodityProductionProfile[];
  getProductionProfile: (farmerId: string, commodityType?: CommodityType) => CommodityProductionProfile | undefined;
  updateProductionProfile: (id: string, updates: Partial<CommodityProductionProfile>) => void;

  addFuelRecord: (record: Omit<FuelUsageRecord, "id" | "recordedAt">) => FuelUsageRecord;
  getFuelRecordsByFarmer: (farmerId: string) => FuelUsageRecord[];

  addWoodlot: (woodlot: Omit<WoodlotRecord, "id" | "woodlotCode" | "recordedAt">) => WoodlotRecord;
  getWoodlotsByFarmer: (farmerId: string) => WoodlotRecord[];
  updateWoodlot: (id: string, updates: Partial<WoodlotRecord>) => void;

  addLabourRecord: (record: Omit<LabourComplianceRecord, "id" | "recordedAt">) => LabourComplianceRecord;
  getLabourRecord: (farmerId: string) => LabourComplianceRecord | undefined;
  updateLabourRecord: (id: string, updates: Partial<LabourComplianceRecord>) => void;

  addChildLabourRecord: (record: Omit<ChildLabourSafeguardRecord, "id" | "recordedAt">) => ChildLabourSafeguardRecord;
  getChildLabourRecord: (farmerId: string) => ChildLabourSafeguardRecord | undefined;
  updateChildLabourRecord: (id: string, updates: Partial<ChildLabourSafeguardRecord>) => void;

  calculateScorecard: (farmerId: string, commodityType: CommodityType, programId?: string) => SustainabilityScorecard;
  getScorecard: (farmerId: string) => SustainabilityScorecard | undefined;

  getPassport: (farmerId: string, farmerCode: string) => SustainabilityPassport | undefined;

  addVerification: (record: Omit<VerificationRecord, "id" | "recordedAt">) => VerificationRecord;
  getVerificationsByFarmer: (farmerId: string) => VerificationRecord[];

  isSustainabilityApplicable: (farmerCrops: string[], programCommodityTypes: CommodityType[]) => boolean;
}

let profileSeq = 2;
let fuelSeq = 8;
let woodlotSeq = 3;
let labourSeq = 2;
let childLabourSeq = 2;
let scorecardSeq = 0;
let verificationSeq = 0;

// Seed data: sustainability records for tobacco farmers
const seedProfiles: CommodityProductionProfile[] = [
  {
    id: "sprod-1", farmerId: "f-1", commodityType: "Tobacco", areaHa: 2.5,
    contractor: "Tobacco Sales Ltd", expectedYieldKg: 3000, actualYieldKg: 2700,
    grade: "B2", numberOfBales: 12, marketingSeason: "2026", contractStatus: "Active",
    recordedAt: new Date(2026, 0, 15).toISOString(),
  },
  {
    id: "sprod-2", farmerId: "f-5", commodityType: "Tobacco", areaHa: 1.8,
    contractor: "Northern Tobacco", expectedYieldKg: 2200, actualYieldKg: 1900,
    grade: "C3", numberOfBales: 8, marketingSeason: "2026", contractStatus: "Active",
    recordedAt: new Date(2026, 1, 10).toISOString(),
  },
];

const seedFuel: FuelUsageRecord[] = [
  { id: "sfuel-1", farmerId: "f-1", fuelType: "Wood Fuel", quantity: 500, unit: "kg", dateUsed: new Date(2026, 0, 1).toISOString(), source: "Local supplier", verifiedBy: "off-1", recordedAt: new Date(2026, 0, 1).toISOString() },
  { id: "sfuel-2", farmerId: "f-1", fuelType: "Biochar Briquettes", quantity: 200, unit: "kg", dateUsed: new Date(2026, 1, 1).toISOString(), source: "Cooperative", verifiedBy: "off-1", recordedAt: new Date(2026, 1, 1).toISOString() },
  { id: "sfuel-3", farmerId: "f-1", fuelType: "Sawdust Briquettes", quantity: 150, unit: "kg", dateUsed: new Date(2026, 2, 1).toISOString(), source: "Local supplier", verifiedBy: "off-2", recordedAt: new Date(2026, 2, 1).toISOString() },
  { id: "sfuel-4", farmerId: "f-1", fuelType: "Coal", quantity: 100, unit: "kg", dateUsed: new Date(2026, 2, 15).toISOString(), source: "Merchant", verifiedBy: "off-1", recordedAt: new Date(2026, 2, 15).toISOString() },
  { id: "sfuel-5", farmerId: "f-5", fuelType: "Wood Fuel", quantity: 400, unit: "kg", dateUsed: new Date(2026, 0, 15).toISOString(), source: "Local supplier", verifiedBy: "off-2", recordedAt: new Date(2026, 0, 15).toISOString() },
  { id: "sfuel-6", farmerId: "f-5", fuelType: "Corn Cob Briquettes", quantity: 180, unit: "kg", dateUsed: new Date(2026, 1, 15).toISOString(), source: "Farm produced", verifiedBy: "off-2", recordedAt: new Date(2026, 1, 15).toISOString() },
  { id: "sfuel-7", farmerId: "f-5", fuelType: "Solar Assisted", quantity: 80, unit: "kg", dateUsed: new Date(2026, 2, 1).toISOString(), source: "Self-installed", verifiedBy: "off-1", recordedAt: new Date(2026, 2, 1).toISOString() },
  { id: "sfuel-8", farmerId: "f-5", fuelType: "Wood Fuel", quantity: 350, unit: "kg", dateUsed: new Date(2026, 3, 1).toISOString(), source: "Woodlot", verifiedBy: "off-2", recordedAt: new Date(2026, 3, 1).toISOString() },
];

const seedWoodlots: WoodlotRecord[] = [
  {
    id: "swlot-1", farmerId: "f-1", woodlotCode: "WL-00001", areaHa: 0.5,
    treeSpecies: "Eucalyptus", treesPlanted: 500, treesSurviving: 420,
    plantingDate: new Date(2024, 10, 1).toISOString(), estimatedFuelYieldTonnes: 2.5,
    verificationDate: new Date(2025, 11, 15).toISOString(), verifier: "Forestry Commission",
    provinceId: "prov-1", districtId: "dist-1", wardId: "ward-1", villageId: "vil-1",
    recordedAt: new Date(2024, 10, 1).toISOString(),
  },
  {
    id: "swlot-2", farmerId: "f-5", woodlotCode: "WL-00002", areaHa: 0.3,
    treeSpecies: "Eucalyptus", treesPlanted: 300, treesSurviving: 240,
    plantingDate: new Date(2025, 0, 15).toISOString(), estimatedFuelYieldTonnes: 1.5,
    verificationDate: new Date(2025, 6, 1).toISOString(), verifier: "Agritex",
    provinceId: "prov-2", districtId: "dist-3", wardId: "ward-5", villageId: "vil-12",
    recordedAt: new Date(2025, 0, 15).toISOString(),
  },
  {
    id: "swlot-3", farmerId: "f-1", woodlotCode: "WL-00003", areaHa: 0.2,
    treeSpecies: "Pine", treesPlanted: 200, treesSurviving: 170,
    plantingDate: new Date(2025, 2, 1).toISOString(), estimatedFuelYieldTonnes: 1.0,
    provinceId: "prov-1", districtId: "dist-1", wardId: "ward-1", villageId: "vil-1",
    recordedAt: new Date(2025, 2, 1).toISOString(),
  },
];

const seedLabour: LabourComplianceRecord[] = [
  {
    id: "slab-1", farmerId: "f-1", permanentWorkers: 2, seasonalWorkers: 5, youthWorkers: 1,
    ppeAvailable: true, labourDeclarationSigned: true, complianceStatus: "Compliant",
    recordedAt: new Date(2026, 0, 1).toISOString(),
  },
  {
    id: "slab-2", farmerId: "f-5", permanentWorkers: 1, seasonalWorkers: 3, youthWorkers: 0,
    ppeAvailable: true, labourDeclarationSigned: false, complianceStatus: "Partially Compliant",
    recordedAt: new Date(2026, 0, 15).toISOString(),
  },
];

const seedChildLabour: ChildLabourSafeguardRecord[] = [
  {
    id: "scl-1", farmerId: "f-1", childLabourRisk: "Low", trainingCompleted: true,
    trainingDate: new Date(2025, 10, 1).toISOString(), followUpDate: new Date(2026, 10, 1).toISOString(),
    complianceStatus: "Compliant", comments: "Annual training completed",
    recordedAt: new Date(2025, 10, 1).toISOString(),
  },
  {
    id: "scl-2", farmerId: "f-5", childLabourRisk: "Medium", trainingCompleted: false,
    followUpDate: new Date(2026, 6, 1).toISOString(),
    complianceStatus: "Partially Compliant", comments: "Training scheduled for Q3",
    recordedAt: new Date(2026, 0, 15).toISOString(),
  },
];

// Indexed lookup maps for O(1) access at scale
const productionByFarmer = new Map<string, CommodityProductionProfile[]>();
const fuelByFarmer = new Map<string, FuelUsageRecord[]>();
const woodlotByFarmer = new Map<string, WoodlotRecord[]>();
const labourByFarmer = new Map<string, LabourComplianceRecord>();
const childLabourByFarmerIdx = new Map<string, ChildLabourSafeguardRecord>();
const scorecardByFarmer = new Map<string, SustainabilityScorecard>();

function indexProfile(p: CommodityProductionProfile) {
  const arr = productionByFarmer.get(p.farmerId) || [];
  arr.push(p);
  productionByFarmer.set(p.farmerId, arr);
}
function indexFuel(r: FuelUsageRecord) {
  const arr = fuelByFarmer.get(r.farmerId) || [];
  arr.push(r);
  fuelByFarmer.set(r.farmerId, arr);
}
function indexWoodlot(r: WoodlotRecord) {
  const arr = woodlotByFarmer.get(r.farmerId) || [];
  arr.push(r);
  woodlotByFarmer.set(r.farmerId, arr);
}

seedProfiles.forEach(indexProfile);
seedFuel.forEach(indexFuel);
seedWoodlots.forEach(indexWoodlot);
seedLabour.forEach((r) => labourByFarmer.set(r.farmerId, r));
seedChildLabour.forEach((r) => childLabourByFarmerIdx.set(r.farmerId, r));

// Pre-calculate scorecards for seed data (pure function, no state dependency)
let seedScorecardSeq = 0;
const seedScorecards: SustainabilityScorecard[] = [];
const uniqueSeedFarmerIds = [...new Set(seedProfiles.map((p) => p.farmerId))];
uniqueSeedFarmerIds.forEach((farmerId) => {
  const profile = seedProfiles.find((p) => p.farmerId === farmerId);
  if (!profile) return;
  const woodlots = woodlotByFarmer.get(farmerId) || [];
  const fuelRecs = fuelByFarmer.get(farmerId) || [];
  const labour = labourByFarmer.get(farmerId);
  const childLabour = childLabourByFarmerIdx.get(farmerId);

  const totalWoodlotArea = woodlots.reduce((s, w) => s + w.areaHa, 0);
  const productionArea = profile.areaHa || 0;
  const woodlotCoverage = productionArea > 0
    ? Math.min(100, (totalWoodlotArea / productionArea) * 100 * 5)
    : (woodlots.length > 0 ? 40 : 0);
  const altFuelTypes: string[] = ["Biochar Briquettes", "Sawdust Briquettes", "Corn Cob Briquettes", "Cotton Stalk Briquettes", "Macadamia Shells", "Solar Assisted"];
  const altFuelQty = fuelRecs.filter((f) => altFuelTypes.includes(f.fuelType)).reduce((s, f) => s + f.quantity, 0);
  const totalFuelQty = fuelRecs.reduce((s, f) => s + f.quantity, 0) || 1;
  const alternativeFuelUsage = Math.min(30, (altFuelQty / totalFuelQty) * 30);
  const surviving = woodlots.reduce((s, w) => s + w.treesSurviving, 0);
  const planted = woodlots.reduce((s, w) => s + w.treesPlanted, 0) || 1;
  const fuelEfficiency = Math.min(30, (surviving / planted) * 30);
  const environmentalScore = Math.round(Math.min(100, woodlotCoverage + alternativeFuelUsage + fuelEfficiency));

  let labourComplianceScore = 0;
  if (labour) {
    if (labour.ppeAvailable) labourComplianceScore += 15;
    if (labour.labourDeclarationSigned) labourComplianceScore += 15;
    if (labour.complianceStatus === "Compliant") labourComplianceScore += 20;
    else if (labour.complianceStatus === "Partially Compliant") labourComplianceScore += 10;
  }
  const trainingScore = childLabour?.trainingCompleted ? 25 : 0;
  let childLabourSafeguardScore = 0;
  if (childLabour) {
    childLabourSafeguardScore = childLabour.childLabourRisk === "Low" ? 25 : childLabour.childLabourRisk === "Medium" ? 15 : 5;
  }
  const socialScore = Math.round(Math.min(100, labourComplianceScore + trainingScore + childLabourSafeguardScore));

  const fields = [profile.areaHa, profile.contractor, profile.expectedYieldKg, profile.contractStatus];
  const profileCompleteness = Math.round((fields.filter(Boolean).length / fields.length) * 30);
  const complianceScore = Math.round(Math.min(100, profileCompleteness + 35));
  const overallScore = Math.round(environmentalScore * 0.4 + socialScore * 0.3 + complianceScore * 0.3);

  let overallRating: SustainabilityComplianceStatus = "Not Assessed";
  if (overallScore >= 65) overallRating = "Compliant";
  else if (overallScore >= 40) overallRating = "Partially Compliant";
  else if (overallScore >= 1) overallRating = "High Risk";

  const scorecard: SustainabilityScorecard = {
    id: `sscore-${++seedScorecardSeq}`,
    farmerId, commodityType: profile.commodityType,
    environmentalScore, socialScore, complianceScore, overallScore, overallRating,
    calculatedAt: new Date().toISOString(),
    woodlotCoverage: Math.round(woodlotCoverage),
    alternativeFuelUsage: Math.round(alternativeFuelUsage),
    fuelEfficiency: Math.round(fuelEfficiency),
    labourComplianceScore, trainingScore, childLabourSafeguardScore,
    profileCompleteness, verificationStatus: 0, programParticipationScore: 35,
  };
  seedScorecards.push(scorecard);
  scorecardByFarmer.set(farmerId, scorecard);
});

// Offset scorecardSeq past seed data
scorecardSeq = seedScorecardSeq;

export const useSustainability = create<SustainabilityState>((set, get) => ({
  productionProfiles: seedProfiles,
  fuelRecords: seedFuel,
  woodlots: seedWoodlots,
  labourRecords: seedLabour,
  childLabourRecords: seedChildLabour,
  scorecards: seedScorecards,
  verifications: [],

  addProductionProfile: (data) => {
    profileSeq += 1;
    const profile: CommodityProductionProfile = {
      ...data,
      id: `sprod-${profileSeq}`,
      recordedAt: new Date().toISOString(),
    };
    indexProfile(profile);
    set({ productionProfiles: [profile, ...get().productionProfiles] });
    return profile;
  },

  getProductionProfilesByFarmer: (farmerId) => productionByFarmer.get(farmerId) || [],

  getProductionProfile: (farmerId, commodityType) => {
    const profiles = productionByFarmer.get(farmerId) || [];
    if (commodityType) return profiles.find((p) => p.commodityType === commodityType);
    return profiles[0];
  },

  updateProductionProfile: (id, updates) => {
    set({
      productionProfiles: get().productionProfiles.map((p) => p.id === id ? { ...p, ...updates } : p),
    });
  },

  addFuelRecord: (data) => {
    fuelSeq += 1;
    const record: FuelUsageRecord = {
      ...data,
      id: `sfuel-${fuelSeq}`,
      recordedAt: new Date().toISOString(),
    };
    indexFuel(record);
    set({ fuelRecords: [record, ...get().fuelRecords] });
    return record;
  },

  getFuelRecordsByFarmer: (farmerId) => fuelByFarmer.get(farmerId) || [],

  addWoodlot: (data) => {
    woodlotSeq += 1;
    const woodlot: WoodlotRecord = {
      ...data,
      id: `swlot-${woodlotSeq}`,
      woodlotCode: `WL-${woodlotSeq.toString().padStart(5, "0")}`,
      recordedAt: new Date().toISOString(),
    };
    indexWoodlot(woodlot);
    set({ woodlots: [woodlot, ...get().woodlots] });
    return woodlot;
  },

  getWoodlotsByFarmer: (farmerId) => woodlotByFarmer.get(farmerId) || [],

  updateWoodlot: (id, updates) => {
    set({
      woodlots: get().woodlots.map((w) => w.id === id ? { ...w, ...updates } : w),
    });
  },

  addLabourRecord: (data) => {
    labourSeq += 1;
    const record: LabourComplianceRecord = {
      ...data,
      id: `slab-${labourSeq}`,
      recordedAt: new Date().toISOString(),
    };
    labourByFarmer.set(record.farmerId, record);
    set({ labourRecords: [record, ...get().labourRecords.filter((l) => l.farmerId !== record.farmerId)] });
    return record;
  },

  getLabourRecord: (farmerId) => labourByFarmer.get(farmerId),

  updateLabourRecord: (id, updates) => {
    set({
      labourRecords: get().labourRecords.map((l) => l.id === id ? { ...l, ...updates } : l),
    });
  },

  addChildLabourRecord: (data) => {
    childLabourSeq += 1;
    const record: ChildLabourSafeguardRecord = {
      ...data,
      id: `scl-${childLabourSeq}`,
      recordedAt: new Date().toISOString(),
    };
    childLabourByFarmerIdx.set(record.farmerId, record);
    set({
      childLabourRecords: [record, ...get().childLabourRecords.filter((c) => c.farmerId !== record.farmerId)],
    });
    return record;
  },

  getChildLabourRecord: (farmerId) => childLabourByFarmerIdx.get(farmerId),

  updateChildLabourRecord: (id, updates) => {
    set({
      childLabourRecords: get().childLabourRecords.map((c) => c.id === id ? { ...c, ...updates } : c),
    });
  },

  // Rule-based scorecard calculation (no AI, simple transparent rules)
  calculateScorecard: (farmerId, commodityType, programId) => {
    const profiles = productionByFarmer.get(farmerId) || [];
    const profile = profiles.find((p) => p.commodityType === commodityType);
    const woodlots = woodlotByFarmer.get(farmerId) || [];
    const fuelRecs = fuelByFarmer.get(farmerId) || [];
    const labour = labourByFarmer.get(farmerId);
    const childLabour = childLabourByFarmerIdx.get(farmerId);
    const verifications = get().verifications.filter((v) => v.farmerId === farmerId);

    // --- Environmental Score (max 100) ---
    const totalWoodlotArea = woodlots.reduce((s, w) => s + w.areaHa, 0);
    const productionArea = profile?.areaHa || 0;
    const woodlotCoverage = productionArea > 0
      ? Math.min(100, (totalWoodlotArea / productionArea) * 100 * 5)
      : (woodlots.length > 0 ? 40 : 0);

    const altFuelTypes: string[] = ["Biochar Briquettes", "Sawdust Briquettes", "Corn Cob Briquettes", "Cotton Stalk Briquettes", "Macadamia Shells", "Solar Assisted"];
    const altFuelQty = fuelRecs.filter((f) => altFuelTypes.includes(f.fuelType)).reduce((s, f) => s + f.quantity, 0);
    const totalFuelQty = fuelRecs.reduce((s, f) => s + f.quantity, 0) || 1;
    const alternativeFuelUsage = Math.min(30, (altFuelQty / totalFuelQty) * 30);

    const surviving = woodlots.reduce((s, w) => s + w.treesSurviving, 0);
    const planted = woodlots.reduce((s, w) => s + w.treesPlanted, 0) || 1;
    const fuelEfficiency = Math.min(30, (surviving / planted) * 30);

    const environmentalScore = Math.round(Math.min(100, woodlotCoverage + alternativeFuelUsage + fuelEfficiency));

    // --- Social Score (max 100) ---
    let labourComplianceScore = 0;
    if (labour) {
      if (labour.ppeAvailable) labourComplianceScore += 15;
      if (labour.labourDeclarationSigned) labourComplianceScore += 15;
      if (labour.complianceStatus === "Compliant") labourComplianceScore += 20;
      else if (labour.complianceStatus === "Partially Compliant") labourComplianceScore += 10;
    }

    const trainingScore = childLabour?.trainingCompleted ? 25 : 0;

    let childLabourSafeguardScore = 0;
    if (childLabour) {
      childLabourSafeguardScore = childLabour.childLabourRisk === "Low" ? 25 : childLabour.childLabourRisk === "Medium" ? 15 : 5;
    }

    const socialScore = Math.round(Math.min(100, labourComplianceScore + trainingScore + childLabourSafeguardScore));

    // --- Compliance Score (max 100) ---
    let profileCompleteness = 0;
    if (profile) {
      const fields = [profile.areaHa, profile.contractor, profile.expectedYieldKg, profile.contractStatus];
      profileCompleteness = Math.round((fields.filter(Boolean).length / fields.length) * 30);
    }

    const latestVerification = verifications[0];
    const verificationStatus = latestVerification ? (latestVerification.evidenceAvailable ? 35 : 15) : 0;
    const programParticipationScore = programId ? 35 : 0;

    const complianceScore = Math.round(Math.min(100, profileCompleteness + verificationStatus + programParticipationScore));

    // --- Overall (weighted 40/30/30) ---
    const overallScore = Math.round(environmentalScore * 0.4 + socialScore * 0.3 + complianceScore * 0.3);

    let overallRating: SustainabilityComplianceStatus = "Not Assessed";
    if (overallScore >= 65) overallRating = "Compliant";
    else if (overallScore >= 40) overallRating = "Partially Compliant";
    else if (overallScore >= 1) overallRating = "High Risk";

    const scorecard: SustainabilityScorecard = {
      id: `sscore-${++scorecardSeq}`,
      farmerId, commodityType, programId,
      environmentalScore, socialScore, complianceScore,
      overallScore, overallRating,
      calculatedAt: new Date().toISOString(),
      woodlotCoverage: Math.round(woodlotCoverage),
      alternativeFuelUsage: Math.round(alternativeFuelUsage),
      fuelEfficiency: Math.round(fuelEfficiency),
      labourComplianceScore, trainingScore, childLabourSafeguardScore,
      profileCompleteness, verificationStatus, programParticipationScore,
    };

    scorecardByFarmer.set(farmerId, scorecard);
    set({
      scorecards: [scorecard, ...get().scorecards.filter((s) => s.farmerId !== farmerId)],
    });
    return scorecard;
  },

  getScorecard: (farmerId) => scorecardByFarmer.get(farmerId),

  getPassport: (farmerId, farmerCode) => {
    const state = get();
    const profiles = productionByFarmer.get(farmerId) || [];
    const profile = profiles[0];
    if (!profile) return undefined;

    const woodlots = woodlotByFarmer.get(farmerId) || [];
    const fuelRecs = fuelByFarmer.get(farmerId) || [];
    const labour = labourByFarmer.get(farmerId);
    const childLabour = childLabourByFarmerIdx.get(farmerId);
    const scorecard = scorecardByFarmer.get(farmerId);
    const latestVerification = state.verifications.find((v) => v.farmerId === farmerId);

    const altFuels = fuelRecs.filter((f) => !["Wood Fuel", "Coal"].includes(f.fuelType));
    const alternativeFuelPercentage = fuelRecs.length > 0
      ? Math.round((altFuels.reduce((s, f) => s + f.quantity, 0) / fuelRecs.reduce((s, f) => s + f.quantity, 0)) * 100)
      : 0;

    const primaryFuel = fuelRecs.length > 0
      ? [...fuelRecs].sort((a, b) => b.quantity - a.quantity)[0].fuelType
      : "Wood Fuel";

    return {
      farmerId, farmerCode,
      commodityType: profile.commodityType,
      productionProfile: profile,
      woodlots,
      totalTreesPlanted: woodlots.reduce((s, w) => s + w.treesPlanted, 0),
      totalTreesSurviving: woodlots.reduce((s, w) => s + w.treesSurviving, 0),
      totalWoodlotAreaHa: +woodlots.reduce((s, w) => s + w.areaHa, 0).toFixed(2),
      fuelRecords: fuelRecs,
      alternativeFuelPercentage,
      primaryFuelType: primaryFuel,
      labourCompliance: labour,
      childLabourSafeguard: childLabour,
      scorecard,
      lastVerificationDate: latestVerification?.verificationDate,
      verificationOfficer: latestVerification?.verificationOfficer,
      evidenceAvailable: latestVerification?.evidenceAvailable ?? false,
      verificationComments: latestVerification?.comments,
    };
  },

  addVerification: (data) => {
    verificationSeq += 1;
    const record: VerificationRecord = {
      ...data,
      id: `sver-${verificationSeq}`,
      recordedAt: new Date().toISOString(),
    };
    set({ verifications: [record, ...get().verifications] });
    return record;
  },

  getVerificationsByFarmer: (farmerId) =>
    get().verifications.filter((v) => v.farmerId === farmerId),

  // Generic commodity-driven check (not Tobacco-only)
  isSustainabilityApplicable: (farmerCrops, programCommodityTypes) => {
    const sustainabilityCommodities: CommodityType[] = ["Tobacco", "Cotton", "Horticulture", "Livestock"];
    return farmerCrops.some((c) => sustainabilityCommodities.includes(c as CommodityType))
      || programCommodityTypes.some((ct) => sustainabilityCommodities.includes(ct));
  },
}));
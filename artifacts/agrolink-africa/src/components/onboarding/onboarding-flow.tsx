import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import type { UserRole } from "@/types";
import {
  provinces,
  districtsByProvince,
  wardsByDistrict,
  villagesByWard,
} from "@/lib/zimbabwe-geo";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{ onNext: () => void; onBack?: () => void; data: any; setData: (data: any) => void }>;
}

export interface OnboardingFlowProps {
  role: UserRole;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "national_admin", label: "National Admin" },
  { value: "provincial_admin", label: "Provincial Admin" },
  { value: "district_officer", label: "District Officer" },
  { value: "ward_officer", label: "Ward Officer" },
  { value: "extension_officer", label: "Extension Officer" },
  { value: "warehouse_manager", label: "Warehouse Manager" },
  { value: "ngo_partner", label: "NGO Partner" },
  { value: "supplier", label: "Supplier" },
  { value: "farmer", label: "Farmer" },
];

/**
 * Role-specific onboarding steps
 */
export const ONBOARDING_STEPS: Record<UserRole, OnboardingStep[]> = {
  super_admin: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your account configured",
      component: WelcomeStep,
    },
    {
      id: "province",
      title: "Province Assignment",
      description: "Select your province",
      component: ProvinceStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  national_admin: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your account configured",
      component: WelcomeStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  provincial_admin: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your account configured",
      component: WelcomeStep,
    },
    {
      id: "province",
      title: "Province Assignment",
      description: "Select your province",
      component: ProvinceStep,
    },
    {
      id: "districts",
      title: "Assigned Districts",
      description: "Select districts you oversee",
      component: DistrictsStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  district_officer: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your account configured",
      component: WelcomeStep,
    },
    {
      id: "province",
      title: "Province Assignment",
      description: "Select your province",
      component: ProvinceStep,
    },
    {
      id: "district",
      title: "District Assignment",
      description: "Select your district",
      component: DistrictStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  ward_officer: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your account configured",
      component: WelcomeStep,
    },
    {
      id: "province",
      title: "Province Assignment",
      description: "Select your province",
      component: ProvinceStep,
    },
    {
      id: "district",
      title: "District Assignment",
      description: "Select your district",
      component: DistrictStep,
    },
    {
      id: "wards",
      title: "Ward Assignment",
      description: "Select wards you oversee",
      component: WardsStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  extension_officer: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your account configured",
      component: WelcomeStep,
    },
    {
      id: "province",
      title: "Province Assignment",
      description: "Select your province",
      component: ProvinceStep,
    },
    {
      id: "district",
      title: "District Assignment",
      description: "Select your district",
      component: DistrictStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  warehouse_manager: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your account configured",
      component: WelcomeStep,
    },
    {
      id: "warehouse",
      title: "Warehouse Assignment",
      description: "Select your warehouse",
      component: WarehouseStep,
    },
    {
      id: "region",
      title: "Region Assignment",
      description: "Select your region",
      component: RegionStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  ngo_partner: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your organization configured",
      component: WelcomeStep,
    },
    {
      id: "organization",
      title: "Organization Details",
      description: "Tell us about your organization",
      component: OrganizationStep,
    },
    {
      id: "regions",
      title: "Project Regions",
      description: "Select regions you operate in",
      component: RegionsStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  supplier: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your business configured",
      component: WelcomeStep,
    },
    {
      id: "business",
      title: "Business Details",
      description: "Tell us about your business",
      component: BusinessStep,
    },
    {
      id: "contact",
      title: "Contact Information",
      description: "How can we reach you?",
      component: ContactStep,
    },
  ],
  farmer: [
    {
      id: "role-selection",
      title: "Your Role",
      description: "Confirm your role in the system",
      component: RoleSelectionStep,
    },
    {
      id: "welcome",
      title: "Welcome to AgroLinkAfrica",
      description: "Let's get your farm profile set up",
      component: WelcomeStep,
    },
    {
      id: "province",
      title: "Province Information",
      description: "Select your province",
      component: ProvinceStep,
    },
    {
      id: "district",
      title: "District Information",
      description: "Select your district",
      component: DistrictStep,
    },
    {
      id: "ward",
      title: "Ward Information",
      description: "Select your ward",
      component: WardStep,
    },
    {
      id: "village",
      title: "Village Information",
      description: "Select your village",
      component: VillageStep,
    },
    {
      id: "household",
      title: "Household Information",
      description: "Select or create your household",
      component: HouseholdStep,
    },
    {
      id: "phone",
      title: "Phone Number",
      description: "Add your contact number",
      component: PhoneStep,
    },
    {
      id: "crops",
      title: "Crop Types",
      description: "Select crops you grow",
      component: CropsStep,
    },
  ],
};

/**
 * Main onboarding flow component
 */
export function OnboardingFlow({ role, onComplete, onCancel }: OnboardingFlowProps) {
  const steps = ONBOARDING_STEPS[role] ?? [];
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<any>({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentComponent = steps[currentStep]?.component;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">{steps[currentStep]?.title}</h2>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{steps[currentStep]?.description}</p>
          <Progress value={progress} className="h-2" />
        </div>

        {CurrentComponent && (
          <CurrentComponent
            onNext={handleNext}
            onBack={handleBack}
            data={data}
            setData={setData}
          />
        )}

        <div className="flex justify-between mt-6 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handleBack}
              disabled={currentStep === 0}
            >
              {currentStep === 0 ? "Cancel" : <ChevronLeft className="h-4 w-4 mr-2" />}
              {currentStep === 0 ? "" : "Back"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onComplete(data)}
            >
              Skip Setup
            </Button>
          </div>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              <>
                Complete <Check className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Step components

function RoleSelectionStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select your role in the AgroLinkAfrica system.
      </p>
      <div>
        <label className="text-sm font-medium">Select Role</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.selectedRole || ""}
          onChange={(e) => {
            const selectedRole = e.target.value;
            setData({
              ...data,
              selectedRole,
              role: selectedRole !== "other" ? selectedRole : data.customRole || "",
              customRole: selectedRole === "other" ? data.customRole || "" : "",
            });
          }}
        >
          <option value="">Choose your role...</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
          <option value="other">Other (Please specify)</option>
        </select>
      </div>
      {data.selectedRole === "other" && (
        <div>
          <label className="text-sm font-medium">Custom Role Name</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="Enter your custom role"
            value={data.customRole || ""}
            onChange={(e) =>
              setData({
                ...data,
                customRole: e.target.value,
                role: e.target.value || "other",
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function WelcomeStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Welcome to AgroLinkAfrica! This quick setup will help configure your account for your role.
      </p>
      <div className="bg-muted p-4 rounded-md">
        <p className="text-sm font-medium">
          Your Role: {data.role || data.selectedRole || "Not set"}
        </p>
      </div>
    </div>
  );
}

function MinistryStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Ministry Name</label>
        <input
          type="text"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter ministry name"
          value={data.ministryName || ""}
          onChange={(e) => setData({ ...data, ministryName: e.target.value })}
        />
      </div>
    </div>
  );
}

function ProvinceStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Province</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.province || ""}
          onChange={(e) => {
            // Reset cascading fields when province changes
            setData({ ...data, province: e.target.value, district: "", ward: "", village: "" });
          }}
        >
          <option value="">Select province</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function DistrictStep({ onNext, data, setData }: any) {
  const availableDistricts = data.province ? districtsByProvince(data.province) : [];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">District</label>
        {!data.province && <p className="text-xs text-red-500 mb-2">Please select a province first</p>}
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.district || ""}
          onChange={(e) => {
            // Reset cascading fields when district changes
            setData({ ...data, district: e.target.value, ward: "", village: "" });
          }}
          disabled={!data.province}
        >
          <option value="">Select district</option>
          {availableDistricts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function DistrictsStep({ onNext, data, setData }: any) {
  const availableDistricts = data.province ? districtsByProvince(data.province) : [];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Assigned Districts</label>
        {!data.province && <p className="text-xs text-red-500 mb-2">Please select a province first</p>}
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          multiple
          value={data.districts || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, (opt: any) => opt.value);
            setData({ ...data, districts: values });
          }}
          disabled={!data.province}
        >
          {availableDistricts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>
    </div>
  );
}

function WardsStep({ onNext, data, setData }: any) {
  const availableWards = data.district ? wardsByDistrict(data.district) : [];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Assigned Wards</label>
        {!data.district && <p className="text-xs text-red-500 mb-2">Please select a district first</p>}
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          multiple
          value={data.wards || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, (opt: any) => opt.value);
            setData({ ...data, wards: values });
          }}
          disabled={!data.district}
        >
          {availableWards.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>
    </div>
  );
}

function WarehouseStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Warehouse</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.warehouse || ""}
          onChange={(e) => setData({ ...data, warehouse: e.target.value })}
        >
          <option value="">Select warehouse</option>
          <option value="harare-central">Harare Central Depot</option>
          <option value="bindura-regional">Bindura Regional</option>
          <option value="mutare-regional">Mutare Regional</option>
          <option value="gweru-hub">Gweru Distribution Hub</option>
        </select>
      </div>
    </div>
  );
}

function RegionStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Region</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.region || ""}
          onChange={(e) => setData({ ...data, region: e.target.value })}
        >
          <option value="">Select region</option>
          <option value="north">Northern Region</option>
          <option value="south">Southern Region</option>
          <option value="east">Eastern Region</option>
          <option value="west">Western Region</option>
        </select>
      </div>
    </div>
  );
}

function OrganizationStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Organization Name</label>
        <input
          type="text"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter organization name"
          value={data.organizationName || ""}
          onChange={(e) => setData({ ...data, organizationName: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Organization Type</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.organizationType || ""}
          onChange={(e) => setData({ ...data, organizationType: e.target.value })}
        >
          <option value="">Select type</option>
          <option value="international">International NGO</option>
          <option value="local">Local NGO</option>
          <option value="community">Community Organization</option>
        </select>
      </div>
    </div>
  );
}

function RegionsStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Project Regions</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          multiple
          value={data.regions || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, (opt: any) => opt.value);
            setData({ ...data, regions: values });
          }}
        >
          <option value="harare">Harare</option>
          <option value="mashonaland-east">Mashonaland East</option>
          <option value="manicaland">Manicaland</option>
          <option value="midlands">Midlands</option>
          <option value="masvingo">Masvingo</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>
    </div>
  );
}

function BusinessStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Business Name</label>
        <input
          type="text"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Enter business name"
          value={data.businessName || ""}
          onChange={(e) => setData({ ...data, businessName: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Business Type</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.businessType || ""}
          onChange={(e) => setData({ ...data, businessType: e.target.value })}
        >
          <option value="">Select type</option>
          <option value="seed-supplier">Seed Supplier</option>
          <option value="fertilizer-supplier">Fertilizer Supplier</option>
          <option value="chemical-supplier">Chemical Supplier</option>
          <option value="equipment-supplier">Equipment Supplier</option>
        </select>
      </div>
    </div>
  );
}

function WardStep({ onNext, data, setData }: any) {
  const availableWards = data.district ? wardsByDistrict(data.district) : [];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Ward</label>
        {!data.district && <p className="text-xs text-red-500 mb-2">Please select a district first</p>}
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.ward || ""}
          onChange={(e) => {
            setData({ ...data, ward: e.target.value, village: "", household: "" });
          }}
          disabled={!data.district}
        >
          <option value="">Select ward</option>
          {availableWards.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function VillageStep({ onNext, data, setData }: any) {
  const availableVillages = data.ward ? villagesByWard(data.ward) : [];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Village</label>
        {!data.ward && <p className="text-xs text-red-500 mb-2">Please select a ward first</p>}
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.village || ""}
          onChange={(e) => {
            setData({ ...data, village: e.target.value, household: "" });
          }}
          disabled={!data.ward}
        >
          <option value="">Select village</option>
          {availableVillages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function HouseholdStep({ onNext, data, setData }: any) {
  // Mock households for now - in real app, would fetch from store
  const mockHouseholds = [
    { id: "hh-001", name: "Household A" },
    { id: "hh-002", name: "Household B" },
    { id: "hh-003", name: "Household C (New)" },
  ];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Household</label>
        {!data.village && <p className="text-xs text-red-500 mb-2">Please select a village first</p>}
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={data.household || ""}
          onChange={(e) => setData({ ...data, household: e.target.value })}
          disabled={!data.village}
        >
          <option value="">Select household</option>
          {mockHouseholds.map((hh) => (
            <option key={hh.id} value={hh.id}>
              {hh.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-1">Your household location in the village</p>
      </div>
    </div>
  );
}

function PhoneStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Phone Number</label>
        <input
          type="tel"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="+263..."
          value={data.phone || ""}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
        />
      </div>
    </div>
  );
}

function CropsStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Crop Types</label>
        <select
          className="w-full mt-1 px-3 py-2 border rounded-md"
          multiple
          value={data.crops || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, (opt: any) => opt.value);
            setData({ ...data, crops: values });
          }}
        >
          <option value="maize">Maize</option>
          <option value="tobacco">Tobacco</option>
          <option value="cotton">Cotton</option>
          <option value="soybean">Soybean</option>
          <option value="sorghum">Sorghum</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
      </div>
    </div>
  );
}

function ContactStep({ onNext, data, setData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Phone Number</label>
        <input
          type="tel"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="+263..."
          value={data.contactPhone || ""}
          onChange={(e) => setData({ ...data, contactPhone: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="email@example.com"
          value={data.contactEmail || ""}
          onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
        />
      </div>
    </div>
  );
}

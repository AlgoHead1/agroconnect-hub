import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { VulnerabilityTagsInput } from "@/components/ui/vulnerability-tags";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useFarmers } from "@/store/farmers";

import {
  provinces,
  districtsByProvince,
  wardsByDistrict,
  villagesByWard,
} from "@/lib/zimbabwe-geo";

import type { Crop, Livestock, VulnerabilityTag } from "@/types";

export const Route = createFileRoute("/_authenticated/farmers/new")({
  component: NewFarmerPage,
});

const cropOptions: Crop[] = [
  "Maize",
  "Tobacco",
  "Cotton",
  "Soybean",
  "Sorghum",
  "Wheat",
  "Groundnut",
  "Sunflower",
];

const livestockOptions: Livestock[] = [
  "Cattle",
  "Goats",
  "Sheep",
  "Poultry",
  "Pigs",
];

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  gender: z.enum(["M", "F", "Other"]),
  dob: z.string().min(1, "Required"),
  nationalId: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),

  provinceId: z.string().min(1, "Required"),
  districtId: z.string().min(1, "Required"),
  wardId: z.string().min(1, "Required"),
  villageId: z.string().min(1, "Required"),
  householdId: z.string().optional(),

  farmSizeHa: z.coerce.number().min(0.01),

  gpsLat: z.string().optional(),
  gpsLng: z.string().optional(),

  crops: z.array(z.string()).min(1, "Select at least one crop"),
  livestock: z.array(z.string()).optional(),
  vulnerabilityTags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

function NewFarmerPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [duplicateWarning, setDuplicateWarning] = React.useState<{ show: boolean; conflicts: string[] }>({ show: false, conflicts: [] });

  const addFarmer = useFarmers((s: any) => s.addFarmer);
  const checkDuplicates = useFarmers((s: any) => s.checkDuplicates);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "M",
      dob: "",
      nationalId: "",
      phone: "",

      provinceId: "",
      districtId: "",
      wardId: "",
      villageId: "",
      householdId: "",

      farmSizeHa: 1,

      gpsLat: "",
      gpsLng: "",

      crops: [],
      livestock: [],
      vulnerabilityTags: [],
    },
    mode: "onBlur",
  });

  const provinceId = watch("provinceId");
  const districtId = watch("districtId");
  const wardId = watch("wardId");
  const villageId = watch("villageId");

  const selectedCrops = watch("crops");
  const selectedLivestock = watch("livestock") || [];

  const toggleArrayValue = (
    field: "crops" | "livestock",
    value: string,
    currentValues: string[]
  ) => {
    if (currentValues.includes(value)) {
      setValue(
        field,
        currentValues.filter((v) => v !== value),
        { shouldValidate: true }
      );
    } else {
      setValue(field, [...currentValues, value], {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check for duplicates
      const dupeCheck = checkDuplicates(data.nationalId, data.phone, data.householdId);
      if (dupeCheck.isDuplicate) {
        setDuplicateWarning({ show: true, conflicts: dupeCheck.conflicts });
        setIsSubmitting(false);
        return;
      }
      
      const farmer = addFarmer({
        ...data,
        householdId: data.householdId || undefined,
        gpsLat: data.gpsLat ? parseFloat(data.gpsLat) : undefined,
        gpsLng: data.gpsLng ? parseFloat(data.gpsLng) : undefined,
        crops: data.crops as any,
        livestock: (data.livestock || []) as any,
        vulnerabilityTags: (data.vulnerabilityTags || []) as VulnerabilityTag[],
      });

      toast.success("Farmer registered successfully");

      navigate({
        to: "/farmers/$farmerId",
        params: {
          farmerId: farmer.id,
        },
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to register farmer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedWithDuplicate = async () => {
    try {
      const data = watch() as FormValues;
      const farmer = addFarmer({
        ...data,
        householdId: data.householdId || undefined,
        gpsLat: data.gpsLat ? parseFloat(data.gpsLat) : undefined,
        gpsLng: data.gpsLng ? parseFloat(data.gpsLng) : undefined,
        crops: data.crops as any,
        livestock: (data.livestock || []) as any,
        vulnerabilityTags: (data.vulnerabilityTags || []) as VulnerabilityTag[],
      });
      toast.warning("Farmer registered (duplicate detected)");
      setDuplicateWarning({ show: false, conflicts: [] });
      navigate({
        to: "/farmers/$farmerId",
        params: {
          farmerId: farmer.id,
        },
      });
    } catch (error) {
      toast.error("Failed to register farmer");
    }
  };

  return (
    <div className="flex flex-col">
      <AlertDialog open={duplicateWarning.show} onOpenChange={(open) => {
        if (!open) setDuplicateWarning({ show: false, conflicts: [] });
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate beneficiary detected</AlertDialogTitle>
            <AlertDialogDescription>
              This farmer appears to be already registered with the following conflicts:
              <ul className="mt-3 space-y-1 list-disc list-inside">
                {duplicateWarning.conflicts.map((c, i) => (
                  <li key={i} className="text-sm">{c}</li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={() => {
              setIsSubmitting(false);
              setDuplicateWarning({ show: false, conflicts: [] });
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithDuplicate}>
              Proceed anyway
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <PageHeader
        title="Register New Farmer"
        breadcrumb="Operations · Farmer Registry"
        description="Add a new farmer to the national registry."
        actions={
          <Button variant="outline" asChild>
            <Link to="/farmers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl space-y-6 p-6"
      >
        <Section
          title="Personal Information"
          description="Farmer identity and contact information."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First Name" error={errors.firstName?.message}>
              <Input {...register("firstName")} />
            </Field>

            <Field label="Last Name" error={errors.lastName?.message}>
              <Input {...register("lastName")} />
            </Field>

            <Field label="Gender" error={errors.gender?.message}>
              <Select
                value={watch("gender")}
                onValueChange={(v) =>
                  setValue("gender", v as "M" | "F" | "Other")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Date of Birth" error={errors.dob?.message}>
              <Input type="date" {...register("dob")} />
            </Field>

            <Field label="National ID" error={errors.nationalId?.message}>
              <Input {...register("nationalId")} />
            </Field>

            <Field label="Phone Number" error={errors.phone?.message}>
              <Input {...register("phone")} />
            </Field>
          </div>
        </Section>

        <Section
          title="Administrative Hierarchy"
          description="Farmer location hierarchy."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Province" error={errors.provinceId?.message}>
              <select
                {...register("provinceId", {
                  onChange: () => {
                    setValue("districtId", "");
                    setValue("wardId", "");
                    setValue("villageId", "");
                  },
                })}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Select province</option>
                {provinces.map((province: any) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="District" error={errors.districtId?.message}>
              <select
                {...register("districtId", {
                  onChange: () => {
                    setValue("wardId", "");
                    setValue("villageId", "");
                  },
                })}
                disabled={!provinceId}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm disabled:opacity-50"
              >
                <option value="">Select district</option>
                {districtsByProvince(provinceId).map((district: any) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ward" error={errors.wardId?.message}>
              <select
                {...register("wardId", {
                  onChange: () => {
                    setValue("villageId", "");
                  },
                })}
                disabled={!districtId}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm disabled:opacity-50"
              >
                <option value="">Select ward</option>
                {wardsByDistrict(districtId).map((ward: any) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Village" error={errors.villageId?.message}>
              <select
                {...register("villageId")}
                disabled={!wardId}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm disabled:opacity-50"
              >
                <option value="">Select village</option>
                {villagesByWard(wardId).map((village: any) => (
                  <option key={village.id} value={village.id}>
                    {village.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Household ID" error={errors.householdId?.message}>
              <Input {...register("householdId")} />
            </Field>
          </div>
        </Section>

        <Section
          title="Farm Information"
          description="Agricultural production details."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Farm Size (Ha)">
              <Input
                type="number"
                step="0.01"
                {...register("farmSizeHa")}
              />
            </Field>

            <Field label="GPS Latitude">
              <Input {...register("gpsLat")} />
            </Field>

            <Field label="GPS Longitude">
              <Input {...register("gpsLng")} />
            </Field>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <Label className="mb-2 block">
                Crops <span className="text-destructive">*</span>
              </Label>

              <div className="grid grid-cols-2 gap-2">
                {cropOptions.map((crop) => (
                  <label
                    key={crop}
                    className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={selectedCrops.includes(crop)}
                      onCheckedChange={() =>
                        toggleArrayValue(
                          "crops",
                          crop,
                          selectedCrops
                        )
                      }
                    />

                    <span className="text-sm">{crop}</span>
                  </label>
                ))}
              </div>
              {errors.crops && (
                <p className="mt-2 text-sm text-destructive">{errors.crops.message as string}</p>
              )}
            </div>

            <div>
              <Label className="mb-2 block">Livestock</Label>

              <div className="grid grid-cols-2 gap-2">
                {livestockOptions.map((livestock) => (
                  <label
                    key={livestock}
                    className="flex items-center gap-2 rounded-md border p-3"
                  >
                    <Checkbox
                      checked={selectedLivestock.includes(livestock)}
                      onCheckedChange={() =>
                        toggleArrayValue(
                          "livestock",
                          livestock,
                          selectedLivestock
                        )
                      }
                    />

                    <span className="text-sm">{livestock}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Vulnerability Classification"
          description="Identify any vulnerability factors that may affect this farmer's situation."
        >
          <VulnerabilityTagsInput 
            selected={(watch("vulnerabilityTags") || []) as VulnerabilityTag[]}
            onChange={(tags) => setValue("vulnerabilityTags", tags as any)}
          />
        </Section>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link to="/farmers">
              Cancel
            </Link>
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Register Farmer
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children}
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {children}

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
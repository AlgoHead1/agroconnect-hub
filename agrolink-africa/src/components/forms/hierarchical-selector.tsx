import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { provinces, districts, wards, villages } from "@/lib/zimbabwe-geo";
import { districtsByProvince, wardsByDistrict, villagesByWard, householdsByVillage, farmersByHousehold } from "@/lib/zimbabwe-geo";
import { useFarmers } from "@/store/farmers";
import { useHouseholds } from "@/store/households";

export interface HierarchicalSelection {
  provinceId?: string;
  districtId?: string;
  wardId?: string;
  villageId?: string;
  householdId?: string;
  farmerId?: string;
}

interface HierarchicalSelectorProps {
  selection: HierarchicalSelection;
  onChange: (selection: HierarchicalSelection) => void;
  disabled?: boolean;
  showFarmer?: boolean;
  showHousehold?: boolean;
}

export function HierarchicalSelector({
  selection,
  onChange,
  disabled = false,
  showFarmer = true,
  showHousehold = true,
}: HierarchicalSelectorProps) {
  const farmers = useFarmers((s) => s.farmers);
  const households = useHouseholds((s) => s.households);

  // Filter options based on current selection
  const availableDistricts = useMemo(() => {
    return selection.provinceId ? districtsByProvince(selection.provinceId) : districts;
  }, [selection.provinceId]);

  const availableWards = useMemo(() => {
    return selection.districtId ? wardsByDistrict(selection.districtId) : [];
  }, [selection.districtId]);

  const availableVillages = useMemo(() => {
    return selection.wardId ? villagesByWard(selection.wardId) : [];
  }, [selection.wardId]);

  const availableHouseholds = useMemo(() => {
    return selection.villageId ? householdsByVillage(selection.villageId, households) : [];
  }, [selection.villageId, households]);

  const availableFarmers = useMemo(() => {
    if (selection.householdId) {
      return farmersByHousehold(selection.householdId, farmers);
    }
    if (selection.villageId) {
      return farmers.filter((f) => f.villageId === selection.villageId);
    }
    return [];
  }, [selection.householdId, selection.villageId, farmers]);

  // Handle selection changes with cascading resets
  const handleProvinceChange = (value: string) => {
    onChange({
      provinceId: value,
      districtId: undefined,
      wardId: undefined,
      villageId: undefined,
      householdId: undefined,
      farmerId: undefined,
    });
  };

  const handleDistrictChange = (value: string) => {
    onChange({
      ...selection,
      districtId: value,
      wardId: undefined,
      villageId: undefined,
      householdId: undefined,
      farmerId: undefined,
    });
  };

  const handleWardChange = (value: string) => {
    onChange({
      ...selection,
      wardId: value,
      villageId: undefined,
      householdId: undefined,
      farmerId: undefined,
    });
  };

  const handleVillageChange = (value: string) => {
    onChange({
      ...selection,
      villageId: value,
      householdId: undefined,
      farmerId: undefined,
    });
  };

  const handleHouseholdChange = (value: string) => {
    onChange({
      ...selection,
      householdId: value,
      farmerId: undefined,
    });
  };

  const handleFarmerChange = (value: string) => {
    onChange({
      ...selection,
      farmerId: value,
    });
  };

  return (
    <div className="grid gap-4">
      {/* Province */}
      <div className="grid gap-1.5">
        <Label>Province</Label>
        <Select
          value={selection.provinceId || ""}
          onValueChange={handleProvinceChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select province" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District */}
      <div className="grid gap-1.5">
        <Label>District</Label>
        <Select
          value={selection.districtId || ""}
          onValueChange={handleDistrictChange}
          disabled={disabled || !selection.provinceId}
        >
          <SelectTrigger>
            <SelectValue placeholder={selection.provinceId ? "Select district" : "Select province first"} />
          </SelectTrigger>
          <SelectContent>
            {availableDistricts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ward */}
      <div className="grid gap-1.5">
        <Label>Ward</Label>
        <Select
          value={selection.wardId || ""}
          onValueChange={handleWardChange}
          disabled={disabled || !selection.districtId}
        >
          <SelectTrigger>
            <SelectValue placeholder={selection.districtId ? "Select ward" : "Select district first"} />
          </SelectTrigger>
          <SelectContent>
            {availableWards.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Village */}
      <div className="grid gap-1.5">
        <Label>Village</Label>
        <Select
          value={selection.villageId || ""}
          onValueChange={handleVillageChange}
          disabled={disabled || !selection.wardId}
        >
          <SelectTrigger>
            <SelectValue placeholder={selection.wardId ? "Select village" : "Select ward first"} />
          </SelectTrigger>
          <SelectContent>
            {availableVillages.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Household */}
      {showHousehold && (
        <div className="grid gap-1.5">
          <Label>Household</Label>
          <Select
            value={selection.householdId || ""}
            onValueChange={handleHouseholdChange}
            disabled={disabled || !selection.villageId}
          >
            <SelectTrigger>
              <SelectValue placeholder={selection.villageId ? "Select household" : "Select village first"} />
            </SelectTrigger>
            <SelectContent>
              {availableHouseholds.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No households in this village</div>
              ) : (
                availableHouseholds.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.householdCode}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Farmer */}
      {showFarmer && (
        <div className="grid gap-1.5">
          <Label>Farmer</Label>
          <Select
            value={selection.farmerId || ""}
            onValueChange={handleFarmerChange}
            disabled={disabled || (!selection.householdId && !selection.villageId)}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                selection.householdId || selection.villageId 
                  ? "Select farmer" 
                  : "Select household/village first"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableFarmers.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No farmers available</div>
              ) : (
                availableFarmers.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.firstName} {f.lastName} · {f.farmerCode}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

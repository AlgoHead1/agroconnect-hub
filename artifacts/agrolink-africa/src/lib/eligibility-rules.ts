import type { Farmer, EligibilityStatus } from "@/types";

// Simple rule-based eligibility scoring (no AI)
export interface EligibilityResult {
  status: EligibilityStatus;
  score: number; // 0-100
  reasons: string[];
}

export function calculateEligibility(farmer: Farmer): EligibilityResult {
  const reasons: string[] = [];
  let score = 0;

  // Household composition (max 30 points)
  if (farmer.householdSize) {
    if (farmer.householdSize <= 4) {
      score += 15;
      reasons.push("Small household (1-4 members)");
    } else if (farmer.householdSize <= 6) {
      score += 10;
      reasons.push("Medium household (5-6 members)");
    } else {
      score += 5;
      reasons.push("Large household (7+ members)");
    }
  }

  // Dependents (max 30 points)
  const totalDependents = (farmer.dependentsUnder18 || 0) + (farmer.dependentsOver60 || 0);
  if (totalDependents > 0) {
    score += Math.min(15, totalDependents * 3); // 3 points per dependent, max 15
    reasons.push(`${totalDependents} dependents`);
  }

  // Female-headed household (15 points, high priority)
  if (farmer.femaleHeadedHousehold) {
    score += 15;
    reasons.push("Female-headed household");
  }

  // Youth-headed household (10 points)
  if (farmer.youthHeadedHousehold) {
    score += 10;
    reasons.push("Youth-headed household (18-35)");
  }

  // Land size (max 20 points)
  if (farmer.farmSizeHa > 0) {
    if (farmer.farmSizeHa <= 1) {
      score += 20;
      reasons.push("Marginal land (≤1 ha)");
    } else if (farmer.farmSizeHa <= 2) {
      score += 15;
      reasons.push("Small land holding (1-2 ha)");
    } else if (farmer.farmSizeHa <= 5) {
      score += 10;
      reasons.push("Medium land holding (2-5 ha)");
    } else {
      score += 5;
      reasons.push("Larger land holding (>5 ha)");
    }
  }

  // Irrigation access (bonus)
  if (farmer.irrigationAccess && farmer.irrigationAccess !== "None") {
    score += 5;
    reasons.push(`Has ${farmer.irrigationAccess} irrigation`);
  }

  // Vulnerability (bonus)
  if (farmer.vulnerabilityTags && farmer.vulnerabilityTags.length > 0) {
    score += Math.min(10, farmer.vulnerabilityTags.length * 2);
    reasons.push(`${farmer.vulnerabilityTags.length} vulnerability tag(s)`);
  }

  // Determine status based on score
  let status: EligibilityStatus = "Eligible";
  if (score >= 60) {
    status = "Eligible";
  } else if (score >= 40) {
    status = "Waitlisted";
  } else {
    status = "Not Eligible";
  }

  return {
    status,
    score: Math.min(100, score),
    reasons,
  };
}

export function getEligibilityColor(status: EligibilityStatus): string {
  switch (status) {
    case "Eligible":
      return "text-green-600";
    case "Waitlisted":
      return "text-yellow-600";
    case "Not Eligible":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function getEligibilityBgColor(status: EligibilityStatus): string {
  switch (status) {
    case "Eligible":
      return "bg-green-50 border-green-200";
    case "Waitlisted":
      return "bg-yellow-50 border-yellow-200";
    case "Not Eligible":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

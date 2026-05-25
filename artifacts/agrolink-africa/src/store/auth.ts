import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, UserRole } from "@/types";
import { getRolePermissions } from "@/lib/permissions";
import { getAccessibleModules } from "@/lib/roles";

interface AuthState {
  user: AuthUser | null;
  permissions: string[];
  accessibleModules: string[];
  onboardingComplete: boolean;
  onboardingRequiredRoles?: string[];
  setOnboardingRequiredRoles?: (roles: string[]) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  completeOnboarding: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessModule: (module: string) => boolean;
}

// Demo accounts — Phase 1 has no real backend (per spec: no fake backend logic).
// Credentials are stored locally for prototype use only.
const DEMO_ACCOUNTS: Array<AuthUser & { password: string }> = [
  { id: "u-1", email: "admin@agrolink.zw", password: "demo", fullName: "Tendai Marufu", role: "super_admin" },
  { id: "u-2", email: "national@agrolink.zw", password: "demo", fullName: "Rumbidzai Sibanda", role: "national_admin" },
  { id: "u-3", email: "province@agrolink.zw", password: "demo", fullName: "Farai Chiweshe", role: "provincial_admin", province: "p-mac" },
  { id: "u-4", email: "district@agrolink.zw", password: "demo", fullName: "Tariro Mukamuri", role: "district_officer", district: "d-bin" },
  { id: "u-5", email: "ward@agrolink.zw", password: "demo", fullName: "Blessing Moyo", role: "ward_officer" },
  { id: "u-6", email: "extension@agrolink.zw", password: "demo", fullName: "Tatenda Dube", role: "extension_officer" },
  { id: "u-7", email: "warehouse@agrolink.zw", password: "demo", fullName: "Memory Ncube", role: "warehouse_manager" },
  { id: "u-8", email: "ngo@agrolink.zw", password: "demo", fullName: "Chipo Katsande", role: "ngo_partner" },
  { id: "u-9", email: "supplier@agrolink.zw", password: "demo", fullName: "John Moyo", role: "supplier" },
  { id: "u-10", email: "farmer@agrolink.zw", password: "demo", fullName: "Tawanda Dube", role: "farmer" },
];

export const DEMO_USER_LIST = DEMO_ACCOUNTS.map(({ password: _p, ...u }) => u);

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      accessibleModules: [],
      onboardingComplete: false,

      // Roles that should go through onboarding on first login.
      // Edit this list to require onboarding for additional roles.
      onboardingRequiredRoles: ["farmer"],
      setOnboardingRequiredRoles: (roles: string[]) => set({ onboardingRequiredRoles: roles }),
      login: async (email, password) => {
        const match = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
        if (!match) return { ok: false, error: "Invalid credentials. Try admin@agrolink.zw / demo" };
        const { password: _pw, ...user } = match;
        const permissions = getRolePermissions(user.role);
        const accessibleModules = getAccessibleModules(user.role);
        // Enable onboarding only for roles included in `onboardingRequiredRoles`
        const { onboardingRequiredRoles } = get() as any;
        const requires = Array.isArray(onboardingRequiredRoles) ? onboardingRequiredRoles.includes(user.role) : user.role === "farmer";
        set({ user, permissions, accessibleModules, onboardingComplete: !requires });
        return { ok: true };
      },
      logout: () => set({ user: null, permissions: [], accessibleModules: [], onboardingComplete: false }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },
      canAccessModule: (module) => {
        const { accessibleModules } = get();
        return accessibleModules.includes(module);
      },
    }),
    {
      name: "agrolink-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as any),
      ),
    },
  ),
);

export const roleLabel = (r: UserRole) =>
  ({
    super_admin: "Super Admin",
    national_admin: "National Admin",
    provincial_admin: "Provincial Admin",
    district_officer: "District Officer",
    ward_officer: "Ward Officer",
    extension_officer: "Extension Officer",
    warehouse_manager: "Warehouse Manager",
    ngo_partner: "NGO Partner",
    supplier: "Supplier",
    farmer: "Farmer",
  }[r]);

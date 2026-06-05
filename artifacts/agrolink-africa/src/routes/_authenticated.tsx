import { createFileRoute, Outlet, useNavigate, useLocation, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { useAuth, roleLabel } from "@/store/auth";
import { Bell, Search, ShieldX, WifiOff } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { canAccessRoute } from "@/lib/route-guards";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

/**
 * Get role-appropriate destination after onboarding
 */
function getOnboardingRedirectRoute(role: UserRole): string {
  switch (role) {
    case "super_admin":
    case "national_admin":
      return "/dashboard";
    case "provincial_admin":
      return "/distributions";
    case "district_officer":
    case "ward_officer":
    case "extension_officer":
      return "/households";
    case "warehouse_manager":
      return "/warehouses";
    case "ngo_partner":
      return "/reports";
    case "supplier":
      return "/farmers";
    case "farmer":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

function AuthLayout() {
  const user = useAuth((s) => s.user);
  const onboardingComplete = useAuth((s) => s.onboardingComplete);
  const completeOnboarding = useAuth((s) => s.completeOnboarding);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  // Synchronous render-time guard — prevents any protected content flash
  const routeCheck = canAccessRoute(user.role, location.pathname);
  if (!routeCheck.allowed) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/30">
          <AppSidebar />
          <SidebarInset className="flex flex-col min-w-0">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
              <SidebarTrigger />
              <div className="ml-auto flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-medium text-foreground">{user.fullName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{roleLabel(user.role)}</span>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 min-w-0 flex items-center justify-center p-8">
              <div className="text-center max-w-md space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
                  <ShieldX className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                <p className="text-sm text-muted-foreground">
                  Your role (<span className="font-medium text-foreground">{roleLabel(user.role)}</span>) does not have permission to access this page.
                  Contact your system administrator if you believe this is an error.
                </p>
                <Button asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </main>
          </SidebarInset>
        </div>
        <Toaster />
      </SidebarProvider>
    );
  }

  // Show onboarding flow if not completed
  if (!onboardingComplete) {
    return (
      <OnboardingFlow
        role={user.role}
        onComplete={(data) => {
          completeOnboarding();
          const redirectTo = getOnboardingRedirectRoute(user.role);
          navigate({ to: redirectTo });
        }}
        onCancel={() => {
          navigate({ to: "/login" });
        }}
      />
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md text-muted-foreground">
              <Search className="h-4 w-4" />
              <span className="text-sm">Search farmers, households, batches…</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              </button>
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-medium text-foreground">{user.fullName}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{roleLabel(user.role)}</span>
                </div>
              </div>
            </div>
          </header>
          {!isOnline && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-sm">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span className="font-medium">Offline Mode</span>
              <span className="text-yellow-700">— Changes will sync when connection returns.</span>
            </div>
          )}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

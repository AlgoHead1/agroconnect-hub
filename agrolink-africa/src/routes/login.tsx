import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sprout, Loader2 } from "lucide-react";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const user = useAuth((s) => s.user);
  const [email, setEmail] = useState("admin@agrolink.zw");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) setError(res.error ?? "Login failed");
    else navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">AgroLinkAfrica</p>
            <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider">Zimbabwe Registry</p>
          </div>
        </Link>

        <div className="space-y-6 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Modern agricultural intelligence for Zimbabwe's farming communities.
          </h1>
          <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
            Register farmers, manage households, coordinate input distribution, and monitor agricultural performance
            across all 10 provinces — from a single government-grade platform.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-sidebar-border">
            <Stat label="Provinces" value="10" />
            <Stat label="Roles" value="7" />
            <Stat label="Modules" value="10" />
          </div>
        </div>

        <p className="text-xs text-sidebar-foreground/50">
          Phase 1 MVP · Ministry of Agriculture · Built for scale
        </p>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md p-8 space-y-6">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="font-semibold">AgroLinkAfrica</span>
          </Link>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">Access the farmer registry and operations dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Sign in
            </Button>
          </form>

          <div className="rounded-md bg-muted px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Demo credentials</p>
            <p><code className="font-mono">admin@agrolink.zw</code> · <code className="font-mono">demo</code></p>
            <p className="text-[11px]">Also try: national@, province@, district@, ward@, extension@, warehouse@</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">{label}</p>
    </div>
  );
}

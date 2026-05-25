import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sprout, Truck, Package, Users, BarChart3, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">AgroLinkAfrica</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Agricultural Input Distribution for Zimbabwe
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A government-grade platform for managing seed, fertilizer, and agricultural inputs distribution 
            from national warehouses to smallholder farmers across provinces, districts, and wards.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/login">
              <Button size="lg" className="text-base">
                Start Distribution
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              End-to-end input distribution workflow from allocation to collection
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Allocate Inputs</h3>
              <p className="text-sm text-muted-foreground">
                District officers create allocations for farmers with QR codes
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Approve & Verify</h3>
              <p className="text-sm text-muted-foreground">
                Supervisors review and approve allocation requests
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Distribute</h3>
              <p className="text-sm text-muted-foreground">
                Warehouse managers issue inputs and confirm collection
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Track & Report</h3>
              <p className="text-sm text-muted-foreground">
                Real-time analytics on distribution progress and stock levels
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Built for All Stakeholders</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Role-based access for government officials, NGOs, and farmers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Government Officials</h3>
              <p className="text-sm text-muted-foreground">
                National, provincial, and district administrators oversee distribution programs, 
                monitor progress, and ensure accountability across all regions.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">NGO Partners</h3>
              <p className="text-sm text-muted-foreground">
                Partner organizations coordinate input programs, track beneficiary reach, 
                and collaborate with government on agricultural initiatives.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Warehouse Managers</h3>
              <p className="text-sm text-muted-foreground">
                Manage stock levels, process distributions, validate QR codes, 
                and maintain accurate inventory records at distribution points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ready to Transform Agricultural Distribution?</h2>
            <p className="text-muted-foreground">
              Join the platform that's modernizing input distribution across Zimbabwe.
            </p>
            <Link to="/login">
              <Button size="lg" className="text-base">
                Access Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>AgroLinkAfrica — Agricultural Input Distribution Management System</p>
          <p className="mt-1">Demo Prototype for Government & NGO Partners</p>
        </div>
      </footer>
    </div>
  );
}

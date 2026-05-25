import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth, roleLabel } from "@/store/auth";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const user = useAuth((s) => s.user);
  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" breadcrumb="Administration" description="Account preferences and system configuration." />
      <div className="p-6 max-w-3xl space-y-6">
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Profile</h3>
            <p className="text-xs text-muted-foreground">Your account information.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue={user?.fullName} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user?.email} type="email" /></div>
            <div className="space-y-1.5"><Label>Role</Label><Input defaultValue={user ? roleLabel(user.role) : ""} disabled /></div>
          </div>
          <Button>Save changes</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold">System</h3>
            <p className="text-xs text-muted-foreground">Platform configuration (Phase 2).</p>
          </div>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>· Offline sync queue settings</li>
            <li>· Distribution batch numbering format</li>
            <li>· Notification channels (SMS, email)</li>
            <li>· Audit log retention policy</li>
            <li>· Data export schedules</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

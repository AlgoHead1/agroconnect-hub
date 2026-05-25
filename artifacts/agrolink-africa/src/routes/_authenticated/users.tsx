import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_USER_LIST, roleLabel } from "@/store/auth";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

function UsersPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="User Management"
        breadcrumb="Administration"
        description="System users and role assignments. Production deployment wires this into Lovable Cloud auth."
      />
      <div className="p-6">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_USER_LIST.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium text-foreground">{u.fullName}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3"><Badge variant="secondary">{roleLabel(u.role)}</Badge></td>
                  <td className="px-5 py-3"><Badge variant="default">Active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

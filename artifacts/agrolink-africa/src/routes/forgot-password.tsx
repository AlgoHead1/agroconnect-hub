import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-semibold">AgroLinkAfrica</span>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
          <p className="text-sm text-muted-foreground">Enter your registered email and we'll send a reset link.</p>
        </div>
        {sent ? (
          <div className="rounded-md bg-success/10 border border-success/20 px-4 py-3 text-sm text-foreground">
            If an account exists for that address, a reset link has been sent.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@agrolink.zw" />
            </div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        )}
        <Link to="/login" className="text-sm text-primary hover:underline">Back to sign in</Link>
      </Card>
    </div>
  );
}

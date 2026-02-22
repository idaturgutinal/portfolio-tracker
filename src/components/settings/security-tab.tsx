"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

export function SecurityTab({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordSet, setPasswordSet] = useState(hasPassword);

  async function handleUpdate() {
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          passwordSet
            ? { currentPassword, newPassword }
            : { newPassword }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update password");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (!passwordSet) setPasswordSet(true);
    } finally {
      setLoading(false);
    }
  }

  if (!passwordSet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set a Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your account is linked to Google. Set a password to also sign in
              with your email and password.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-positive">Password set successfully.</p>
          )}
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Setting..." : "Set password"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-positive">Password updated successfully.</p>
        )}
        <Button onClick={handleUpdate} disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </Button>
      </CardContent>
    </Card>
  );
}

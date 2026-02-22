import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/services/user.service";
import { SettingsShell } from "@/components/settings/settings-shell";

export const metadata = { title: "Settings — Portfolio Tracker" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getUserProfile(session.user.id);
  if (!profile) redirect("/login");

  return (
    <main className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, preferences, and data.
        </p>
      </div>
      <SettingsShell profile={profile} />
    </main>
  );
}

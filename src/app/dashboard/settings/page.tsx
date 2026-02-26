import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/services/user.service";
import { SettingsShell } from "@/components/settings/settings-shell";
import { UserGuidePanel } from "@/components/onboarding/user-guide-panel";
import { PageHeader } from "@/components/page-header";
import { Settings, KeyRound } from "lucide-react";

export const metadata = { title: "Settings — FolioVault" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getUserProfile(session.user.id);
  if (!profile) redirect("/login");

  return (
    <main className="container py-8 space-y-6">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Manage your account, preferences, and data."
      />
      <UserGuidePanel />

      {/* Binance API Keys Card */}
      <Link
        href="/dashboard/settings/api-keys"
        className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-yellow-500/10">
          <KeyRound className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Binance API Keys</h3>
          <p className="text-xs text-muted-foreground">
            Manage your Binance API keys for trading
          </p>
        </div>
        <span className="text-muted-foreground text-sm">&rarr;</span>
      </Link>

      <SettingsShell profile={profile} />
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/services/user.service";
import { SettingsShell } from "@/components/settings/settings-shell";
import { UserGuidePanel } from "@/components/onboarding/user-guide-panel";
import { PageHeader } from "@/components/page-header";
import { Settings } from "lucide-react";

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
      <SettingsShell profile={profile} />
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CURRENT_LEGAL_VERSION } from "@/lib/legal-version";
import { SidebarNav } from "@/components/sidebar-nav";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { LegalConsentModal } from "@/components/legal-consent-modal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { legalConsentVersion: true },
  });

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav
        userName={session.user.name ?? session.user.email ?? ""}
        userEmail={session.user.email ?? undefined}
      />
      <LegalConsentModal
        currentVersion={CURRENT_LEGAL_VERSION}
        userVersion={user?.legalConsentVersion ?? null}
      />
      <OnboardingDialog userId={session.user.id} />
      <div className="relative pt-14 md:pt-0 md:pl-64">
        {/* Subtle dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

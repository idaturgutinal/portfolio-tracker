import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav
        userName={session.user.name ?? session.user.email ?? ""}
        userEmail={session.user.email ?? undefined}
      />
      <OnboardingDialog userId={session.user.id} />
      <div className="relative pt-14 md:pt-0 md:pl-64">
        {/* Subtle dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
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

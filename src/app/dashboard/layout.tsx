import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";

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
      <div className="pt-14 md:pt-0 md:pl-64">
        {children}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SupportForm } from "@/components/support/support-form";
import { PageHeader } from "@/components/page-header";
import { LifeBuoy } from "lucide-react";

export const metadata = { title: "Support — FolioVault" };

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="container py-8 space-y-6">
      <PageHeader
        icon={LifeBuoy}
        title="Support"
        description="Have a question or issue? Send us a message and we'll get back to you."
      />
      <SupportForm />
    </main>
  );
}
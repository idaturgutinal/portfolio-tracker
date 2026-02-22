import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SupportForm } from "@/components/support/support-form";

export const metadata = { title: "Support — Portfolio Tracker" };

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground mt-1">
          Have a question or issue? Send us a message and we'll get back to you.
        </p>
      </div>
      <SupportForm />
    </main>
  );
}
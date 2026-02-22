import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">Portfolio Tracker</h1>
        <p className="text-muted-foreground">
          Track your investments across stocks, ETFs, crypto, and more.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

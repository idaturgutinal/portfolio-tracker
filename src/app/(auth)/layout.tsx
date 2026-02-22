import { PieChart, Shield, BarChart2 } from "lucide-react";
import { FolioVaultLogo } from "@/components/folio-vault-logo";

const HIGHLIGHTS = [
  { icon: PieChart, text: "Multi-asset portfolio tracking" },
  { icon: BarChart2, text: "Real-time analytics & charts" },
  { icon: Shield, text: "Secure & private by default" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex-col justify-center px-12 xl:px-20">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-2.5">
            <FolioVaultLogo size={28} />
            <span className="text-2xl font-bold tracking-tight">FolioVault</span>
          </div>

          <p className="text-lg font-medium leading-relaxed opacity-90">
            Your investments, one clear view. Track, analyse, and stay on top of
            every asset in your portfolio.
          </p>

          <ul className="space-y-3 pt-2">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm opacity-80">
                <Icon className="h-4 w-4 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-12">
        {/* Mobile-only branding */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <FolioVaultLogo size={20} className="text-primary" />
          <span className="font-semibold text-sm tracking-tight">FolioVault</span>
        </div>

        {children}
      </div>
    </div>
  );
}

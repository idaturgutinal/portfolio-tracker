/**
 * Ambient type stubs for packages missing bundled/DefinitelyTyped types.
 * All other packages (react, next, next-auth, radix, recharts, prisma, etc.)
 * have real types provided by node_modules — do NOT redeclare them here.
 */

// ─── Lucide React (missing .d.ts in installed package) ───────────────────────

declare module "lucide-react" {
  import type { FC, SVGAttributes } from "react";

  type LucideProps = SVGAttributes<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
    color?: string;
    className?: string;
  };
  export type LucideIcon = FC<LucideProps>;

  export const Activity: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowDown: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowLeftRight: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUp: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const BarChart2: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Calendar: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Clock: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Download: LucideIcon;
  export const Edit: LucideIcon;
  export const Eye: LucideIcon;
  export const FileText: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const Globe: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Home: LucideIcon;
  export const Info: LucideIcon;
  export const Key: LucideIcon;
  export const KeyRound: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const LifeBuoy: LucideIcon;
  export const LineChart: LucideIcon;
  export const Loader2: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const Menu: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Moon: LucideIcon;
  export const Package: LucideIcon;
  export const Pencil: LucideIcon;
  export const PieChart: LucideIcon;
  export const Plus: LucideIcon;
  export const Power: LucideIcon;
  export const RefreshCcw: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Rocket: LucideIcon;
  export const Search: LucideIcon;
  export const Settings: LucideIcon;
  export const Shield: LucideIcon;
  export const Star: LucideIcon;
  export const Sun: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const Wallet: LucideIcon;
  export const X: LucideIcon;
}

// ─── Tailwind CSS (config types not bundled) ─────────────────────────────────

declare module "tailwindcss" {
  export interface Config {
    content?: string[];
    darkMode?: string | string[];
    theme?: Record<string, unknown>;
    plugins?: unknown[];
    prefix?: string;
    separator?: string;
    important?: boolean | string;
    [key: string]: unknown;
  }
}

declare module "tailwindcss-animate" {
  const plugin: unknown;
  export default plugin;
}

declare module "tailwindcss/plugin" {
  function plugin(
    handler: () => void,
    config?: Record<string, unknown>
  ): unknown;
  export = plugin;
}

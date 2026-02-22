import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

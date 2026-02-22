import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="container py-8 space-y-6 max-w-3xl">
      {/* Page header */}
      <Skeleton className="h-8 w-28" />

      {/* Tab bar */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      {/* Form card */}
      <div className="rounded-xl border p-6 space-y-5">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

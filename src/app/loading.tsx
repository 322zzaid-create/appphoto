import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

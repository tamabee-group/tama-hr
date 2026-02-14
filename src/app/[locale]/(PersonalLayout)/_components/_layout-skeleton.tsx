"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton cho PersonalLayout
 */
export function LayoutSkeleton() {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex min-h-screen w-full">
        {/* Sidebar skeleton - ẩn trên mobile */}
        <div className="hidden md:flex w-64 flex-col border-r bg-background p-4 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 w-full">
          {/* Header skeleton */}
          <div className="sticky top-0 z-10 flex items-center justify-between w-full bg-primary-foreground border-b border-primary/20 h-[50px] px-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          {/* Content skeleton */}
          <div className="p-4 pb-24 md:pb-4 space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>

          {/* Bottom nav skeleton - chỉ mobile */}
          <div className="fixed bottom-0 left-0 right-0 md:hidden h-16 bg-background/80 backdrop-blur-lg border-t">
            <div className="flex justify-around items-center h-full px-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

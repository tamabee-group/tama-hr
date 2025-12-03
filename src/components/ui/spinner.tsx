import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function SpinnerBase({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export function Spinner({
  className,
}: React.ComponentProps<typeof SpinnerBase> & { delayMs?: number }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <SpinnerBase />
    </div>
  );
}

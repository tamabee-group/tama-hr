import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Triangle } from "react-loader-spinner";

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

type SpinnerType = "triangle" | "page";

export function Spinner({
  className,
  type,
}: React.ComponentProps<typeof SpinnerBase> & {
  delayMs?: number;
  type?: SpinnerType | null;
}) {
  switch (type) {
    case "triangle":
      return (
        <div className="flex justify-center items-center h-[calc(100vh-100px)] text-muted-foreground">
          <Triangle
            visible
            height="80"
            width="80"
            color="var(--primary)"
            ariaLabel="triangle-loading"
          />
        </div>
      );

    case "page":
      return (
        <div className="flex items-center justify-center min-h-screen">
          <SpinnerBase />
        </div>
      );

    default:
      return (
        <div className={cn("flex items-center gap-4", className)}>
          <SpinnerBase />
        </div>
      );
  }
}

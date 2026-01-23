import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  onChange,
  ...props
}: React.ComponentProps<"textarea">) {
  // Auto viết hoa chữ cái đầu
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length === 1) {
      e.target.value = value.charAt(0).toUpperCase();
    }
    onChange?.(e);
  };

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "my-1.5",
        className,
      )}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Textarea };

"use client";

import { useMemo, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { formatDate } from "@/lib/utils/format-date-time";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

type SupportedLocale = "vi" | "en" | "ja";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  locale?: SupportedLocale;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày...",
  locale: localeProp,
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // Lấy locale từ next-intl nếu không được truyền vào
  const nextIntlLocale = useLocale() as SupportedLocale;
  const locale = localeProp || nextIntlLocale || "vi";

  // Lấy timezone một lần khi component mount
  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 justify-start text-left font-normal w-full",
            !value && "text-muted-foreground",
            "my-1.5",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="ml-2 truncate">
            {value ? formatDate(value, locale) : placeholder}
          </span>
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            "bg-popover text-popover-foreground z-9999 w-auto rounded-md border p-0 shadow-md outline-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            defaultMonth={value}
            autoFocus
            captionLayout="dropdown"
            startMonth={new Date(new Date().getFullYear() - 60, 0)}
            endMonth={new Date(new Date().getFullYear() + 10, 11)}
            timeZone={timeZone}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

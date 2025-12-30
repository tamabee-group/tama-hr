"use client";

import { format } from "date-fns";
import { vi, enUS, ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SupportedLocale = "vi" | "en" | "ja";

const localeMap = {
  vi: vi,
  en: enUS,
  ja: ja,
};

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
  placeholder = "Chọn ngày",
  locale = "vi",
  className,
  disabled = false,
}: DatePickerProps) {
  const dateLocale = localeMap[locale];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-40 justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="ml-2 truncate">
            {value
              ? format(value, "dd/MM/yyyy", { locale: dateLocale })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          locale={dateLocale}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

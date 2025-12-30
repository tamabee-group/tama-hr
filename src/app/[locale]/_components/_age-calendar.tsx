"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { formatDate } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface AgeCalendarProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  defaultValue?: Date;
}

export function AgeCalendar({
  value,
  onChange,
  defaultValue,
}: AgeCalendarProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(defaultValue);
  const locale = useLocale() as SupportedLocale;
  const selectedDate = value || date;

  return (
    <div className="flex flex-col gap-3 my-1.5 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full h-9 justify-between font-normal"
          >
            {selectedDate ? formatDate(selectedDate, locale) : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={defaultValue}
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date()}
            onSelect={(date) => {
              setDate(date);
              onChange?.(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

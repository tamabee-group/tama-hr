"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ============================================
// Types
// ============================================

export interface TimePreset {
  label: string;
  value: string; // HH:mm format
}

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  presets?: TimePreset[];
  disabled?: boolean;
  className?: string;
  id?: string;
  quickSelectLabel?: string; // Label cho phần chọn nhanh
}

// ============================================
// Default Presets
// ============================================

// Tạo danh sách thời gian từ 00:00 đến 23:30 (mỗi 30 phút)
const generateTimePresets = (): TimePreset[] => {
  const presets: TimePreset[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      presets.push({ label: time, value: time });
    }
  }
  return presets;
};

export const DEFAULT_TIME_PRESETS: TimePreset[] = generateTimePresets();

// Helper: Cắt bỏ giây từ time string (HH:mm:ss -> HH:mm)
const formatTimeWithoutSeconds = (time: string): string => {
  if (!time) return time;
  const parts = time.split(":");
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
};

// ============================================
// TimePicker Component
// ============================================

export function TimePicker({
  value = "",
  onChange,
  placeholder = "00:00",
  presets = DEFAULT_TIME_PRESETS,
  disabled = false,
  className,
  id,
  quickSelectLabel = "Quick select",
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  // Chuẩn hóa value: bỏ giây nếu có
  const normalizedValue = formatTimeWithoutSeconds(value);
  const [inputValue, setInputValue] = React.useState(normalizedValue);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Sync với external value
  React.useEffect(() => {
    setInputValue(formatTimeWithoutSeconds(value));
  }, [value]);

  // Auto scroll đến item đang active khi mở popover
  React.useEffect(() => {
    if (open && inputValue) {
      setTimeout(() => {
        const activeButton = document.querySelector(
          `[data-time-value="${inputValue}"]`,
        ) as HTMLElement;
        if (activeButton) {
          activeButton.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [open, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handlePresetClick = (presetValue: string) => {
    setInputValue(presetValue);
    onChange?.(presetValue);
    setOpen(false);
  };

  const displayValue = inputValue || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !inputValue && "text-muted-foreground",
            className,
          )}
        >
          <span className="tabular-nums">{displayValue}</span>
          <Clock className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-3" align="start">
        <div className="space-y-3">
          {/* Input trực tiếp */}
          <Input
            type="time"
            value={inputValue}
            onChange={handleInputChange}
            className="w-full"
          />

          {/* Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                {quickSelectLabel}
              </p>
              <div
                ref={scrollRef}
                className="max-h-[200px] overflow-y-auto scroll-smooth"
                onWheel={(e) => {
                  // Ngăn scroll lan ra ngoài
                  e.stopPropagation();
                }}
              >
                <div className="grid grid-cols-2 gap-1 pr-1">
                  {presets.map((preset) => {
                    const isSelected = inputValue === preset.value;
                    return (
                      <Button
                        key={preset.value}
                        data-time-value={preset.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="text-xs tabular-nums"
                        onClick={() => handlePresetClick(preset.value)}
                      >
                        {preset.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

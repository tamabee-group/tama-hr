"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export type ReasonCategory = "leave" | "swap" | "adjustment";

interface ReasonTemplateSelectProps {
  category: ReasonCategory;
  value: string;
  onChange: (reason: string) => void;
  error?: string;
  className?: string;
}

// Keys cho mỗi category
const REASON_KEYS: Record<ReasonCategory, string[]> = {
  leave: [
    "sick",
    "fever",
    "hospital",
    "family",
    "childcare",
    "funeral",
    "wedding",
    "personal",
    "government",
    "moving",
    "other",
  ],
  swap: [
    "personal",
    "family",
    "hospital",
    "childcare",
    "schedule",
    "emergency",
    "travel",
    "study",
    "other",
  ],
  adjustment: [
    "forgot",
    "systemError",
    "cardError",
    "overtime",
    "earlyArrival",
    "breakError",
    "wrongTime",
    "other",
  ],
};

// ============================================
// Component
// ============================================

export function ReasonTemplateSelect({
  category,
  value,
  onChange,
  error,
  className,
}: ReasonTemplateSelectProps) {
  const t = useTranslations("common.reasonTemplates");
  const [selectedKey, setSelectedKey] = React.useState<string>("");
  const [customReason, setCustomReason] = React.useState("");
  const isSelectingOther = React.useRef(false);

  // Lấy danh sách templates theo category
  const templates = React.useMemo(() => {
    return REASON_KEYS[category].map((key) => ({
      key,
      label: t(`${category}.${key}`),
    }));
  }, [category, t]);

  // Sync từ value prop khi mount hoặc value thay đổi từ bên ngoài
  React.useEffect(() => {
    // Bỏ qua nếu đang chọn "other"
    if (isSelectingOther.current) {
      isSelectingOther.current = false;
      return;
    }

    if (!value) {
      // Chỉ reset nếu không phải đang ở trạng thái "other"
      if (selectedKey !== "other") {
        setSelectedKey("");
        setCustomReason("");
      }
      return;
    }

    // Tìm key tương ứng với value
    const matchedTemplate = templates.find((tpl) => tpl.label === value);
    if (matchedTemplate && matchedTemplate.key !== "other") {
      setSelectedKey(matchedTemplate.key);
      setCustomReason("");
    } else if (value && !matchedTemplate) {
      // Value là custom text
      setSelectedKey("other");
      setCustomReason(value);
    }
  }, [value, templates, selectedKey]);

  const handleSelectChange = (key: string) => {
    setSelectedKey(key);
    if (key === "other") {
      isSelectingOther.current = true;
      setCustomReason("");
      onChange("");
    } else {
      const template = templates.find((tpl) => tpl.key === key);
      if (template) {
        onChange(template.label);
      }
    }
  };

  const handleCustomReasonChange = (text: string) => {
    setCustomReason(text);
    onChange(text);
  };

  const isOther = selectedKey === "other";

  return (
    <div className={cn(className)}>
      <Select value={selectedKey} onValueChange={handleSelectChange}>
        <SelectTrigger
          className={cn(
            "w-full",
            error && !isOther && "ring-2 ring-destructive",
          )}
        >
          <SelectValue placeholder={t("selectReason")} />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.key} value={template.key}>
              {template.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isOther && (
        <Textarea
          value={customReason}
          onChange={(e) => handleCustomReasonChange(e.target.value)}
          placeholder={t("customReasonPlaceholder")}
          rows={2}
          className={cn("resize-none mt-2", error && "ring-2 ring-destructive")}
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

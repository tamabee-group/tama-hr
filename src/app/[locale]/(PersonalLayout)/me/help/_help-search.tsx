"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { ClearableInput } from "@/components/ui/clearable-input";

interface HelpSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Ô tìm kiếm articles — lọc theo keyword (case-insensitive)
 * Xóa keyword → quay về topic đang chọn
 */
export function HelpSearch({ value, onChange }: HelpSearchProps) {
  const t = useTranslations("help");

  return (
    <ClearableInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClear={() => onChange("")}
      placeholder={t("searchPlaceholder")}
      icon={<Search className="h-4 w-4" />}
    />
  );
}

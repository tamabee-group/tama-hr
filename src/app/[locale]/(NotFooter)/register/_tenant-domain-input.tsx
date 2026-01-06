"use client";

import { useState, useEffect, useMemo } from "react";
import { Globe, Check, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  validateTenantDomain,
  TenantDomainValidationResult,
} from "@/lib/utils/validate-tenant-domain";
import { checkTenantDomainAvailability } from "@/lib/apis/auth";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface TenantDomainInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export function TenantDomainInput({
  value,
  onChange,
  onValidityChange,
}: TenantDomainInputProps) {
  const t = useTranslations("auth.register");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Validate format
  const validation: TenantDomainValidationResult = useMemo(() => {
    if (!value) return { valid: false };
    return validateTenantDomain(value);
  }, [value]);

  // Lấy error message từ validation result
  const formatError = useMemo(() => {
    if (!value) return null;
    if (!validation.valid && validation.errorCode) {
      switch (validation.errorCode) {
        case "TOO_SHORT":
          return t("domainTooShort");
        case "TOO_LONG":
          return t("domainTooLong");
        case "INVALID_CHARS":
          return t("domainInvalidChars");
        case "INVALID_HYPHEN":
          return t("domainInvalidHyphen");
        default:
          return null;
      }
    }
    return null;
  }, [value, validation, t]);

  // Debounce check availability
  useEffect(() => {
    // Reset availability khi value thay đổi
    setIsAvailable(null);

    // Không check nếu format không hợp lệ
    if (!value || !validation.valid) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const result = await checkTenantDomainAvailability(value);
        setIsAvailable(result.available);
      } catch {
        // Nếu API lỗi, coi như không khả dụng
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, validation.valid]);

  // Notify parent về validity
  useEffect(() => {
    const isValid = validation.valid && isAvailable === true;
    onValidityChange?.(isValid);
  }, [validation.valid, isAvailable, onValidityChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chuyển về lowercase và loại bỏ ký tự không hợp lệ
    const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    onChange(newValue);
  };

  return (
    <div className="space-y-1.5">
      <InputGroup>
        <InputGroupInput
          value={value}
          onChange={handleChange}
          placeholder={t("domainPlaceholder")}
        />
        <InputGroupAddon>
          <Globe />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">.tamabee.vn</InputGroupAddon>
      </InputGroup>

      {/* Status indicator */}
      <div className="min-h-[20px]">
        {isChecking && (
          <span className="text-muted-foreground text-sm flex items-center gap-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t("domainChecking")}
          </span>
        )}
        {!isChecking && formatError && (
          <span className="text-destructive text-sm">{formatError}</span>
        )}
        {!isChecking && !formatError && isAvailable === true && (
          <span className="text-green-600 text-sm flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {t("domainAvailable")}
          </span>
        )}
        {!isChecking && !formatError && isAvailable === false && (
          <span className="text-destructive text-sm flex items-center gap-1">
            <X className="w-3.5 h-3.5" />
            {t("domainTaken")}
          </span>
        )}
      </div>
    </div>
  );
}

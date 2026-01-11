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
import { Label } from "@/components/ui/label";

interface TenantDomainInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  /** Hiển thị label bên trong component */
  showLabel?: boolean;
}

export function TenantDomainInput({
  value,
  onChange,
  onValidityChange,
  showLabel = false,
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

  // Render status message
  const renderStatus = () => {
    if (isChecking) {
      return (
        <span className="text-muted-foreground text-sm flex items-center leading-0 gap-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t("domainChecking")}
        </span>
      );
    }
    if (formatError) {
      return (
        <span className="text-destructive text-sm flex items-center leading-0 gap-1">
          <X className="w-3.5 h-3.5" />
          {formatError}
        </span>
      );
    }
    if (isAvailable === true) {
      return (
        <span className="text-green-600 text-sm flex items-center leading-0 gap-1">
          <Check className="w-3.5 h-3.5" />
          {t("domainAvailable")}
        </span>
      );
    }
    if (isAvailable === false) {
      return (
        <span className="text-destructive text-sm flex items-center leading-0 gap-1">
          <X className="w-3.5 h-3.5" />
          {t("domainTaken")}
        </span>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Label - luôn hiển thị */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <Label htmlFor="tenantDomain">{t("tenantDomain")}</Label>
          {/* Status bên cạnh label - chỉ desktop */}
          <span className="hidden md:block">{renderStatus()}</span>
        </div>
      )}

      <InputGroup>
        <InputGroupInput
          id="tenantDomain"
          value={value}
          onChange={handleChange}
          placeholder={t("domainPlaceholder")}
        />
        <InputGroupAddon>
          <Globe />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">.tamabee.vn</InputGroupAddon>
      </InputGroup>

      {/* Status dưới input - mobile hoặc khi không có label */}
      <div className={showLabel ? "md:hidden" : ""}>{renderStatus()}</div>
    </div>
  );
}

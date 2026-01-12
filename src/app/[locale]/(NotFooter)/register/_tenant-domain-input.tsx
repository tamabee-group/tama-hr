"use client";

import { useState, useEffect } from "react";
import { Globe, Check, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
  // Lưu reason từ backend: INVALID_FORMAT, RESERVED, ALREADY_EXISTS
  const [errorReason, setErrorReason] = useState<string | null>(null);

  // Debounce check availability từ backend
  useEffect(() => {
    // Reset state khi value thay đổi
    setIsAvailable(null);
    setErrorReason(null);

    // Không check nếu chưa nhập gì
    if (!value) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const result = await checkTenantDomainAvailability(value);
        setIsAvailable(result.available);
        setErrorReason(result.reason || null);
      } catch {
        // Nếu API lỗi, coi như không khả dụng
        setIsAvailable(false);
        setErrorReason(null);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Notify parent về validity
  useEffect(() => {
    const isValid = isAvailable === true;
    onValidityChange?.(isValid);
  }, [isAvailable, onValidityChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ chuyển về lowercase, validate ở backend
    const newValue = e.target.value.toLowerCase();
    onChange(newValue);
  };

  // Lấy error message từ reason
  const getErrorMessage = () => {
    if (!errorReason) return t("domainTaken");
    switch (errorReason) {
      case "INVALID_FORMAT":
        return t("domainInvalidChars");
      case "RESERVED":
        return t("domainReserved");
      case "ALREADY_EXISTS":
        return t("domainTaken");
      default:
        return t("domainTaken");
    }
  };

  // Render status message
  const renderStatus = () => {
    if (isChecking) {
      return (
        <span className="text-muted-foreground text-sm flex items-center gap-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          {t("domainChecking")}
        </span>
      );
    }
    if (isAvailable === true) {
      return (
        <span className="text-green-600 text-sm flex items-center gap-1">
          <Check className="w-3.5 h-3.5 shrink-0" />
          {t("domainAvailable")}
        </span>
      );
    }
    if (isAvailable === false) {
      return (
        <span className="text-destructive text-sm flex items-center gap-1">
          <X className="w-3.5 h-3.5 shrink-0" />
          {getErrorMessage()}
        </span>
      );
    }
    return null;
  };

  return (
    <div>
      {showLabel && <Label htmlFor="tenantDomain">{t("tenantDomain")}</Label>}

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

      {/* Status luôn hiển thị dưới input */}
      <div>{renderStatus()}</div>
    </div>
  );
}

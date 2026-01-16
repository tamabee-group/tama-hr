"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoginDialog } from "@/app/[locale]/_components/_header/_login-dialog";
import { ClearableInput } from "@/components/ui/clearable-input";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Building2,
  User,
  Phone,
  MapPin,
  Mail,
  Milestone,
  Briefcase,
  Globe,
  Languages,
} from "lucide-react";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { SelectItem } from "@/components/ui/select";
import { NextPage } from "next";

import { sendVerificationCode } from "@/lib/apis/auth";
import { useState, useCallback } from "react";
import type { RegisterFormData } from "@/types/register";
import { useKeyDown } from "@/hooks/use-key-down";
import { toast } from "sonner";
import { getZipcodeLength, localeToRegion } from "@/hooks/use-zipcode";
import { INDUSTRIES } from "@/constants/industries";
import { validateEmail, validatePhone } from "@/lib/validation";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";
import { TenantDomainInput } from "./_tenant-domain-input";

interface Props {
  formData: RegisterFormData;
  setFormData: (data: RegisterFormData) => void;
  zipcode: string;
  setZipcode: (zipcode: string) => void;
  loading: boolean;
  handleNext: () => void;
  emailSent: string;
  setEmailSent: (email: string) => void;
  companySent: string;
  setCompanySent: (company: string) => void;
  setResendTimer: (timer: number) => void;
  verified: boolean;
  setVerified: (verified: boolean) => void;
  fromStep4?: boolean;
  handleConfirm?: () => void;
}

const Step1: NextPage<Props> = ({
  formData,
  setFormData,
  zipcode,
  setZipcode,
  loading,
  handleNext,
  emailSent,
  setEmailSent,
  companySent,
  setCompanySent,
  setResendTimer,
  verified,
  setVerified,
  fromStep4 = false,
  handleConfirm,
}) => {
  const t = useTranslations("auth");
  const tValidation = useTranslations("auth.validation");
  const tRegister = useTranslations("auth.register");
  const tErrors = useTranslations("errors");
  const tIndustry = useTranslations("enums.industry");

  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginOpen, setLoginOpen] = useState(false);
  const [isDomainValid, setIsDomainValid] = useState(false);

  const handleDomainValidityChange = useCallback((isValid: boolean) => {
    setIsDomainValid(isValid);
  }, []);

  const isPhoneValid = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    return (
      /^(0|\+84)[0-9]{9}$/.test(cleaned) ||
      /^(0|\+81)[0-9]{9,10}$/.test(cleaned)
    );
  };

  const hasCJKCharacters = (text: string): boolean => {
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(text);
  };

  const getFieldError = (field: string, value: string): string | null => {
    switch (field) {
      case "companyName":
        if (!value.trim()) return tValidation("companyNameRequired");
        if (value.trim().length < 3) return tValidation("companyNameMinLength");
        return null;
      case "ownerName":
        if (!value.trim()) return tValidation("ownerNameRequired");
        if (hasCJKCharacters(value)) return tValidation("ownerNameRomajiOnly");
        if (value.trim().length < 2) return tValidation("ownerNameMinLength");
        return null;
      case "phone":
        if (!value.trim()) return tValidation("phoneRequired");
        const phoneError = validatePhone(value);
        if (phoneError) return phoneError;
        if (!isPhoneValid(value)) return tValidation("phoneInvalid");
        return null;
      case "email":
        return validateEmail(value);
      case "industry":
        if (!value) return tValidation("industryRequired");
        return null;
      case "locale":
        if (!value) return tValidation("localeRequired");
        return null;
      case "language":
        if (!value) return tValidation("languageRequired");
        return null;
      case "address":
        if (!value.trim()) return tValidation("addressRequired");
        if (value.trim().length < 5) return tValidation("addressMinLength");
        return null;
      default:
        return null;
    }
  };

  const validateField = (field: string, value: string) => {
    const error = getFieldError(field, value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};

    const fields = [
      "companyName",
      "ownerName",
      "phone",
      "email",
      "industry",
      "locale",
      "language",
      "address",
    ];
    fields.forEach((field) => {
      const error = getFieldError(
        field,
        formData[field as keyof RegisterFormData] as string,
      );
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    if (fromStep4 && verified && handleConfirm) {
      handleConfirm();
      return;
    }

    if (
      verified &&
      emailSent === formData.email &&
      companySent === formData.companyName
    ) {
      handleNext();
      return;
    }

    if (emailSent === formData.email && companySent === formData.companyName) {
      handleNext();
      return;
    }

    setSending(true);
    try {
      await sendVerificationCode(
        formData.email,
        formData.companyName,
        formData.language,
      );
      setFormData({ ...formData, otp: "" });
      setEmailSent(formData.email);
      setCompanySent(formData.companyName);
      setResendTimer(60);
      toast.success(t("codeSent"));
      handleNext();
    } catch (error: unknown) {
      console.error("Error sending verification code:", error);
      const apiError = error as { errorCode?: string; message?: string };
      const errorCode = apiError.errorCode;

      if (errorCode) {
        const errorMessage = tErrors(errorCode as string);
        if (errorCode === "EMAIL_EXISTS" || errorCode === "EMAIL_NOT_FOUND") {
          setErrors((prev) => ({ ...prev, email: errorMessage }));
        } else {
          setErrors((prev) => ({ ...prev, email: errorMessage }));
        }
      } else {
        const message = apiError.message || tErrors("generic");
        setErrors((prev) => ({ ...prev, email: message }));
      }
    } finally {
      setSending(false);
    }
  };
  useKeyDown({ onEnter: handleContinue, disabled: sending });

  return (
    <div className="grid md:grid-cols-2 md:border md:p-6 md:rounded-xl md:shadow-md">
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-2 text-center">
          <CardTitle className="text-2xl">{tRegister("title")}</CardTitle>
          <CardDescription className="text-sm">
            {tRegister("description")}
          </CardDescription>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">{tRegister("companyName")}</Label>
            <ClearableInput
              id="companyName"
              value={formData.companyName}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, companyName: value });
                validateField("companyName", value);
                setVerified(
                  value === companySent && formData.email === emailSent,
                );
              }}
              onClear={() => {
                setFormData({ ...formData, companyName: "" });
                if (companySent) setVerified(false);
              }}
              onBlur={(e) => validateField("companyName", e.target.value)}
              icon={<Building2 />}
              placeholder={tRegister("companyNamePlaceholder")}
              textTransform="uppercase"
            />
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">
                {errors.companyName}
              </p>
            )}
          </div>
          <div>
            <TenantDomainInput
              value={formData.tenantDomain}
              onChange={(value) =>
                setFormData({ ...formData, tenantDomain: value })
              }
              onValidityChange={handleDomainValidityChange}
              showLabel
            />
          </div>
          <div>
            <Label htmlFor="ownerName">{tRegister("ownerName")}</Label>
            <ClearableInput
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, ownerName: value });
                validateField("ownerName", value);
              }}
              onClear={() => setFormData({ ...formData, ownerName: "" })}
              onBlur={(e) => validateField("ownerName", e.target.value)}
              icon={<User />}
              placeholder={tRegister("ownerNamePlaceholder")}
              textTransform="words"
            />
            {errors.ownerName && (
              <p className="text-sm text-destructive mt-1">
                {errors.ownerName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">{tRegister("phone")}</Label>
            <ClearableInput
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                validateField("phone", e.target.value);
              }}
              onClear={() => setFormData({ ...formData, phone: "" })}
              onBlur={(e) => validateField("phone", e.target.value)}
              icon={<Phone />}
              placeholder={tRegister("phonePlaceholder")}
              textTransform="none"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">{tRegister("email")}</Label>
            <ClearableInput
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, email: value, otp: "" });
                validateField("email", value);
                setVerified(
                  value === emailSent && formData.companyName === companySent,
                );
              }}
              onClear={() => {
                setFormData({ ...formData, email: "", otp: "" });
                if (emailSent) setVerified(false);
              }}
              onBlur={(e) => validateField("email", e.target.value)}
              icon={<Mail />}
              placeholder={tRegister("emailPlaceholder")}
              textTransform="lowercase"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="industry">{tRegister("industry")}</Label>
            <SelectWithIcon
              value={formData.industry}
              onValueChange={(value) => {
                setFormData({ ...formData, industry: value });
                validateField("industry", value);
              }}
              placeholder={tRegister("industryPlaceholder")}
              icon={<Briefcase />}
            >
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {tIndustry(industry)}
                </SelectItem>
              ))}
            </SelectWithIcon>
            {errors.industry && (
              <p className="text-sm text-destructive mt-1">{errors.industry}</p>
            )}
          </div>
          <div>
            <Label htmlFor="locale">{tRegister("locale")}</Label>
            <SelectWithIcon
              value={formData.locale}
              onValueChange={(value) => {
                setFormData({ ...formData, locale: value });
                validateField("locale", value);
                // Clear zipcode khi đổi locale vì độ dài khác nhau
                setZipcode("");
              }}
              placeholder={tRegister("localePlaceholder")}
              icon={<Globe />}
            >
              <SelectItem value="vi">{tRegister("localeVietnam")}</SelectItem>
              <SelectItem value="ja">{tRegister("localeJapan")}</SelectItem>
            </SelectWithIcon>
            {errors.locale && (
              <p className="text-sm text-destructive mt-1">{errors.locale}</p>
            )}
          </div>
          <div>
            <Label htmlFor="language">{tRegister("language")}</Label>
            <SelectWithIcon
              value={formData.language}
              onValueChange={(value) => {
                setFormData({ ...formData, language: value });
                validateField("language", value);
              }}
              placeholder={tRegister("languagePlaceholder")}
              icon={<Languages />}
            >
              <SelectItem value="vi">{tRegister("languageVi")}</SelectItem>
              <SelectItem value="en">{tRegister("languageEn")}</SelectItem>
              <SelectItem value="ja">{tRegister("languageJa")}</SelectItem>
            </SelectWithIcon>
            {errors.language && (
              <p className="text-sm text-destructive mt-1">{errors.language}</p>
            )}
          </div>
          <div>
            <Label htmlFor="zipcode">{tRegister("zipcode")}</Label>
            <ClearableInput
              id="zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value.replace(/\D/g, ""))}
              onClear={() => setZipcode("")}
              icon={<Milestone />}
              placeholder={tRegister("zipcodePlaceholder")}
              maxLength={getZipcodeLength(localeToRegion(formData.locale))}
              textTransform="none"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">{tRegister("address")}</Label>
            <ClearableInput
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                validateField("address", e.target.value);
              }}
              onClear={() => setFormData({ ...formData, address: "" })}
              onBlur={(e) => validateField("address", e.target.value)}
              icon={loading ? <Spinner /> : <MapPin />}
              placeholder={
                loading
                  ? tRegister("addressLoading")
                  : tRegister("addressPlaceholder")
              }
              disabled={loading}
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleContinue}
            disabled={sending || !isDomainValid}
            className="w-full md:w-auto md:px-12 md:ml-auto md:flex"
          >
            {sending ? (
              <>
                <Spinner />
                {tRegister("processing")}
              </>
            ) : fromStep4 ? (
              tRegister("confirm")
            ) : (
              tRegister("continue")
            )}
          </Button>
          <div className="text-center text-sm">
            {tRegister("haveAccount")}{" "}
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="text-primary cursor-pointer hover:underline font-medium"
            >
              {t("login")}
            </button>
          </div>
          <LoginDialog
            open={loginOpen}
            onOpenChange={setLoginOpen}
            onLoginSuccess={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/clearable-input";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { useZipcode } from "@/hooks/use-zipcode";
import { SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AgeCalendar } from "@/app/[locale]/_components/_age-calendar";
import {
  validateEmail,
  validatePhone,
  validateRequired,
} from "@/lib/validation";
import { capitalizeWords, toLowerCase } from "@/lib/utils/text-format";
import { toast } from "sonner";
import {
  Mail,
  User,
  Phone,
  MapPin,
  Milestone,
  Languages,
  UserCog,
  Users,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LANGUAGES, GENDERS } from "@/types/enums";
import {
  getLanguageLabel,
  getGenderLabel,
  getUserRoleLabel,
} from "@/lib/utils/get-enum-label";

// Định nghĩa kiểu dữ liệu cho role option (chỉ giữ value, label sẽ lấy từ translations)
type RoleValue = string;

// Định nghĩa kiểu dữ liệu cho form
export interface CreateUserFormData {
  email: string;
  name: string;
  phone: string;
  role: string;
  address: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
  language: string;
}

// Props cho BaseCreateUserForm
interface BaseCreateUserFormProps {
  title: string;
  roles: readonly RoleValue[];
  defaultRole: string;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  submitButtonText?: string;
  loadingText?: string;
  successMessage?: string;
  successRedirectUrl?: string;
  resetAfterSuccess?: boolean;
}

export function BaseCreateUserForm({
  title,
  roles,
  defaultRole,
  onSubmit,
  submitButtonText,
  loadingText,
  successMessage,
  successRedirectUrl,
  resetAfterSuccess = false,
}: BaseCreateUserFormProps) {
  const router = useRouter();
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tValidation = useTranslations("validation");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: "",
    name: "",
    phone: "",
    role: defaultRole,
    address: "",
    zipCode: "",
    dateOfBirth: "",
    gender: "",
    language: "ja",
  });

  const { address: zipcodeAddress } = useZipcode(formData.zipCode);
  const [prevZipcodeAddress, setPrevZipcodeAddress] = useState("");

  // Tự động điền địa chỉ khi tìm thấy mã bưu điện
  if (
    zipcodeAddress &&
    formData.zipCode.length === 7 &&
    zipcodeAddress !== prevZipcodeAddress
  ) {
    setPrevZipcodeAddress(zipcodeAddress);
    setFormData((prev) => ({ ...prev, address: zipcodeAddress }));
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const nameError = validateRequired(formData.name, t("form.name"));
    if (nameError) newErrors.name = nameError;

    if (!formData.gender) newErrors.gender = tValidation("genderRequired");
    if (!formData.role) newErrors.role = tValidation("roleRequired");

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      phone: "",
      role: defaultRole,
      address: "",
      zipCode: "",
      dateOfBirth: "",
      gender: "",
      language: "ja",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    const promise = onSubmit(formData);

    toast.promise(promise, {
      loading: loadingText || tCommon("loading"),
      success: () => {
        if (resetAfterSuccess) {
          resetForm();
        }
        if (successRedirectUrl) {
          router.push(successRedirectUrl);
        }
        return successMessage || tCommon("success");
      },
      error: (err) => {
        setErrors({ submit: err.message });
        return err.message || tCommon("errorLoading");
      },
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {errors.submit && (
            <Alert variant="destructive" className="col-span-1 md:col-span-2">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="email">Email *</Label>
            <ClearableInput
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                const value = toLowerCase(e.target.value);
                setFormData({ ...formData, email: value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              onClear={() => setFormData({ ...formData, email: "" })}
              icon={<Mail />}
              placeholder={t("form.emailPlaceholder")}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">{t("form.name")} *</Label>
            <ClearableInput
              id="name"
              required
              value={formData.name}
              onChange={(e) => {
                const value = capitalizeWords(e.target.value);
                setFormData({ ...formData, name: value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              onClear={() => setFormData({ ...formData, name: "" })}
              icon={<User />}
              placeholder={t("form.namePlaceholder")}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="gender">{t("form.gender")} *</Label>
            <SelectWithIcon
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
              placeholder={t("form.genderPlaceholder")}
              icon={<Users />}
            >
              {GENDERS.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {getGenderLabel(gender, tEnums)}
                </SelectItem>
              ))}
            </SelectWithIcon>
            {errors.gender && (
              <p className="text-sm text-destructive mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dateOfBirth" className="flex items-center gap-1">
              {t("form.dateOfBirth")}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{t("form.dateOfBirthTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <AgeCalendar
              placeholder={t("form.birthDatePlaceholder")}
              onChange={(date) => {
                setFormData({
                  ...formData,
                  dateOfBirth: date ? date.toISOString().split("T")[0] : "",
                });
              }}
            />
          </div>

          <div>
            <Label htmlFor="phone">{t("form.phone")}</Label>
            <ClearableInput
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              onClear={() => setFormData({ ...formData, phone: "" })}
              icon={<Phone />}
              placeholder={t("form.phonePlaceholder")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="zipCode">{t("form.zipCode")}</Label>
            <ClearableInput
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
                setFormData({ ...formData, zipCode: value });
              }}
              onClear={() => setFormData({ ...formData, zipCode: "" })}
              icon={<Milestone />}
              placeholder={t("form.zipCodePlaceholder")}
              maxLength={7}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="address">{t("form.address")}</Label>
            <ClearableInput
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
              }}
              onClear={() => setFormData({ ...formData, address: "" })}
              icon={<MapPin />}
              placeholder={t("form.addressPlaceholder")}
            />
          </div>

          <div>
            <Label htmlFor="language">{t("form.language")} *</Label>
            <SelectWithIcon
              value={formData.language}
              onValueChange={(value) =>
                setFormData({ ...formData, language: value })
              }
              icon={<Languages />}
            >
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.flag} {getLanguageLabel(lang.value, tEnums)}
                </SelectItem>
              ))}
            </SelectWithIcon>
          </div>

          <div>
            <Label htmlFor="role">{t("form.role")} *</Label>
            <SelectWithIcon
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
              placeholder={t("form.rolePlaceholder")}
              icon={<UserCog />}
            >
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {getUserRoleLabel(role, tEnums)}
                </SelectItem>
              ))}
            </SelectWithIcon>
            {errors.role && (
              <p className="text-sm text-destructive mt-1">{errors.role}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 flex gap-4 pt-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit">
              {submitButtonText || tCommon("submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/clearable-input";
import {
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Gift,
  Milestone,
  LocateFixed,
  Languages,
  Edit,
  Globe,
} from "lucide-react";
import { NextPage } from "next";
import type { RegisterFormData } from "@/types/register";
import { useKeyDown } from "@/hooks/use-key-down";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  formData: RegisterFormData;
  setFormData: (data: RegisterFormData) => void;
  handleBack: () => void;
  handleSubmit: () => void;
  handleEditInfo: () => void;
  submitting?: boolean;
}

const Step4: NextPage<Props> = ({
  formData,
  setFormData,
  handleBack,
  handleSubmit,
  handleEditInfo,
  submitting = false,
}) => {
  const tRegister = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const tIndustry = useTranslations("enums.industry");

  useKeyDown({ onEnter: handleSubmit, disabled: submitting });

  return (
    <div className="space-y-6 max-w-[500px] mx-auto">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">{tRegister("confirmTitle")}</h1>
        <p className="text-muted-foreground">
          {tRegister("confirmDescription")}
        </p>
      </div>

      <div>
        <Label htmlFor="referralCode">{tRegister("referralCode")}</Label>
        <ClearableInput
          id="referralCode"
          value={formData.referralCode || ""}
          onChange={(e) =>
            setFormData({ ...formData, referralCode: e.target.value })
          }
          onClear={() => setFormData({ ...formData, referralCode: "" })}
          icon={<Gift />}
          placeholder={tRegister("referralCodePlaceholder")}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {tRegister("registrationInfo")}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditInfo}
            disabled={submitting}
            className="h-8 gap-1.5"
          >
            <Edit className="h-3.5 w-3.5" />
            {tRegister("editInfo")}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-top gap-2">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("companyName")}</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.companyName}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("tenantDomain")}</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.tenantDomain}.tamabee.vn
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <User className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("ownerName")}</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.ownerName}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("email")}</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.email}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Phone className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("phone")}</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.phone}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Milestone className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("zipcode")}</p>
              <p className="text-sm text-muted-foreground wrap-break-words">
                {formData.zipcode}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("address")}</p>
              <p className="text-sm text-muted-foreground wrap-break-words">
                {formData.address}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Briefcase className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("industry")}</p>
              <p className="text-sm text-muted-foreground truncate">
                {tIndustry(formData.industry)}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <LocateFixed className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("locale")}</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.locale === "vi"
                  ? tRegister("localeVietnam")
                  : tRegister("localeJapan")}
              </p>
            </div>
          </div>

          <div className="flex items-top gap-2">
            <Languages className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium">{tRegister("language")}</p>
              <p className="text-sm text-muted-foreground truncate">
                {formData.language === "vi"
                  ? tRegister("languageVi")
                  : formData.language === "en"
                    ? tRegister("languageEn")
                    : tRegister("languageJa")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1"
          disabled={submitting}
        >
          {tCommon("back")}
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={submitting}>
          {submitting ? (
            <span className="flex gap-2">
              <Spinner />
              {tRegister("processing")}
            </span>
          ) : (
            tRegister("completeRegistration")
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step4;

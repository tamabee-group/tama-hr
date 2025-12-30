"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Lock, LockKeyhole } from "lucide-react";
import { NextPage } from "next";
import type { RegisterFormData } from "@/types/register";
import { useKeyDown } from "@/hooks/use-key-down";
import { useState } from "react";
import { validatePassword } from "@/lib/validation";
import { useTranslations } from "next-intl";

interface Props {
  formData: RegisterFormData;
  setFormData: (data: RegisterFormData) => void;
  handleNext: () => void;
  handleBack: () => void;
}

const Step3: NextPage<Props> = ({
  formData,
  setFormData,
  handleNext,
  handleBack,
}) => {
  const t = useTranslations("auth");
  const tRegister = useTranslations("auth.register");
  const tValidation = useTranslations("auth.validation");
  const tCommon = useTranslations("common");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = tValidation("confirmPasswordRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = tValidation("passwordMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      handleNext();
    }
  };

  useKeyDown({ onEnter: handleContinue });

  return (
    <Card className="space-y-6 max-w-[450px] mx-auto px-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Lock className="h-12 w-12 text-primary" />
        </div>

        <CardTitle className="text-2xl">{tRegister("passwordTitle")}</CardTitle>
        <CardDescription>{tRegister("passwordDescription")}</CardDescription>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <PasswordInput
            id="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) {
                setErrors({ ...errors, password: "" });
              }
            }}
            placeholder={tRegister("passwordPlaceholder")}
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password}</p>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({
                ...formData,
                confirmPassword: e.target.value,
              });
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: "" });
              }
            }}
            placeholder={tRegister("confirmPasswordPlaceholder")}
            icon={<LockKeyhole />}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleBack} variant="outline" className="flex-1">
          {tCommon("back")}
        </Button>
        <Button onClick={handleContinue} className="flex-1">
          {tRegister("continue")}
        </Button>
      </div>
    </Card>
  );
};

export default Step3;

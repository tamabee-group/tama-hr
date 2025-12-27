"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Lock, LockKeyhole } from "lucide-react";
import { NextPage } from "next";
import type { RegisterFormData } from "@/types/register";
import { useKeyDown } from "@/hooks/useKeyDown";
import { useState } from "react";
import { validatePassword } from "@/lib/validation";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
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

        <CardTitle className="text-2xl">Đặt mật khẩu</CardTitle>
        <CardDescription>Tạo mật khẩu mạnh để bảo vệ tài khoản</CardDescription>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <PasswordInput
            id="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) {
                setErrors({ ...errors, password: "" });
              }
            }}
            placeholder="Nhập mật khẩu..."
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password}</p>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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
            placeholder="Nhập lại mật khẩu..."
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
          Quay lại
        </Button>
        <Button onClick={handleContinue} className="flex-1">
          Tiếp tục
        </Button>
      </div>
    </Card>
  );
};

export default Step3;

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { resetPassword } from "@/lib/apis/forgot-password";
import { getErrorMessage } from "@/lib/utils/get-error-message";

type Step = "password" | "success" | "invalid";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const tReset = useTranslations("auth.resetPassword");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Kiểm tra token có tồn tại không
  useEffect(() => {
    if (!token) {
      setStep("invalid");
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(tReset("passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      toast.error(tReset("passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token!, password);
      setStep("success");
    } catch (error) {
      const message = getErrorMessage(error, tErrors, tReset("resetFailed"));
      // Nếu token không hợp lệ hoặc hết hạn
      if (message.includes("INVALID_TOKEN") || message.includes("token")) {
        setStep("invalid");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6 mt-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">{tReset("title")}</h1>
        <p className="text-sm text-muted-foreground mb-10">
          {step === "password" && tReset("enterNewPassword")}
          {step === "success" && tReset("successMessage")}
          {step === "invalid" && tReset("invalidToken")}
        </p>
      </div>

      {step === "password" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="password">{tReset("newPassword")}</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tReset("newPasswordPlaceholder")}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={tReset("confirmPasswordPlaceholder")}
            />
          </div>
          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? tReset("processing") : tReset("submit")}
          </Button>
        </form>
      )}

      {step === "success" && (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle className="relative -top-5 h-14 w-14 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            {tReset("canLoginNow")}
          </p>
          <Button onClick={() => router.push("/login")} className="w-full">
            {t("login")}
          </Button>
        </div>
      )}

      {step === "invalid" && (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">
            {tReset("tokenExpiredMessage")}
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push("/forgot-password")}
              className="w-full"
            >
              {tReset("requestNewLink")}
            </Button>
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              {tReset("backToLogin")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

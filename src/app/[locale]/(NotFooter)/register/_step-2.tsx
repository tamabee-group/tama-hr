"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { BadgeCheck, Mail } from "lucide-react";
import { NextPage } from "next";
import { useState, useEffect } from "react";
import { sendVerificationCode, verifyEmail } from "@/lib/apis/auth";
import { Spinner } from "@/components/ui/spinner";
import type { RegisterFormData } from "@/types/register";
import { useKeyDown } from "@/hooks/use-key-down";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface Props {
  formData: RegisterFormData;
  setFormData: (data: RegisterFormData) => void;
  handleNext: () => void;
  handleBack: () => void;
  verified: boolean;
  setVerified: (verified: boolean) => void;
  resendTimer: number;
  setResendTimer: (timer: number) => void;
}

const Step2: NextPage<Props> = ({
  formData,
  setFormData,
  handleNext,
  handleBack,
  verified,
  setVerified,
  resendTimer,
  setResendTimer,
}) => {
  const t = useTranslations("auth");
  const tRegister = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [canResend, setCanResend] = useState(resendTimer === 0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer, setResendTimer]);

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (formData.otp.length !== 6) return;

    setVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await verifyEmail(formData.email, formData.otp);
      setVerified(true);
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error(getErrorMessage(error, tErrors, t("invalidCode")));
      setFormData({ ...formData, otp: "" });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (formData.otp.length === 6 && !verified) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.otp, verified]);

  useKeyDown({
    onEnter: handleVerify,
    disabled: formData.otp.length !== 6 || verifying,
  });

  const handleResend = async () => {
    setResending(true);
    try {
      await sendVerificationCode(
        formData.email,
        formData.companyName,
        formData.language,
      );
      setResendTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("Error resending code:", error);
      toast.error(getErrorMessage(error, tErrors, t("resendFailed")));
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <GlassCard className="space-y-6 max-w-[450px] mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4 ">
            <BadgeCheck className="h-12 w-12 text-green-600 dark:text" />
          </div>
          <h1 className="text-2xl font-semibold text-green-600 dark:text">
            {tRegister("verifySuccess")}
          </h1>
          <p className="text-muted-foreground">
            {tRegister("verifySuccessDesc")}
            <br />
            <span className="font-semibold text-foreground">
              {formData.email}
            </span>
          </p>
        </div>
        <div className="flex gap-3 max-w-md mx-auto">
          <Button onClick={handleBack} variant="outline" className="flex-1">
            {tCommon("back")}
          </Button>
          <Button onClick={handleNext} className="flex-1">
            {tCommon("next")}
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-6 max-w-[500px] mx-auto p-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold">{tRegister("verifyTitle")}</h1>
        <p className="text-muted-foreground">
          {tRegister("verifyDescription")}
          <br />
          <span className="font-semibold text-foreground">
            {formData.email}
          </span>
        </p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={6}
          value={formData.otp}
          onChange={(value) => setFormData({ ...formData, otp: value })}
          disabled={verifying}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {verifying && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            <span>{tRegister("verifying")}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <Button
            variant="link"
            onClick={handleResend}
            disabled={!canResend || resending}
            className="text-sm"
          >
            {resending
              ? tRegister("processing")
              : canResend
                ? t("resendCode")
                : t("resendAfter", { seconds: resendTimer })}
          </Button>
        </div>
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1"
            disabled={verifying}
          >
            {tCommon("back")}
          </Button>
          <Button
            onClick={handleVerify}
            className="flex-1"
            disabled={formData.otp.length !== 6 || verifying}
          >
            {tCommon("next")}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default Step2;

"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Mail } from "lucide-react";
import { NextPage } from "next";
import { useState, useEffect } from "react";
import { sendVerificationCode, verifyEmail } from "@/lib/apis/auth";
import { Spinner } from "@/components/ui/spinner";
import type { RegisterFormData } from "@/types/register";
import { useKeyDown } from "@/hooks/useKeyDown";

interface Props {
  formData: RegisterFormData;
  setFormData: (data: RegisterFormData) => void;
  handleNext: () => void;
  handleBack: () => void;
  verified: boolean;
  setVerified: (verified: boolean) => void;
  emailSent: string;
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

  const handleVerify = async () => {
    if (formData.otp.length !== 6) return;

    setVerifying(true);
    try {
      await verifyEmail(formData.email, formData.otp);
      setVerified(true);
    } catch (error) {
      console.error("Error verifying code:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`M\u00e3 x\u00e1c th\u1ef1c kh\u00f4ng \u0111\u00fang: ${message}`);
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
    try {
      await sendVerificationCode(
        formData.email,
        formData.companyName,
        formData.language
      );
      setResendTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("Error resending code:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Không thể gửi lại mã: ${message}`);
    }
  };

  // Nếu đã verify thành công, hiển thị màn hình thành công
  if (verified) {
    return (
      <Card className="space-y-6 max-w-[450px] mx-auto">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4 ">
            <BadgeCheck className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Xác thực thành công!
          </CardTitle>
          <CardDescription>
            Email của bạn đã được xác thực
            <br />
            <span className="font-semibold text-foreground">
              {formData.email}
            </span>
          </CardDescription>
        </div>
        <div className="flex gap-3 max-w-md mx-auto">
          <Button onClick={handleBack} variant="outline" className="flex-1">
            Quay lại
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Tiếp theo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-6 max-w-[500px] mx-auto">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">Xác thực email</CardTitle>
        <CardDescription>
          Nhập mã 6 số đã gửi đến
          <br />
          <span className="font-semibold text-foreground">
            {formData.email}
          </span>
        </CardDescription>
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
            <span>Đang xác thực...</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <Button
            variant="link"
            onClick={handleResend}
            disabled={!canResend}
            className="text-sm"
          >
            {canResend ? "Gửi lại mã" : `Gửi lại sau ${resendTimer}s`}
          </Button>
        </div>
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1"
            disabled={verifying}
          >
            Quay lại
          </Button>
          <Button
            onClick={handleVerify}
            className="flex-1"
            disabled={formData.otp.length !== 6 || verifying}
          >
            Tiếp theo
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Step2;

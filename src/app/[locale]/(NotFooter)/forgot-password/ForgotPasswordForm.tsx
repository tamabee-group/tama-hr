"use client";

import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/clearable-input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Mail } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "@/lib/apis/forgot-password";

type Step = "email" | "verify" | "password";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendResetCode(email);
      toast.success("Mã xác thực đã được gửi đến email của bạn!");
      setStep("verify");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gửi mã thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) return;

    setLoading(true);

    try {
      await verifyResetCode(email, code);
      toast.success("Xác thực thành công!");
      setStep("password");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Xác thực thất bại";
      toast.error(message);
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.length === 6 && step === "verify") {
      handleVerifyCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, code, password);
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => router.push("/login"), 1000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6">
      <div className="text-center space-y-2">
        <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
        <p className="text-sm text-muted-foreground">
          {step === "email" && "Nhập email để nhận mã xác thực"}
          {step === "verify" && "Nhập mã 6 số đã gửi đến email"}
          {step === "password" && "Nhập mật khẩu mới"}
        </p>
      </div>

      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <ClearableInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onClear={() => setEmail("")}
              icon={<Mail />}
              placeholder="Nhập email của bạn..."
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi mã xác thực"}
          </Button>
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}

      {step === "verify" && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              disabled={loading}
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
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Đang xác thực...</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setStep("email")}
                className="text-sm"
              >
                Gửi lại mã
              </Button>
            </div>
            <Button
              onClick={handleVerifyCode}
              className="w-full"
              disabled={code.length !== 6 || loading}
            >
              Xác thực
            </Button>
          </div>
        </div>
      )}

      {step === "password" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Mật khẩu mới</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu..."
            />
          </div>
          <Button
            onClick={handleResetPassword}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </Button>
        </div>
      )}
    </div>
  );
}

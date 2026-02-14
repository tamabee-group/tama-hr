"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/clearable-input";
import { Mail } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { sendResetLink } from "@/lib/apis/forgot-password";
import { getErrorMessage } from "@/lib/utils/get-error-message";

type Step = "email" | "sent";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tForgot = useTranslations("auth.forgotPassword");
  const tErrors = useTranslations("errors");
  const params = useParams();
  const locale = (params.locale as string) || "vi";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendResetLink(email, locale);
      setStep("sent");
    } catch (error) {
      const message = getErrorMessage(error, tErrors, tForgot("sendFailed"));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6 mt-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">{tForgot("title")}</h1>
        <p className="text-sm text-muted-foreground mb-10">
          {step === "email" && tForgot("emailStep")}
          {step === "sent" && tForgot("sentStep")}
        </p>
      </div>

      {step === "email" && (
        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <ClearableInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onClear={() => setEmail("")}
              icon={<Mail />}
              placeholder={tForgot("emailPlaceholder")}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? tForgot("sending") : tForgot("sendLink")}
          </Button>
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              {tForgot("backToLogin")}
            </Link>
          </div>
        </form>
      )}

      {step === "sent" && (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {tForgot("checkSpam")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("email")}
              className="w-full"
            >
              {tForgot("tryAnotherEmail")}
            </Button>
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              {tForgot("backToLogin")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useZipcode, localeToRegion } from "@/hooks/use-zipcode";
import { login as loginApi, register } from "@/lib/apis/auth";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Step1 from "./_step-1";
import Step2 from "./_step-2";
import Step3 from "./_step-3";
import Step4 from "./_step-4";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { RegisterFormData } from "@/types/register";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const RegisterPage: NextPage = () => {
  const { login } = useAuth();
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const [step, setStep] = useState(1);
  const [prevStep, setPrevStep] = useState(1);
  const [zipcode, setZipcode] = useState("");
  const [emailSent, setEmailSent] = useState("");
  const [companySent, setCompanySent] = useState("");
  const [verified, setVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState<RegisterFormData>({
    companyName: "TAMABEE",
    ownerName: "Quang Hiep",
    phone: "07044781997",
    address: "",
    industry: "",
    locale: "vi",
    language: "vi",
    email: "tamachan.test1@gmail.com",
    otp: "",
    password: "",
    confirmPassword: "",
    zipcode: "9500911",
    referralCode: "",
  });

  const { address, loading } = useZipcode(
    zipcode,
    localeToRegion(formData.locale),
  );

  useEffect(() => {
    if (address) {
      setFormData((prev) => ({ ...prev, address }));
    }
  }, [address]);

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    setPrevStep(step);
    setStep(step + 1);
  };
  const handleBack = () => {
    setPrevStep(step);
    setStep(step - 1);
  };
  const handleConfirmFromStep1 = () => {
    setPrevStep(step);
    setStep(4);
  };
  const handleEditInfo = () => {
    setPrevStep(4);
    setStep(1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await register({
        companyName: formData.companyName,
        ownerName: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        industry: formData.industry,
        locale: formData.locale,
        language: formData.language,
        email: formData.email,
        password: formData.password,
        zipcode: zipcode || undefined,
        referralCode: formData.referralCode || undefined,
      });

      const user = await loginApi(formData.email, formData.password);
      login(user);
      toast.success(t("registerSuccess"));
      router.push("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(getErrorMessage(error, tErrors, t("registerFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: t("step.info") },
    { num: 2, label: t("step.verify") },
    { num: 3, label: t("step.password") },
    { num: 4, label: t("step.confirm") },
  ];

  return (
    <div className="w-full flex flex-col items-center pt-8 pb-14 gap-6">
      <div className="flex justify-center items-center gap-3">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex gap-3">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  s.num === step
                    ? "bg-primary dark:bg-(--blue) text-white"
                    : s.num < step
                      ? "bg-primary/20 text-primary dark:bg-(--blue)"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {s.num < step ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:block",
                  s.num === step
                    ? "text-foreground"
                    : s.num < step
                      ? "text-primary"
                      : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {idx < 3 && (
              <div
                className={cn(
                  "w-12 h-0.5 relative top-4 transition-all rounded-full",
                  s.num < step ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step1
                formData={formData}
                setFormData={setFormData}
                zipcode={zipcode}
                setZipcode={setZipcode}
                loading={loading}
                handleNext={handleNext}
                emailSent={emailSent}
                setEmailSent={setEmailSent}
                companySent={companySent}
                setCompanySent={setCompanySent}
                setResendTimer={setResendTimer}
                verified={verified}
                setVerified={setVerified}
                fromStep4={prevStep === 4}
                handleConfirm={handleConfirmFromStep1}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step2
                formData={formData}
                setFormData={setFormData}
                handleNext={handleNext}
                handleBack={handleBack}
                verified={verified}
                setVerified={setVerified}
                resendTimer={resendTimer}
                setResendTimer={setResendTimer}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step3
                formData={formData}
                setFormData={setFormData}
                handleNext={handleNext}
                handleBack={handleBack}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step4
                formData={formData}
                setFormData={setFormData}
                handleBack={handleBack}
                handleSubmit={handleSubmit}
                handleEditInfo={handleEditInfo}
                submitting={submitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegisterPage;

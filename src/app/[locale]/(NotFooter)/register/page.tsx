"use client";

import { NextPage } from "next";
import { useState, useEffect, useCallback } from "react";
import { useZipcode, localeToRegion } from "@/hooks/use-zipcode";
import { register } from "@/lib/apis/auth";
import { toast } from "sonner";
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

const STORAGE_KEY = "register_form_data";
const STORAGE_STATE_KEY = "register_form_state";

// Giá trị mặc định cho form
const DEFAULT_FORM_DATA: RegisterFormData = {
  companyName: "",
  ownerName: "",
  phone: "",
  address: "",
  industry: "",
  locale: "vi",
  language: "vi",
  email: "",
  otp: "",
  password: "",
  confirmPassword: "",
  zipcode: "",
  referralCode: "",
  tenantDomain: "",
};

interface FormState {
  step: number;
  zipcode: string;
  emailSent: string;
  companySent: string;
  verified: boolean;
}

const RegisterPage: NextPage = () => {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");

  // Khởi tạo state từ localStorage hoặc default
  const [isInitialized, setIsInitialized] = useState(false);
  const [step, setStep] = useState(1);
  const [prevStep, setPrevStep] = useState(1);
  const [zipcode, setZipcode] = useState("");
  const [emailSent, setEmailSent] = useState("");
  const [companySent, setCompanySent] = useState("");
  const [verified, setVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState<RegisterFormData>(DEFAULT_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);

  // Load data từ localStorage khi mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedState = localStorage.getItem(STORAGE_STATE_KEY);

      if (savedData) {
        const parsed = JSON.parse(savedData) as RegisterFormData;
        // Không restore password và confirmPassword vì lý do bảo mật
        setFormData({
          ...parsed,
          password: "",
          confirmPassword: "",
          otp: "",
        });
      }

      if (savedState) {
        const state = JSON.parse(savedState) as FormState;
        setStep(state.step);
        setZipcode(state.zipcode);
        setEmailSent(state.emailSent);
        setCompanySent(state.companySent);
        setVerified(state.verified);
      }
    } catch (error) {
      console.error("Error loading register data from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Lưu formData vào localStorage khi thay đổi
  useEffect(() => {
    if (!isInitialized) return;
    try {
      // Không lưu password và otp vì lý do bảo mật
      const dataToSave = {
        ...formData,
        password: "",
        confirmPassword: "",
        otp: "",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving register data to localStorage:", error);
    }
  }, [formData, isInitialized]);

  // Lưu state vào localStorage khi thay đổi
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const state: FormState = {
        step,
        zipcode,
        emailSent,
        companySent,
        verified,
      };
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving register state to localStorage:", error);
    }
  }, [step, zipcode, emailSent, companySent, verified, isInitialized]);

  // Clear localStorage sau khi đăng ký thành công
  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_STATE_KEY);
  }, []);

  const { address, loading } = useZipcode(
    zipcode,
    localeToRegion(formData.locale),
  );

  useEffect(() => {
    if (address) {
      setFormData((prev) => ({ ...prev, address }));
    }
  }, [address]);

  const handleNext = () => {
    // Sync zipcode vào formData trước khi chuyển step
    if (step === 1 || step === 3) {
      setFormData((prev) => ({ ...prev, zipcode }));
    }
    setPrevStep(step);
    setStep(step + 1);
  };
  const handleBack = () => {
    setPrevStep(step);
    setStep(step - 1);
  };
  const handleConfirmFromStep1 = () => {
    // Sync zipcode vào formData trước khi chuyển về Step4
    setFormData((prev) => ({ ...prev, zipcode }));
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
        tenantDomain: formData.tenantDomain,
      });

      // Clear localStorage sau khi đăng ký thành công
      clearStorage();

      toast.success(t("registerSuccess"));

      // Redirect đến login page trên tenant domain mới
      const tenantLoginUrl = buildTenantLoginUrl(
        formData.tenantDomain,
        formData.locale,
      );
      window.location.href = tenantLoginUrl;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(getErrorMessage(error, tErrors, t("registerFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Build URL login cho tenant domain mới
   * Local: tenant-name.tamabee.local
   * Production: tenant-name.tamabee.vn
   */
  const buildTenantLoginUrl = (
    tenantDomain: string,
    locale: string,
  ): string => {
    const currentHost = window.location.host;
    const protocol = window.location.protocol;

    // Lấy base domain (tamabee.local hoặc tamabee.vn)
    const hostParts = currentHost.split(".");
    let baseDomain: string;

    if (hostParts.length >= 2) {
      // Lấy 2 phần cuối: tamabee.local hoặc tamabee.vn
      baseDomain = hostParts.slice(-2).join(".");
    } else {
      baseDomain = currentHost;
    }

    // Build URL với subdomain mới
    const newHost = `${tenantDomain}.${baseDomain}`;
    return `${protocol}//${newHost}/${locale}/login`;
  };

  const steps = [
    { num: 1, label: t("step.info") },
    { num: 2, label: t("step.verify") },
    { num: 3, label: t("step.password") },
    { num: 4, label: t("step.confirm") },
  ];

  // Không render cho đến khi đã load xong từ localStorage
  if (!isInitialized) {
    return (
      <div className="w-full flex flex-col items-center pt-8 pb-14 gap-6">
        <div className="flex justify-center items-center gap-3">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex gap-3">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-muted text-muted-foreground">
                  {s.num}
                </div>
                <span className="text-sm font-medium hidden sm:block text-muted-foreground">
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div className="w-12 h-0.5 relative top-4 rounded-full bg-muted" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

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

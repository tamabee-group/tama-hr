"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoginDialog } from "@/app/[locale]/_components/_header/LoginDialog";
import { ClearableInput } from "@/components/ui/clearable-input";
import { CardDescription, CardTitle } from "@/components/ui/card";
import {
  Building2,
  User,
  Phone,
  MapPin,
  Mail,
  Milestone,
  Briefcase,
  Globe,
  Languages,
} from "lucide-react";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { SelectItem } from "@/components/ui/select";
import { NextPage } from "next";
import {
  capitalizeWords,
  toLowerCase,
  toUpperCase,
} from "@/lib/utils/text-format";
import { sendVerificationCode } from "@/lib/apis/auth";
import { useState } from "react";
import type { RegisterFormData } from "@/types/register";
import { useKeyDown } from "@/hooks/useKeyDown";
import { toast } from "sonner";
import { INDUSTRIES } from "@/constants/industries";
import { validateEmail, validatePhone } from "@/lib/validation";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  formData: RegisterFormData;
  setFormData: (data: RegisterFormData) => void;
  zipcode: string;
  setZipcode: (zipcode: string) => void;
  loading: boolean;
  handleNext: () => void;
  emailSent: string;
  setEmailSent: (email: string) => void;
  companySent: string;
  setCompanySent: (company: string) => void;
  setResendTimer: (timer: number) => void;
  verified: boolean;
  setVerified: (verified: boolean) => void;
  fromStep4?: boolean;
  handleConfirm?: () => void;
}

const Step1: NextPage<Props> = ({
  formData,
  setFormData,
  zipcode,
  setZipcode,
  loading,
  handleNext,
  emailSent,
  setEmailSent,
  companySent,
  setCompanySent,
  setResendTimer,
  verified,
  setVerified,
  fromStep4 = false,
  handleConfirm,
}) => {
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginOpen, setLoginOpen] = useState(false);

  const isPhoneValid = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    return (
      /^(0|\+84)[0-9]{9}$/.test(cleaned) ||
      /^(0|\+81)[0-9]{9,10}$/.test(cleaned)
    );
  };

  const hasCJKCharacters = (text: string): boolean => {
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(text);
  };

  const getFieldError = (field: string, value: string): string | null => {
    switch (field) {
      case "companyName":
        if (!value.trim()) return "Vui lòng nhập tên công ty";
        if (value.trim().length < 3)
          return "Tên công ty phải có ít nhất 3 ký tự";
        return null;
      case "ownerName":
        if (!value.trim()) return "Vui lòng nhập tên chủ doanh nghiệp";
        if (hasCJKCharacters(value))
          return "Tên chủ doanh nghiệp chỉ được nhập chữ Romaji";
        if (value.trim().length < 2)
          return "Tên chủ doanh nghiệp phải có ít nhất 2 ký tự";
        return null;
      case "phone":
        if (!value.trim()) return "Vui lòng nhập số điện thoại";
        const phoneError = validatePhone(value);
        if (phoneError) return phoneError;
        if (!isPhoneValid(value)) return "Số điện thoại không hợp lệ";
        return null;
      case "email":
        return validateEmail(value);
      case "industry":
        if (!value) return "Vui lòng chọn ngành nghề kinh doanh";
        return null;
      case "locale":
        if (!value) return "Vui lòng chọn khu vực hoạt động";
        return null;
      case "language":
        if (!value) return "Vui lòng chọn ngôn ngữ thông báo";
        return null;
      case "address":
        if (!value.trim()) return "Vui lòng nhập địa chỉ";
        if (value.trim().length < 5) return "Địa chỉ phải có ít nhất 5 ký tự";
        return null;
      default:
        return null;
    }
  };

  const validateField = (field: string, value: string) => {
    const error = getFieldError(field, value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const handleContinue = async () => {
    const newErrors: Record<string, string> = {};

    const fields = [
      "companyName",
      "ownerName",
      "phone",
      "email",
      "industry",
      "locale",
      "language",
      "address",
    ];
    fields.forEach((field) => {
      const error = getFieldError(
        field,
        formData[field as keyof RegisterFormData] as string,
      );
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Nếu từ Step4 quay về, chỉ cần validate và confirm
    if (fromStep4 && verified && handleConfirm) {
      handleConfirm();
      return;
    }

    // Nếu đã verify thành công và email + tên công ty không đổi, bỏ qua gửi email
    if (
      verified &&
      emailSent === formData.email &&
      companySent === formData.companyName
    ) {
      handleNext();
      return;
    }

    // Nếu email và tên công ty không đổi so với lần gửi trước, chuyển tiếp
    if (emailSent === formData.email && companySent === formData.companyName) {
      handleNext();
      return;
    }

    setSending(true);
    try {
      await sendVerificationCode(
        formData.email,
        formData.companyName,
        formData.language,
      );
      // Reset OTP khi gửi mã mới
      setFormData({ ...formData, otp: "" });
      setEmailSent(formData.email);
      setCompanySent(formData.companyName);
      setResendTimer(60);
      toast.success("Mã xác thực đã được gửi đến email của bạn");
      handleNext();
    } catch (error: unknown) {
      console.error("Error sending verification code:", error);
      // Xử lý lỗi từ ApiError (có errorCode property)
      const apiError = error as { errorCode?: string; message?: string };
      const errorCode = apiError.errorCode;

      // Map errorCode sang field và message tương ứng
      const errorMap: Record<string, { field: string; message: string }> = {
        EMAIL_EXISTS: { field: "email", message: "Email này đã được đăng ký." },
        EMAIL_NOT_FOUND: {
          field: "email",
          message: "Email không tồn tại trong hệ thống",
        },
        COMPANY_NAME_EXISTS: {
          field: "companyName",
          message: "Tên công ty này đã được đăng ký.",
        },
        VALIDATION_ERROR: {
          field: "email",
          message: apiError.message || "Dữ liệu không hợp lệ.",
        },
        EMAIL_SEND_FAILED: {
          field: "email",
          message: "Không thể gửi email xác thực, vui lòng thử lại.",
        },
        BAD_REQUEST: {
          field: "email",
          message: apiError.message || "Yêu cầu không hợp lệ.",
        },
      };

      if (errorCode && errorMap[errorCode]) {
        const { field, message } = errorMap[errorCode];
        setErrors((prev) => ({ ...prev, [field]: message }));
      } else {
        // Fallback: hiển thị message từ server hoặc message mặc định
        const message = apiError.message || "Đã có lỗi xảy ra.";
        setErrors((prev) => ({ ...prev, email: message }));
      }
    } finally {
      setSending(false);
    }
  };
  useKeyDown({ onEnter: handleContinue, disabled: sending });

  return (
    <div className="grid md:grid-cols-2 md:border md:p-6 md:rounded-xl md:shadow-md">
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-2 text-center">
          <CardTitle className="text-2xl">Thông tin doanh nghiệp</CardTitle>
          <CardDescription className="text-sm">
            Vui lòng điền đầy đủ thông tin.
          </CardDescription>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Tên công ty</Label>
            <ClearableInput
              id="companyName"
              value={formData.companyName}
              onChange={(e) => {
                const value = toUpperCase(e.target.value);
                setFormData({ ...formData, companyName: value });
                validateField("companyName", value);
                // Reset verified nếu tên công ty khác với lần gửi verify
                setVerified(
                  value === companySent && formData.email === emailSent,
                );
              }}
              onClear={() => {
                setFormData({ ...formData, companyName: "" });
                // Xoá tên công ty -> chắc chắn khác companySent (trừ khi companySent rỗng)
                if (companySent) setVerified(false);
              }}
              onBlur={(e) => validateField("companyName", e.target.value)}
              icon={<Building2 />}
              placeholder="Nhập tên công ty..."
            />
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">
                {errors.companyName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="ownerName">Chủ doanh nghiệp</Label>
            <ClearableInput
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => {
                const value = capitalizeWords(e.target.value);
                setFormData({ ...formData, ownerName: value });
                validateField("ownerName", value);
              }}
              onClear={() => setFormData({ ...formData, ownerName: "" })}
              onBlur={(e) => validateField("ownerName", e.target.value)}
              icon={<User />}
              placeholder="Người đại diện..."
            />
            {errors.ownerName && (
              <p className="text-sm text-destructive mt-1">
                {errors.ownerName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <ClearableInput
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                validateField("phone", e.target.value);
              }}
              onClear={() => setFormData({ ...formData, phone: "" })}
              onBlur={(e) => validateField("phone", e.target.value)}
              icon={<Phone />}
              placeholder="Nhập số điện thoại..."
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <ClearableInput
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                const value = toLowerCase(e.target.value);
                setFormData({ ...formData, email: value, otp: "" });
                validateField("email", value);
                // Reset verified nếu email khác với lần gửi verify
                setVerified(
                  value === emailSent && formData.companyName === companySent,
                );
              }}
              onClear={() => {
                setFormData({ ...formData, email: "", otp: "" });
                // Xoá email -> chắc chắn khác emailSent (trừ khi emailSent rỗng)
                if (emailSent) setVerified(false);
              }}
              onBlur={(e) => validateField("email", e.target.value)}
              icon={<Mail />}
              placeholder="Nhập email..."
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="industry">Ngành nghề kinh doanh</Label>
            <SelectWithIcon
              value={formData.industry}
              onValueChange={(value) => {
                setFormData({ ...formData, industry: value });
                validateField("industry", value);
              }}
              placeholder="Chọn ngành nghề..."
              icon={<Briefcase />}
            >
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectWithIcon>
            {errors.industry && (
              <p className="text-sm text-destructive mt-1">{errors.industry}</p>
            )}
          </div>
          <div>
            <Label htmlFor="locale">Khu vực hoạt động</Label>
            <SelectWithIcon
              value={formData.locale}
              onValueChange={(value) => {
                setFormData({ ...formData, locale: value });
                validateField("locale", value);
              }}
              placeholder="Chọn khu vực..."
              icon={<Globe />}
            >
              <SelectItem value="vi">Việt Nam</SelectItem>
              <SelectItem value="ja">Nhật Bản</SelectItem>
            </SelectWithIcon>
            {errors.locale && (
              <p className="text-sm text-destructive mt-1">{errors.locale}</p>
            )}
          </div>
          <div>
            <Label htmlFor="language">Ngôn ngữ thông báo</Label>
            <SelectWithIcon
              value={formData.language}
              onValueChange={(value) => {
                setFormData({ ...formData, language: value });
                validateField("language", value);
              }}
              placeholder="Chọn ngôn ngữ..."
              icon={<Languages />}
            >
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectWithIcon>
            {errors.language && (
              <p className="text-sm text-destructive mt-1">{errors.language}</p>
            )}
          </div>
          <div>
            <Label htmlFor="zipcode">Mã bưu điện (không bắt buộc)</Label>
            <ClearableInput
              id="zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              onClear={() => setZipcode("")}
              icon={<Milestone />}
              placeholder="Nhập mã bưu điện..."
              maxLength={7}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <ClearableInput
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                validateField("address", e.target.value);
              }}
              onClear={() => setFormData({ ...formData, address: "" })}
              onBlur={(e) => validateField("address", e.target.value)}
              icon={loading ? <Spinner /> : <MapPin />}
              placeholder={loading ? "Đang tìm địa chỉ..." : "Nhập địa chỉ..."}
              disabled={loading}
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleContinue}
            disabled={sending}
            className="w-full md:w-auto md:px-12 md:ml-auto md:flex"
          >
            {sending ? "Đang xử lý..." : fromStep4 ? "Xác nhận" : "Tiếp tục"}
          </Button>
          <div className="text-center text-sm">
            Bạn đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="text-primary cursor-pointer dark:text-(--blue-light) hover:underline font-medium"
            >
              Đăng nhập
            </button>
          </div>
          <LoginDialog
            open={loginOpen}
            onOpenChange={setLoginOpen}
            onLoginSuccess={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1;

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Building2, User, Phone, MapPin, Mail, Milestone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NextPage } from "next";
import Link from "next/link";
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

interface Props {
  formData: RegisterFormData;
  setFormData: (data: RegisterFormData) => void;
  zipcode: string;
  setZipcode: (zipcode: string) => void;
  loading: boolean;
  handleNext: () => void;
  emailSent: string;
  setEmailSent: (email: string) => void;
  setResendTimer: (timer: number) => void;
  verified: boolean;
  setVerified: (verified: boolean) => void;
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
  setResendTimer,
  verified,
  setVerified,
}) => {
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        if (!isPhoneValid(value)) return "Số điện thoại không hợp lệ";
        return null;
      case "email":
        if (!value.trim()) return "Vui lòng nhập email";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Email không hợp lệ";
        return null;
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
        formData[field as keyof RegisterFormData] as string
      );
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Nếu đã verify thành công rồi, bỏ qua gửi email
    if (verified && emailSent === formData.email) {
      handleNext();
      return;
    }

    if (emailSent === formData.email) {
      handleNext();
      return;
    }

    setSending(true);
    try {
      await sendVerificationCode(
        formData.email,
        formData.companyName,
        formData.language
      );
      setEmailSent(formData.email);
      setResendTimer(60);
      toast.success("Mã xác thực đã được gửi đến email của bạn");
      handleNext();
    } catch (error) {
      console.error("Error sending verification code:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Không thể gửi mã xác thực: ${message}`);
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
            <InputGroup>
              <InputGroupInput
                id="companyName"
                value={formData.companyName}
                onChange={(e) => {
                  const value = toUpperCase(e.target.value);
                  setFormData({ ...formData, companyName: value });
                  validateField("companyName", value);
                }}
                onBlur={(e) => validateField("companyName", e.target.value)}
                placeholder="Nhập tên công ty..."
              />
              <InputGroupAddon>
                <Building2 className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
            {errors.companyName && (
              <p className="text-sm text-destructive mt-1">
                {errors.companyName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="ownerName">Chủ doanh nghiệp</Label>
            <InputGroup>
              <InputGroupInput
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => {
                  const value = capitalizeWords(e.target.value);
                  setFormData({ ...formData, ownerName: value });
                  validateField("ownerName", value);
                }}
                onBlur={(e) => validateField("ownerName", e.target.value)}
                placeholder="Người đại diện..."
              />
              <InputGroupAddon>
                <User className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
            {errors.ownerName && (
              <p className="text-sm text-destructive mt-1">
                {errors.ownerName}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <InputGroup>
              <InputGroupInput
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  validateField("phone", e.target.value);
                }}
                onBlur={(e) => validateField("phone", e.target.value)}
                placeholder="Nhập số điện thoại..."
              />
              <InputGroupAddon>
                <Phone className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <InputGroup>
              <InputGroupInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const value = toLowerCase(e.target.value);
                  setFormData({ ...formData, email: value, otp: "" });
                  validateField("email", value);
                  // Reset verified và OTP nếu email thay đổi
                  if (value !== emailSent) {
                    setVerified(false);
                  }
                }}
                onBlur={(e) => validateField("email", e.target.value)}
                placeholder="Nhập email..."
              />
              <InputGroupAddon>
                <Mail className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="industry">Ngành nghề kinh doanh</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => {
                setFormData({ ...formData, industry: value });
                validateField("industry", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn ngành nghề..." />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-destructive mt-1">{errors.industry}</p>
            )}
          </div>
          <div>
            <Label htmlFor="locale">Khu vực hoạt động</Label>
            <Select
              value={formData.locale}
              onValueChange={(value) => {
                setFormData({ ...formData, locale: value });
                validateField("locale", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khu vực..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Việt Nam</SelectItem>
                <SelectItem value="ja">Nhật Bản</SelectItem>
              </SelectContent>
            </Select>
            {errors.locale && (
              <p className="text-sm text-destructive mt-1">{errors.locale}</p>
            )}
          </div>
          <div>
            <Label htmlFor="language">Ngôn ngữ thông báo</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => {
                setFormData({ ...formData, language: value });
                validateField("language", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn ngôn ngữ..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
            {errors.language && (
              <p className="text-sm text-destructive mt-1">{errors.language}</p>
            )}
          </div>
          <div>
            <Label htmlFor="zipcode">Mã bưu điện (không bắt buộc)</Label>
            <InputGroup>
              <InputGroupInput
                id="zipcode"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="Nhập mã bưu điện..."
                maxLength={7}
              />
              <InputGroupAddon>
                <Milestone className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <InputGroup>
              <InputGroupInput
                id="address"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  validateField("address", e.target.value);
                }}
                onBlur={(e) => validateField("address", e.target.value)}
                placeholder={
                  loading ? "Đang tìm địa chỉ..." : "Nhập địa chỉ..."
                }
                disabled={loading}
              />
              <InputGroupAddon>
                <MapPin className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
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
            {sending ? "Đang xử lý..." : "Tiếp tục"}
          </Button>
          <div className="text-center text-sm">
            Bạn đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;

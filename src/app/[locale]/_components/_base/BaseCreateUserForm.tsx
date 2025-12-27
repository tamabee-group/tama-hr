"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/clearable-input";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { useZipcode } from "@/hooks/useZipcode";
import { SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AgeCalendar } from "@/app/[locale]/_components/AgeCalendar";
import {
  validateEmail,
  validatePhone,
  validateRequired,
} from "@/lib/validation";
import { capitalizeWords, toLowerCase } from "@/lib/utils/text-format";
import { toast } from "sonner";
import {
  Mail,
  User,
  Phone,
  MapPin,
  Milestone,
  Languages,
  UserCog,
  Users,
} from "lucide-react";
import { LANGUAGES, GENDERS } from "@/types/enums";

// Định nghĩa kiểu dữ liệu cho role option
interface RoleOption {
  readonly value: string;
  readonly label: string;
}

// Định nghĩa kiểu dữ liệu cho form
export interface CreateUserFormData {
  email: string;
  name: string;
  phone: string;
  role: string;
  address: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
  language: string;
}

// Props cho BaseCreateUserForm
interface BaseCreateUserFormProps {
  title: string;
  roles: readonly RoleOption[];
  defaultRole: string;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  submitButtonText?: string;
  loadingText?: string;
  successMessage?: string;
  successRedirectUrl?: string;
  resetAfterSuccess?: boolean;
}

export function BaseCreateUserForm({
  title,
  roles,
  defaultRole,
  onSubmit,
  submitButtonText = "Đăng ký",
  loadingText = "Đang xử lý...",
  successMessage = "Thành công!",
  successRedirectUrl,
  resetAfterSuccess = false,
}: BaseCreateUserFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: "",
    name: "",
    phone: "",
    role: defaultRole,
    address: "",
    zipCode: "",
    dateOfBirth: "",
    gender: "",
    language: "ja",
  });

  const { address: zipcodeAddress } = useZipcode(formData.zipCode);
  const [prevZipcodeAddress, setPrevZipcodeAddress] = useState("");

  // Tự động điền địa chỉ khi tìm thấy mã bưu điện

  if (
    zipcodeAddress &&
    formData.zipCode.length === 7 &&
    zipcodeAddress !== prevZipcodeAddress
  ) {
    setPrevZipcodeAddress(zipcodeAddress);
    setFormData((prev) => ({ ...prev, address: zipcodeAddress }));
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const nameError = validateRequired(formData.name, "Họ và tên");
    if (nameError) newErrors.name = nameError;

    if (!formData.gender) newErrors.gender = "Vui lòng chọn giới tính";
    if (!formData.role) newErrors.role = "Vui lòng chọn vai trò";

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      phone: "",
      role: defaultRole,
      address: "",
      zipCode: "",
      dateOfBirth: "",
      gender: "",
      language: "ja",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    const promise = onSubmit(formData);

    toast.promise(promise, {
      loading: loadingText,
      success: () => {
        if (resetAfterSuccess) {
          resetForm();
        }
        if (successRedirectUrl) {
          router.push(successRedirectUrl);
        }
        return successMessage;
      },
      error: (err) => {
        setErrors({ submit: err.message });
        return err.message || "Thao tác thất bại";
      },
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {errors.submit && (
            <Alert variant="destructive" className="col-span-1 md:col-span-2">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="email">Email *</Label>
            <ClearableInput
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                const value = toLowerCase(e.target.value);
                setFormData({ ...formData, email: value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              onClear={() => setFormData({ ...formData, email: "" })}
              icon={<Mail />}
              placeholder="Nhập email..."
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">Họ và tên *</Label>
            <ClearableInput
              id="name"
              required
              value={formData.name}
              onChange={(e) => {
                const value = capitalizeWords(e.target.value);
                setFormData({ ...formData, name: value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              onClear={() => setFormData({ ...formData, name: "" })}
              icon={<User />}
              placeholder="Nhập họ và tên..."
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="gender">Giới tính *</Label>
            <SelectWithIcon
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
              placeholder="Chọn giới tính"
              icon={<Users />}
            >
              {GENDERS.map((gender) => (
                <SelectItem key={gender.value} value={gender.value}>
                  {gender.label}
                </SelectItem>
              ))}
            </SelectWithIcon>
            {errors.gender && (
              <p className="text-sm text-destructive mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Ngày sinh</Label>
            <AgeCalendar
              defaultValue={new Date("1998-05-31")}
              onChange={(date) => {
                setFormData({
                  ...formData,
                  dateOfBirth: date ? date.toISOString().split("T")[0] : "",
                });
              }}
            />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <ClearableInput
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              onClear={() => setFormData({ ...formData, phone: "" })}
              icon={<Phone />}
              placeholder="Nhập số điện thoại..."
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="zipCode">Mã bưu điện</Label>
            <ClearableInput
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
                setFormData({ ...formData, zipCode: value });
              }}
              onClear={() => setFormData({ ...formData, zipCode: "" })}
              icon={<Milestone />}
              placeholder="Nhập 7 số"
              maxLength={7}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <ClearableInput
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
              }}
              onClear={() => setFormData({ ...formData, address: "" })}
              icon={<MapPin />}
              placeholder="Nhập địa chỉ..."
            />
          </div>

          <div>
            <Label htmlFor="language">Ngôn ngữ *</Label>
            <SelectWithIcon
              value={formData.language}
              onValueChange={(value) =>
                setFormData({ ...formData, language: value })
              }
              icon={<Languages />}
            >
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectWithIcon>
          </div>

          <div>
            <Label htmlFor="role">Vai trò *</Label>
            <SelectWithIcon
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value })
              }
              placeholder="Chọn vai trò"
              icon={<UserCog />}
            >
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectWithIcon>
            {errors.role && (
              <p className="text-sm text-destructive mt-1">{errors.role}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 flex gap-4 pt-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Hủy
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

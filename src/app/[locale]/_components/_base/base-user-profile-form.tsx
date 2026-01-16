"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ConfirmChangesDialog,
  FieldChange,
} from "@/app/[locale]/_components/_base/confirm-changes-dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { ClearableInput } from "@/components/ui/clearable-input";
import { getFileUrl } from "@/lib/utils/file-url";
import {
  Edit,
  Save,
  X,
  Camera,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Users,
  Globe,
  Milestone,
  ScanBarcode,
} from "lucide-react";
import { LANGUAGES, USER_STATUSES } from "@/types/enums";
import {
  getLanguageLabel,
  getUserStatusLabel,
  getUserRoleLabel,
} from "@/lib/utils/get-enum-label";
import { useZipcode } from "@/hooks/use-zipcode";
import { ImageCropDialog } from "@/app/[locale]/_components/_image-crop-dialog";
import { compressImageToWebP } from "@/lib/utils/compress-image-to-webp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { User } from "@/types/user";
import { validateEmail, validatePhone } from "@/lib/validation";
import { BankInfoForm } from "@/app/[locale]/_components/_base/_bank-info-form";
import { EmergencyContactForm } from "@/app/[locale]/_components/_base/_emergency-contact-form";
import type {
  BankAccountType,
  BankAccountCategory,
  JapanBankType,
} from "@/types/user";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Định nghĩa kiểu dữ liệu cho role option (chỉ giữ value, label sẽ lấy từ translations)
type RoleValue = string;

// Định nghĩa kiểu dữ liệu cho form
export interface UserProfileFormData {
  name: string;
  email: string;
  phone: string;
  language: string;
  status: string;
  role: string;
  zipCode: string;
  address: string;
  avatar: string;
  // Bank info - Common
  bankAccountType: string;
  japanBankType: string; // Loại ngân hàng Nhật: normal hoặc yucho
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  // Bank info - Japan specific
  bankCode: string;
  bankBranchCode: string;
  bankBranchName: string;
  bankAccountCategory: string;
  // Bank info - Japan Post Bank (ゆうちょ銀行)
  bankSymbol: string;
  bankNumber: string;
  // Emergency contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContactAddress: string;
}

// Props cho BaseUserProfileForm
interface BaseUserProfileFormProps {
  user: User;
  title: string;
  roles: readonly RoleValue[];
  onSave: (userId: number, data: UserProfileFormData) => Promise<void>;
  onUploadAvatar: (userId: number, file: File) => Promise<void>;
}

export function BaseUserProfileForm({
  user,
  title,
  roles,
  onSave,
  onUploadAvatar,
}: BaseUserProfileFormProps) {
  const router = useRouter();
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations("users.profile");
  const tEnums = useTranslations("enums");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Khởi tạo dữ liệu từ user
  const getInitialData = (): UserProfileFormData => ({
    name: user.profile?.name || "",
    email: user.email,
    phone: user.profile?.phone || "",
    language: user.language || "vi",
    status: user.status,
    role: user.role,
    zipCode: user.profile?.zipCode || "",
    address: user.profile?.address || "",
    avatar: user.profile?.avatar || "",
    // Bank info - Common
    bankAccountType: user.profile?.bankAccountType || "VN",
    japanBankType: user.profile?.japanBankType || "normal",
    bankName: user.profile?.bankName || "",
    bankAccount: user.profile?.bankAccount || "",
    bankAccountName: user.profile?.bankAccountName || "",
    // Bank info - Japan specific
    bankCode: user.profile?.bankCode || "",
    bankBranchCode: user.profile?.bankBranchCode || "",
    bankBranchName: user.profile?.bankBranchName || "",
    bankAccountCategory: user.profile?.bankAccountCategory || "",
    // Bank info - Japan Post Bank (ゆうちょ銀行)
    bankSymbol: user.profile?.bankSymbol || "",
    bankNumber: user.profile?.bankNumber || "",
    // Emergency contact
    emergencyContactName: user.profile?.emergencyContactName || "",
    emergencyContactPhone: user.profile?.emergencyContactPhone || "",
    emergencyContactRelation: user.profile?.emergencyContactRelation || "",
    emergencyContactAddress: user.profile?.emergencyContactAddress || "",
  });

  const [formData, setFormData] = useState<UserProfileFormData>(getInitialData);
  const [initialData] = useState<UserProfileFormData>(getInitialData);

  const { address: autoAddress, loading } = useZipcode(formData.zipCode);

  // Kiểm tra có thay đổi không
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData) ||
    avatarFile !== null;

  // Tự động điền địa chỉ khi nhập mã bưu điện
  useEffect(() => {
    if (autoAddress && isEditing) {
      setFormData((prev) => ({ ...prev, address: autoAddress }));
    }
  }, [autoAddress, isEditing]);

  // Mapping field sang nhóm
  const fieldGroups: Record<
    keyof UserProfileFormData,
    "basic" | "emergency" | "bank"
  > = {
    name: "basic",
    email: "basic",
    phone: "basic",
    language: "basic",
    status: "basic",
    role: "basic",
    zipCode: "basic",
    address: "basic",
    avatar: "basic",
    // Bank info
    bankAccountType: "bank",
    japanBankType: "bank",
    bankName: "bank",
    bankAccount: "bank",
    bankAccountName: "bank",
    bankCode: "bank",
    bankBranchCode: "bank",
    bankBranchName: "bank",
    bankAccountCategory: "bank",
    bankSymbol: "bank",
    bankNumber: "bank",
    // Emergency contact
    emergencyContactName: "emergency",
    emergencyContactPhone: "emergency",
    emergencyContactRelation: "emergency",
    emergencyContactAddress: "emergency",
  };

  // Mapping tên field sang translation keys
  const getFieldLabel = (key: keyof UserProfileFormData): string => {
    const labelMap: Record<keyof UserProfileFormData, string> = {
      name: t("name"),
      email: t("email"),
      phone: t("phone"),
      language: t("language"),
      status: t("status"),
      role: t("role"),
      zipCode: t("zipCode"),
      address: t("address"),
      avatar: t("avatar"),
      // Bank info
      bankAccountType: t("bankAccountType"),
      japanBankType: t("japanBankType"),
      bankName: t("bankName"),
      bankAccount: t("bankAccount"),
      bankAccountName: t("bankAccountName"),
      bankCode: t("bankCode"),
      bankBranchCode: t("bankBranchCode"),
      bankBranchName: t("bankBranchName"),
      bankAccountCategory: t("bankAccountCategory"),
      bankSymbol: t("bankSymbol"),
      bankNumber: t("bankNumber"),
      // Emergency contact
      emergencyContactName: t("emergencyName"),
      emergencyContactPhone: t("emergencyPhone"),
      emergencyContactRelation: t("emergencyRelation"),
      emergencyContactAddress: t("emergencyAddress"),
    };
    return labelMap[key];
  };

  // Hàm format giá trị hiển thị (chuyển value sang label)
  const formatDisplayValue = (
    key: keyof UserProfileFormData,
    value: string,
  ): string => {
    if (!value) return t("empty");

    // Format language
    if (key === "language") {
      const lang = LANGUAGES.find((l) => l.value === value);
      return lang
        ? `${lang.flag} ${getLanguageLabel(value as "vi" | "en" | "ja", tEnums)}`
        : value;
    }

    // Format status
    if (key === "status") {
      return getUserStatusLabel(value as "ACTIVE" | "INACTIVE", tEnums);
    }

    // Format role
    if (key === "role") {
      return getUserRoleLabel(value, tEnums);
    }

    return value;
  };

  // Lấy danh sách các field đã thay đổi
  const getChangedFields = (): FieldChange[] => {
    const changes: FieldChange[] = [];

    (Object.keys(formData) as (keyof UserProfileFormData)[]).forEach((key) => {
      if (key === "avatar") {
        // Xử lý riêng cho avatar
        if (avatarFile) {
          changes.push({
            field: key,
            label: getFieldLabel(key),
            oldValue: initialData[key] ? t("hasImage") : t("noImage"),
            newValue: t("newImage"),
            group: fieldGroups[key],
          });
        }
      } else if (formData[key] !== initialData[key]) {
        changes.push({
          field: key,
          label: getFieldLabel(key),
          oldValue: formatDisplayValue(key, initialData[key]),
          newValue: formatDisplayValue(key, formData[key]),
          group: fieldGroups[key],
        });
      }
    });

    return changes;
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (!formData.name.trim()) {
      newErrors.name = tValidation("required");
    }

    if (formData.emergencyContactPhone) {
      const emergencyPhoneError = validatePhone(formData.emergencyContactPhone);
      if (emergencyPhoneError)
        newErrors.emergencyContactPhone = emergencyPhoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mở dialog xác nhận trước khi lưu
  const handleSaveClick = () => {
    if (!validateForm()) {
      toast.error(tCommon("checkInfo"));
      return;
    }
    setConfirmDialogOpen(true);
  };

  // Xử lý lưu sau khi xác nhận
  const handleConfirmSave = async () => {
    setConfirmDialogOpen(false);
    setIsSaving(true);
    try {
      if (avatarFile) {
        await onUploadAvatar(user.id, avatarFile);
      }

      await onSave(user.id, formData);

      toast.success(tCommon("updateSuccess"));
      setIsEditing(false);
      setAvatarFile(null);
      setErrors({});
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      const message = getErrorMessage(error, tErrors, tCommon("saveError"));
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    setFormData(initialData);
    setAvatarFile(null);
    setErrors({});
    setIsEditing(false);
  };

  // Xử lý chọn file ảnh
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý sau khi crop ảnh
  const handleCropComplete = async (croppedFile: File) => {
    try {
      const compressedFile = await compressImageToWebP(croppedFile);
      setAvatarFile(compressedFile);
      const previewUrl = URL.createObjectURL(compressedFile);
      setFormData((prev) => ({ ...prev, avatar: previewUrl }));
    } catch (error) {
      console.error("Crop error:", error);
      toast.error(tCommon("imageProcessError"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {!isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              {tCommon("edit")}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveClick}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? tCommon("loading") : tCommon("save")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                {tCommon("cancel")}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar và thông tin cơ bản */}
        <div className="grid grid-cols-3 gap-4">
          <div className="relative w-fit">
            <Avatar className="h-20 w-20 border-2 border-primary sm:relative sm:bottom-3">
              <AvatarImage src={getFileUrl(formData.avatar)} />
              <AvatarFallback>
                {formData.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
              {isEditing && (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="avatar-input"
                  />
                  <label
                    htmlFor="avatar-input"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </label>
                </>
              )}
            </Avatar>
          </div>

          {selectedImage && (
            <ImageCropDialog
              open={cropDialogOpen}
              onOpenChange={setCropDialogOpen}
              imageSrc={selectedImage}
              onCropComplete={handleCropComplete}
              aspectRatio={1}
              cropShape="round"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center col-span-2">
            <div>
              <Label>{t("employeeCode")}</Label>
              <InputGroup>
                <InputGroupInput value={user.employeeCode || "-"} disabled />
                <InputGroupAddon>
                  <ScanBarcode />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div>
              <Label>{t("status")}</Label>
              <SelectWithIcon
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                disabled={!isEditing}
              >
                <SelectContent>
                  {USER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getUserStatusLabel(status, tEnums)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectWithIcon>
            </div>
          </div>
        </div>

        {/* Thông tin cá nhân */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("name")}</Label>
            <ClearableInput
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, name: "" }))}
              disabled={!isEditing}
              icon={<UserIcon />}
              textTransform="words"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>{t("email")}</Label>
            <ClearableInput
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, email: "" }))}
              disabled={!isEditing}
              icon={<Mail />}
              type="email"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label>{t("role")}</Label>
            <SelectWithIcon
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
              icon={<Users />}
              disabled={!isEditing}
            >
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getUserRoleLabel(role, tEnums)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithIcon>
          </div>

          <div>
            <Label>{t("phone")}</Label>
            <ClearableInput
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, phone: "" }))}
              disabled={!isEditing}
              icon={<Phone />}
              textTransform="none"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label>{t("notificationLanguage")}</Label>
            <SelectWithIcon
              value={formData.language}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, language: value }))
              }
              icon={<Globe />}
              disabled={!isEditing}
            >
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.flag} {getLanguageLabel(lang.value, tEnums)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithIcon>
          </div>

          <div>
            <Label>{t("zipCode")}</Label>
            <ClearableInput
              value={formData.zipCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, zipCode: "" }))}
              disabled={!isEditing}
              placeholder={t("zipCodePlaceholder")}
              icon={<Milestone />}
              textTransform="none"
            />
          </div>

          <div className="md:col-span-2">
            <Label>{t("address")}</Label>
            <ClearableInput
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, address: "" }))}
              disabled={!isEditing || loading}
              placeholder={
                loading ? t("addressLoading") : t("addressPlaceholder")
              }
              icon={loading ? <Spinner /> : <MapPin />}
            />
          </div>
        </div>

        {/* Thông tin liên lạc khẩn cấp và ngân hàng */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EmergencyContactForm
            data={{
              emergencyContactName: formData.emergencyContactName,
              emergencyContactPhone: formData.emergencyContactPhone,
              emergencyContactRelation: formData.emergencyContactRelation,
              emergencyContactAddress: formData.emergencyContactAddress,
            }}
            onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
            isEditing={isEditing}
            errors={errors}
          />

          <BankInfoForm
            data={{
              bankAccountType:
                (formData.bankAccountType as BankAccountType) || "VN",
              japanBankType:
                (formData.japanBankType as JapanBankType) || "normal",
              bankName: formData.bankName,
              bankAccount: formData.bankAccount,
              bankAccountName: formData.bankAccountName,
              bankCode: formData.bankCode,
              bankBranchCode: formData.bankBranchCode,
              bankBranchName: formData.bankBranchName,
              bankAccountCategory: formData.bankAccountCategory as
                | BankAccountCategory
                | "",
              bankSymbol: formData.bankSymbol,
              bankNumber: formData.bankNumber,
            }}
            onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
            isEditing={isEditing}
          />
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            {t("registeredAt")}: {formatDate(user.createdAt, locale)}
          </span>
          <span>
            {t("lastUpdated")}: {formatDate(user.updatedAt, locale)}
          </span>
        </div>
      </CardContent>

      {/* Dialog xác nhận thay đổi */}
      <ConfirmChangesDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        changes={getChangedFields()}
        onConfirm={handleConfirmSave}
        isLoading={isSaving}
      />
    </Card>
  );
}

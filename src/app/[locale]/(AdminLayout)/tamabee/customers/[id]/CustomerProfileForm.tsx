"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { ClearableInput } from "@/components/ui/clearable-input";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatDate } from "@/lib/utils/format-date";
import { SupportedLocale } from "@/lib/utils/format-currency";
import {
  Edit,
  Save,
  X,
  Camera,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Milestone,
  User,
  Briefcase,
  Hash,
  Languages,
} from "lucide-react";
import { LANGUAGES, LOCALES, normalizeLocale } from "@/types/enums";
import { INDUSTRIES, Company } from "@/types/company";
import { useZipcode } from "@/hooks/use-zipcode";
import { ImageCropDialog } from "@/app/[locale]/_components/_image-crop-dialog";
import { compressImageToWebP } from "@/lib/utils/compress-image-to-webp";
import { updateCompany, uploadCompanyLogo } from "@/lib/apis/admin-companies";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { validateEmail, validatePhone } from "@/lib/validation";
import { getLanguageLabel, getLocaleLabel } from "@/lib/utils/get-enum-label";

interface FormData {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  industry: string;
  locale: string;
  language: string;
  zipcode: string;
  address: string;
  logo: string;
}

export function CustomerProfileForm({ company }: { company: Company }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Khởi tạo dữ liệu từ company
  const getInitialData = (): FormData => ({
    name: company.name || "",
    ownerName: company.ownerName || "",
    email: company.email || "",
    phone: company.phone || "",
    industry: company.industry || "",
    locale: normalizeLocale(company.locale || ""),
    language: company.language || "vi",
    zipcode: company.zipcode || "",
    address: company.address || "",
    logo: company.logo || "",
  });

  const [formData, setFormData] = useState<FormData>(getInitialData);
  const [initialData] = useState<FormData>(getInitialData);

  const { address: autoAddress, loading } = useZipcode(formData.zipcode);

  // Kiểm tra có thay đổi không
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData) ||
    logoFile !== null;

  // Tự động điền địa chỉ khi nhập mã bưu điện
  useEffect(() => {
    if (autoAddress && isEditing) {
      setFormData((prev) => ({ ...prev, address: autoAddress }));
    }
  }, [autoAddress, isEditing]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired");
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = t("validation.ownerNameRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý lưu
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(t("validation.checkInfo"));
      return;
    }

    setIsSaving(true);
    try {
      // Upload logo nếu có
      if (logoFile) {
        await uploadCompanyLogo(company.id, logoFile);
      }

      // Cập nhật thông tin công ty
      await updateCompany(company.id, formData);

      toast.success(t("messages.updateSuccess"));
      setIsEditing(false);
      setLogoFile(null);
      setErrors({});
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(t("messages.updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    setFormData(initialData);
    setLogoFile(null);
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
      setLogoFile(compressedFile);
      const previewUrl = URL.createObjectURL(compressedFile);
      setFormData((prev) => ({ ...prev, logo: previewUrl }));
    } catch (error) {
      console.error("Crop error:", error);
      toast.error(tCommon("errorLoading"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle>{t("companyInfo")}</CardTitle>
          {!isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              {tCommon("edit")}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <Spinner className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? t("messages.saving") : tCommon("save")}
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
        {/* Logo và thông tin cơ bản */}
        <div className="grid grid-cols-3 gap-4">
          <div className="relative w-fit">
            {formData.logo ? (
              <div className="relative h-20 w-20 border-2 border-primary rounded-lg overflow-hidden">
                <Image
                  src={getFileUrl(formData.logo)}
                  alt="Logo"
                  fill
                  className="object-cover"
                />
                {isEditing && (
                  <>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="logo-input"
                    />
                    <label
                      htmlFor="logo-input"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </label>
                  </>
                )}
              </div>
            ) : (
              <div className="relative h-20 w-20 border-2 border-dashed border-muted-foreground rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground font-medium">
                  LOGO
                </span>
                {isEditing && (
                  <>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="logo-input"
                    />
                    <label
                      htmlFor="logo-input"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </label>
                  </>
                )}
              </div>
            )}
          </div>

          {selectedImage && (
            <ImageCropDialog
              open={cropDialogOpen}
              onOpenChange={setCropDialogOpen}
              imageSrc={selectedImage}
              onCropComplete={handleCropComplete}
              aspectRatio={1}
              cropShape="rect"
            />
          )}

          {/* Chỉ hiển thị mã giới thiệu và nhân viên tư vấn nếu có */}
          {(company.referredByEmployeeCode ||
            company.referredByEmployeeName) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center col-span-2">
              {company.referredByEmployeeCode && (
                <div>
                  <Label>{t("form.referralCode")}</Label>
                  <ClearableInput
                    value={company.referredByEmployeeCode}
                    disabled
                    icon={<Hash />}
                    onClear={() => {}}
                  />
                </div>
              )}
              {company.referredByEmployeeName && (
                <div>
                  <Label>{t("form.referredBy")}</Label>
                  <ClearableInput
                    value={company.referredByEmployeeName}
                    disabled
                    icon={<User />}
                    onClear={() => {}}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thông tin công ty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("form.name")}</Label>
            <ClearableInput
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, name: "" }))}
              disabled={!isEditing}
              icon={<Building2 />}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label>{t("form.ownerName")}</Label>
            <ClearableInput
              value={formData.ownerName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ownerName: e.target.value }))
              }
              onClear={() =>
                setFormData((prev) => ({ ...prev, ownerName: "" }))
              }
              disabled={!isEditing}
              icon={<User />}
            />
            {errors.ownerName && (
              <p className="text-sm text-destructive mt-1">
                {errors.ownerName}
              </p>
            )}
          </div>

          <div>
            <Label>{tCommon("email")}</Label>
            <ClearableInput
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, email: "" }))}
              disabled={!isEditing}
              icon={<Mail />}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label>{tCommon("phone")}</Label>
            <ClearableInput
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, phone: "" }))}
              disabled={!isEditing}
              icon={<Phone />}
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Label>{t("form.industry")}</Label>
            <SelectWithIcon
              value={formData.industry}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, industry: value }))
              }
              icon={<Briefcase />}
              disabled={!isEditing}
              placeholder={t("form.industryPlaceholder")}
            >
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind.value} value={ind.value}>
                    {ind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithIcon>
          </div>

          <div>
            <Label>{t("form.locale")}</Label>
            <SelectWithIcon
              value={formData.locale}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, locale: value }))
              }
              icon={<Globe />}
              disabled={!isEditing}
              placeholder={t("form.localePlaceholder")}
            >
              <SelectContent>
                {LOCALES.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {getLocaleLabel(loc, tEnums)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithIcon>
          </div>

          <div>
            <Label>{t("form.language")}</Label>
            <SelectWithIcon
              value={formData.language}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, language: value }))
              }
              icon={<Languages />}
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
            <Label>{t("form.zipcode")}</Label>
            <ClearableInput
              value={formData.zipcode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zipcode: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, zipcode: "" }))}
              disabled={!isEditing}
              placeholder={t("form.zipcodePlaceholder")}
              icon={<Milestone />}
            />
          </div>

          <div className="md:col-span-2">
            <Label>{t("form.address")}</Label>
            <ClearableInput
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              onClear={() => setFormData((prev) => ({ ...prev, address: "" }))}
              disabled={!isEditing || loading}
              placeholder={
                loading
                  ? t("form.autoFillAddress")
                  : t("form.addressPlaceholder")
              }
              icon={loading ? <Spinner /> : <MapPin />}
            />
          </div>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>
            {t("table.createdAt")}: {formatDate(company.createdAt, locale)}
          </span>
          <span>•</span>
          <span>
            {t("table.updatedAt")}: {formatDate(company.updatedAt, locale)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

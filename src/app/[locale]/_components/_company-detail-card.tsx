"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import { ClearableInput } from "@/components/ui/clearable-input";
import { Spinner } from "@/components/ui/spinner";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import {
  Edit,
  Save,
  X,
  Camera,
  Building2,
  Mail,
  Phone,
  MapPin,
  Milestone,
  User,
  Briefcase,
  Package,
  Wallet,
  Users,
} from "lucide-react";
import { INDUSTRIES, Company, getCompanyPlanName } from "@/types/company";
import { useZipcode } from "@/hooks/use-zipcode";
import { ImageCropDialog } from "./_image-crop-dialog";
import { compressImageToWebP } from "@/lib/utils/compress-image-to-webp";
import { toast } from "sonner";
import { validateEmail, validatePhone } from "@/lib/validation";

interface FormData {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  industry: string;
  zipcode: string;
  address: string;
  logo: string;
}

interface CompanyDetailCardProps {
  company: Company;
  canEdit: boolean;
  showWalletButton?: boolean;
  onSave: (data: FormData, logoFile: File | null) => Promise<void>;
  children?: React.ReactNode;
}

export function CompanyDetailCard({
  company,
  canEdit,
  showWalletButton = false,
  onSave,
  children,
}: CompanyDetailCardProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";
  const t = useTranslations("companies");
  const tCommon = useTranslations("common");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getInitialData = (): FormData => ({
    name: company.name || "",
    ownerName: company.ownerName || "",
    email: company.email || "",
    phone: company.phone || "",
    industry: company.industry || "",
    zipcode: company.zipcode || "",
    address: company.address || "",
    logo: company.logo || "",
  });

  const [formData, setFormData] = useState<FormData>(getInitialData);
  const [initialData] = useState<FormData>(getInitialData);
  const { address: autoAddress, loading } = useZipcode(formData.zipcode);

  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(initialData) ||
    logoFile !== null;

  // Service card data
  const isFreeTrial = company.isFreeTrialActive;
  const planName = getCompanyPlanName(company, locale as "vi" | "en" | "ja");
  const employeeCount = company.employeeCount ?? 0;
  const maxEmployees = company.planMaxEmployees;
  const isUnlimited = maxEmployees === -1 || maxEmployees === null;
  const usagePercent = isUnlimited
    ? 0
    : maxEmployees
      ? Math.min((employeeCount / maxEmployees) * 100, 100)
      : 0;

  useEffect(() => {
    if (autoAddress && isEditing) {
      setFormData((prev) => ({ ...prev, address: autoAddress }));
    }
  }, [autoAddress, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t("validation.nameRequired");
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    if (!formData.ownerName.trim())
      newErrors.ownerName = t("validation.ownerNameRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(t("validation.checkInfo"));
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData, logoFile);
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

  const handleCancel = () => {
    setFormData(initialData);
    setLogoFile(null);
    setErrors({});
    setIsEditing(false);
  };

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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Profile Card */}
      <Card className="xl:col-span-2 flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {formData.logo ? (
                  <div className="relative h-12 w-12 border-2 border-primary rounded-lg overflow-hidden">
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
                          <Camera className="h-4 w-4 text-white" />
                        </label>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative h-12 w-12 border-2 border-dashed border-muted-foreground rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
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
                          <Camera className="h-4 w-4 text-white" />
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-semibold">{company.name}</h2>
                <p className="text-xs text-muted-foreground">
                  ID: {company.id}
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {tCommon("edit")}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                    >
                      {isSaving ? (
                        <Spinner className="h-4 w-4 mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      {isSaving ? t("messages.saving") : tCommon("save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
            <div>
              <Label className="text-xs">{t("form.name")}</Label>
              <ClearableInput
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                onClear={() => setFormData((prev) => ({ ...prev, name: "" }))}
                disabled={!isEditing}
                icon={<Building2 />}
                className="h-9"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label className="text-xs">{t("form.ownerName")}</Label>
              <ClearableInput
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ownerName: e.target.value,
                  }))
                }
                onClear={() =>
                  setFormData((prev) => ({ ...prev, ownerName: "" }))
                }
                disabled={!isEditing}
                icon={<User />}
                className="h-9"
              />
              {errors.ownerName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.ownerName}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs">{t("form.industry")}</Label>
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
              <Label className="text-xs">{tCommon("email")}</Label>
              <ClearableInput
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                onClear={() => setFormData((prev) => ({ ...prev, email: "" }))}
                disabled={!isEditing}
                icon={<Mail />}
                className="h-9"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <Label className="text-xs">{tCommon("phone")}</Label>
              <ClearableInput
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                onClear={() => setFormData((prev) => ({ ...prev, phone: "" }))}
                disabled={!isEditing}
                icon={<Phone />}
                className="h-9"
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <Label className="text-xs">{t("form.zipcode")}</Label>
              <ClearableInput
                value={formData.zipcode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zipcode: e.target.value }))
                }
                onClear={() =>
                  setFormData((prev) => ({ ...prev, zipcode: "" }))
                }
                disabled={!isEditing}
                placeholder={t("form.zipcodePlaceholder")}
                icon={<Milestone />}
                className="h-9"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs">{t("form.address")}</Label>
              <ClearableInput
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                onClear={() =>
                  setFormData((prev) => ({ ...prev, address: "" }))
                }
                disabled={!isEditing || loading}
                placeholder={
                  loading
                    ? t("form.autoFillAddress")
                    : t("form.addressPlaceholder")
                }
                icon={loading ? <Spinner /> : <MapPin />}
                className="h-9"
              />
            </div>
          </div>

          {/* Extra content */}
          {children && <div className="mt-4 pt-3 border-t">{children}</div>}
        </CardContent>
      </Card>

      {/* Service Card */}
      <Card className="flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("serviceInfo")}
            </h3>
            {showWalletButton && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/${locale}/dashboard/wallet`}>
                  <Wallet className="h-4 w-4 mr-1" />
                  {t("subscription.manageWallet")}
                </Link>
              </Button>
            )}
          </div>

          <div className="space-y-3 flex-1">
            {/* Plan */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t("plan")}</span>
              <Badge variant="secondary" className="text-xs">
                {planName}
              </Badge>
            </div>

            {/* Wallet */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Wallet className="h-3 w-3" />
                {t("companyWallet")}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t("balance")}
                </span>
                <span
                  className={`font-semibold ${company.walletBalance != null && company.walletBalance > 0 ? "text-green-600" : company.walletBalance != null && company.walletBalance <= 0 ? "text-red-600" : ""}`}
                >
                  {company.walletBalance != null
                    ? formatCurrency(company.walletBalance)
                    : "-"}
                </span>
              </div>
              {isFreeTrial && company.freeTrialEndDate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t("subscription.freeTrialEnd")}
                  </span>
                  <span className="text-yellow-600 font-medium">
                    {formatDate(company.freeTrialEndDate, locale)}
                  </span>
                </div>
              )}
              {!isFreeTrial && company.nextBillingDate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t("nextBilling")}
                  </span>
                  <span>{formatDate(company.nextBillingDate, locale)}</span>
                </div>
              )}
            </div>

            {/* Employee Usage */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs font-medium mb-2">
                <Users className="h-3 w-3" />
                {t("employeeUsage")}
              </div>
              <div className="flex items-end justify-between mb-1">
                <div>
                  <span className="text-2xl font-bold text-blue-600">
                    {employeeCount}
                  </span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-base font-semibold text-purple-600">
                    {isUnlimited ? "∞" : maxEmployees}
                  </span>
                </div>
                {!isUnlimited && (
                  <span className="text-xs text-muted-foreground">
                    {usagePercent.toFixed(0)}%
                  </span>
                )}
              </div>
              {!isUnlimited && (
                <Progress value={usagePercent} className="h-1.5" />
              )}
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>{t("employees")}</span>
                <span>{t("limit")}</span>
              </div>
            </div>

            {/* Plan details */}
            <div className="text-xs text-muted-foreground space-y-1 mt-auto">
              <div className="flex justify-between">
                <span>{t("subscription.monthlyPrice")}</span>
                <span className="font-medium text-foreground">
                  {company.planMonthlyPrice != null
                    ? formatCurrency(company.planMonthlyPrice)
                    : "-"}
                </span>
              </div>
              {company.lastBillingDate && (
                <div className="flex justify-between">
                  <span>{t("lastBilling")}</span>
                  <span>{formatDate(company.lastBillingDate, locale)}</span>
                </div>
              )}
            </div>

            {/* Nút xem các gói dịch vụ */}
            <Button variant="outline" size="sm" className="w-full mt-3" asChild>
              <Link href={`/${locale}/dashboard/plans`}>
                {t("subscription.viewPlans")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
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
    </div>
  );
}

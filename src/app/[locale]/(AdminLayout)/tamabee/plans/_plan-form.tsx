"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { planApi } from "@/lib/apis/plan-api";
import { PlanResponse, PlanFeatureCreateRequest } from "@/types/plan";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { PlanFeatureForm } from "./_plan-feature-form";

export interface PlanFormData {
  nameVi: string;
  nameEn: string;
  nameJa: string;
  descriptionVi: string;
  descriptionEn: string;
  descriptionJa: string;
  monthlyPrice: number;
  maxEmployees: number;
  isActive: boolean;
  features: PlanFeatureCreateRequest[];
}

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: PlanResponse; // Edit mode nếu có
  onSuccess: () => void;
  locale?: SupportedLocale;
}

/**
 * Component form tạo/sửa plan
 * - Sections cho 3 ngôn ngữ: vi, en, ja
 * - Fields: name, description, monthlyPrice, maxEmployees, isActive
 * - Features management
 */
export function PlanForm({
  open,
  onOpenChange,
  plan,
  onSuccess,
  locale = "vi",
}: PlanFormProps) {
  const isEditMode = !!plan;

  const [formData, setFormData] = useState<PlanFormData>({
    nameVi: "",
    nameEn: "",
    nameJa: "",
    descriptionVi: "",
    descriptionEn: "",
    descriptionJa: "",
    monthlyPrice: 0,
    maxEmployees: 10,
    isActive: true,
    features: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Labels theo locale
  const labels = {
    vi: {
      titleCreate: "Thêm gói dịch vụ",
      titleEdit: "Sửa gói dịch vụ",
      description: "Nhập thông tin gói dịch vụ cho 3 ngôn ngữ",
      vietnamese: "Tiếng Việt",
      english: "Tiếng Anh",
      japanese: "Tiếng Nhật",
      name: "Tên gói",
      descriptionField: "Mô tả",
      monthlyPrice: "Giá hàng tháng (VND)",
      maxEmployees: "Số nhân viên tối đa",
      isActive: "Đang hoạt động",
      features: "Tính năng",
      cancel: "Hủy",
      save: "Lưu",
      saving: "Đang lưu...",
      successCreate: "Tạo gói dịch vụ thành công",
      successEdit: "Cập nhật gói dịch vụ thành công",
      errorCreate: "Không thể tạo gói dịch vụ",
      errorEdit: "Không thể cập nhật gói dịch vụ",
      required: "Trường này là bắt buộc",
      invalidPrice: "Giá phải lớn hơn hoặc bằng 0",
      invalidMaxEmployees: "Số nhân viên phải lớn hơn 0",
    },
    en: {
      titleCreate: "Add Plan",
      titleEdit: "Edit Plan",
      description: "Enter plan information for 3 languages",
      vietnamese: "Vietnamese",
      english: "English",
      japanese: "Japanese",
      name: "Plan Name",
      descriptionField: "Description",
      monthlyPrice: "Monthly Price (VND)",
      maxEmployees: "Max Employees",
      isActive: "Active",
      features: "Features",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      successCreate: "Plan created successfully",
      successEdit: "Plan updated successfully",
      errorCreate: "Failed to create plan",
      errorEdit: "Failed to update plan",
      required: "This field is required",
      invalidPrice: "Price must be greater than or equal to 0",
      invalidMaxEmployees: "Max employees must be greater than 0",
    },
    ja: {
      titleCreate: "プランを追加",
      titleEdit: "プランを編集",
      description: "3言語でプラン情報を入力してください",
      vietnamese: "ベトナム語",
      english: "英語",
      japanese: "日本語",
      name: "プラン名",
      descriptionField: "説明",
      monthlyPrice: "月額料金 (VND)",
      maxEmployees: "最大従業員数",
      isActive: "有効",
      features: "機能",
      cancel: "キャンセル",
      save: "保存",
      saving: "保存中...",
      successCreate: "プランが正常に作成されました",
      successEdit: "プランが正常に更新されました",
      errorCreate: "プランの作成に失敗しました",
      errorEdit: "プランの更新に失敗しました",
      required: "この項目は必須です",
      invalidPrice: "価格は0以上である必要があります",
      invalidMaxEmployees: "最大従業員数は0より大きくなければなりません",
    },
  };

  const t = labels[locale];

  // Load plan data khi edit mode
  useEffect(() => {
    if (plan) {
      setFormData({
        nameVi: plan.nameVi,
        nameEn: plan.nameEn,
        nameJa: plan.nameJa,
        descriptionVi: plan.descriptionVi,
        descriptionEn: plan.descriptionEn,
        descriptionJa: plan.descriptionJa,
        monthlyPrice: plan.monthlyPrice,
        maxEmployees: plan.maxEmployees,
        isActive: plan.isActive,
        features: plan.features.map((f) => ({
          featureVi: f.featureVi,
          featureEn: f.featureEn,
          featureJa: f.featureJa,
          sortOrder: f.sortOrder,
          isHighlighted: f.isHighlighted,
        })),
      });
    } else {
      resetForm();
    }
  }, [plan, open]);

  const resetForm = () => {
    setFormData({
      nameVi: "",
      nameEn: "",
      nameJa: "",
      descriptionVi: "",
      descriptionEn: "",
      descriptionJa: "",
      monthlyPrice: 0,
      maxEmployees: 10,
      isActive: true,
      features: [],
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate names
    if (!formData.nameVi.trim()) newErrors.nameVi = t.required;
    if (!formData.nameEn.trim()) newErrors.nameEn = t.required;
    if (!formData.nameJa.trim()) newErrors.nameJa = t.required;

    // Validate descriptions
    if (!formData.descriptionVi.trim()) newErrors.descriptionVi = t.required;
    if (!formData.descriptionEn.trim()) newErrors.descriptionEn = t.required;
    if (!formData.descriptionJa.trim()) newErrors.descriptionJa = t.required;

    // Validate price
    if (formData.monthlyPrice < 0) newErrors.monthlyPrice = t.invalidPrice;

    // Validate maxEmployees
    if (formData.maxEmployees <= 0)
      newErrors.maxEmployees = t.invalidMaxEmployees;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && plan) {
        await planApi.update(plan.id, formData);
        toast.success(t.successEdit);
      } else {
        await planApi.create(formData);
        toast.success(t.successCreate);
      }
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to save plan:", error);
      toast.error(isEditMode ? t.errorEdit : t.errorCreate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleInputChange = (
    field: keyof PlanFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFeaturesChange = (features: PlanFeatureCreateRequest[]) => {
    setFormData((prev) => ({ ...prev, features }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t.titleEdit : t.titleCreate}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vietnamese Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              🇻🇳 {t.vietnamese}
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameVi">{t.name}</Label>
                <Input
                  id="nameVi"
                  value={formData.nameVi}
                  onChange={(e) => handleInputChange("nameVi", e.target.value)}
                  disabled={isSubmitting}
                  className={errors.nameVi ? "border-destructive" : ""}
                />
                {errors.nameVi && (
                  <p className="text-sm text-destructive">{errors.nameVi}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionVi">{t.descriptionField}</Label>
                <Textarea
                  id="descriptionVi"
                  value={formData.descriptionVi}
                  onChange={(e) =>
                    handleInputChange("descriptionVi", e.target.value)
                  }
                  disabled={isSubmitting}
                  className={errors.descriptionVi ? "border-destructive" : ""}
                  rows={2}
                />
                {errors.descriptionVi && (
                  <p className="text-sm text-destructive">
                    {errors.descriptionVi}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* English Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              🇺🇸 {t.english}
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">{t.name}</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange("nameEn", e.target.value)}
                  disabled={isSubmitting}
                  className={errors.nameEn ? "border-destructive" : ""}
                />
                {errors.nameEn && (
                  <p className="text-sm text-destructive">{errors.nameEn}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionEn">{t.descriptionField}</Label>
                <Textarea
                  id="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={(e) =>
                    handleInputChange("descriptionEn", e.target.value)
                  }
                  disabled={isSubmitting}
                  className={errors.descriptionEn ? "border-destructive" : ""}
                  rows={2}
                />
                {errors.descriptionEn && (
                  <p className="text-sm text-destructive">
                    {errors.descriptionEn}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Japanese Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              🇯🇵 {t.japanese}
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameJa">{t.name}</Label>
                <Input
                  id="nameJa"
                  value={formData.nameJa}
                  onChange={(e) => handleInputChange("nameJa", e.target.value)}
                  disabled={isSubmitting}
                  className={errors.nameJa ? "border-destructive" : ""}
                />
                {errors.nameJa && (
                  <p className="text-sm text-destructive">{errors.nameJa}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionJa">{t.descriptionField}</Label>
                <Textarea
                  id="descriptionJa"
                  value={formData.descriptionJa}
                  onChange={(e) =>
                    handleInputChange("descriptionJa", e.target.value)
                  }
                  disabled={isSubmitting}
                  className={errors.descriptionJa ? "border-destructive" : ""}
                  rows={2}
                />
                {errors.descriptionJa && (
                  <p className="text-sm text-destructive">
                    {errors.descriptionJa}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyPrice">{t.monthlyPrice}</Label>
              <Input
                id="monthlyPrice"
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyPrice",
                    parseFloat(e.target.value) || 0,
                  )
                }
                disabled={isSubmitting}
                className={errors.monthlyPrice ? "border-destructive" : ""}
              />
              {errors.monthlyPrice && (
                <p className="text-sm text-destructive">
                  {errors.monthlyPrice}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxEmployees">{t.maxEmployees}</Label>
              <Input
                id="maxEmployees"
                type="number"
                value={formData.maxEmployees}
                onChange={(e) =>
                  handleInputChange(
                    "maxEmployees",
                    parseInt(e.target.value) || 0,
                  )
                }
                disabled={isSubmitting}
                className={errors.maxEmployees ? "border-destructive" : ""}
              />
              {errors.maxEmployees && (
                <p className="text-sm text-destructive">
                  {errors.maxEmployees}
                </p>
              )}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">{t.isActive}</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
              disabled={isSubmitting}
            />
          </div>

          <Separator />

          {/* Features Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t.features}</h3>
            <PlanFeatureForm
              features={formData.features}
              onChange={handleFeaturesChange}
              disabled={isSubmitting}
              locale={locale}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

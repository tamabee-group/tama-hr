"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  plan?: PlanResponse;
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
}: PlanFormProps) {
  const t = useTranslations("plans");
  const tCommon = useTranslations("common");
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
    if (!formData.nameVi.trim()) newErrors.nameVi = t("validation.required");
    if (!formData.nameEn.trim()) newErrors.nameEn = t("validation.required");
    if (!formData.nameJa.trim()) newErrors.nameJa = t("validation.required");

    // Validate descriptions
    if (!formData.descriptionVi.trim())
      newErrors.descriptionVi = t("validation.required");
    if (!formData.descriptionEn.trim())
      newErrors.descriptionEn = t("validation.required");
    if (!formData.descriptionJa.trim())
      newErrors.descriptionJa = t("validation.required");

    // Validate price
    if (formData.monthlyPrice < 0)
      newErrors.monthlyPrice = t("validation.invalidPrice");

    // Validate maxEmployees
    if (formData.maxEmployees <= 0)
      newErrors.maxEmployees = t("validation.invalidMaxEmployees");

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
        toast.success(t("messages.updateSuccess"));
      } else {
        await planApi.create(formData);
        toast.success(t("messages.createSuccess"));
      }
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to save plan:", error);
      toast.error(
        isEditMode ? t("messages.updateError") : t("messages.createError"),
      );
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
          <DialogTitle>
            {isEditMode ? t("editPlan") : t("createPlan")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vietnamese Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">
              🇻🇳 {t("form.vietnamese")}
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameVi">{t("form.name")}</Label>
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
                <Label htmlFor="descriptionVi">{t("form.description")}</Label>
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
              🇺🇸 {t("form.english")}
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">{t("form.name")}</Label>
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
                <Label htmlFor="descriptionEn">{t("form.description")}</Label>
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
              🇯🇵 {t("form.japanese")}
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameJa">{t("form.name")}</Label>
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
                <Label htmlFor="descriptionJa">{t("form.description")}</Label>
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
              <Label htmlFor="monthlyPrice">{t("form.price")}</Label>
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
              <Label htmlFor="maxEmployees">{t("form.maxEmployees")}</Label>
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
            <Label htmlFor="isActive">{t("form.isActive")}</Label>
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
            <h3 className="font-semibold">{t("form.features")}</h3>
            <PlanFeatureForm
              features={formData.features}
              onChange={handleFeaturesChange}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? t("form.saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

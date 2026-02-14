"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MapPin } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { AttendanceLocation } from "@/types/attendance-config";
import type {
  CreateAttendanceLocationRequest,
  UpdateAttendanceLocationRequest,
} from "@/lib/apis/attendance-location-api";

// ============================================
// Props
// ============================================

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: AttendanceLocation | null;
  onSubmit: (
    data: CreateAttendanceLocationRequest | UpdateAttendanceLocationRequest,
  ) => Promise<void>;
}

// ============================================
// Form State
// ============================================

interface LocationFormState {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  radiusMeters: string;
  isActive: boolean;
}

const DEFAULT_FORM: LocationFormState = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  radiusMeters: "100",
  isActive: true,
};

// ============================================
// Component
// ============================================

/**
 * Dialog tạo/sửa vị trí chấm công
 * Có hướng dẫn từng bước lấy tọa độ GPS
 * Không gọi API trực tiếp, trả data qua onSubmit callback
 */
export function LocationDialog({
  open,
  onOpenChange,
  location,
  onSubmit,
}: LocationDialogProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");

  const [form, setForm] = useState<LocationFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const isEditMode = !!location;

  // Reset form khi dialog mở/đóng hoặc location thay đổi
  useEffect(() => {
    if (open) {
      if (location) {
        setForm({
          name: location.name,
          address: location.address || "",
          latitude: String(location.latitude),
          longitude: String(location.longitude),
          radiusMeters: String(location.radiusMeters),
          isActive: location.isActive,
        });
        setShowGuide(false);
      } else {
        setForm(DEFAULT_FORM);
        setShowGuide(true);
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, location]);

  // Cập nhật field trong form
  const updateField = (
    field: keyof LocationFormState,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validate form trước khi submit
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = t("locations.nameRequired");
    }

    const lat = parseFloat(form.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = t("locations.latitudeRange");
    }

    const lng = parseFloat(form.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = t("locations.longitudeRange");
    }

    const radius = parseInt(form.radiusMeters, 10);
    if (isNaN(radius) || radius < 1) {
      newErrors.radiusMeters = t("locations.radiusMin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    if (!validate()) return;

    const data:
      | CreateAttendanceLocationRequest
      | UpdateAttendanceLocationRequest = {
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      radiusMeters: parseInt(form.radiusMeters, 10),
      isActive: form.isActive,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("locations.editTitle") : t("locations.addTitle")}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              {isEditMode ? t("locations.editTitle") : t("locations.addTitle")}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <div className="space-y-5 my-4">
          {/* Tên vị trí */}
          <div className="space-y-2">
            <Label htmlFor="location-name">{t("locations.nameLabel")}</Label>
            <Input
              id="location-name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {t("locations.nameHint")}
            </p>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="space-y-2">
            <Label htmlFor="location-address">
              {t("locations.addressLabel")}
            </Label>
            <Input
              id="location-address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {t("locations.addressHint")}
            </p>
          </div>

          {/* Tọa độ GPS với hướng dẫn */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {t("locations.coordinatesTitle")}
              </span>
            </div>

            {/* Hướng dẫn lấy tọa độ */}
            <Collapsible open={showGuide} onOpenChange={setShowGuide}>
              <CollapsibleTrigger className="text-sm text-primary hover:underline cursor-pointer">
                {t("locations.coordinatesGuide")}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground list-decimal list-inside rounded-lg border bg-muted/30 p-3">
                  <li>{t("locations.coordinatesStep1")}</li>
                  <li>{t("locations.coordinatesStep2")}</li>
                  <li>{t("locations.coordinatesStep3")}</li>
                  <li>{t("locations.coordinatesStep4")}</li>
                  <li>{t("locations.coordinatesStep5")}</li>
                </ol>
              </CollapsibleContent>
            </Collapsible>

            {/* Vĩ độ và Kinh độ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location-latitude">
                  {t("locations.latitudeLabel")}
                </Label>
                <Input
                  id="location-latitude"
                  type="number"
                  step="any"
                  placeholder="21.0285"
                  value={form.latitude}
                  onChange={(e) => updateField("latitude", e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {t("locations.latitudeHint")}
                </p>
                {errors.latitude && (
                  <p className="text-sm text-red-500">{errors.latitude}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-longitude">
                  {t("locations.longitudeLabel")}
                </Label>
                <Input
                  id="location-longitude"
                  type="number"
                  step="any"
                  placeholder="105.8542"
                  value={form.longitude}
                  onChange={(e) => updateField("longitude", e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {t("locations.longitudeHint")}
                </p>
                {errors.longitude && (
                  <p className="text-sm text-red-500">{errors.longitude}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bán kính */}
          <div className="space-y-2">
            <Label htmlFor="location-radius">
              {t("locations.radiusLabel")}
            </Label>
            <Input
              id="location-radius"
              type="number"
              min={1}
              className="max-w-[200px]"
              value={form.radiusMeters}
              onChange={(e) => updateField("radiusMeters", e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {t("locations.radiusHint")}
            </p>
            {errors.radiusMeters && (
              <p className="text-sm text-red-500">{errors.radiusMeters}</p>
            )}
          </div>

          {/* Trạng thái hoạt động */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Switch
                id="location-active"
                checked={form.isActive}
                onCheckedChange={(checked) => updateField("isActive", checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="location-active">
                {t("locations.isActiveLabel")}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("locations.isActiveHint")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEditMode ? tCommon("update") : tCommon("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

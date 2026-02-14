"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { PlanFeatureCreateRequest } from "@/types/plan";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Star,
} from "lucide-react";

interface PlanFeatureFormProps {
  features: PlanFeatureCreateRequest[];
  onChange: (features: PlanFeatureCreateRequest[]) => void;
  disabled?: boolean;
}

export function PlanFeatureForm({
  features,
  onChange,
  disabled = false,
}: PlanFeatureFormProps) {
  const t = useTranslations("plans");

  const handleAddFeature = () => {
    const newFeature: PlanFeatureCreateRequest = {
      featureVi: "",
      featureEn: "",
      featureJa: "",
      sortOrder: features.length + 1,
      isHighlighted: false,
    };
    onChange([...features, newFeature]);
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    const updatedFeatures = newFeatures.map((f, i) => ({
      ...f,
      sortOrder: i + 1,
    }));
    onChange(updatedFeatures);
  };

  const handleUpdateFeature = (
    index: number,
    field: keyof PlanFeatureCreateRequest,
    value: string | number | boolean,
  ) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange(newFeatures);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFeatures = [...features];
    [newFeatures[index - 1], newFeatures[index]] = [
      newFeatures[index],
      newFeatures[index - 1],
    ];
    const updatedFeatures = newFeatures.map((f, i) => ({
      ...f,
      sortOrder: i + 1,
    }));
    onChange(updatedFeatures);
  };

  const handleMoveDown = (index: number) => {
    if (index === features.length - 1) return;
    const newFeatures = [...features];
    [newFeatures[index], newFeatures[index + 1]] = [
      newFeatures[index + 1],
      newFeatures[index],
    ];
    const updatedFeatures = newFeatures.map((f, i) => ({
      ...f,
      sortOrder: i + 1,
    }));
    onChange(updatedFeatures);
  };

  return (
    <div className="space-y-4">
      {features.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("feature.noFeatures")}
        </p>
      ) : (
        <div className="space-y-3">
          {features.map((feature, index) => (
            <GlassCard key={index} className="relative p-4">
              <div className="flex gap-2">
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveUp(index)}
                    disabled={disabled || index === 0}
                    title={t("feature.moveUp")}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center h-6 w-6">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveDown(index)}
                    disabled={disabled || index === features.length - 1}
                    title={t("feature.moveDown")}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        🇻🇳 {t("feature.featureVi")}
                      </Label>
                      <Input
                        value={feature.featureVi}
                        onChange={(e) =>
                          handleUpdateFeature(
                            index,
                            "featureVi",
                            e.target.value,
                          )
                        }
                        placeholder={t("feature.featurePlaceholder")}
                        disabled={disabled}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        🇺🇸 {t("feature.featureEn")}
                      </Label>
                      <Input
                        value={feature.featureEn}
                        onChange={(e) =>
                          handleUpdateFeature(
                            index,
                            "featureEn",
                            e.target.value,
                          )
                        }
                        placeholder={t("feature.featurePlaceholder")}
                        disabled={disabled}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        🇯🇵 {t("feature.featureJa")}
                      </Label>
                      <Input
                        value={feature.featureJa}
                        onChange={(e) =>
                          handleUpdateFeature(
                            index,
                            "featureJa",
                            e.target.value,
                          )
                        }
                        placeholder={t("feature.featurePlaceholder")}
                        disabled={disabled}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={feature.isHighlighted}
                        onCheckedChange={(checked) =>
                          handleUpdateFeature(index, "isHighlighted", checked)
                        }
                        disabled={disabled}
                      />
                      <Label className="text-sm flex items-center gap-1">
                        <Star
                          className={`h-3 w-3 ${
                            feature.isHighlighted
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        {t("feature.highlighted")}
                      </Label>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                      disabled={disabled}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t("feature.remove")}
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddFeature}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {t("feature.addFeature")}
      </Button>
    </div>
  );
}

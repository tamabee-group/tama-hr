"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WorkScheduleInput } from "@/types/attendance-records";
import { SCHEDULE_TYPES, ScheduleType } from "@/types/attendance-enums";
import { createSchedule } from "@/lib/apis/work-schedule-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { ExplanationPanel } from "../_components/_explanation-panel";
import { ScheduleTimeline } from "../_components/_schedule-timeline";
import {
  BreakPeriodForm,
  BreakPeriodData,
  calculateTotalBreakMinutes,
} from "./_break-period-form";
import {
  isValidTimeFormat,
  isStartTimeBeforeEndTime,
  isOvernightSchedule,
  isBreakWithinWorkHours,
  areBreakPeriodsOverlapping,
} from "./_schedule-form";

interface ScheduleWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  type: ScheduleType;
  workStartTime: string;
  workEndTime: string;
  breakMinutes: number;
  isDefault: boolean;
  breakPeriods: BreakPeriodData[];
}

const WIZARD_STEPS = [
  "basicInfo",
  "workingHours",
  "breakConfig",
  "review",
] as const;

/**
 * Wizard component để tạo lịch làm việc mới
 * 4 steps: Basic Info → Working Hours → Break Config → Review
 */
export function ScheduleWizard({
  open,
  onClose,
  onSuccess,
}: ScheduleWizardProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "FIXED",
    workStartTime: "09:00",
    workEndTime: "18:00",
    breakMinutes: 60,
    isDefault: false,
    breakPeriods: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isOvernight = isOvernightSchedule(
    formData.workStartTime,
    formData.workEndTime,
  );

  // Handle field change
  const handleChange = (
    field: keyof FormData,
    value: string | number | boolean | BreakPeriodData[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle break periods change
  const handleBreakPeriodsChange = (periods: BreakPeriodData[]) => {
    const totalMinutes = calculateTotalBreakMinutes(periods, isOvernight);
    setFormData((prev) => ({
      ...prev,
      breakPeriods: periods,
      breakMinutes: totalMinutes > 0 ? totalMinutes : prev.breakMinutes,
    }));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.name.trim()) {
          newErrors.name = t("form.namePlaceholder");
        }
        break;

      case 1: // Working Hours
        if (!isValidTimeFormat(formData.workStartTime)) {
          newErrors.workStartTime = t("messages.invalidTimeRange");
        }
        if (!isValidTimeFormat(formData.workEndTime)) {
          newErrors.workEndTime = t("messages.invalidTimeRange");
        }
        const allowOvernight = formData.type === "SHIFT";
        if (
          isValidTimeFormat(formData.workStartTime) &&
          isValidTimeFormat(formData.workEndTime) &&
          !isStartTimeBeforeEndTime(
            formData.workStartTime,
            formData.workEndTime,
            allowOvernight,
          )
        ) {
          newErrors.workEndTime = t("messages.invalidTimeRange");
        }
        break;

      case 2: // Break Config
        if (formData.breakMinutes < 0 || formData.breakMinutes > 480) {
          newErrors.breakMinutes = t("messages.invalidTimeRange");
        }
        // Validate break periods
        formData.breakPeriods.forEach((period, index) => {
          if (
            !isValidTimeFormat(period.startTime) ||
            !isValidTimeFormat(period.endTime)
          ) {
            newErrors[`breakPeriod_${index}`] = t("messages.invalidTimeRange");
            return;
          }
          if (
            !isBreakWithinWorkHours(
              period.startTime,
              period.endTime,
              formData.workStartTime,
              formData.workEndTime,
              isOvernight,
            )
          ) {
            newErrors[`breakPeriod_${index}`] = t("form.breakOutsideWorkHours");
          }
        });
        // Check overlap
        for (let i = 0; i < formData.breakPeriods.length; i++) {
          for (let j = i + 1; j < formData.breakPeriods.length; j++) {
            if (
              areBreakPeriodsOverlapping(
                formData.breakPeriods[i].startTime,
                formData.breakPeriods[i].endTime,
                formData.breakPeriods[j].startTime,
                formData.breakPeriods[j].endTime,
                isOvernight,
              )
            ) {
              newErrors.breakPeriods = t("form.breakOverlap");
              break;
            }
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);

      const breakPeriodsData = formData.breakPeriods.map((period, index) => ({
        name: period.name || `Break ${index + 1}`,
        startTime: period.startTime,
        endTime: period.endTime,
        durationMinutes: calculateTotalBreakMinutes([period], isOvernight),
        isFlexible: period.isFlexible,
      }));

      const scheduleData: WorkScheduleInput = {
        name: formData.name,
        type: formData.type,
        isDefault: formData.isDefault,
        scheduleData: {
          workStartTime: formData.workStartTime,
          workEndTime: formData.workEndTime,
          breakMinutes: formData.breakMinutes,
          ...(breakPeriodsData.length > 0 && {
            breakPeriods: breakPeriodsData,
          }),
        },
      };

      await createSchedule(scheduleData);
      toast.success(t("messages.createSuccess"));
      onSuccess();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />
        );
      case 1:
        return (
          <WorkingHoursStep
            formData={formData}
            errors={errors}
            isOvernight={isOvernight}
            onChange={handleChange}
          />
        );
      case 2:
        return (
          <BreakConfigStep
            formData={formData}
            errors={errors}
            isOvernight={isOvernight}
            onChange={handleChange}
            onBreakPeriodsChange={handleBreakPeriodsChange}
          />
        );
      case 3:
        return <ReviewStep formData={formData} isOvernight={isOvernight} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createSchedule")}</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step Content */}
        <div className="py-4">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {tCommon("previous")}
          </Button>

          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              {tCommon("next")}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? tCommon("loading") : tCommon("save")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Step Indicator Component
function StepIndicator({ currentStep }: { currentStep: number }) {
  const t = useTranslations("schedules");

  const stepLabels = [
    t("wizard.basicInfo"),
    t("wizard.workingHours"),
    t("wizard.breakConfig"),
    t("wizard.review"),
  ];

  return (
    <div className="flex items-center justify-between">
      {stepLabels.map((label, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
              index < currentStep
                ? "bg-primary text-primary-foreground"
                : index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
          </div>
          <span
            className={cn(
              "ml-2 text-sm hidden sm:inline",
              index === currentStep ? "font-medium" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
          {index < stepLabels.length - 1 && (
            <div
              className={cn(
                "mx-4 h-0.5 w-8 sm:w-16",
                index < currentStep ? "bg-primary" : "bg-muted",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Step 1: Basic Info
interface BasicInfoStepProps {
  formData: FormData;
  errors: Record<string, string>;
  onChange: (
    field: keyof FormData,
    value: string | number | boolean | BreakPeriodData[],
  ) => void;
}

function BasicInfoStep({ formData, errors, onChange }: BasicInfoStepProps) {
  const t = useTranslations("schedules");
  const tEnums = useTranslations("enums");

  return (
    <div className="space-y-4">
      <ExplanationPanel
        title={t("wizard.basicInfo")}
        description={t("wizard.basicInfoDescription")}
        tips={[t("wizard.basicInfoTip1"), t("wizard.basicInfoTip2")]}
        defaultCollapsed={false}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("form.name")}</Label>
          <Input
            id="name"
            placeholder={t("form.namePlaceholder")}
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t("form.type")}</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => onChange("type", value as ScheduleType)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("form.typePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {SCHEDULE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getEnumLabel("scheduleType", type, tEnums)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="isDefault"
            checked={formData.isDefault}
            onCheckedChange={(checked) => onChange("isDefault", checked)}
          />
          <Label htmlFor="isDefault" className="cursor-pointer">
            {t("form.isDefault")}
          </Label>
        </div>
      </div>
    </div>
  );
}

// Step 2: Working Hours
interface WorkingHoursStepProps {
  formData: FormData;
  errors: Record<string, string>;
  isOvernight: boolean;
  onChange: (
    field: keyof FormData,
    value: string | number | boolean | BreakPeriodData[],
  ) => void;
}

function WorkingHoursStep({
  formData,
  errors,
  isOvernight,
  onChange,
}: WorkingHoursStepProps) {
  const t = useTranslations("schedules");

  return (
    <div className="space-y-4">
      <ExplanationPanel
        title={t("wizard.workingHours")}
        description={t("wizard.workingHoursDescription")}
        tips={[t("wizard.workingHoursTip1"), t("wizard.workingHoursTip2")]}
        defaultCollapsed={false}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workStartTime">{t("form.workStartTime")}</Label>
          <Input
            id="workStartTime"
            type="time"
            value={formData.workStartTime}
            onChange={(e) => onChange("workStartTime", e.target.value)}
          />
          {errors.workStartTime && (
            <p className="text-sm text-destructive">{errors.workStartTime}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workEndTime">{t("form.workEndTime")}</Label>
          <Input
            id="workEndTime"
            type="time"
            value={formData.workEndTime}
            onChange={(e) => onChange("workEndTime", e.target.value)}
          />
          {errors.workEndTime && (
            <p className="text-sm text-destructive">{errors.workEndTime}</p>
          )}
        </div>
      </div>

      {isOvernight && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {t("form.overnightScheduleHint")}
        </div>
      )}

      {/* Timeline Preview */}
      <div className="pt-4">
        <Label className="mb-2 block">{t("timeline")}</Label>
        <ScheduleTimeline
          workStartTime={formData.workStartTime}
          workEndTime={formData.workEndTime}
          breakPeriods={formData.breakPeriods.map((bp) => ({
            name: bp.name,
            startTime: bp.startTime,
            endTime: bp.endTime,
            durationMinutes: calculateTotalBreakMinutes([bp], isOvernight),
            isFlexible: bp.isFlexible,
            order: 0,
          }))}
          isOvernight={isOvernight}
        />
      </div>
    </div>
  );
}

// Step 3: Break Config
interface BreakConfigStepProps {
  formData: FormData;
  errors: Record<string, string>;
  isOvernight: boolean;
  onChange: (
    field: keyof FormData,
    value: string | number | boolean | BreakPeriodData[],
  ) => void;
  onBreakPeriodsChange: (periods: BreakPeriodData[]) => void;
}

function BreakConfigStep({
  formData,
  errors,
  isOvernight,
  onChange,
  onBreakPeriodsChange,
}: BreakConfigStepProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-4">
      <ExplanationPanel
        title={t("wizard.breakConfig")}
        description={t("wizard.breakConfigDescription")}
        tips={[t("wizard.breakConfigTip1"), t("wizard.breakConfigTip2")]}
        defaultCollapsed={false}
      />

      {formData.breakPeriods.length === 0 && (
        <div className="space-y-2">
          <Label htmlFor="breakMinutes">{t("form.breakDuration")}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="breakMinutes"
              type="number"
              min={0}
              max={480}
              value={formData.breakMinutes}
              onChange={(e) =>
                onChange("breakMinutes", parseInt(e.target.value) || 0)
              }
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              {tCommon("minutes")}
            </span>
          </div>
          {errors.breakMinutes && (
            <p className="text-sm text-destructive">{errors.breakMinutes}</p>
          )}
        </div>
      )}

      <BreakPeriodForm
        breakPeriods={formData.breakPeriods}
        onChange={onBreakPeriodsChange}
        isOvernight={isOvernight}
        maxPeriods={5}
        errors={errors}
      />

      {/* Timeline Preview */}
      <div className="pt-4">
        <Label className="mb-2 block">{t("timeline")}</Label>
        <ScheduleTimeline
          workStartTime={formData.workStartTime}
          workEndTime={formData.workEndTime}
          breakPeriods={formData.breakPeriods.map((bp) => ({
            name: bp.name,
            startTime: bp.startTime,
            endTime: bp.endTime,
            durationMinutes: calculateTotalBreakMinutes([bp], isOvernight),
            isFlexible: bp.isFlexible,
            order: 0,
          }))}
          isOvernight={isOvernight}
        />
      </div>
    </div>
  );
}

// Step 4: Review
interface ReviewStepProps {
  formData: FormData;
  isOvernight: boolean;
}

function ReviewStep({ formData, isOvernight }: ReviewStepProps) {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  return (
    <div className="space-y-4">
      <ExplanationPanel
        title={t("wizard.review")}
        description={t("wizard.reviewDescription")}
        defaultCollapsed={false}
      />

      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("form.name")}</p>
            <p className="font-medium">{formData.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("form.type")}</p>
            <Badge variant="secondary">
              {getEnumLabel("scheduleType", formData.type, tEnums)}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("form.workStartTime")}
            </p>
            <p className="font-medium">{formData.workStartTime}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("form.workEndTime")}
            </p>
            <p className="font-medium">
              {formData.workEndTime}
              {isOvernight && (
                <span className="ml-2 text-xs text-blue-600">
                  ({t("overnight")})
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("form.breakDuration")}
            </p>
            <p className="font-medium">
              {formData.breakMinutes} {tCommon("minutes")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("form.isDefault")}
            </p>
            <p className="font-medium">
              {formData.isDefault ? tCommon("yes") : tCommon("no")}
            </p>
          </div>
        </div>

        {formData.breakPeriods.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {t("form.breakPeriods")}
            </p>
            <div className="space-y-1">
              {formData.breakPeriods.map((bp, index) => (
                <div key={index} className="text-sm">
                  {bp.name || `Break ${index + 1}`}: {bp.startTime} -{" "}
                  {bp.endTime}
                  {bp.isFlexible && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({t("flexibleBreak")})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Preview */}
      <div>
        <Label className="mb-2 block">{t("timeline")}</Label>
        <ScheduleTimeline
          workStartTime={formData.workStartTime}
          workEndTime={formData.workEndTime}
          breakPeriods={formData.breakPeriods.map((bp) => ({
            name: bp.name,
            startTime: bp.startTime,
            endTime: bp.endTime,
            durationMinutes: calculateTotalBreakMinutes([bp], isOvernight),
            isFlexible: bp.isFlexible,
            order: 0,
          }))}
          isOvernight={isOvernight}
        />
      </div>
    </div>
  );
}

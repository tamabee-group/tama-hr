"use client";

import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Switch } from "@/components/ui/switch";
import { InfoPanel } from "@/components/ui/info-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { AttendanceConfig } from "@/types/attendance-config";
import {
  ROUNDING_INTERVALS,
  ROUNDING_DIRECTIONS,
  RoundingInterval,
  RoundingDirection,
} from "@/types/attendance-enums";

interface RoundingSectionProps {
  formData: AttendanceConfig;
  updateField: <K extends keyof AttendanceConfig>(
    field: K,
    value: AttendanceConfig[K],
  ) => void;
}

// Tính toán ví dụ làm tròn
function calculateRoundingExample(
  time: string,
  interval: RoundingInterval,
  direction: RoundingDirection,
): string {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;

  const intervalMinutes =
    {
      MINUTES_1: 1,
      MINUTES_5: 5,
      MINUTES_10: 10,
      MINUTES_15: 15,
      MINUTES_30: 30,
      MINUTES_60: 60,
    }[interval] || 15;

  let roundedMinutes: number;

  switch (direction) {
    case "UP":
      roundedMinutes =
        Math.ceil(totalMinutes / intervalMinutes) * intervalMinutes;
      break;
    case "DOWN":
      roundedMinutes =
        Math.floor(totalMinutes / intervalMinutes) * intervalMinutes;
      break;
    case "NEAREST":
    default:
      roundedMinutes =
        Math.round(totalMinutes / intervalMinutes) * intervalMinutes;
      break;
  }

  const resultHours = Math.floor(roundedMinutes / 60) % 24;
  const resultMins = roundedMinutes % 60;

  return `${resultHours.toString().padStart(2, "0")}:${resultMins.toString().padStart(2, "0")}`;
}

export function RoundingSection({
  formData,
  updateField,
}: RoundingSectionProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  // Thông tin giải thích
  const roundingInfo = [
    {
      label: t("attendance.rounding"),
      description: t("attendance.roundingTooltip"),
    },
  ];

  // Ví dụ cho check-in
  const checkInExample = formData.enableCheckInRounding
    ? calculateRoundingExample(
        "08:07",
        formData.checkInRounding?.interval || "MINUTES_15",
        formData.checkInRounding?.direction || "NEAREST",
      )
    : "08:07";

  // Ví dụ cho check-out
  const checkOutExample = formData.enableCheckOutRounding
    ? calculateRoundingExample(
        "17:23",
        formData.checkOutRounding?.interval || "MINUTES_15",
        formData.checkOutRounding?.direction || "NEAREST",
      )
    : "17:23";

  // Ví dụ cho break start
  const breakStartExample = formData.enableBreakStartRounding
    ? calculateRoundingExample(
        "12:03",
        formData.breakStartRounding?.interval || "MINUTES_15",
        formData.breakStartRounding?.direction || "NEAREST",
      )
    : "12:03";

  // Ví dụ cho break end
  const breakEndExample = formData.enableBreakEndRounding
    ? calculateRoundingExample(
        "13:08",
        formData.breakEndRounding?.interval || "MINUTES_15",
        formData.breakEndRounding?.direction || "NEAREST",
      )
    : "13:08";

  return (
    <GlassSection title={t("attendance.rounding")}>
      <div className="space-y-5">
        <div className="pb-2 -mt-2 flex justify-between gap-4">
          <div className="flex justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                {t("attendance.checkIn")}
              </span>
              <div className="flex items-center gap-1.5 text-sm">
                <code className="px-2 py-1 bg-background border rounded text-sm">
                  08:07
                </code>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <code className="px-2 py-1 bg-primary/10 text-primary border rounded font-medium text-sm">
                  {checkInExample}
                </code>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                {t("attendance.checkOut")}
              </span>
              <div className="flex items-center gap-1.5 text-sm">
                <code className="px-2 py-1 bg-background border rounded text-sm">
                  17:23
                </code>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <code className="px-2 py-1 bg-primary/10 text-primary border rounded font-medium text-sm">
                  {checkOutExample}
                </code>
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                {t("attendance.breakStart")}
              </span>
              <div className="flex items-center gap-1.5 text-sm">
                <code className="px-2 py-1 bg-background border rounded text-sm">
                  12:03
                </code>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <code className="px-2 py-1 bg-primary/10 text-primary border rounded font-medium text-sm">
                  {breakStartExample}
                </code>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                {t("attendance.breakEnd")}
              </span>
              <div className="flex items-center gap-1.5 text-sm">
                <code className="px-2 py-1 bg-background border rounded text-sm">
                  13:08
                </code>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <code className="px-2 py-1 bg-primary/10 text-primary border rounded font-medium text-sm">
                  {breakEndExample}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng cấu hình - Desktop */}
        <div className="hidden sm:block border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-12"></th>
                <th className="text-left px-4 py-3 font-medium">
                  {t("attendance.roundingType")}
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  {t("attendance.roundingInterval")}
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  {t("attendance.roundingDirection")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Check-in */}
              <RoundingTableRow
                label={t("attendance.checkIn")}
                enabled={formData.enableCheckInRounding}
                onEnabledChange={(checked) => {
                  updateField("enableCheckInRounding", checked);
                  // Tạo default config khi bật nếu chưa có
                  if (checked && !formData.checkInRounding) {
                    updateField("checkInRounding", {
                      interval: "MINUTES_15",
                      direction: "NEAREST",
                    });
                  }
                }}
                interval={formData.checkInRounding?.interval || "MINUTES_15"}
                direction={formData.checkInRounding?.direction || "NEAREST"}
                onIntervalChange={(value) =>
                  updateField("checkInRounding", {
                    interval: value as RoundingInterval,
                    direction: formData.checkInRounding?.direction || "NEAREST",
                  })
                }
                onDirectionChange={(value) =>
                  updateField("checkInRounding", {
                    interval:
                      formData.checkInRounding?.interval || "MINUTES_15",
                    direction: value as RoundingDirection,
                  })
                }
                tEnums={tEnums}
              />

              {/* Check-out */}
              <RoundingTableRow
                label={t("attendance.checkOut")}
                enabled={formData.enableCheckOutRounding}
                onEnabledChange={(checked) => {
                  updateField("enableCheckOutRounding", checked);
                  if (checked && !formData.checkOutRounding) {
                    updateField("checkOutRounding", {
                      interval: "MINUTES_15",
                      direction: "NEAREST",
                    });
                  }
                }}
                interval={formData.checkOutRounding?.interval || "MINUTES_15"}
                direction={formData.checkOutRounding?.direction || "NEAREST"}
                onIntervalChange={(value) =>
                  updateField("checkOutRounding", {
                    interval: value as RoundingInterval,
                    direction:
                      formData.checkOutRounding?.direction || "NEAREST",
                  })
                }
                onDirectionChange={(value) =>
                  updateField("checkOutRounding", {
                    interval:
                      formData.checkOutRounding?.interval || "MINUTES_15",
                    direction: value as RoundingDirection,
                  })
                }
                tEnums={tEnums}
              />

              {/* Break Start */}
              <RoundingTableRow
                label={t("attendance.breakStart")}
                enabled={formData.enableBreakStartRounding}
                onEnabledChange={(checked) => {
                  updateField("enableBreakStartRounding", checked);
                  if (checked && !formData.breakStartRounding) {
                    updateField("breakStartRounding", {
                      interval: "MINUTES_15",
                      direction: "NEAREST",
                    });
                  }
                }}
                interval={formData.breakStartRounding?.interval || "MINUTES_15"}
                direction={formData.breakStartRounding?.direction || "NEAREST"}
                onIntervalChange={(value) =>
                  updateField("breakStartRounding", {
                    interval: value as RoundingInterval,
                    direction:
                      formData.breakStartRounding?.direction || "NEAREST",
                  })
                }
                onDirectionChange={(value) =>
                  updateField("breakStartRounding", {
                    interval:
                      formData.breakStartRounding?.interval || "MINUTES_15",
                    direction: value as RoundingDirection,
                  })
                }
                tEnums={tEnums}
              />

              {/* Break End */}
              <RoundingTableRow
                label={t("attendance.breakEnd")}
                enabled={formData.enableBreakEndRounding}
                onEnabledChange={(checked) => {
                  updateField("enableBreakEndRounding", checked);
                  if (checked && !formData.breakEndRounding) {
                    updateField("breakEndRounding", {
                      interval: "MINUTES_15",
                      direction: "NEAREST",
                    });
                  }
                }}
                interval={formData.breakEndRounding?.interval || "MINUTES_15"}
                direction={formData.breakEndRounding?.direction || "NEAREST"}
                onIntervalChange={(value) =>
                  updateField("breakEndRounding", {
                    interval: value as RoundingInterval,
                    direction:
                      formData.breakEndRounding?.direction || "NEAREST",
                  })
                }
                onDirectionChange={(value) =>
                  updateField("breakEndRounding", {
                    interval:
                      formData.breakEndRounding?.interval || "MINUTES_15",
                    direction: value as RoundingDirection,
                  })
                }
                tEnums={tEnums}
              />
            </tbody>
          </table>
        </div>

        {/* Cấu hình dạng card - Mobile */}
        <div className="sm:hidden space-y-2">
          <RoundingMobileCard
            label={t("attendance.checkIn")}
            enabled={formData.enableCheckInRounding}
            onEnabledChange={(checked) => {
              updateField("enableCheckInRounding", checked);
              if (checked && !formData.checkInRounding) {
                updateField("checkInRounding", {
                  interval: "MINUTES_15",
                  direction: "NEAREST",
                });
              }
            }}
            interval={formData.checkInRounding?.interval || "MINUTES_15"}
            direction={formData.checkInRounding?.direction || "NEAREST"}
            onIntervalChange={(value) =>
              updateField("checkInRounding", {
                interval: value as RoundingInterval,
                direction: formData.checkInRounding?.direction || "NEAREST",
              })
            }
            onDirectionChange={(value) =>
              updateField("checkInRounding", {
                interval: formData.checkInRounding?.interval || "MINUTES_15",
                direction: value as RoundingDirection,
              })
            }
            tEnums={tEnums}
            t={t}
          />

          <RoundingMobileCard
            label={t("attendance.checkOut")}
            enabled={formData.enableCheckOutRounding}
            onEnabledChange={(checked) => {
              updateField("enableCheckOutRounding", checked);
              if (checked && !formData.checkOutRounding) {
                updateField("checkOutRounding", {
                  interval: "MINUTES_15",
                  direction: "NEAREST",
                });
              }
            }}
            interval={formData.checkOutRounding?.interval || "MINUTES_15"}
            direction={formData.checkOutRounding?.direction || "NEAREST"}
            onIntervalChange={(value) =>
              updateField("checkOutRounding", {
                interval: value as RoundingInterval,
                direction: formData.checkOutRounding?.direction || "NEAREST",
              })
            }
            onDirectionChange={(value) =>
              updateField("checkOutRounding", {
                interval: formData.checkOutRounding?.interval || "MINUTES_15",
                direction: value as RoundingDirection,
              })
            }
            tEnums={tEnums}
            t={t}
          />

          <RoundingMobileCard
            label={t("attendance.breakStart")}
            enabled={formData.enableBreakStartRounding}
            onEnabledChange={(checked) => {
              updateField("enableBreakStartRounding", checked);
              if (checked && !formData.breakStartRounding) {
                updateField("breakStartRounding", {
                  interval: "MINUTES_15",
                  direction: "NEAREST",
                });
              }
            }}
            interval={formData.breakStartRounding?.interval || "MINUTES_15"}
            direction={formData.breakStartRounding?.direction || "NEAREST"}
            onIntervalChange={(value) =>
              updateField("breakStartRounding", {
                interval: value as RoundingInterval,
                direction: formData.breakStartRounding?.direction || "NEAREST",
              })
            }
            onDirectionChange={(value) =>
              updateField("breakStartRounding", {
                interval: formData.breakStartRounding?.interval || "MINUTES_15",
                direction: value as RoundingDirection,
              })
            }
            tEnums={tEnums}
            t={t}
          />

          <RoundingMobileCard
            label={t("attendance.breakEnd")}
            enabled={formData.enableBreakEndRounding}
            onEnabledChange={(checked) => {
              updateField("enableBreakEndRounding", checked);
              if (checked && !formData.breakEndRounding) {
                updateField("breakEndRounding", {
                  interval: "MINUTES_15",
                  direction: "NEAREST",
                });
              }
            }}
            interval={formData.breakEndRounding?.interval || "MINUTES_15"}
            direction={formData.breakEndRounding?.direction || "NEAREST"}
            onIntervalChange={(value) =>
              updateField("breakEndRounding", {
                interval: value as RoundingInterval,
                direction: formData.breakEndRounding?.direction || "NEAREST",
              })
            }
            onDirectionChange={(value) =>
              updateField("breakEndRounding", {
                interval: formData.breakEndRounding?.interval || "MINUTES_15",
                direction: value as RoundingDirection,
              })
            }
            tEnums={tEnums}
            t={t}
          />
        </div>

        {/* Info panel */}
        <InfoPanel title={tCommon("viewExplanation")} items={roundingInfo} />
      </div>
    </GlassSection>
  );
}

// Component cho mỗi row trong bảng (Desktop)
interface RoundingTableRowProps {
  label: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  interval: string;
  direction: string;
  onIntervalChange: (value: string) => void;
  onDirectionChange: (value: string) => void;
  tEnums: ReturnType<typeof useTranslations<"enums">>;
}

function RoundingTableRow({
  label,
  enabled,
  onEnabledChange,
  interval,
  direction,
  onIntervalChange,
  onDirectionChange,
  tEnums,
}: RoundingTableRowProps) {
  return (
    <tr className={!enabled ? "opacity-50" : ""}>
      <td className="px-4">
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          className="scale-90 relative top-0.5"
        />
      </td>
      <td className="px-4 font-medium">{label}</td>
      <td className="px-4">
        <Select
          value={interval}
          onValueChange={onIntervalChange}
          disabled={!enabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROUNDING_INTERVALS.map((int) => (
              <SelectItem key={int} value={int}>
                {tEnums(`roundingInterval.${int}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4">
        <Select
          value={direction}
          onValueChange={onDirectionChange}
          disabled={!enabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROUNDING_DIRECTIONS.map((dir) => (
              <SelectItem key={dir} value={dir}>
                {tEnums(`roundingDirection.${dir}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
    </tr>
  );
}

// Component card cho mobile
interface RoundingMobileCardProps {
  label: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  interval: string;
  direction: string;
  onIntervalChange: (value: string) => void;
  onDirectionChange: (value: string) => void;
  tEnums: ReturnType<typeof useTranslations<"enums">>;
  t: ReturnType<typeof useTranslations<"companySettings">>;
}

function RoundingMobileCard({
  label,
  enabled,
  onEnabledChange,
  interval,
  direction,
  onIntervalChange,
  onDirectionChange,
  tEnums,
  t,
}: RoundingMobileCardProps) {
  return (
    <div
      className={`p-4 border rounded-xl space-y-2 ${!enabled ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">
            {t("attendance.roundingInterval")}
          </span>
          <Select
            value={interval}
            onValueChange={onIntervalChange}
            disabled={!enabled}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROUNDING_INTERVALS.map((int) => (
                <SelectItem key={int} value={int}>
                  {tEnums(`roundingInterval.${int}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">
            {t("attendance.roundingDirection")}
          </span>
          <Select
            value={direction}
            onValueChange={onDirectionChange}
            disabled={!enabled}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROUNDING_DIRECTIONS.map((dir) => (
                <SelectItem key={dir} value={dir}>
                  {tEnums(`roundingDirection.${dir}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

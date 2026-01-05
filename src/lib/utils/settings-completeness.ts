import {
  CompanySettings,
  WorkModeConfig,
  AttendanceConfig,
  PayrollConfig,
  OvertimeConfig,
  BreakConfig,
  AllowanceConfig,
  DeductionConfig,
  WorkMode,
} from "@/types/attendance-config";

/**
 * Các loại cấu hình có thể thiếu
 */
export type IncompleteSettingType =
  | "workMode"
  | "attendance"
  | "payroll"
  | "overtime"
  | "break"
  | "allowance"
  | "deduction";

/**
 * Thông tin về cấu hình còn thiếu
 */
export interface IncompleteSetting {
  type: IncompleteSettingType;
  fieldKey: string;
  severity: "warning" | "error";
}

/**
 * Kết quả kiểm tra độ hoàn thiện của settings
 */
export interface SettingsCompletenessResult {
  isComplete: boolean;
  incompleteSettings: IncompleteSetting[];
  completionPercentage: number;
}

/**
 * Kiểm tra work mode config có đầy đủ không
 */
function checkWorkModeConfig(
  config: WorkModeConfig | null,
): IncompleteSetting[] {
  const issues: IncompleteSetting[] = [];

  if (!config) {
    issues.push({
      type: "workMode",
      fieldKey: "mode",
      severity: "error",
    });
    return issues;
  }

  // Nếu là FIXED_HOURS mode, cần có default hours
  if (config.mode === WorkMode.FIXED_HOURS) {
    if (!config.defaultWorkStartTime) {
      issues.push({
        type: "workMode",
        fieldKey: "defaultWorkStartTime",
        severity: "warning",
      });
    }
    if (!config.defaultWorkEndTime) {
      issues.push({
        type: "workMode",
        fieldKey: "defaultWorkEndTime",
        severity: "warning",
      });
    }
  }

  return issues;
}

/**
 * Kiểm tra attendance config có đầy đủ không
 */
function checkAttendanceConfig(
  config: AttendanceConfig | null,
): IncompleteSetting[] {
  const issues: IncompleteSetting[] = [];

  if (!config) {
    issues.push({
      type: "attendance",
      fieldKey: "config",
      severity: "error",
    });
    return issues;
  }

  if (!config.defaultWorkStartTime) {
    issues.push({
      type: "attendance",
      fieldKey: "defaultWorkStartTime",
      severity: "warning",
    });
  }

  if (!config.defaultWorkEndTime) {
    issues.push({
      type: "attendance",
      fieldKey: "defaultWorkEndTime",
      severity: "warning",
    });
  }

  return issues;
}

/**
 * Kiểm tra payroll config có đầy đủ không
 */
function checkPayrollConfig(config: PayrollConfig | null): IncompleteSetting[] {
  const issues: IncompleteSetting[] = [];

  if (!config) {
    issues.push({
      type: "payroll",
      fieldKey: "config",
      severity: "error",
    });
    return issues;
  }

  if (!config.payDay || config.payDay < 1 || config.payDay > 31) {
    issues.push({
      type: "payroll",
      fieldKey: "payDay",
      severity: "warning",
    });
  }

  if (!config.cutoffDay || config.cutoffDay < 1 || config.cutoffDay > 31) {
    issues.push({
      type: "payroll",
      fieldKey: "cutoffDay",
      severity: "warning",
    });
  }

  return issues;
}

/**
 * Kiểm tra overtime config có đầy đủ không
 */
function checkOvertimeConfig(
  config: OvertimeConfig | null,
): IncompleteSetting[] {
  const issues: IncompleteSetting[] = [];

  if (!config) {
    issues.push({
      type: "overtime",
      fieldKey: "config",
      severity: "error",
    });
    return issues;
  }

  // Overtime config thường có giá trị mặc định, không cần kiểm tra nhiều
  return issues;
}

/**
 * Kiểm tra break config có đầy đủ không
 */
function checkBreakConfig(config: BreakConfig | null): IncompleteSetting[] {
  const issues: IncompleteSetting[] = [];

  if (!config) {
    issues.push({
      type: "break",
      fieldKey: "config",
      severity: "error",
    });
    return issues;
  }

  // Break config thường có giá trị mặc định
  return issues;
}

/**
 * Kiểm tra allowance config có đầy đủ không
 */
function checkAllowanceConfig(
  config: AllowanceConfig | null,
): IncompleteSetting[] {
  const issues: IncompleteSetting[] = [];

  if (!config) {
    issues.push({
      type: "allowance",
      fieldKey: "config",
      severity: "error",
    });
    return issues;
  }

  // Allowance config có thể rỗng (không bắt buộc phải có allowances)
  return issues;
}

/**
 * Kiểm tra deduction config có đầy đủ không
 */
function checkDeductionConfig(
  config: DeductionConfig | null,
): IncompleteSetting[] {
  const issues: IncompleteSetting[] = [];

  if (!config) {
    issues.push({
      type: "deduction",
      fieldKey: "config",
      severity: "error",
    });
    return issues;
  }

  // Deduction config có thể rỗng (không bắt buộc phải có deductions)
  return issues;
}

/**
 * Kiểm tra độ hoàn thiện của tất cả settings
 * @param settings - Company settings
 * @param workModeConfig - Work mode config
 * @returns Kết quả kiểm tra
 */
export function checkSettingsCompleteness(
  settings: CompanySettings | null,
  workModeConfig: WorkModeConfig | null,
): SettingsCompletenessResult {
  const incompleteSettings: IncompleteSetting[] = [];

  // Kiểm tra work mode
  incompleteSettings.push(...checkWorkModeConfig(workModeConfig));

  if (settings) {
    // Kiểm tra attendance
    incompleteSettings.push(
      ...checkAttendanceConfig(settings.attendanceConfig),
    );

    // Kiểm tra payroll
    incompleteSettings.push(...checkPayrollConfig(settings.payrollConfig));

    // Kiểm tra overtime
    incompleteSettings.push(...checkOvertimeConfig(settings.overtimeConfig));

    // Kiểm tra break
    incompleteSettings.push(...checkBreakConfig(settings.breakConfig));

    // Kiểm tra allowance
    incompleteSettings.push(...checkAllowanceConfig(settings.allowanceConfig));

    // Kiểm tra deduction
    incompleteSettings.push(...checkDeductionConfig(settings.deductionConfig));
  } else {
    // Nếu không có settings, tất cả đều thiếu
    incompleteSettings.push(
      { type: "attendance", fieldKey: "config", severity: "error" },
      { type: "payroll", fieldKey: "config", severity: "error" },
      { type: "overtime", fieldKey: "config", severity: "error" },
      { type: "break", fieldKey: "config", severity: "error" },
      { type: "allowance", fieldKey: "config", severity: "error" },
      { type: "deduction", fieldKey: "config", severity: "error" },
    );
  }

  // Tính completion percentage
  const totalChecks = 7; // workMode, attendance, payroll, overtime, break, allowance, deduction
  const errorCount = incompleteSettings.filter(
    (s) => s.severity === "error",
  ).length;
  const completionPercentage = Math.round(
    ((totalChecks - errorCount) / totalChecks) * 100,
  );

  return {
    isComplete: incompleteSettings.length === 0,
    incompleteSettings,
    completionPercentage,
  };
}

/**
 * Lấy danh sách các tab có cấu hình chưa hoàn thiện
 * @param result - Kết quả kiểm tra completeness
 * @returns Danh sách các tab types có issues
 */
export function getIncompleteTabTypes(
  result: SettingsCompletenessResult,
): IncompleteSettingType[] {
  const types = new Set<IncompleteSettingType>();
  result.incompleteSettings.forEach((setting) => {
    types.add(setting.type);
  });
  return Array.from(types);
}

/**
 * Kiểm tra xem một tab có cấu hình chưa hoàn thiện không
 * @param tabType - Loại tab
 * @param result - Kết quả kiểm tra completeness
 * @returns true nếu tab có issues
 */
export function hasIncompleteSettings(
  tabType: IncompleteSettingType,
  result: SettingsCompletenessResult,
): boolean {
  return result.incompleteSettings.some((setting) => setting.type === tabType);
}

/**
 * Types cho System Settings
 */

// Value types cho settings
export type SettingValueType = "INTEGER" | "DECIMAL" | "STRING" | "BOOLEAN";

/**
 * Thông tin setting
 */
export interface SettingResponse {
  id: number;
  settingKey: string;
  settingValue: string;
  valueType: SettingValueType;
  description: string;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Request cập nhật setting
 */
export interface SettingUpdateRequest {
  settingValue: string;
}

/**
 * Helper function để parse setting value theo type
 */
export const parseSettingValue = (
  value: string,
  valueType: SettingValueType,
): string | number | boolean => {
  switch (valueType) {
    case "INTEGER":
      return parseInt(value, 10);
    case "DECIMAL":
      return parseFloat(value);
    case "BOOLEAN":
      return value.toLowerCase() === "true";
    case "STRING":
    default:
      return value;
  }
};

/**
 * Helper function để validate setting value theo type
 */
export const validateSettingValue = (
  value: string,
  valueType: SettingValueType,
): boolean => {
  switch (valueType) {
    case "INTEGER":
      return /^-?\d+$/.test(value);
    case "DECIMAL":
      return /^-?\d+(\.\d+)?$/.test(value);
    case "BOOLEAN":
      return value.toLowerCase() === "true" || value.toLowerCase() === "false";
    case "STRING":
    default:
      return true;
  }
};

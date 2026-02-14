// Types cho Salary Item (phụ cấp/khấu trừ)
// Dựa trên backend DTOs

// ============================================
// Salary Item Type Enum
// ============================================

export const SalaryItemType = {
  ALLOWANCE: "ALLOWANCE",
  DEDUCTION: "DEDUCTION",
} as const;

export type SalaryItemType =
  (typeof SalaryItemType)[keyof typeof SalaryItemType];

// ============================================
// Salary Item Template
// ============================================

export interface SalaryItemTemplate {
  id: number;
  name: string;
  type: SalaryItemType;
}

export interface CreateSalaryItemTemplateRequest {
  name: string;
  type: SalaryItemType;
}

export interface UpdateSalaryItemTemplateRequest {
  name: string;
}

// ============================================
// Employee Salary Item
// ============================================

export interface EmployeeSalaryItem {
  id: number;
  employeeId: number;
  templateId: number;
  templateName: string;
  type: SalaryItemType;
  amount: number;
}

export interface AssignSalaryItemRequest {
  templateId: number;
  amount: number;
}

export interface UpdateSalaryItemRequest {
  templateId: number;
  amount: number;
}

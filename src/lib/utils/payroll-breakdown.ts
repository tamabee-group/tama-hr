/**
 * Payroll Breakdown Utilities
 * Tính toán và xác minh breakdown lương
 */

// ============================================
// Types
// ============================================

export interface PayrollBreakdownInput {
  baseSalary: number;
  regularOvertimePay: number;
  nightWorkPay: number;
  nightOvertimePay: number;
  holidayOvertimePay: number;
  holidayNightOvertimePay: number;
  allowances: number[];
  deductions: number[];
}

export interface PayrollBreakdownResult {
  baseSalary: number;
  totalOvertimePay: number;
  totalAllowances: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
}

// ============================================
// Functions
// ============================================

/**
 * Tính toán payroll breakdown từ input
 * @param input - PayrollBreakdownInput
 * @returns PayrollBreakdownResult
 */
export function calculatePayrollBreakdown(
  input: PayrollBreakdownInput,
): PayrollBreakdownResult {
  // Tính tổng overtime
  const totalOvertimePay =
    input.regularOvertimePay +
    input.nightWorkPay +
    input.nightOvertimePay +
    input.holidayOvertimePay +
    input.holidayNightOvertimePay;

  // Tính tổng allowances
  const totalAllowances = input.allowances.reduce((sum, a) => sum + a, 0);

  // Tính tổng deductions
  const totalDeductions = input.deductions.reduce((sum, d) => sum + d, 0);

  // Tính gross salary
  const grossSalary = input.baseSalary + totalOvertimePay + totalAllowances;

  // Tính net salary
  const netSalary = grossSalary - totalDeductions;

  return {
    baseSalary: input.baseSalary,
    totalOvertimePay,
    totalAllowances,
    totalDeductions,
    grossSalary,
    netSalary,
  };
}

/**
 * Xác minh payroll breakdown sum invariant
 * grossSalary = baseSalary + totalOvertimePay + totalAllowances
 * netSalary = grossSalary - totalDeductions
 *
 * @param result - PayrollBreakdownResult
 * @returns true nếu invariant được thỏa mãn
 */
export function verifyPayrollBreakdownSum(
  result: PayrollBreakdownResult,
): boolean {
  // Kiểm tra gross salary
  const expectedGross =
    result.baseSalary + result.totalOvertimePay + result.totalAllowances;

  if (result.grossSalary !== expectedGross) {
    return false;
  }

  // Kiểm tra net salary
  const expectedNet = result.grossSalary - result.totalDeductions;

  if (result.netSalary !== expectedNet) {
    return false;
  }

  return true;
}

/**
 * Tính toán payroll breakdown từ PayrollRecord
 * Sử dụng cho việc hiển thị và xác minh
 *
 * @param record - PayrollRecord từ API
 * @returns PayrollBreakdownResult
 */
export function calculatePayrollBreakdownFromRecord(record: {
  baseSalary: number;
  regularOvertimePay: number;
  nightWorkPay: number;
  nightOvertimePay: number;
  holidayOvertimePay: number;
  holidayNightOvertimePay: number;
  allowanceDetails: { amount: number }[];
  deductionDetails: { amount: number }[];
  breakDeductionAmount?: number;
}): PayrollBreakdownResult {
  const input: PayrollBreakdownInput = {
    baseSalary: record.baseSalary,
    regularOvertimePay: record.regularOvertimePay,
    nightWorkPay: record.nightWorkPay,
    nightOvertimePay: record.nightOvertimePay,
    holidayOvertimePay: record.holidayOvertimePay,
    holidayNightOvertimePay: record.holidayNightOvertimePay,
    allowances: record.allowanceDetails.map((a) => a.amount),
    deductions: [
      ...record.deductionDetails.map((d) => d.amount),
      record.breakDeductionAmount || 0,
    ],
  };

  return calculatePayrollBreakdown(input);
}

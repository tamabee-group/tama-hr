import { apiClient } from "@/lib/utils/fetch-client";

/**
 * Dashboard API
 * Lấy thống kê tổng quan cho bảng điều khiển
 * @client-only
 */

export interface DailyAttendance {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface MonthlyPayroll {
  month: string;
  totalGross: number;
  totalNet: number;
  totalEmployees: number;
  status: string | null;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  todayPresent: number;
  todayAbsent: number;
  todayLate: number;
  todayOnLeave: number;
  pendingLeaveRequests: number;
  pendingAdjustmentRequests: number;
  weeklyAttendance: DailyAttendance[];
  monthlyLeaveApproved: number;
  monthlyLeaveRejected: number;
  monthlyLeavePending: number;
  payrollOverview: MonthlyPayroll[];
}

/**
 * Lấy thống kê tổng quan
 * @client-only
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient.get<DashboardStats>("/api/company/dashboard/stats");
}

export interface PendingCounts {
  pendingAdjustments: number;
  pendingLeaves: number;
}

/**
 * Lấy số yêu cầu chờ duyệt (sidebar badge)
 * @client-only
 */
export async function getPendingCounts(): Promise<PendingCounts> {
  return apiClient.get<PendingCounts>("/api/company/dashboard/pending-counts");
}

export interface AdminPendingCounts {
  pendingDeposits: number;
  openFeedbacks: number;
}

/**
 * Lấy số yêu cầu chờ xử lý cho admin sidebar badge
 * @client-only
 */
export async function getAdminPendingCounts(): Promise<AdminPendingCounts> {
  return apiClient.get<AdminPendingCounts>("/api/admin/pending-counts");
}

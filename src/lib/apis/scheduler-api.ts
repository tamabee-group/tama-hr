import { apiClient } from "@/lib/utils/fetch-client";

export const schedulerApi = {
  /**
   * Chạy thủ công payroll payment scheduler
   */
  runPayrollPayment: async (): Promise<string> => {
    return await apiClient.post<string>(
      "/api/admin/schedulers/payroll-payment",
    );
  },

  /**
   * Chạy thủ công billing scheduler
   */
  runBilling: async (): Promise<string> => {
    return await apiClient.post<string>("/api/admin/schedulers/billing");
  },

  /**
   * Chạy thủ công contract expiry scheduler
   */
  runContractExpiry: async (): Promise<string> => {
    return await apiClient.post<string>(
      "/api/admin/schedulers/contract-expiry",
    );
  },

  /**
   * Chạy thủ công company cleanup scheduler
   */
  runCompanyCleanup: async (): Promise<string> => {
    return await apiClient.post<string>(
      "/api/admin/schedulers/company-cleanup",
    );
  },

  /**
   * Chạy thủ công tenant cleanup scheduler
   */
  runTenantCleanup: async (): Promise<string> => {
    return await apiClient.post<string>("/api/admin/schedulers/tenant-cleanup");
  },

  /**
   * Lấy danh sách tất cả tenants
   */
  getAllTenants: async (): Promise<TenantInfo[]> => {
    return await apiClient.get<TenantInfo[]>("/api/admin/schedulers/tenants");
  },

  /**
   * Rollback payroll periods về DRAFT (dùng cho testing)
   */
  rollbackPayroll: async (params: {
    companyId?: number;
    year?: number;
    month?: number;
  }): Promise<RollbackResult> => {
    const queryParams = new URLSearchParams();
    if (params.companyId)
      queryParams.append("companyId", params.companyId.toString());
    if (params.year) queryParams.append("year", params.year.toString());
    if (params.month) queryParams.append("month", params.month.toString());

    const url = `/api/admin/schedulers/rollback-payroll${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return await apiClient.post<RollbackResult>(url);
  },
};

export interface TenantInfo {
  id: number;
  name: string;
  tenantDomain: string;
}

export interface RollbackResult {
  count: number;
  companyId: number | null;
  year: number | null;
  month: number | null;
}

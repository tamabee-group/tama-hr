import { apiClient } from "@/lib/utils/fetch-client";
import { EmployeeDocument, DocumentType } from "@/types/employee-detail";
import { PaginatedResponse } from "@/types/api";

/**
 * My Document API functions
 * API cho nhân viên quản lý tài liệu cá nhân
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Constants
// ============================================

const BASE_URL = "/api/users/me/documents";

// ============================================
// API Functions
// ============================================

/**
 * Lấy danh sách tài liệu của nhân viên đang đăng nhập
 * @client-only
 */
export async function getMyDocuments(
  page: number = 0,
  size: number = 20,
): Promise<PaginatedResponse<EmployeeDocument>> {
  return apiClient.get<PaginatedResponse<EmployeeDocument>>(
    `${BASE_URL}?page=${page}&size=${size}`,
  );
}

/**
 * Upload tài liệu mới
 * @client-only
 */
export async function uploadDocument(
  file: File,
  documentType: DocumentType,
): Promise<EmployeeDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);

  return apiClient.post<EmployeeDocument>(BASE_URL, formData, {
    headers: {
      // Không set Content-Type, để browser tự set với boundary
    },
  });
}

/**
 * Xóa tài liệu
 * @client-only
 */
export async function deleteDocument(documentId: number): Promise<void> {
  return apiClient.delete(`${BASE_URL}/${documentId}`);
}

// ============================================
// Export API object
// ============================================

export const myDocumentApi = {
  getMyDocuments,
  uploadDocument,
  deleteDocument,
};

import { DepositStatus } from "./enums";

// Response types cho Deposit API

/**
 * Thông tin yêu cầu nạp tiền
 */
export interface DepositRequestResponse {
  id: number;
  companyId: number;
  companyName: string;
  amount: number;
  transferProofUrl: string;
  status: DepositStatus;
  requestedBy: string;
  requesterName?: string;
  requesterRole?: string;
  requesterEmail?: string;
  requesterLanguage?: string;
  approvedBy?: string;
  approverName?: string;
  approverRole?: string;
  approverEmail?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

// Request types cho Deposit API

/**
 * Request tạo yêu cầu nạp tiền
 */
export interface DepositRequestCreateRequest {
  amount: number;
  transferProofUrl: string;
}

/**
 * Filter cho danh sách deposit requests
 */
export interface DepositFilterRequest {
  status?: DepositStatus;
  companyId?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Request từ chối yêu cầu nạp tiền
 */
export interface RejectRequest {
  rejectionReason: string;
}

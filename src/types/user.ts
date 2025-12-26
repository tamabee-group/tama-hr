// Các role của user trong hệ thống
export type UserRole =
  | "ADMIN_TAMABEE" // Admin của Tamabee
  | "MANAGER_TAMABEE" // Manager của Tamabee
  | "EMPLOYEE_TAMABEE" // Nhân viên của Tamabee
  | "ADMIN_COMPANY" // Admin của công ty khách hàng
  | "MANAGER_COMPANY" // Manager của công ty khách hàng
  | "USER_COMPANY"; // Nhân viên của công ty khách hàng

// Trạng thái của user
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserProfile {
  name: string;
  phone: string;
  address: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
  referralCode: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContactAddress: string;
}

export interface User {
  id: number;
  employeeCode: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  locale: string;
  language: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;
}

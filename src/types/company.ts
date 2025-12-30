// Type cho Company response từ API
export interface Company {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  zipcode?: string;
  locale: string;
  language: string;
  referredByEmployeeCode?: string;
  referredByEmployeeName?: string;
  logo?: string;
  ownerId?: number;
  createdAt: string;
  updatedAt: string;
}

// Labels cho ngành nghề
export const INDUSTRY_LABELS: Record<string, string> = {
  technology: "Công nghệ thông tin",
  manufacturing: "Sản xuất",
  retail: "Bán lẻ",
  finance: "Tài chính - Ngân hàng",
  healthcare: "Y tế - Chăm sóc sức khỏe",
  education: "Giáo dục - Đào tạo",
  construction: "Xây dựng",
  hospitality: "Khách sạn - Nhà hàng",
  logistics: "Vận tải - Logistics",
  other: "Khác",
};

// Danh sách ngành nghề cho Select
export const INDUSTRIES = [
  { value: "technology", label: "Công nghệ thông tin" },
  { value: "manufacturing", label: "Sản xuất" },
  { value: "retail", label: "Bán lẻ" },
  { value: "finance", label: "Tài chính - Ngân hàng" },
  { value: "healthcare", label: "Y tế - Chăm sóc sức khỏe" },
  { value: "education", label: "Giáo dục - Đào tạo" },
  { value: "construction", label: "Xây dựng" },
  { value: "hospitality", label: "Khách sạn - Nhà hàng" },
  { value: "logistics", label: "Vận tải - Logistics" },
  { value: "other", label: "Khác" },
] as const;

// Re-export normalizeLocale từ enums để backward compatible
export { normalizeLocale } from "./enums";

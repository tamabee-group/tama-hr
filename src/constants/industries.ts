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

export const getIndustryLabel = (value: string): string => {
  return INDUSTRIES.find((item) => item.value === value)?.label || value;
};

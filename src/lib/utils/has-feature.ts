import { PlanFeature } from "@/types/plan";

/**
 * Kiểm tra xem feature có được bật hay không
 * @param features - Danh sách features từ plan
 * @param code - Mã feature cần kiểm tra
 * @returns true nếu feature tồn tại và enabled = true
 */
export function hasFeature(features: PlanFeature[], code: string): boolean {
  return features.some((f) => f.code === code && f.enabled);
}

import type { SidebarGroup, SidebarItem } from "@/types/sidebar";
import type { WorkMode } from "@/types/attendance-config";

/**
 * Cấu hình các items cần ẩn theo work mode
 */
interface WorkModeFilterConfig {
  hiddenUrls: string[];
  partialItems: {
    url: string;
    hiddenTabs: string[];
  }[];
}

/**
 * Cấu hình filter cho từng work mode
 * Schedules đã được gộp vào Shifts page nên không cần ẩn ở sidebar
 */
const WORK_MODE_FILTER_CONFIG: Record<WorkMode, WorkModeFilterConfig> = {
  FIXED_HOURS: {
    // Không cần ẩn gì ở sidebar vì Schedules đã nằm trong Shifts page
    hiddenUrls: [],
    partialItems: [
      {
        // Shifts page: ẩn tab Schedules và Templates khi FIXED_HOURS
        url: "/company/shifts",
        hiddenTabs: ["schedules", "templates"],
      },
    ],
  },
  FLEXIBLE_SHIFT: {
    // Hiển thị tất cả khi FLEXIBLE_SHIFT
    hiddenUrls: [],
    partialItems: [],
  },
};

/**
 * Filter một sidebar item dựa trên work mode
 * @param item - Sidebar item cần kiểm tra
 * @param config - Cấu hình filter
 * @returns true nếu item nên được hiển thị, false nếu nên ẩn
 */
function shouldShowItem(
  item: SidebarItem,
  config: WorkModeFilterConfig,
): boolean {
  return !config.hiddenUrls.includes(item.url);
}

/**
 * Filter danh sách sidebar items dựa trên work mode
 * @param items - Danh sách sidebar items
 * @param workMode - Chế độ làm việc hiện tại
 * @returns Danh sách items đã được filter
 */
export function filterSidebarItemsByWorkMode(
  items: SidebarItem[],
  workMode: WorkMode,
): SidebarItem[] {
  const config = WORK_MODE_FILTER_CONFIG[workMode];
  return items.filter((item) => shouldShowItem(item, config));
}

/**
 * Filter danh sách sidebar groups dựa trên work mode
 * @param groups - Danh sách sidebar groups
 * @param workMode - Chế độ làm việc hiện tại
 * @returns Danh sách groups đã được filter (loại bỏ groups rỗng)
 */
export function filterSidebarByWorkMode(
  groups: SidebarGroup[],
  workMode: WorkMode,
): SidebarGroup[] {
  const config = WORK_MODE_FILTER_CONFIG[workMode];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => shouldShowItem(item, config)),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * Lấy danh sách tabs cần ẩn cho một URL cụ thể
 * @param url - URL của page
 * @param workMode - Chế độ làm việc hiện tại
 * @returns Danh sách tab keys cần ẩn
 */
export function getHiddenTabsForUrl(url: string, workMode: WorkMode): string[] {
  const config = WORK_MODE_FILTER_CONFIG[workMode];
  const partialItem = config.partialItems.find((item) => item.url === url);
  return partialItem?.hiddenTabs ?? [];
}

/**
 * Kiểm tra xem một URL có bị ẩn hoàn toàn không
 * @param url - URL cần kiểm tra
 * @param workMode - Chế độ làm việc hiện tại
 * @returns true nếu URL bị ẩn
 */
export function isUrlHiddenByWorkMode(
  url: string,
  workMode: WorkMode,
): boolean {
  const config = WORK_MODE_FILTER_CONFIG[workMode];
  return config.hiddenUrls.includes(url);
}

/**
 * Export config để sử dụng trong tests
 */
export { WORK_MODE_FILTER_CONFIG };
export type { WorkModeFilterConfig };

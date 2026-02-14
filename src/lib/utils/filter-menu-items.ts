import type { MenuItem } from "@/constants/menu-items";
import type { UserRole } from "@/types/enums";

/**
 * Filter menu items dựa trên user role
 * Hỗ trợ nested children với recursive filtering
 *
 * @param items - Danh sách menu items cần filter
 * @param userRole - Role của user hiện tại
 * @returns Danh sách menu items đã được filter
 */
export function filterMenuItems(
  items: MenuItem[],
  userRole: UserRole | undefined,
): MenuItem[] {
  return (
    items
      .filter((item) => {
        // Check role - nếu có roles array thì user phải có role trong đó
        if (item.roles && userRole && !item.roles.includes(userRole)) {
          return false;
        }

        // Nếu có roles nhưng không có userRole thì không hiển thị
        if (item.roles && !userRole) {
          return false;
        }

        return true;
      })
      .map((item) => {
        // Nếu không có children thì return item nguyên bản
        if (!item.children || item.children.length === 0) {
          return item;
        }

        // Recursively filter children
        const filteredChildren = filterMenuItems(item.children, userRole);

        return {
          ...item,
          children: filteredChildren,
        };
      })
      // Remove items có children rỗng sau khi filter
      .filter((item) => {
        if (item.children && item.children.length === 0) {
          return false;
        }
        return true;
      })
  );
}

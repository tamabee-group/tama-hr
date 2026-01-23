import { apiServer } from "@/lib/utils/fetch-server";
import { formatTime } from "@/lib/utils/format-date";
import { AttendanceConfig } from "@/types/attendance-config";
import { ShiftsTabs } from "./_shifts-tabs";

/**
 * Trang quản lý ca làm việc
 * Server Component - fetch settings và truyền xuống
 */
export default async function ShiftsPage() {
  // Fetch attendance config để lấy giá trị mặc định
  let defaultStartTime = "--:--";
  let defaultEndTime = "--:--";
  let defaultBreakMinutes = 0;

  try {
    const config = await apiServer.get<AttendanceConfig>(
      "/api/company/settings/attendance",
    );
    defaultStartTime = formatTime(config.defaultWorkStartTime, "--:--");
    defaultEndTime = formatTime(config.defaultWorkEndTime, "--:--");
    defaultBreakMinutes = config.defaultBreakMinutes;
  } catch (error) {
    // Nếu lỗi, sử dụng giá trị mặc định --:--
    console.error("Failed to fetch attendance config:", error);
  }

  return (
    <ShiftsTabs
      defaultStartTime={defaultStartTime}
      defaultEndTime={defaultEndTime}
      defaultBreakMinutes={defaultBreakMinutes}
    />
  );
}

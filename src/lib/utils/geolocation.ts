// Tiện ích lấy vị trí GPS từ trình duyệt

export interface GeoPosition {
  latitude: number;
  longitude: number;
}

/**
 * Lấy vị trí GPS hiện tại từ trình duyệt
 * @param timeoutMs - Thời gian chờ tối đa (mặc định 10 giây)
 * @returns GeoPosition hoặc null nếu không lấy được
 */
export function getCurrentPosition(
  timeoutMs: number = 10000,
): Promise<GeoPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Lỗi hoặc user từ chối → trả null
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 30000,
      },
    );
  });
}

/**
 * Tính khoảng cách giữa 2 tọa độ GPS bằng công thức Haversine (đơn vị: mét)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Bán kính trái đất (mét)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Kiểm tra vị trí có nằm trong phạm vi cho phép không
 */
export function isWithinAnyLocation(
  position: GeoPosition,
  locations: { latitude: number; longitude: number; radiusMeters: number }[],
): boolean {
  if (locations.length === 0) return true;
  return locations.some((loc) => {
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      loc.latitude,
      loc.longitude,
    );
    return distance <= loc.radiusMeters;
  });
}

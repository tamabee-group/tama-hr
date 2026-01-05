import { useState, useEffect } from "react";

interface ZipcodeResult {
  address1: string;
  address2: string;
  address3: string;
  kana1: string;
  kana2: string;
  kana3: string;
  prefcode: string;
  zipcode: string;
}

interface ZipcodeResponse {
  message: string | null;
  results: ZipcodeResult[] | null;
  status: number;
}

// Định nghĩa độ dài zipcode theo region
export type ZipcodeRegion = "JP" | "VN";

const ZIPCODE_LENGTH: Record<ZipcodeRegion, number> = {
  JP: 7, // Nhật Bản: 7 số (ví dụ: 1000001)
  VN: 5, // Việt Nam: 5 số (ví dụ: 63000)
};

// Mapping locale sang region
const LOCALE_TO_REGION: Record<string, ZipcodeRegion> = {
  ja: "JP",
  vi: "VN",
};

/**
 * Chuyển đổi locale code sang region code
 * @param locale - Locale code (ja, vi)
 * @returns Region code (JP, VN), mặc định JP
 */
export function localeToRegion(locale: string): ZipcodeRegion {
  return LOCALE_TO_REGION[locale] || "JP";
}

/**
 * Validate zipcode theo region
 * @param zipcode - Mã bưu điện
 * @param region - Region code (JP, VN)
 * @returns true nếu hợp lệ
 */
export function isValidZipcode(
  zipcode: string,
  region: ZipcodeRegion,
): boolean {
  if (!zipcode) return false;
  const expectedLength = ZIPCODE_LENGTH[region];
  return /^\d+$/.test(zipcode) && zipcode.length === expectedLength;
}

/**
 * Lấy độ dài zipcode theo region
 * @param region - Region code (JP, VN)
 * @returns Độ dài zipcode
 */
export function getZipcodeLength(region: ZipcodeRegion): number {
  return ZIPCODE_LENGTH[region];
}

/**
 * Hook để tự động lookup địa chỉ từ zipcode
 * Chỉ hỗ trợ lookup cho Nhật Bản (JP)
 * @param zipcode - Mã bưu điện
 * @param region - Region code (JP, VN), mặc định là JP
 */
export function useZipcode(zipcode: string, region: ZipcodeRegion = "JP") {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const expectedLength = ZIPCODE_LENGTH[region];

    // Validate zipcode format
    if (
      !zipcode ||
      zipcode.length !== expectedLength ||
      !/^\d+$/.test(zipcode)
    ) {
      setAddress("");
      setIsValid(false);
      setError("");
      return;
    }

    setIsValid(true);

    // Chỉ lookup địa chỉ cho Nhật Bản
    if (region !== "JP") {
      setAddress("");
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`,
        );
        const data: ZipcodeResponse = await response.json();

        if (data.status === 200 && data.results && data.results.length > 0) {
          const result = data.results[0];
          const fullAddress = `${result.address1}${result.address2}${result.address3}`;
          setAddress(fullAddress);
        } else {
          setAddress("");
          setError("Không tìm thấy địa chỉ");
        }
      } catch {
        setError("Lỗi khi tìm địa chỉ");
        setAddress("");
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [zipcode, region]);

  return { address, loading, error, isValid };
}

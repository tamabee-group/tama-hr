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

export function useZipcode(zipcode: string) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!zipcode || zipcode.length !== 7) {
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
  }, [zipcode]);

  return { address, loading, error };
}

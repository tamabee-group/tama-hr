import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  validateFileSize,
  validateFileType,
} from "@/app/[locale]/_components/_image-upload";

/**
 * Property-Based Tests cho Image Upload Component
 * Feature: wallet-management-ui
 */

describe("ImageUpload - Property Tests", () => {
  /**
   * Property 3: Validation Form - Kích thước File
   *
   * Với bất kỳ file upload nào trong Image_Upload, nếu file.size > maxSize (5MB)
   * thì component PHẢI hiển thị error và KHÔNG ĐƯỢC upload.
   */
  describe("Property 3: Validation Kích thước File", () => {
    const DEFAULT_MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = DEFAULT_MAX_SIZE_MB * 1024 * 1024;

    it("phải từ chối files lớn hơn maxSize", () => {
      fc.assert(
        fc.property(
          // Tạo kích thước file lớn hơn max (5MB đến 100MB)
          fc.integer({ min: MAX_SIZE_BYTES + 1, max: 100 * 1024 * 1024 }),
          (fileSize) => {
            const result = validateFileSize(fileSize, DEFAULT_MAX_SIZE_MB);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain(`${DEFAULT_MAX_SIZE_MB}MB`);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải chấp nhận files nhỏ hơn hoặc bằng maxSize", () => {
      fc.assert(
        fc.property(
          // Tạo kích thước file từ 0 đến max size
          fc.integer({ min: 0, max: MAX_SIZE_BYTES }),
          (fileSize) => {
            const result = validateFileSize(fileSize, DEFAULT_MAX_SIZE_MB);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải hoạt động với giá trị maxSize tùy chỉnh", () => {
      fc.assert(
        fc.property(
          // Tạo max sizes tùy chỉnh (1MB đến 50MB)
          fc.integer({ min: 1, max: 50 }),
          // Tạo kích thước file (0 đến 100MB)
          fc.integer({ min: 0, max: 100 * 1024 * 1024 }),
          (maxSizeMB, fileSize) => {
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            const result = validateFileSize(fileSize, maxSizeMB);

            if (fileSize > maxSizeBytes) {
              expect(result.valid).toBe(false);
              expect(result.error).toContain(`${maxSizeMB}MB`);
            } else {
              expect(result.valid).toBe(true);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Tests Validation Loại File
   */
  describe("Validation Loại File", () => {
    const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    it("phải chấp nhận các loại ảnh hợp lệ", () => {
      fc.assert(
        fc.property(fc.constantFrom(...ACCEPTED_TYPES), (fileType) => {
          const result = validateFileType(fileType, ACCEPTED_TYPES);
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }),
        { numRuns: 100 },
      );
    });

    it("phải từ chối các loại file không hợp lệ", () => {
      const invalidTypes = [
        "application/pdf",
        "text/plain",
        "image/gif",
        "image/bmp",
        "video/mp4",
        "application/json",
      ];

      fc.assert(
        fc.property(fc.constantFrom(...invalidTypes), (fileType) => {
          const result = validateFileType(fileType, ACCEPTED_TYPES);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }),
        { numRuns: 100 },
      );
    });
  });
});

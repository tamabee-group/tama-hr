/**
 * Image Upload Rules (FE-IMG-001)
 * Check image uploads use compression
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-IMG-001: Compress images before upload
 * Verify compressImageToWebP() is called before upload
 */
export class ImageCompressionRule extends BaseRule {
  id = "FE-IMG-001";
  name = "Compress images before upload";
  category = "image-upload" as const;
  severity = "warning" as const;
  description = "Must compress images to WebP before upload";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Patterns to detect image upload
    const uploadPatterns = [
      /upload.*image/i,
      /image.*upload/i,
      /uploadFile/i,
      /handleUpload/i,
      /onUpload/i,
      /submitImage/i,
      /formData\.append\s*\(\s*['"`](image|file|avatar|photo|picture)/i,
      /type:\s*['"`]image/i,
      /accept:\s*['"`]image/i,
    ];

    // Check if file has image upload
    let hasImageUpload = false;
    let uploadLine = -1;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      for (const pattern of uploadPatterns) {
        if (pattern.test(line)) {
          hasImageUpload = true;
          uploadLine = i + 1;
          break;
        }
      }
      if (hasImageUpload) break;
    }

    if (!hasImageUpload) {
      return violations;
    }

    // Check if compressImageToWebP is imported
    const hasCompressionImport = file.imports.some(
      (imp) =>
        imp.source.includes("compress-image") ||
        imp.namedImports.includes("compressImageToWebP"),
    );

    // Check if compressImageToWebP is used
    const usesCompression =
      file.content.includes("compressImageToWebP") ||
      file.content.includes("compressImage") ||
      file.content.includes("toWebP");

    if (!hasCompressionImport || !usesCompression) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: uploadLine,
          column: 1,
          message: "Image upload does not use compression",
          suggestion:
            "Use compressImageToWebP() from @/lib/utils/compress-image-to-webp before upload",
          codeSnippet: file.lines[uploadLine - 1]?.trim() || "",
        }),
      );
    }

    return violations;
  }
}

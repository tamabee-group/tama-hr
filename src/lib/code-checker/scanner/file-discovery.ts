/**
 * File Discovery
 * Quét thư mục và tìm files cần kiểm tra
 */

import * as fs from "fs";
import * as path from "path";
import type { FileInfo, FileType, ScanOptions } from "../types";

/**
 * Kiểm tra file có match với glob pattern không (simplified)
 */
function matchGlob(filePath: string, pattern: string): boolean {
  // Chuyển glob pattern thành regex
  const regexPattern = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/{{GLOBSTAR}}/g, ".*");

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath.replace(/\\/g, "/"));
}

/**
 * Xác định loại file từ extension
 */
function getFileType(filePath: string): FileType | null {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts":
      return "typescript";
    case ".tsx":
      return "tsx";
    case ".jsx":
      return "jsx";
    case ".java":
      return "java";
    default:
      return null;
  }
}

/**
 * Xác định các thuộc tính của file dựa trên path và tên
 */
function getFileProperties(
  relativePath: string,
  fileType: FileType,
): Partial<FileInfo> {
  const fileName = path.basename(relativePath);
  const normalizedPath = relativePath.replace(/\\/g, "/");

  // Frontend properties
  const isPage = fileName === "page.tsx" || fileName === "page.ts";
  const isComponent =
    (fileType === "tsx" || fileType === "jsx") &&
    !isPage &&
    !fileName.includes(".test.") &&
    !fileName.includes(".spec.");

  // Backend properties (Java)
  const isService =
    fileType === "java" &&
    (fileName.endsWith("Service.java") ||
      fileName.endsWith("ServiceImpl.java") ||
      normalizedPath.includes("/service/"));
  const isController =
    fileType === "java" &&
    (fileName.endsWith("Controller.java") ||
      normalizedPath.includes("/controller/"));
  const isMapper =
    fileType === "java" &&
    (fileName.endsWith("Mapper.java") || normalizedPath.includes("/mapper/"));
  const isEntity =
    fileType === "java" &&
    (fileName.endsWith("Entity.java") || normalizedPath.includes("/entity/"));
  const isRepository =
    fileType === "java" &&
    (fileName.endsWith("Repository.java") ||
      normalizedPath.includes("/repository/"));

  return {
    isPage,
    isComponent,
    isService,
    isController,
    isMapper,
    isEntity,
    isRepository,
  };
}

/**
 * Đệ quy quét thư mục
 */
function scanDirectoryRecursive(
  dirPath: string,
  rootPath: string,
  options: ScanOptions,
  results: FileInfo[],
): void {
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    // Bỏ qua thư mục không đọc được
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(rootPath, fullPath);

    // Bỏ qua node_modules, .git, .next, target
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === ".next" ||
      entry.name === "target" ||
      entry.name === ".kiro"
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectoryRecursive(fullPath, rootPath, options, results);
    } else if (entry.isFile()) {
      const fileType = getFileType(entry.name);
      if (!fileType) continue;

      // Kiểm tra project type
      if (options.projectType === "frontend" && fileType === "java") continue;
      if (options.projectType === "backend" && fileType !== "java") continue;

      // Kiểm tra exclude patterns
      const normalizedRelPath = relativePath.replace(/\\/g, "/");
      const shouldExclude = options.exclude.some((pattern) =>
        matchGlob(normalizedRelPath, pattern),
      );
      if (shouldExclude) continue;

      // Kiểm tra include patterns (nếu có)
      if (options.include.length > 0) {
        const shouldInclude = options.include.some((pattern) =>
          matchGlob(normalizedRelPath, pattern),
        );
        if (!shouldInclude) continue;
      }

      const properties = getFileProperties(relativePath, fileType);

      results.push({
        path: fullPath,
        relativePath,
        type: fileType,
        isPage: properties.isPage ?? false,
        isComponent: properties.isComponent ?? false,
        isService: properties.isService ?? false,
        isController: properties.isController ?? false,
        isMapper: properties.isMapper ?? false,
        isEntity: properties.isEntity ?? false,
        isRepository: properties.isRepository ?? false,
      });
    }
  }
}

/**
 * Quét thư mục và trả về danh sách files
 */
export async function discoverFiles(
  rootPath: string,
  options: ScanOptions,
): Promise<FileInfo[]> {
  const results: FileInfo[] = [];
  scanDirectoryRecursive(rootPath, rootPath, options, results);
  return results;
}

/**
 * Default scan options cho frontend
 */
export const defaultFrontendOptions: ScanOptions = {
  include: ["**/*.ts", "**/*.tsx"],
  exclude: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/node_modules/**",
    "**/.next/**",
  ],
  projectType: "frontend",
};

/**
 * Default scan options cho backend
 */
export const defaultBackendOptions: ScanOptions = {
  include: ["**/*.java"],
  exclude: ["**/test/**", "**/target/**"],
  projectType: "backend",
};

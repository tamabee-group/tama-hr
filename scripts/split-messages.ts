/**
 * Migration Script: Tách file translation từ single-file sang namespace-based structure
 *
 * Script này thực hiện:
 * 1. Backup file gốc trước khi migrate
 * 2. Đọc file messages/{locale}.json
 * 3. Tách theo top-level keys (namespaces)
 * 4. Tạo thư mục messages/{locale}/
 * 5. Ghi từng namespace file
 * 6. Identify verbose messages và tạo report
 * 7. Verify key count trước và sau migration
 */

import * as fs from "fs";
import * as path from "path";

// Cấu hình
const LOCALES = ["vi", "en", "ja"];
const MESSAGES_DIR = path.join(process.cwd(), "messages");
const BACKUP_DIR = path.join(MESSAGES_DIR, "backup");
const VERBOSE_REPORT_PATH = path.join(MESSAGES_DIR, "verbose-report.json");

// Patterns để detect verbose messages
const VERBOSE_PATTERNS = [
  {
    pattern: /^(Cấu hình|Quản lý|Thông tin|Chi tiết)\s+/i,
    reason: "Có thể rút gọn prefix khi đã có context từ section title",
  },
  {
    pattern: /\s+(thành công|thất bại|không thể)$/i,
    reason: "Message kết quả có thể rút gọn",
  },
  {
    pattern: /.{50,}/,
    reason: "Message quá dài (>50 ký tự), cân nhắc rút gọn",
  },
];

interface VerboseMessage {
  namespace: string;
  key: string;
  value: string;
  reason: string;
}

interface MigrationResult {
  locale: string;
  namespacesCreated: string[];
  keysTotal: number;
  keysMigrated: number;
  verboseMessages: VerboseMessage[];
  success: boolean;
  error?: string;
}

interface VerboseReport {
  generatedAt: string;
  totalVerboseMessages: number;
  byLocale: {
    [locale: string]: {
      count: number;
      messages: VerboseMessage[];
    };
  };
}

/**
 * Đếm tổng số keys trong một object (đệ quy)
 */
function countKeys(obj: Record<string, unknown>, prefix = ""): number {
  let count = 0;
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      count += countKeys(value as Record<string, unknown>, `${prefix}${key}.`);
    } else {
      count += 1;
    }
  }
  return count;
}

/**
 * Flatten object thành danh sách key paths
 */
function flattenKeys(
  obj: Record<string, unknown>,
  prefix = "",
): { key: string; value: string }[] {
  const result: { key: string; value: string }[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      result.push({ key: fullKey, value: String(value) });
    }
  }
  return result;
}

/**
 * Backup file gốc trước khi migrate
 */
function backupOriginalFile(locale: string): void {
  const originalPath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(originalPath)) {
    console.log(`⚠️  File ${locale}.json không tồn tại, bỏ qua backup`);
    return;
  }

  // Tạo thư mục backup nếu chưa có
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `${locale}_${timestamp}.json`);

  fs.copyFileSync(originalPath, backupPath);
  console.log(`✅ Backup ${locale}.json → ${path.basename(backupPath)}`);
}

/**
 * Đọc file translation gốc
 */
function readOriginalFile(locale: string): Record<string, unknown> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File không tồn tại: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Tách content theo namespace (top-level keys)
 */
function splitByNamespace(
  original: Record<string, unknown>,
): Record<string, unknown> {
  // Mỗi top-level key là một namespace
  return original;
}

/**
 * Identify verbose messages có thể rút gọn
 */
function identifyVerboseMessages(
  namespaces: Record<string, unknown>,
  locale: string,
): VerboseMessage[] {
  const verboseMessages: VerboseMessage[] = [];

  for (const [namespace, content] of Object.entries(namespaces)) {
    if (typeof content !== "object" || content === null) continue;

    const flatKeys = flattenKeys(content as Record<string, unknown>);
    for (const { key, value } of flatKeys) {
      // Chỉ check string values
      if (typeof value !== "string") continue;

      for (const { pattern, reason } of VERBOSE_PATTERNS) {
        if (pattern.test(value)) {
          verboseMessages.push({
            namespace,
            key: `${namespace}.${key}`,
            value,
            reason,
          });
          break; // Chỉ report 1 reason per message
        }
      }
    }
  }

  return verboseMessages;
}

/**
 * Tạo namespace files trong thư mục locale
 */
function createNamespaceFiles(
  locale: string,
  namespaces: Record<string, unknown>,
): string[] {
  const localeDir = path.join(MESSAGES_DIR, locale);

  // Tạo thư mục locale nếu chưa có
  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir, { recursive: true });
  }

  const createdNamespaces: string[] = [];

  for (const [namespace, content] of Object.entries(namespaces)) {
    const filePath = path.join(localeDir, `${namespace}.json`);
    const jsonContent = JSON.stringify(content, null, 2);
    fs.writeFileSync(filePath, jsonContent, "utf-8");
    createdNamespaces.push(namespace);
  }

  return createdNamespaces;
}

/**
 * Verify migration bằng cách so sánh key count
 */
function verifyMigration(
  locale: string,
  originalKeyCount: number,
): { keysMigrated: number; success: boolean; error?: string } {
  const localeDir = path.join(MESSAGES_DIR, locale);

  if (!fs.existsSync(localeDir)) {
    return {
      keysMigrated: 0,
      success: false,
      error: `Thư mục ${locale}/ không tồn tại`,
    };
  }

  let totalKeys = 0;
  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(localeDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    totalKeys += countKeys(content);
  }

  const success = totalKeys === originalKeyCount;
  return {
    keysMigrated: totalKeys,
    success,
    error: success
      ? undefined
      : `Key count mismatch: original=${originalKeyCount}, migrated=${totalKeys}`,
  };
}

/**
 * Tạo verbose report file
 */
function generateVerboseReport(results: MigrationResult[]): VerboseReport {
  const report: VerboseReport = {
    generatedAt: new Date().toISOString(),
    totalVerboseMessages: 0,
    byLocale: {},
  };

  for (const result of results) {
    report.byLocale[result.locale] = {
      count: result.verboseMessages.length,
      messages: result.verboseMessages,
    };
    report.totalVerboseMessages += result.verboseMessages.length;
  }

  return report;
}

/**
 * Main migration function
 */
async function migrateMessages(): Promise<MigrationResult[]> {
  console.log("🚀 Bắt đầu migration i18n namespace split...\n");

  const results: MigrationResult[] = [];

  for (const locale of LOCALES) {
    console.log(`\n📁 Processing locale: ${locale}`);
    console.log("─".repeat(40));

    try {
      // 1. Backup original file
      backupOriginalFile(locale);

      // 2. Read original file
      const original = readOriginalFile(locale);
      const originalKeyCount = countKeys(original);
      console.log(`📊 Original key count: ${originalKeyCount}`);

      // 3. Split by namespace
      const namespaces = splitByNamespace(original);
      console.log(`📦 Namespaces found: ${Object.keys(namespaces).length}`);

      // 4. Identify verbose messages
      const verboseMessages = identifyVerboseMessages(namespaces, locale);
      console.log(`⚠️  Verbose messages: ${verboseMessages.length}`);

      // 5. Create namespace files
      const createdNamespaces = createNamespaceFiles(locale, namespaces);
      console.log(`✅ Created ${createdNamespaces.length} namespace files`);

      // 6. Verify migration
      const verification = verifyMigration(locale, originalKeyCount);

      if (verification.success) {
        console.log(
          `✅ Verification passed: ${verification.keysMigrated} keys migrated`,
        );
      } else {
        console.log(`❌ Verification failed: ${verification.error}`);
      }

      results.push({
        locale,
        namespacesCreated: createdNamespaces,
        keysTotal: originalKeyCount,
        keysMigrated: verification.keysMigrated,
        verboseMessages,
        success: verification.success,
        error: verification.error,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(`❌ Error: ${errorMessage}`);
      results.push({
        locale,
        namespacesCreated: [],
        keysTotal: 0,
        keysMigrated: 0,
        verboseMessages: [],
        success: false,
        error: errorMessage,
      });
    }
  }

  // Generate verbose report
  const verboseReport = generateVerboseReport(results);
  fs.writeFileSync(
    VERBOSE_REPORT_PATH,
    JSON.stringify(verboseReport, null, 2),
    "utf-8",
  );
  console.log(`\n📝 Verbose report saved to: ${VERBOSE_REPORT_PATH}`);

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("📊 MIGRATION SUMMARY");
  console.log("═".repeat(50));

  let allSuccess = true;
  for (const result of results) {
    const status = result.success ? "✅" : "❌";
    console.log(
      `${status} ${result.locale}: ${result.keysMigrated}/${result.keysTotal} keys, ${result.namespacesCreated.length} namespaces`,
    );
    if (!result.success) {
      allSuccess = false;
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(`Total verbose messages: ${verboseReport.totalVerboseMessages}`);
  console.log("─".repeat(50));

  if (allSuccess) {
    console.log("\n🎉 Migration completed successfully!");
    console.log("📌 Next steps:");
    console.log("   1. Review verbose-report.json for messages to optimize");
    console.log("   2. Update src/i18n/request.ts to use new structure");
    console.log("   3. Test application to verify translations work");
    console.log("   4. Delete original files after verification");
  } else {
    console.log("\n⚠️  Migration completed with errors. Please review.");
  }

  return results;
}

// Run migration
migrateMessages().catch(console.error);

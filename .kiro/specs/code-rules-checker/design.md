# Design Document: Code Rules Checker

## Overview

Code Rules Checker là một công cụ phân tích tĩnh (static analysis) để kiểm tra code trong dự án tuân thủ các coding rules đã định nghĩa. Công cụ hỗ trợ cả Frontend (Next.js/TypeScript) và Backend (Java/Spring Boot), phát hiện vi phạm và đề xuất cách sửa.

### Mục tiêu chính:

- Phát hiện vi phạm coding rules tự động
- Cung cấp báo cáo chi tiết với line numbers và suggestions
- Hỗ trợ auto-fix cho các vi phạm đơn giản
- Tích hợp vào workflow phát triển

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Code Rules Checker                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Scanner   │  │   Analyzer  │  │      Reporter           │ │
│  │             │  │             │  │                         │ │
│  │ - File      │  │ - Rule      │  │ - Console Output        │ │
│  │   Discovery │  │   Engine    │  │ - Markdown Report       │ │
│  │ - AST       │  │ - Violation │  │ - Summary Stats         │ │
│  │   Parser    │  │   Collector │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│         │                │                    │                 │
│         ▼                ▼                    ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Rule Registry                            ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│  │  │ Frontend     │  │ Backend      │  │ Common       │      ││
│  │  │ Rules        │  │ Rules        │  │ Rules        │      ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘      ││
│  └─────────────────────────────────────────────────────────────┘│
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Auto-Fixer                               ││
│  │  - Diff Preview  - Format Preservation  - Error Handling   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Scanner Component

Chịu trách nhiệm quét và phân tích cấu trúc file.

```typescript
interface Scanner {
  // Quét thư mục và trả về danh sách files cần kiểm tra
  scanDirectory(path: string, options: ScanOptions): Promise<FileInfo[]>;

  // Parse file thành AST
  parseFile(file: FileInfo): Promise<ParsedFile>;
}

interface ScanOptions {
  include: string[]; // Glob patterns để include
  exclude: string[]; // Glob patterns để exclude
  projectType: "frontend" | "backend" | "both";
}

interface FileInfo {
  path: string;
  relativePath: string;
  type: "typescript" | "java" | "tsx" | "jsx";
  isPage: boolean;
  isComponent: boolean;
  isService: boolean;
  isController: boolean;
  isMapper: boolean;
  isEntity: boolean;
  isRepository: boolean;
}

interface ParsedFile {
  file: FileInfo;
  ast: AST;
  lines: string[];
  lineCount: number;
  imports: ImportInfo[];
  exports: ExportInfo[];
  comments: CommentInfo[];
}
```

### 2. Rule Engine Component

Định nghĩa và thực thi các rules.

```typescript
interface Rule {
  id: string;
  name: string;
  category: RuleCategory;
  severity: Severity;
  description: string;
  projectType: "frontend" | "backend" | "both";

  // Kiểm tra file có vi phạm rule không
  check(file: ParsedFile, context: RuleContext): Violation[];

  // Có thể auto-fix không
  canAutoFix: boolean;

  // Thực hiện auto-fix
  fix?(file: ParsedFile, violation: Violation): FixResult;
}

type RuleCategory =
  | "navigation"
  | "api-calls"
  | "authentication"
  | "components"
  | "component-placement"
  | "types"
  | "tables"
  | "statistics-cards"
  | "image-upload"
  | "performance"
  | "i18n"
  | "currency"
  | "comments"
  | "architecture"
  | "exception-handling"
  | "response"
  | "transaction"
  | "repository"
  | "naming"
  | "security"
  | "entity"
  | "mapper";

type Severity = "error" | "warning" | "info";

interface Violation {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion: string;
  canAutoFix: boolean;
  codeSnippet: string;
}

interface RuleContext {
  projectRoot: string;
  allFiles: FileInfo[];
  importGraph: ImportGraph;
}
```

### 3. Reporter Component

Tạo báo cáo vi phạm.

```typescript
interface Reporter {
  // Tạo báo cáo console
  generateConsoleReport(violations: Violation[]): void;

  // Tạo báo cáo markdown
  generateMarkdownReport(violations: Violation[]): string;

  // Tạo summary statistics
  generateSummary(violations: Violation[]): ReportSummary;
}

interface ReportSummary {
  totalViolations: number;
  byProject: {
    frontend: number;
    backend: number;
  };
  bySeverity: {
    error: number;
    warning: number;
    info: number;
  };
  byCategory: Record<RuleCategory, number>;
  byFile: Record<string, number>;
  autoFixable: number;
}
```

### 4. Auto-Fixer Component

Tự động sửa vi phạm.

```typescript
interface AutoFixer {
  // Xem trước thay đổi
  previewFix(violation: Violation): DiffPreview;

  // Áp dụng fix
  applyFix(violation: Violation): FixResult;

  // Áp dụng tất cả fixes có thể
  applyAllFixes(violations: Violation[]): FixResult[];
}

interface DiffPreview {
  file: string;
  before: string;
  after: string;
  lineChanges: LineChange[];
}

interface FixResult {
  success: boolean;
  file: string;
  violation: Violation;
  error?: string;
}
```

## Data Models

### Violation Model

```typescript
interface Violation {
  id: string; // Unique ID
  ruleId: string; // Rule ID (e.g., "nav-001")
  ruleName: string; // Rule name
  category: RuleCategory; // Category
  severity: Severity; // error | warning | info
  projectType: "frontend" | "backend";

  // Location
  file: string; // File path
  line: number; // Line number
  column: number; // Column number
  endLine?: number; // End line (for multi-line)
  endColumn?: number; // End column

  // Details
  message: string; // Mô tả vi phạm
  suggestion: string; // Gợi ý sửa
  codeSnippet: string; // Code snippet vi phạm

  // Auto-fix
  canAutoFix: boolean;
  fixCode?: string; // Code sau khi fix
}
```

### Rule Definition Model

```typescript
interface RuleDefinition {
  id: string;
  name: string;
  category: RuleCategory;
  severity: Severity;
  description: string;
  projectType: "frontend" | "backend" | "both";

  // Pattern matching
  patterns: {
    include?: RegExp[]; // Patterns to detect
    exclude?: RegExp[]; // Patterns to ignore
    fileTypes?: string[]; // File types to check
    filePatterns?: string[]; // File name patterns
  };

  // AST-based checking
  astCheck?: (node: ASTNode, context: RuleContext) => Violation | null;

  // Auto-fix
  canAutoFix: boolean;
  fixTemplate?: string; // Template for auto-fix
}
```

## Rule Definitions

### Frontend Rules

| Rule ID      | Name                                  | Category            | Severity | Auto-fix |
| ------------ | ------------------------------------- | ------------------- | -------- | -------- |
| FE-NAV-001   | No window.location.href               | navigation          | error    | yes      |
| FE-NAV-002   | No anchor tags for internal links     | navigation          | warning  | yes      |
| FE-API-001   | Use apiClient in client components    | api-calls           | warning  | yes      |
| FE-API-002   | Use apiServer in server components    | api-calls           | warning  | yes      |
| FE-API-003   | No direct fetch calls                 | api-calls           | warning  | no       |
| FE-API-004   | Declare pagination constants          | api-calls           | warning  | yes      |
| FE-AUTH-001  | Use useAuth hook                      | authentication      | warning  | no       |
| FE-AUTH-002  | No direct localStorage for auth       | authentication      | warning  | no       |
| FE-COMP-001  | Max 250 lines per component           | components          | warning  | no       |
| FE-COMP-002  | No use client in page.tsx             | components          | error    | no       |
| FE-COMP-003  | Internal components prefix underscore | components          | warning  | yes      |
| FE-PLACE-001 | Component placement check             | component-placement | warning  | no       |
| FE-TYPE-001  | No any type                           | types               | error    | no       |
| FE-TYPE-002  | Import enums from types/enums.ts      | types               | warning  | yes      |
| FE-TABLE-001 | STT column required                   | tables              | warning  | no       |
| FE-TABLE-002 | Correct BaseTable import              | tables              | warning  | yes      |
| FE-CARD-001  | No icons in statistics cards          | statistics-cards    | warning  | no       |
| FE-CARD-002  | Proper color classes                  | statistics-cards    | info     | no       |
| FE-IMG-001   | Compress images before upload         | image-upload        | warning  | no       |
| FE-PERF-001  | Use next/image                        | performance         | warning  | yes      |
| FE-PERF-002  | Debounce search inputs                | performance         | info     | no       |
| FE-I18N-001  | No hardcoded strings                  | i18n                | warning  | no       |
| FE-I18N-002  | Use useTranslations                   | i18n                | warning  | no       |
| FE-CURR-001  | Use formatCurrency                    | currency            | warning  | no       |
| FE-CMT-001   | No requirement comments               | comments            | warning  | yes      |

### Backend Rules

| Rule ID     | Name                                  | Category           | Severity | Auto-fix |
| ----------- | ------------------------------------- | ------------------ | -------- | -------- |
| BE-ARCH-001 | Service interface pattern             | architecture       | error    | no       |
| BE-ARCH-002 | Mapper @Component annotation          | architecture       | error    | yes      |
| BE-ARCH-003 | Domain-based package structure        | architecture       | warning  | no       |
| BE-EXC-001  | Use ErrorCode enum                    | exception-handling | error    | no       |
| BE-EXC-002  | Use custom exceptions                 | exception-handling | warning  | no       |
| BE-EXC-003  | Use factory methods                   | exception-handling | info     | no       |
| BE-RESP-001 | Return ResponseEntity<BaseResponse>   | response           | error    | no       |
| BE-RESP-002 | Use BaseResponse methods              | response           | warning  | no       |
| BE-RESP-003 | Pageable for list APIs                | response           | warning  | no       |
| BE-TXN-001  | @Transactional for write ops          | transaction        | warning  | yes      |
| BE-TXN-002  | @Transactional(readOnly) for read ops | transaction        | warning  | yes      |
| BE-REPO-001 | deleted=false check first             | repository         | error    | no       |
| BE-REPO-002 | Spring Data JPA naming                | repository         | warning  | no       |
| BE-NAME-001 | Entity naming pattern                 | naming             | warning  | no       |
| BE-NAME-002 | Mapper naming pattern                 | naming             | warning  | no       |
| BE-NAME-003 | Constant UPPER_SNAKE_CASE             | naming             | warning  | no       |
| BE-SEC-001  | @PreAuthorize required                | security           | error    | no       |
| BE-SEC-002  | Admin package roles                   | security           | error    | no       |
| BE-SEC-003  | Company package roles                 | security           | error    | no       |
| BE-ENT-001  | Extend BaseEntity                     | entity             | error    | no       |
| BE-ENT-002  | No @ManyToOne/@OneToMany              | entity             | error    | no       |
| BE-ENT-003  | Long type for foreign keys            | entity             | warning  | no       |
| BE-MAP-001  | Null check in mapper                  | mapper             | warning  | no       |
| BE-MAP-002  | Required mapper methods               | mapper             | warning  | no       |
| BE-CMT-001  | Vietnamese comments                   | comments           | info     | no       |
| BE-CMT-002  | No requirement comments               | comments           | warning  | yes      |
| BE-CMT-003  | No @Label annotation                  | comments           | warning  | yes      |

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Navigation Violation Detection

_For any_ TypeScript/TSX file containing `window.location.href` or `<a href>` for internal links, the Code_Rules_Checker SHALL detect and flag these as violations with appropriate severity and suggestions.
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: API Call Pattern Detection

_For any_ component file, the Code_Rules_Checker SHALL correctly identify whether it's a client or server component and verify the appropriate API utility (apiClient/apiServer) is used.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Auth Pattern Detection

_For any_ code accessing user authentication data, the Code_Rules_Checker SHALL detect direct localStorage access and verify useAuth() hook usage.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Component Size Detection

_For any_ component file, the Code_Rules_Checker SHALL correctly count lines and flag files exceeding 250 lines.
**Validates: Requirements 4.1**

### Property 5: Page Component Client Directive Detection

_For any_ page.tsx file, the Code_Rules_Checker SHALL detect 'use client' directive and flag as error.
**Validates: Requirements 4.2, 4.3**

### Property 6: Internal Component Naming Detection

_For any_ internal component file, the Code_Rules_Checker SHALL verify filename starts with underscore prefix.
**Validates: Requirements 4.4**

### Property 7: Component Placement Validation

_For any_ component, the Code_Rules_Checker SHALL analyze import graph and verify component is placed at the correct folder level based on usage count.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 8: Any Type Detection

_For any_ TypeScript file, the Code_Rules_Checker SHALL detect usage of `any` type and flag as error.
**Validates: Requirements 6.1, 6.2**

### Property 9: Enum Import Validation

_For any_ enum usage, the Code_Rules_Checker SHALL verify enums are imported from types/enums.ts.
**Validates: Requirements 6.3, 6.4**

### Property 10: Table STT Column Detection

_For any_ table component, the Code_Rules_Checker SHALL verify STT (index) column exists as first column.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 11: Statistics Card Icon Detection

_For any_ statistics card component, the Code_Rules_Checker SHALL detect icon usage and flag as warning.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 12: Image Compression Detection

_For any_ image upload code, the Code_Rules_Checker SHALL verify compressImageToWebP() is called before upload.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 13: Performance Pattern Detection

_For any_ component, the Code_Rules_Checker SHALL detect missing Suspense boundaries, non-dynamic imports for heavy components, and non-next/image usage.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

### Property 14: i18n Pattern Detection

_For any_ UI component, the Code_Rules_Checker SHALL detect hardcoded text strings and verify useTranslations() usage.
**Validates: Requirements 11.1, 11.2, 11.3**

### Property 15: Currency Format Detection

_For any_ currency display, the Code_Rules_Checker SHALL verify formatCurrency() is used with JPY locale.
**Validates: Requirements 12.1, 12.2, 12.3**

### Property 16: Comment Pattern Detection

_For any_ code comment, the Code_Rules_Checker SHALL detect "Requirements" or "Validates: Requirements" text.
**Validates: Requirements 13.1, 13.2, 13.3**

### Property 17: Service Interface Pattern Validation

_For any_ Service class, the Code_Rules_Checker SHALL verify Interface + Implementation pattern exists.
**Validates: Requirements 14.1, 14.2**

### Property 18: Mapper Annotation Validation

_For any_ Mapper class, the Code_Rules_Checker SHALL verify @Component annotation exists.
**Validates: Requirements 14.3**

### Property 19: Error Code Usage Validation

_For any_ exception handling code, the Code_Rules_Checker SHALL verify ErrorCode enum is used instead of hardcoded strings.
**Validates: Requirements 15.1, 15.2, 15.3, 15.4**

### Property 20: Response Type Validation

_For any_ Controller method, the Code_Rules_Checker SHALL verify return type is ResponseEntity<BaseResponse<T>>.
**Validates: Requirements 16.1, 16.2, 16.3, 16.4**

### Property 21: Transaction Annotation Validation

_For any_ Service method, the Code_Rules_Checker SHALL verify appropriate @Transactional annotation based on operation type.
**Validates: Requirements 17.1, 17.2, 17.3**

### Property 22: Repository Query Validation

_For any_ Repository query, the Code_Rules_Checker SHALL verify deleted=false check is FIRST in WHERE clause.
**Validates: Requirements 18.1, 18.2, 18.3**

### Property 23: Naming Convention Validation

_For any_ class/method/variable, the Code_Rules_Checker SHALL verify naming follows conventions (Entity, Mapper, constants, camelCase).
**Validates: Requirements 19.1, 19.2, 19.3, 19.4**

### Property 24: Authorization Annotation Validation

_For any_ Controller method, the Code_Rules_Checker SHALL verify @PreAuthorize annotation exists with correct roles.
**Validates: Requirements 20.1, 20.2, 20.3, 20.4**

### Property 25: Entity Pattern Validation

_For any_ Entity class, the Code_Rules_Checker SHALL verify it extends BaseEntity and uses Long for foreign keys.
**Validates: Requirements 21.1, 21.2, 21.3**

### Property 26: Mapper Pattern Validation

_For any_ Mapper method, the Code_Rules_Checker SHALL verify null check at beginning and required methods exist.
**Validates: Requirements 22.1, 22.2**

### Property 27: Backend Comment Validation

_For any_ Java comment, the Code_Rules_Checker SHALL verify Vietnamese language and no requirement comments.
**Validates: Requirements 23.1, 23.2, 23.3**

### Property 28: Report Structure Validation

_For any_ generated report, the Code_Rules_Checker SHALL include violations grouped by file and category with line numbers and suggestions.
**Validates: Requirements 24.1, 24.2, 24.3, 24.4, 24.5**

### Property 29: Auto-fix Functionality Validation

_For any_ auto-fixable violation, the Code_Rules_Checker SHALL correctly apply fix while preserving formatting.
**Validates: Requirements 25.1, 25.2, 25.3, 25.4**

## Error Handling

### Scanner Errors

- File not found: Log warning, skip file, continue scanning
- Parse error: Log error with file path and line, skip file
- Permission denied: Log warning, skip file

### Rule Execution Errors

- Rule throws exception: Catch, log error, continue with next rule
- Invalid AST node: Skip node, continue checking

### Auto-fix Errors

- Fix fails: Log error, mark as failed, continue with next fix
- Format preservation fails: Revert changes, log warning

### Report Generation Errors

- Write permission denied: Output to console instead
- Invalid output path: Use default path

## Testing Strategy

### Unit Tests

- Test individual rule detection logic
- Test AST parsing for different file types
- Test report generation formats
- Test auto-fix transformations

### Property-Based Tests

Sử dụng **fast-check** library cho TypeScript property-based testing.

Mỗi property test sẽ:

- Chạy tối thiểu 100 iterations
- Generate random code samples với các patterns khác nhau
- Verify detection accuracy

### Integration Tests

- Test full scanning workflow
- Test report generation end-to-end
- Test auto-fix with real files

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: ["**/*.test.ts", "**/*.property.test.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
});
```

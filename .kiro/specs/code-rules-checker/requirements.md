# Requirements Document

## Introduction

Tính năng Code Rules Checker giúp kiểm tra và đảm bảo code trong dự án tuân thủ các coding rules đã định nghĩa trong steering files. Công cụ này sẽ phân tích code cho cả Frontend (Next.js/TypeScript) và Backend (Java/Spring Boot), phát hiện vi phạm và đề xuất cách sửa.

## Glossary

- **Code_Rules_Checker**: Hệ thống kiểm tra code tuân thủ các quy tắc đã định nghĩa
- **Violation**: Vi phạm quy tắc coding được phát hiện trong code
- **Rule_Category**: Nhóm các quy tắc liên quan (Navigation, API Calls, Components, etc.)
- **Severity**: Mức độ nghiêm trọng của vi phạm (Error, Warning, Info)
- **Auto_Fix**: Khả năng tự động sửa vi phạm
- **Frontend**: Dự án tama-hr (Next.js/TypeScript)
- **Backend**: Dự án api-hr (Java/Spring Boot)

---

# FRONTEND RULES (tama-hr)

## Requirements

### Requirement 1: Kiểm tra Navigation Rules

**User Story:** As a developer, I want to check navigation code follows the rules, so that I can ensure consistent navigation patterns across the app.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans a TypeScript file, THE Code_Rules_Checker SHALL detect usage of `window.location.href` and flag as Error
2. WHEN the Code_Rules_Checker scans a TypeScript file, THE Code_Rules_Checker SHALL detect usage of `<a href>` for internal links and flag as Warning
3. WHEN the Code_Rules_Checker finds navigation violations, THE Code_Rules_Checker SHALL suggest using `router.push()` from `next/navigation` or `<Link>` from `next/link`

### Requirement 2: Kiểm tra API Call Rules

**User Story:** As a developer, I want to verify API calls use correct utilities, so that I can maintain consistent API patterns.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans a client component (has `'use client'`), THE Code_Rules_Checker SHALL verify API calls use `apiClient` from `@/lib/utils/fetch-client`
2. WHEN the Code_Rules_Checker scans a server component, THE Code_Rules_Checker SHALL verify API calls use `apiServer` from `@/lib/utils/fetch-server`
3. WHEN the Code_Rules_Checker finds direct `fetch()` calls without using apiClient/apiServer, THE Code_Rules_Checker SHALL flag as Warning
4. WHEN the Code_Rules_Checker scans paginated API calls, THE Code_Rules_Checker SHALL verify `DEFAULT_PAGE` and `DEFAULT_LIMIT` constants are declared

### Requirement 3: Kiểm tra Authentication Rules

**User Story:** As a developer, I want to ensure authentication code follows security patterns, so that I can maintain secure auth handling.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans code accessing user info, THE Code_Rules_Checker SHALL verify `useAuth()` hook is used
2. WHEN the Code_Rules_Checker finds direct `localStorage` access for auth data, THE Code_Rules_Checker SHALL flag as Warning
3. WHEN the Code_Rules_Checker finds auth violations, THE Code_Rules_Checker SHALL suggest using functions from `@/lib/auth`

### Requirement 4: Kiểm tra Component Rules

**User Story:** As a developer, I want to ensure components follow size and structure rules, so that I can maintain readable and maintainable code.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans a component file exceeding 250 lines, THE Code_Rules_Checker SHALL flag as Warning with suggestion to split
2. WHEN the Code_Rules_Checker scans a `page.tsx` file, THE Code_Rules_Checker SHALL verify it does NOT contain `'use client'` directive
3. WHEN the Code*Rules_Checker finds `'use client'` in `page.tsx`, THE Code_Rules_Checker SHALL suggest extracting interactive logic to internal component with `*` prefix
4. WHEN the Code*Rules_Checker scans internal components, THE Code_Rules_Checker SHALL verify filename starts with underscore prefix `*`
5. WHEN the Code_Rules_Checker scans components, THE Code_Rules_Checker SHALL verify each component has only 1 main responsibility

### Requirement 5: Kiểm tra Component Placement Rules

**User Story:** As a developer, I want to ensure components are placed at the correct level in the folder hierarchy, so that I can maintain proper code organization and avoid unnecessary shared components.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans a component, THE Code_Rules_Checker SHALL check if it is used in multiple locations
2. WHEN the Code_Rules_Checker finds a component used only in one page/folder, THE Code_Rules_Checker SHALL verify it is placed in that folder (not in parent/shared folder)
3. WHEN the Code_Rules_Checker finds a shared component used only in one location, THE Code_Rules_Checker SHALL flag as Warning with suggestion to move to child folder
4. WHEN the Code_Rules_Checker finds a component used in 2+ locations, THE Code_Rules_Checker SHALL verify it is placed in the nearest common parent folder
5. WHEN the Code_Rules_Checker finds a component in `_components/_shared/` used only in one layout, THE Code_Rules_Checker SHALL suggest moving to that layout's `_components/` folder

### Requirement 6: Kiểm tra Type Rules

**User Story:** As a developer, I want to ensure TypeScript types are properly used, so that I can maintain type safety.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans TypeScript files, THE Code_Rules_Checker SHALL detect usage of `any` type and flag as Error
2. WHEN the Code_Rules_Checker finds `any` type, THE Code_Rules_Checker SHALL suggest defining proper types in `types/` directory
3. WHEN the Code_Rules_Checker scans enum usage, THE Code_Rules_Checker SHALL verify enums are imported from `types/enums.ts`
4. WHEN the Code_Rules_Checker finds hardcoded enum values, THE Code_Rules_Checker SHALL suggest using constants from `types/enums.ts`

### Requirement 7: Kiểm tra Table Rules

**User Story:** As a developer, I want to verify tables follow standard patterns, so that I can ensure consistent UX.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans table components, THE Code_Rules_Checker SHALL verify STT (index) column exists as first column
2. WHEN the Code_Rules_Checker finds table without STT column, THE Code_Rules_Checker SHALL flag as Warning
3. WHEN the Code_Rules_Checker scans BaseTable usage, THE Code_Rules_Checker SHALL verify correct import from `@/app/[locale]/_components/_base/base-table`
4. WHEN the Code_Rules_Checker scans STT calculation, THE Code_Rules_Checker SHALL verify formula `page * pageSize + index + 1`

### Requirement 8: Kiểm tra Statistics Card Rules

**User Story:** As a developer, I want to ensure statistics cards follow design guidelines, so that I can maintain consistent UI.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans statistics card components, THE Code_Rules_Checker SHALL detect icon usage and flag as Warning
2. WHEN the Code_Rules_Checker finds icons in statistics cards, THE Code_Rules_Checker SHALL suggest removing icons for cleaner design
3. WHEN the Code_Rules_Checker scans Card components with statistics, THE Code_Rules_Checker SHALL verify proper color classes are used (text-green-600, text-yellow-600, text-blue-600, text-red-600)
4. WHEN the Code_Rules_Checker scans statistics cards, THE Code_Rules_Checker SHALL verify structure: label (text-sm text-muted-foreground) + value (text-2xl font-bold)

### Requirement 9: Kiểm tra Image Upload Rules

**User Story:** As a developer, I want to verify image uploads use compression, so that I can ensure optimal performance.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans image upload code, THE Code_Rules_Checker SHALL verify `compressImageToWebP()` is called before upload
2. WHEN the Code_Rules_Checker finds direct image upload without compression, THE Code_Rules_Checker SHALL flag as Warning
3. WHEN the Code_Rules_Checker finds compression violation, THE Code_Rules_Checker SHALL suggest using `@/lib/utils/compress-image-to-webp`

### Requirement 10: Kiểm tra Performance Rules

**User Story:** As a developer, I want to ensure code follows performance best practices, so that I can maintain fast app performance.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans components without Suspense boundaries, THE Code_Rules_Checker SHALL flag as Info
2. WHEN the Code_Rules_Checker finds heavy components without `dynamic()` import, THE Code_Rules_Checker SHALL suggest lazy loading
3. WHEN the Code_Rules_Checker finds images not using `next/image`, THE Code_Rules_Checker SHALL flag as Warning
4. WHEN the Code_Rules_Checker finds search inputs without debounce, THE Code_Rules_Checker SHALL suggest adding 500ms debounce

### Requirement 11: Kiểm tra i18n Rules

**User Story:** As a developer, I want to ensure internationalization is properly implemented, so that I can support multiple languages.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker finds hardcoded text strings in UI, THE Code_Rules_Checker SHALL flag as Warning
2. WHEN the Code_Rules_Checker scans translation usage, THE Code_Rules_Checker SHALL verify `useTranslations()` hook is used
3. WHEN the Code_Rules_Checker finds missing translation keys, THE Code_Rules_Checker SHALL flag as Error

### Requirement 12: Kiểm tra Currency Rules

**User Story:** As a developer, I want to ensure currency formatting is consistent, so that I can maintain proper financial display.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker finds currency values without formatting, THE Code_Rules_Checker SHALL flag as Warning
2. WHEN the Code_Rules_Checker scans currency formatting, THE Code_Rules_Checker SHALL verify `formatCurrency()` from `@/lib/utils/format-currency` is used
3. WHEN the Code_Rules_Checker finds currency format not using JPY locale, THE Code_Rules_Checker SHALL flag as Warning

### Requirement 13: Kiểm tra Comment Rules (Frontend)

**User Story:** As a developer, I want to ensure comments follow language guidelines, so that I can maintain consistent documentation.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans comments, THE Code_Rules_Checker SHALL detect "Requirements" or "Validates: Requirements" text and flag as Warning
2. WHEN the Code_Rules_Checker finds requirement comments in code, THE Code_Rules_Checker SHALL suggest removing them
3. WHEN the Code_Rules_Checker scans function comments, THE Code_Rules_Checker SHALL verify `@client-only` or `@server-only` annotations where appropriate

---

# BACKEND RULES (api-hr)

### Requirement 14: Kiểm tra Architecture Rules

**User Story:** As a developer, I want to ensure code follows layered architecture, so that I can maintain clean separation of concerns.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans Service classes, THE Code_Rules_Checker SHALL verify Interface + Implementation pattern (`I{Entity}Service` + `{Entity}ServiceImpl`)
2. WHEN the Code_Rules_Checker finds Service without interface, THE Code_Rules_Checker SHALL flag as Error
3. WHEN the Code_Rules_Checker scans Mapper classes, THE Code_Rules_Checker SHALL verify `@Component` annotation exists
4. WHEN the Code_Rules_Checker scans package structure, THE Code_Rules_Checker SHALL verify domain-based organization (admin/, company/, core/)

### Requirement 15: Kiểm tra Exception Handling Rules

**User Story:** As a developer, I want to ensure exceptions are handled consistently, so that I can maintain proper error responses.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker finds hardcoded error code strings, THE Code_Rules_Checker SHALL flag as Error
2. WHEN the Code_Rules_Checker scans error handling, THE Code_Rules_Checker SHALL verify `ErrorCode` enum from `com.tamabee.api_hr.enums.ErrorCode` is used
3. WHEN the Code_Rules_Checker finds generic exceptions, THE Code_Rules_Checker SHALL suggest using custom exceptions (BadRequestException, NotFoundException, etc.)
4. WHEN the Code_Rules_Checker scans exception creation, THE Code_Rules_Checker SHALL verify static factory methods are used (e.g., `NotFoundException.user(id)`)

### Requirement 16: Kiểm tra Response Rules

**User Story:** As a developer, I want to ensure API responses follow standard format, so that I can maintain consistent API contracts.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans Controller methods, THE Code_Rules_Checker SHALL verify return type is `ResponseEntity<BaseResponse<T>>`
2. WHEN the Code_Rules_Checker finds direct object returns, THE Code_Rules_Checker SHALL flag as Error
3. WHEN the Code_Rules_Checker scans response creation, THE Code_Rules_Checker SHALL verify `BaseResponse.success()`, `BaseResponse.created()`, or `BaseResponse.error()` is used
4. WHEN the Code_Rules_Checker scans list APIs, THE Code_Rules_Checker SHALL verify `Pageable` parameter exists

### Requirement 17: Kiểm tra Transaction Rules

**User Story:** As a developer, I want to ensure transactions are properly managed, so that I can maintain data integrity.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans write operations (create, update, delete), THE Code_Rules_Checker SHALL verify `@Transactional` annotation exists
2. WHEN the Code_Rules_Checker scans read operations, THE Code_Rules_Checker SHALL verify `@Transactional(readOnly = true)` annotation exists
3. WHEN the Code_Rules_Checker finds missing transaction annotations, THE Code_Rules_Checker SHALL flag as Warning

### Requirement 18: Kiểm tra Repository Rules

**User Story:** As a developer, I want to ensure repository queries follow conventions, so that I can maintain consistent data access.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans Repository queries, THE Code_Rules_Checker SHALL verify `deleted = false` check is FIRST in WHERE clause
2. WHEN the Code_Rules_Checker finds queries without deleted check, THE Code_Rules_Checker SHALL flag as Error
3. WHEN the Code_Rules_Checker scans method naming, THE Code_Rules_Checker SHALL verify Spring Data JPA conventions (findBy..., existsBy..., countBy...)

### Requirement 19: Kiểm tra Naming Convention Rules

**User Story:** As a developer, I want to ensure naming follows conventions, so that I can maintain code readability.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans Entity classes, THE Code_Rules_Checker SHALL verify naming pattern `{Entity}Entity`
2. WHEN the Code_Rules_Checker scans Mapper classes, THE Code_Rules_Checker SHALL verify naming pattern `{Entity}Mapper`
3. WHEN the Code_Rules_Checker scans constants, THE Code_Rules_Checker SHALL verify UPPER_SNAKE_CASE format
4. WHEN the Code_Rules_Checker scans methods and variables, THE Code_Rules_Checker SHALL verify camelCase format

### Requirement 20: Kiểm tra Security Rules

**User Story:** As a developer, I want to ensure APIs have proper authorization, so that I can maintain security.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans Controller methods, THE Code_Rules_Checker SHALL verify `@PreAuthorize` annotation exists (except public endpoints)
2. WHEN the Code_Rules_Checker scans admin package APIs, THE Code_Rules_Checker SHALL verify only `ADMIN_TAMABEE` role is allowed
3. WHEN the Code_Rules_Checker scans company package APIs, THE Code_Rules_Checker SHALL verify `ADMIN_COMPANY` or `MANAGER_COMPANY` roles are allowed
4. WHEN the Code_Rules_Checker finds missing authorization, THE Code_Rules_Checker SHALL flag as Error

### Requirement 21: Kiểm tra Entity Rules

**User Story:** As a developer, I want to ensure entities follow conventions, so that I can maintain proper data models.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans Entity classes, THE Code_Rules_Checker SHALL verify they extend `BaseEntity`
2. WHEN the Code_Rules_Checker finds `@ManyToOne` or `@OneToMany` annotations, THE Code_Rules_Checker SHALL flag as Error
3. WHEN the Code_Rules_Checker scans foreign key fields, THE Code_Rules_Checker SHALL verify they use `Long` type instead of entity references

### Requirement 22: Kiểm tra Mapper Rules

**User Story:** As a developer, I want to ensure mappers follow conventions, so that I can maintain clean data transformation.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans Mapper methods, THE Code_Rules_Checker SHALL verify null check at beginning
2. WHEN the Code_Rules_Checker scans Mapper classes, THE Code_Rules_Checker SHALL verify methods include `toEntity()`, `toResponse()`, `updateEntity()`
3. WHEN the Code_Rules_Checker finds business logic in Mapper, THE Code_Rules_Checker SHALL flag as Error

### Requirement 23: Kiểm tra Comment Rules (Backend)

**User Story:** As a developer, I want to ensure comments follow guidelines, so that I can maintain consistent documentation.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker scans comments, THE Code_Rules_Checker SHALL verify they are written in Vietnamese
2. WHEN the Code_Rules_Checker finds "Requirements" or "Validates: Requirements" in comments, THE Code_Rules_Checker SHALL flag as Warning
3. WHEN the Code_Rules_Checker finds `@Label` annotation in property tests, THE Code_Rules_Checker SHALL flag as Warning

---

# COMMON RULES

### Requirement 24: Báo cáo vi phạm

**User Story:** As a developer, I want to see a summary of all violations, so that I can prioritize fixes.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker completes scanning, THE Code_Rules_Checker SHALL generate a summary report with total violations by severity
2. WHEN the Code_Rules_Checker generates report, THE Code_Rules_Checker SHALL group violations by file and rule category
3. WHEN the Code_Rules_Checker finds violations, THE Code_Rules_Checker SHALL provide specific line numbers and suggested fixes
4. THE Code_Rules_Checker SHALL output report in both console and markdown format
5. THE Code_Rules_Checker SHALL separate Frontend and Backend violations in report

### Requirement 25: Auto-fix capability

**User Story:** As a developer, I want to automatically fix simple violations, so that I can save time on manual corrections.

#### Acceptance Criteria

1. WHEN the Code_Rules_Checker finds auto-fixable violations, THE Code_Rules_Checker SHALL mark them with `[auto-fix available]` tag
2. WHEN a developer requests auto-fix, THE Code_Rules_Checker SHALL apply fixes and show diff preview
3. WHEN auto-fix is applied, THE Code_Rules_Checker SHALL preserve code formatting and indentation
4. IF auto-fix fails, THEN THE Code_Rules_Checker SHALL log the error and continue with manual fix suggestion

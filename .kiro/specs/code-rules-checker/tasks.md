# Implementation Plan: Code Rules Checker

## Overview

- Triển khai Code Rules Checker - công cụ phân tích tĩnh để kiểm tra code tuân thủ coding rules. Sử dụng TypeScript với AST parsing cho cả Frontend và Backend rules.

- Khi KIRO thực hiện task hãy phản hồi tôi bằng tiếng việt.

## Tasks

- [x] 1. Setup project structure, Scanner và Rule Engine
  - Tạo thư mục `src/lib/code-checker/` trong tama-hr
  - Định nghĩa core interfaces: Scanner, Rule, Violation, Reporter
  - Implement file discovery với glob patterns
  - Implement TypeScript/TSX parser (AST, imports, exports, comments)
  - Implement Java parser (annotations, methods, fields)
  - Create Rule Registry và base rule class
  - Setup testing framework với vitest và fast-check
  - _Requirements: 24.1, 24.2, 24.3_

- [x] 2. Implement tất cả Frontend Rules
  - **Navigation Rules (FE-NAV-001/002):** Detect window.location.href, <a href>, suggest router.push()/<Link>
  - **API Call Rules (FE-API-001/002/003/004):** Detect client/server components, verify apiClient/apiServer, check pagination constants
  - **Auth Rules (FE-AUTH-001/002):** Verify useAuth() hook, detect direct localStorage access
  - **Component Rules (FE-COMP-001/002/003):** Max 250 lines, no 'use client' in page.tsx, underscore prefix
  - **Component Placement (FE-PLACE-001):** Build import graph, verify placement at correct folder level
  - **Type Rules (FE-TYPE-001/002):** Detect 'any' type, verify enum imports from types/enums.ts
  - **Table Rules (FE-TABLE-001/002):** Verify STT column exists, correct BaseTable import
  - **Statistics Card Rules (FE-CARD-001/002):** Detect icon usage, verify color classes
  - **Image Upload Rules (FE-IMG-001):** Verify compressImageToWebP() usage
  - **Performance Rules (FE-PERF-001/002):** Detect missing Suspense, non-next/image usage
  - **i18n Rules (FE-I18N-001/002):** Detect hardcoded strings, verify useTranslations()
  - **Currency Rules (FE-CURR-001):** Verify formatCurrency() with JPY locale
  - **Comment Rules (FE-CMT-001):** Detect "Requirements" comments, auto-fix removal
  - _Requirements: 1.1-1.3, 2.1-2.4, 3.1-3.3, 4.1-4.4, 5.1-5.5, 6.1-6.4, 7.1-7.4, 8.1-8.4, 9.1-9.3, 10.1-10.4, 11.1-11.3, 12.1-12.3, 13.1-13.3_

- [x] 3. Write property tests cho Frontend Rules
  - **Property 1:** Navigation Violation Detection (Requirements 1.1, 1.2, 1.3)
  - **Property 2:** API Call Pattern Detection (Requirements 2.1, 2.2, 2.3)
  - **Property 3:** Auth Pattern Detection (Requirements 3.1, 3.2, 3.3)
  - **Property 4:** Component Size Detection (Requirements 4.1)
  - **Property 5:** Page Component Client Directive Detection (Requirements 4.2, 4.3)
  - **Property 7:** Component Placement Validation (Requirements 5.1-5.5)
  - **Property 8:** Any Type Detection (Requirements 6.1, 6.2)
  - **Property 10:** Table STT Column Detection (Requirements 7.1-7.4)
  - **Property 11:** Statistics Card Icon Detection (Requirements 8.1-8.4)
  - **Property 12:** Image Compression Detection (Requirements 9.1-9.3)
  - **Property 16:** Comment Pattern Detection (Requirements 13.1-13.3)

- [x] 4. Implement tất cả Backend Rules
  - **Architecture Rules (BE-ARCH-001/002/003):** Service interface pattern, Mapper @Component, domain-based packages
  - **Exception Rules (BE-EXC-001/002/003):** ErrorCode enum usage, custom exceptions, factory methods
  - **Response Rules (BE-RESP-001/002/003):** ResponseEntity<BaseResponse<T>>, BaseResponse methods, Pageable
  - **Transaction Rules (BE-TXN-001/002):** @Transactional for write, @Transactional(readOnly) for read
  - **Repository Rules (BE-REPO-001/002):** deleted=false check FIRST, Spring Data JPA naming
  - **Naming Rules (BE-NAME-001/002/003):** Entity/Mapper naming, UPPER_SNAKE_CASE constants
  - **Security Rules (BE-SEC-001/002/003):** @PreAuthorize required, role assignments by package
  - **Entity Rules (BE-ENT-001/002/003):** Extend BaseEntity, no @ManyToOne/@OneToMany, Long for FK
  - **Mapper Rules (BE-MAP-001/002):** Null check at beginning, required methods
  - **Comment Rules (BE-CMT-001/002/003):** Vietnamese comments, no requirement comments, no @Label
  - _Requirements: 14.1-14.4, 15.1-15.4, 16.1-16.4, 17.1-17.3, 18.1-18.3, 19.1-19.4, 20.1-20.4, 21.1-21.3, 22.1-22.2, 23.1-23.3_

- [x] 5. Write property tests cho Backend Rules
  - **Property 17:** Service Interface Pattern Validation (Requirements 14.1, 14.2)
  - **Property 18:** Mapper Annotation Validation (Requirements 14.3)
  - **Property 19:** Error Code Usage Validation (Requirements 15.1-15.4)
  - **Property 20:** Response Type Validation (Requirements 16.1-16.4)
  - **Property 21:** Transaction Annotation Validation (Requirements 17.1-17.3)
  - **Property 22:** Repository Query Validation (Requirements 18.1-18.3)
  - **Property 24:** Authorization Annotation Validation (Requirements 20.1-20.4)
  - **Property 25:** Entity Pattern Validation (Requirements 21.1-21.3)
  - **Property 26:** Mapper Pattern Validation (Requirements 22.1, 22.2)

- [x] 6. Implement Reporter và Auto-Fixer
  - **Console Reporter:** Format violations, color-coded severity
  - **Markdown Reporter:** Generate report file, group by file/category, line numbers, suggestions
  - **Diff Preview:** Generate before/after diff, show line changes
  - **Fix Application:** Apply fixes preserving formatting, handle errors gracefully
  - _Requirements: 24.1-24.5, 25.1-25.4_

- [x] 7. Write property tests cho Reporter và Auto-Fixer
  - **Property 28:** Report Structure Validation (Requirements 24.1-24.5)
  - **Property 29:** Auto-fix Functionality Validation (Requirements 25.1-25.4)

- [x] 8. Integration, CLI và Final Testing
  - Create main entry point, wire all components
  - Handle command line arguments
  - Add npm scripts: `npm run check:rules`, `npm run check:rules:fix`
  - Run full scan on both projects (tama-hr và api-hr)
  - Ensure all tests pass
  - _Requirements: 24.1, 25.1_

## Notes

- All 8 tasks are required (comprehensive with property tests)
- Each task references specific requirements for traceability
- Task 2 và 4 là các tasks lớn nhất, implement tất cả rules cho Frontend/Backend
- Task 3, 5, 7 là property tests để đảm bảo correctness

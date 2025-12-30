/**
 * Property-Based Tests cho Backend Rules
 * Sử dụng fast-check để test các rules với nhiều inputs ngẫu nhiên
 *
 * Feature: code-rules-checker
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { ruleRegistry } from "../rules/rule-registry";
import { registerBackendRules } from "../rules";
import type {
  ParsedJavaFile,
  FileInfo,
  RuleContext,
  ImportGraph,
} from "../types";

// ============================================
// HELPERS
// ============================================

/**
 * Tạo mock FileInfo cho Java file
 */
function createJavaFileInfo(overrides: Partial<FileInfo> = {}): FileInfo {
  return {
    path:
      overrides.path ||
      "/project/src/main/java/com/tamabee/api_hr/service/UserServiceImpl.java",
    relativePath:
      overrides.relativePath ||
      "src/main/java/com/tamabee/api_hr/service/UserServiceImpl.java",
    type: "java",
    isPage: false,
    isComponent: false,
    isService: overrides.isService ?? false,
    isController: overrides.isController ?? false,
    isMapper: overrides.isMapper ?? false,
    isEntity: overrides.isEntity ?? false,
    isRepository: overrides.isRepository ?? false,
  };
}

/**
 * Tạo mock ParsedJavaFile
 */
function createMockJavaFile(
  overrides: Partial<ParsedJavaFile> = {},
): ParsedJavaFile {
  const lines = overrides.lines || [];
  return {
    file: overrides.file || createJavaFileInfo(),
    lines,
    lineCount: lines.length,
    imports: overrides.imports || [],
    exports: overrides.exports || [],
    comments: overrides.comments || [],
    hasUseClient: false,
    hasUseServer: false,
    content: overrides.content || lines.join("\n"),
    className: overrides.className || "UserServiceImpl",
    packageName: overrides.packageName || "com.tamabee.api_hr.service",
    classAnnotations: overrides.classAnnotations || [],
    methods: overrides.methods || [],
    fields: overrides.fields || [],
    extendsClass: overrides.extendsClass,
    implementsInterfaces: overrides.implementsInterfaces || [],
  };
}

/**
 * Tạo mock RuleContext
 */
function createMockContext(
  allFiles: FileInfo[] = [],
  importGraph?: ImportGraph,
): RuleContext {
  return {
    projectRoot: "/project",
    allFiles,
    importGraph: importGraph || {
      importedBy: new Map(),
      imports: new Map(),
    },
  };
}

// ============================================
// GENERATORS
// ============================================

/**
 * Generator cho entity names
 */
const entityNameArb = fc.constantFrom(
  "User",
  "Company",
  "Wallet",
  "Employee",
  "Department",
  "Plan",
  "Transaction",
);

/**
 * Generator cho method names - write operations
 */
const writeMethodNameArb = fc.constantFrom(
  "createUser",
  "saveCompany",
  "addEmployee",
  "updateWallet",
  "deleteTransaction",
  "removeEmployee",
  "softDeleteUser",
  "modifyPlan",
);

/**
 * Generator cho method names - read operations
 */
const readMethodNameArb = fc.constantFrom(
  "getUser",
  "findCompany",
  "fetchEmployee",
  "loadWallet",
  "searchTransactions",
  "listEmployees",
  "countUsers",
  "existsById",
);

/**
 * Generator cho error codes
 */
const errorCodeArb = fc.constantFrom(
  "INVALID_CREDENTIALS",
  "USER_NOT_FOUND",
  "EMAIL_EXISTS",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "INTERNAL_ERROR",
  "BAD_REQUEST",
);

/**
 * Generator cho generic exceptions
 */
const genericExceptionArb = fc.constantFrom(
  "RuntimeException",
  "Exception",
  "IllegalArgumentException",
  "IllegalStateException",
);

/**
 * Generator cho custom exceptions
 */
const customExceptionArb = fc.constantFrom(
  "BadRequestException",
  "NotFoundException",
  "UnauthorizedException",
  "ForbiddenException",
  "ConflictException",
  "InternalServerException",
);

/**
 * Generator cho HTTP method annotations
 */
const httpMethodAnnotationArb = fc.constantFrom(
  "GetMapping",
  "PostMapping",
  "PutMapping",
  "DeleteMapping",
  "PatchMapping",
);

/**
 * Generator cho return types
 */
const returnTypeArb = fc.constantFrom(
  "User",
  "Company",
  "void",
  "List<User>",
  "Page<Company>",
  "Optional<User>",
);

// ============================================
// PROPERTY TESTS
// ============================================

describe("Backend Rules Property Tests", () => {
  beforeEach(() => {
    ruleRegistry.clear();
    registerBackendRules();
  });

  /**
   * Property 17: Service Interface Pattern Validation
   * For any Service class, the Code_Rules_Checker SHALL verify Interface + Implementation pattern exists.
   * **Validates: Requirements 14.1, 14.2**
   */
  describe("Property 17: Service Interface Pattern Validation", () => {
    it("should detect ServiceImpl without interface for any entity name", () => {
      const rule = ruleRegistry.get("BE-ARCH-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}ServiceImpl`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isService: true,
              relativePath: `src/main/java/com/tamabee/api_hr/service/${className}.java`,
            }),
            className,
            implementsInterfaces: [], // Không implement interface
          });

          const violations = rule!.check(file, createMockContext());

          // Phải detect ServiceImpl không có interface
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].ruleId).toBe("BE-ARCH-001");
          expect(violations[0].severity).toBe("error");
          expect(violations[0].message).toContain("không implement interface");
        }),
        { numRuns: 100 },
      );
    });

    it("should NOT flag ServiceImpl that implements correct interface", () => {
      const rule = ruleRegistry.get("BE-ARCH-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}ServiceImpl`;
          const interfaceName = `I${entityName}Service`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isService: true,
              relativePath: `src/main/java/com/tamabee/api_hr/service/${className}.java`,
            }),
            className,
            implementsInterfaces: [interfaceName],
          });

          const violations = rule!.check(file, createMockContext());

          // Không nên flag khi đã implement đúng interface
          expect(violations.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 18: Mapper Annotation Validation
   * For any Mapper class, the Code_Rules_Checker SHALL verify @Component annotation exists.
   * **Validates: Requirements 14.3**
   */
  describe("Property 18: Mapper Annotation Validation", () => {
    it("should detect Mapper without @Component for any entity name", () => {
      const rule = ruleRegistry.get("BE-ARCH-002");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}Mapper`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isMapper: true,
              relativePath: `src/main/java/com/tamabee/api_hr/mapper/${className}.java`,
            }),
            className,
            classAnnotations: [], // Không có @Component
            lines: [`public class ${className} {`],
          });

          const violations = rule!.check(file, createMockContext());

          // Phải detect Mapper thiếu @Component
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].ruleId).toBe("BE-ARCH-002");
          expect(violations[0].severity).toBe("error");
          expect(violations[0].message).toContain("thiếu @Component");
        }),
        { numRuns: 100 },
      );
    });

    it("should NOT flag Mapper with @Component annotation", () => {
      const rule = ruleRegistry.get("BE-ARCH-002");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}Mapper`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isMapper: true,
              relativePath: `src/main/java/com/tamabee/api_hr/mapper/${className}.java`,
            }),
            className,
            classAnnotations: [{ name: "Component", parameters: {}, line: 1 }],
          });

          const violations = rule!.check(file, createMockContext());

          // Không nên flag khi đã có @Component
          expect(violations.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 19: Error Code Usage Validation
   * For any exception handling code, the Code_Rules_Checker SHALL verify ErrorCode enum is used
   * instead of hardcoded strings.
   * **Validates: Requirements 15.1, 15.2, 15.3, 15.4**
   */
  describe("Property 19: Error Code Usage Validation", () => {
    it("should detect hardcoded error codes in exceptions", () => {
      const rule = ruleRegistry.get("BE-EXC-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          errorCodeArb,
          customExceptionArb,
          (errorCode, exceptionType) => {
            const line = `throw new ${exceptionType}("${errorCode}", "Error message");`;
            const file = createMockJavaFile({
              file: createJavaFileInfo({ isService: true }),
              lines: [line],
            });

            const violations = rule!.check(file, createMockContext());

            // Phải detect hardcoded error code
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-EXC-001");
            expect(violations[0].severity).toBe("error");
            expect(violations[0].message).toContain("Hardcoded error code");
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should NOT flag when using ErrorCode enum", () => {
      const rule = ruleRegistry.get("BE-EXC-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          errorCodeArb,
          customExceptionArb,
          (errorCode, exceptionType) => {
            // Sử dụng ErrorCode enum thay vì hardcoded string
            const line = `throw new ${exceptionType}(ErrorCode.${errorCode}, "Error message");`;
            const file = createMockJavaFile({
              file: createJavaFileInfo({ isService: true }),
              lines: [line],
            });

            const violations = rule!.check(file, createMockContext());

            // Không nên flag khi dùng ErrorCode enum
            expect(violations.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should detect generic exceptions", () => {
      const rule = ruleRegistry.get("BE-EXC-002");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(genericExceptionArb, (exceptionType) => {
          const line = `throw new ${exceptionType}("Something went wrong");`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({ isService: true }),
            lines: [line],
          });

          const violations = rule!.check(file, createMockContext());

          // Phải detect generic exception
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].ruleId).toBe("BE-EXC-002");
          expect(violations[0].message).toContain("generic exception");
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 20: Response Type Validation
   * For any Controller method, the Code_Rules_Checker SHALL verify return type is ResponseEntity<BaseResponse<T>>.
   * **Validates: Requirements 16.1, 16.2, 16.3, 16.4**
   */
  describe("Property 20: Response Type Validation", () => {
    it("should detect Controller methods not returning ResponseEntity", () => {
      const rule = ruleRegistry.get("BE-RESP-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          returnTypeArb,
          httpMethodAnnotationArb,
          fc.constantFrom(
            "getUser",
            "createCompany",
            "updateEmployee",
            "deleteWallet",
          ),
          (returnType, httpAnnotation, methodName) => {
            const file = createMockJavaFile({
              file: createJavaFileInfo({
                isController: true,
                relativePath:
                  "src/main/java/com/tamabee/api_hr/controller/UserController.java",
              }),
              methods: [
                {
                  name: methodName,
                  returnType, // Không phải ResponseEntity
                  annotations: [
                    { name: httpAnnotation, parameters: {}, line: 1 },
                  ],
                  line: 2,
                  endLine: 5,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Phải detect method không return ResponseEntity
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-RESP-001");
            expect(violations[0].message).toContain(
              "không return ResponseEntity",
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should NOT flag Controller methods returning ResponseEntity<BaseResponse>", () => {
      const rule = ruleRegistry.get("BE-RESP-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          returnTypeArb,
          httpMethodAnnotationArb,
          fc.constantFrom("getUser", "createCompany", "updateEmployee"),
          (innerType, httpAnnotation, methodName) => {
            const file = createMockJavaFile({
              file: createJavaFileInfo({
                isController: true,
                relativePath:
                  "src/main/java/com/tamabee/api_hr/controller/UserController.java",
              }),
              methods: [
                {
                  name: methodName,
                  returnType: `ResponseEntity<BaseResponse<${innerType}>>`,
                  annotations: [
                    { name: httpAnnotation, parameters: {}, line: 1 },
                  ],
                  line: 2,
                  endLine: 5,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Không nên flag khi return đúng type
            expect(violations.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 21: Transaction Annotation Validation
   * For any Service method, the Code_Rules_Checker SHALL verify appropriate @Transactional annotation
   * based on operation type.
   * **Validates: Requirements 17.1, 17.2, 17.3**
   */
  describe("Property 21: Transaction Annotation Validation", () => {
    it("should detect write methods without @Transactional", () => {
      const rule = ruleRegistry.get("BE-TXN-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          writeMethodNameArb,
          returnTypeArb,
          (methodName, returnType) => {
            const file = createMockJavaFile({
              file: createJavaFileInfo({ isService: true }),
              methods: [
                {
                  name: methodName,
                  returnType,
                  annotations: [], // Không có @Transactional
                  line: 1,
                  endLine: 5,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Phải detect write method thiếu @Transactional
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-TXN-001");
            expect(violations[0].message).toContain("thiếu @Transactional");
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should NOT flag write methods with @Transactional", () => {
      const rule = ruleRegistry.get("BE-TXN-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          writeMethodNameArb,
          returnTypeArb,
          (methodName, returnType) => {
            const file = createMockJavaFile({
              file: createJavaFileInfo({ isService: true }),
              methods: [
                {
                  name: methodName,
                  returnType,
                  annotations: [
                    { name: "Transactional", parameters: {}, line: 1 },
                  ],
                  line: 2,
                  endLine: 5,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Không nên flag khi đã có @Transactional
            expect(violations.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should detect read methods without @Transactional(readOnly = true)", () => {
      const rule = ruleRegistry.get("BE-TXN-002");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          readMethodNameArb,
          returnTypeArb,
          (methodName, returnType) => {
            const file = createMockJavaFile({
              file: createJavaFileInfo({ isService: true }),
              methods: [
                {
                  name: methodName,
                  returnType,
                  annotations: [], // Không có @Transactional
                  line: 1,
                  endLine: 5,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Phải detect read method thiếu @Transactional(readOnly = true)
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-TXN-002");
            expect(violations[0].message).toContain(
              "thiếu @Transactional(readOnly = true)",
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should NOT flag read methods with @Transactional(readOnly = true)", () => {
      const rule = ruleRegistry.get("BE-TXN-002");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          readMethodNameArb,
          returnTypeArb,
          (methodName, returnType) => {
            const file = createMockJavaFile({
              file: createJavaFileInfo({ isService: true }),
              methods: [
                {
                  name: methodName,
                  returnType,
                  annotations: [
                    {
                      name: "Transactional",
                      parameters: { readOnly: "true" },
                      line: 1,
                    },
                  ],
                  line: 2,
                  endLine: 5,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Không nên flag khi đã có @Transactional(readOnly = true)
            expect(violations.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 22: Repository Query Validation
   * For any Repository query, the Code_Rules_Checker SHALL verify deleted=false check is FIRST in WHERE clause.
   * **Validates: Requirements 18.1, 18.2, 18.3**
   */
  describe("Property 22: Repository Query Validation", () => {
    it("should detect queries without deleted=false check", () => {
      const rule = ruleRegistry.get("BE-REPO-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          // Query không có deleted = false
          const query = `@Query("SELECT u FROM ${entityName}Entity u WHERE u.email = :email")`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isRepository: true,
              relativePath: `src/main/java/com/tamabee/api_hr/repository/${entityName}Repository.java`,
            }),
            lines: [query],
          });

          const violations = rule!.check(file, createMockContext());

          // Phải detect query thiếu deleted = false
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].ruleId).toBe("BE-REPO-001");
          expect(violations[0].message).toContain("deleted = false");
        }),
        { numRuns: 100 },
      );
    });

    it("should NOT flag queries with deleted=false check first", () => {
      const rule = ruleRegistry.get("BE-REPO-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          // Query có deleted = false ở đầu WHERE clause
          const query = `@Query("SELECT u FROM ${entityName}Entity u WHERE u.deleted = false AND u.email = :email")`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isRepository: true,
              relativePath: `src/main/java/com/tamabee/api_hr/repository/${entityName}Repository.java`,
            }),
            lines: [query],
          });

          const violations = rule!.check(file, createMockContext());

          // Không nên flag khi deleted = false ở đầu
          expect(violations.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });

    it("should detect queries with deleted=false NOT first", () => {
      const rule = ruleRegistry.get("BE-REPO-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          // Query có deleted = false nhưng không ở đầu
          const query = `@Query("SELECT u FROM ${entityName}Entity u WHERE u.email = :email AND u.deleted = false")`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isRepository: true,
              relativePath: `src/main/java/com/tamabee/api_hr/repository/${entityName}Repository.java`,
            }),
            lines: [query],
          });

          const violations = rule!.check(file, createMockContext());

          // Phải detect deleted = false không ở đầu
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].ruleId).toBe("BE-REPO-001");
          expect(violations[0].message).toContain("không ở đầu");
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 24: Authorization Annotation Validation
   * For any Controller method, the Code_Rules_Checker SHALL verify @PreAuthorize annotation exists with correct roles.
   * **Validates: Requirements 20.1, 20.2, 20.3, 20.4**
   */
  describe("Property 24: Authorization Annotation Validation", () => {
    it("should detect Controller methods without @PreAuthorize in admin package", () => {
      const rule = ruleRegistry.get("BE-SEC-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          httpMethodAnnotationArb,
          fc.constantFrom("getUsers", "createUser", "updateUser", "deleteUser"),
          (httpAnnotation, methodName) => {
            const file = createMockJavaFile({
              file: createJavaFileInfo({
                isController: true,
                relativePath:
                  "src/main/java/com/tamabee/api_hr/controller/admin/UserController.java",
              }),
              packageName: "com.tamabee.api_hr.controller.admin",
              methods: [
                {
                  name: methodName,
                  returnType: "ResponseEntity<BaseResponse<User>>",
                  annotations: [
                    { name: httpAnnotation, parameters: {}, line: 1 },
                  ],
                  line: 2,
                  endLine: 5,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Phải detect method thiếu @PreAuthorize
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-SEC-001");
            expect(violations[0].message).toContain("thiếu @PreAuthorize");
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should NOT flag Controller methods with @PreAuthorize", () => {
      const rule = ruleRegistry.get("BE-SEC-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          httpMethodAnnotationArb,
          fc.constantFrom("getUsers", "createUser", "updateUser"),
          (httpAnnotation, methodName) => {
            const file = createMockJavaFile({
              file: createJavaFileInfo({
                isController: true,
                relativePath:
                  "src/main/java/com/tamabee/api_hr/controller/admin/UserController.java",
              }),
              packageName: "com.tamabee.api_hr.controller.admin",
              methods: [
                {
                  name: methodName,
                  returnType: "ResponseEntity<BaseResponse<User>>",
                  annotations: [
                    { name: httpAnnotation, parameters: {}, line: 1 },
                    {
                      name: "PreAuthorize",
                      parameters: { value: "hasRole('ADMIN_TAMABEE')" },
                      line: 2,
                    },
                  ],
                  line: 3,
                  endLine: 6,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Không nên flag khi đã có @PreAuthorize
            expect(violations.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should detect admin package APIs with invalid roles (missing ADMIN_TAMABEE)", () => {
      const rule = ruleRegistry.get("BE-SEC-002");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          fc.constantFrom("getUsers", "createUser", "updateUser"),
          (methodName) => {
            // Admin package API với role không hợp lệ (ADMIN_COMPANY thay vì ADMIN_TAMABEE)
            // Package name phải có .admin. (với dấu chấm ở cả hai bên) để rule match
            const file = createMockJavaFile({
              file: createJavaFileInfo({
                isController: true,
                relativePath:
                  "src/main/java/com/tamabee/api_hr/controller/admin/user/UserController.java",
              }),
              packageName: "com.tamabee.api_hr.controller.admin.user", // .admin. với dấu chấm ở cả hai bên
              methods: [
                {
                  name: methodName,
                  returnType: "ResponseEntity<BaseResponse<User>>",
                  annotations: [
                    { name: "GetMapping", parameters: {}, line: 1 },
                    {
                      name: "PreAuthorize",
                      parameters: { value: "hasRole('ADMIN_COMPANY')" },
                      line: 2,
                    },
                  ],
                  line: 3,
                  endLine: 6,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Rule BE-SEC-002 kiểm tra: (!hasAdminTamabee || hasInvalidRole)
            // Với ADMIN_COMPANY: hasAdminTamabee=false, hasInvalidRole=true -> flag
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-SEC-002");
            expect(violations[0].message).toContain("role không hợp lệ");
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should detect company package APIs without valid company roles", () => {
      const rule = ruleRegistry.get("BE-SEC-003");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          fc.constantFrom("getEmployees", "createEmployee"),
          (methodName) => {
            // Company package API với role không hợp lệ (EMPLOYEE_COMPANY không phải ADMIN_COMPANY hoặc MANAGER_COMPANY)
            // Package name phải có .company. (với dấu chấm ở cả hai bên) để rule match
            const file = createMockJavaFile({
              file: createJavaFileInfo({
                isController: true,
                relativePath:
                  "src/main/java/com/tamabee/api_hr/controller/company/employee/EmployeeController.java",
              }),
              packageName: "com.tamabee.api_hr.controller.company.employee", // .company. với dấu chấm ở cả hai bên
              methods: [
                {
                  name: methodName,
                  returnType: "ResponseEntity<BaseResponse<Employee>>",
                  annotations: [
                    { name: "GetMapping", parameters: {}, line: 1 },
                    // EMPLOYEE_COMPANY không phải valid role cho company package
                    {
                      name: "PreAuthorize",
                      parameters: { value: "hasRole('EMPLOYEE_COMPANY')" },
                      line: 2,
                    },
                  ],
                  line: 3,
                  endLine: 6,
                  modifier: "public",
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Rule BE-SEC-003 kiểm tra: !hasValidRole (ADMIN_COMPANY hoặc MANAGER_COMPANY)
            // Với EMPLOYEE_COMPANY: hasValidRole=false -> flag
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-SEC-003");
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 25: Entity Pattern Validation
   * For any Entity class, the Code_Rules_Checker SHALL verify it extends BaseEntity and uses Long for foreign keys.
   * **Validates: Requirements 21.1, 21.2, 21.3**
   */
  describe("Property 25: Entity Pattern Validation", () => {
    it("should detect Entity not extending BaseEntity", () => {
      const rule = ruleRegistry.get("BE-ENT-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}Entity`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isEntity: true,
              relativePath: `src/main/java/com/tamabee/api_hr/entity/${className}.java`,
            }),
            className,
            classAnnotations: [{ name: "Entity", parameters: {}, line: 1 }],
            extendsClass: undefined, // Không extend BaseEntity
          });

          const violations = rule!.check(file, createMockContext());

          // Phải detect Entity không extend BaseEntity
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].ruleId).toBe("BE-ENT-001");
          expect(violations[0].message).toContain("không extend BaseEntity");
        }),
        { numRuns: 100 },
      );
    });

    it("should NOT flag Entity extending BaseEntity", () => {
      const rule = ruleRegistry.get("BE-ENT-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}Entity`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isEntity: true,
              relativePath: `src/main/java/com/tamabee/api_hr/entity/${className}.java`,
            }),
            className,
            classAnnotations: [{ name: "Entity", parameters: {}, line: 1 }],
            extendsClass: "BaseEntity",
          });

          const violations = rule!.check(file, createMockContext());

          // Không nên flag khi extend BaseEntity
          expect(violations.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });

    it("should detect @ManyToOne/@OneToMany annotations", () => {
      const rule = ruleRegistry.get("BE-ENT-002");
      expect(rule).toBeDefined();

      const relationAnnotations = [
        "ManyToOne",
        "OneToMany",
        "ManyToMany",
        "OneToOne",
      ];

      fc.assert(
        fc.property(
          entityNameArb,
          fc.constantFrom(...relationAnnotations),
          (entityName, annotationName) => {
            const className = `${entityName}Entity`;
            const file = createMockJavaFile({
              file: createJavaFileInfo({
                isEntity: true,
                relativePath: `src/main/java/com/tamabee/api_hr/entity/${className}.java`,
              }),
              className,
              fields: [
                {
                  name: "company",
                  type: "CompanyEntity",
                  annotations: [
                    { name: annotationName, parameters: {}, line: 5 },
                  ],
                  line: 6,
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Phải detect relationship annotation
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-ENT-002");
            expect(violations[0].message).toContain(`@${annotationName}`);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should detect entity reference fields instead of Long", () => {
      const rule = ruleRegistry.get("BE-ENT-003");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(
          entityNameArb,
          entityNameArb,
          (entityName, refEntityName) => {
            const className = `${entityName}Entity`;
            const file = createMockJavaFile({
              file: createJavaFileInfo({
                isEntity: true,
                relativePath: `src/main/java/com/tamabee/api_hr/entity/${className}.java`,
              }),
              className,
              fields: [
                {
                  name: refEntityName.toLowerCase(),
                  type: `${refEntityName}Entity`, // Entity reference thay vì Long
                  annotations: [],
                  line: 5,
                },
              ],
            });

            const violations = rule!.check(file, createMockContext());

            // Phải detect entity reference
            expect(violations.length).toBeGreaterThan(0);
            expect(violations[0].ruleId).toBe("BE-ENT-003");
            expect(violations[0].message).toContain("entity reference");
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 26: Mapper Pattern Validation
   * For any Mapper method, the Code_Rules_Checker SHALL verify null check at beginning and required methods exist.
   * **Validates: Requirements 22.1, 22.2**
   */
  describe("Property 26: Mapper Pattern Validation", () => {
    it("should detect missing required mapper methods", () => {
      const rule = ruleRegistry.get("BE-MAP-002");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}Mapper`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isMapper: true,
              relativePath: `src/main/java/com/tamabee/api_hr/mapper/${className}.java`,
            }),
            className,
            methods: [
              // Chỉ có toEntity, thiếu toResponse và updateEntity
              {
                name: "toEntity",
                returnType: `${entityName}Entity`,
                annotations: [],
                line: 1,
                endLine: 5,
                modifier: "public",
              },
            ],
          });

          const violations = rule!.check(file, createMockContext());

          // Phải detect thiếu required methods
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].ruleId).toBe("BE-MAP-002");
          expect(violations[0].message).toContain("thiếu method");
        }),
        { numRuns: 100 },
      );
    });

    it("should NOT flag Mapper with all required methods", () => {
      const rule = ruleRegistry.get("BE-MAP-002");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}Mapper`;
          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isMapper: true,
              relativePath: `src/main/java/com/tamabee/api_hr/mapper/${className}.java`,
            }),
            className,
            methods: [
              {
                name: "toEntity",
                returnType: `${entityName}Entity`,
                annotations: [],
                line: 1,
                endLine: 5,
                modifier: "public",
              },
              {
                name: "toResponse",
                returnType: `${entityName}Response`,
                annotations: [],
                line: 6,
                endLine: 10,
                modifier: "public",
              },
              {
                name: "updateEntity",
                returnType: "void",
                annotations: [],
                line: 11,
                endLine: 15,
                modifier: "public",
              },
            ],
          });

          const violations = rule!.check(file, createMockContext());

          // Không nên flag khi có đủ required methods
          expect(violations.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });

    it("should detect mapper methods without null check", () => {
      const rule = ruleRegistry.get("BE-MAP-001");
      expect(rule).toBeDefined();

      fc.assert(
        fc.property(entityNameArb, (entityName) => {
          const className = `${entityName}Mapper`;
          // Method body không có null check
          const methodBody = [
            `public ${entityName}Entity toEntity(${entityName}Request request) {`,
            `    ${entityName}Entity entity = new ${entityName}Entity();`,
            "    entity.setName(request.getName());",
            "    return entity;",
            "}",
          ];

          const file = createMockJavaFile({
            file: createJavaFileInfo({
              isMapper: true,
              relativePath: `src/main/java/com/tamabee/api_hr/mapper/${className}.java`,
            }),
            className,
            lines: methodBody,
            methods: [
              {
                name: "toEntity",
                returnType: `${entityName}Entity`,
                annotations: [],
                line: 1,
                endLine: 5,
                modifier: "public",
              },
            ],
          });

          const violations = rule!.check(file, createMockContext());

          // Phải detect thiếu null check
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].ruleId).toBe("BE-MAP-001");
          expect(violations[0].message).toContain("null check");
        }),
        { numRuns: 100 },
      );
    });
  });
});

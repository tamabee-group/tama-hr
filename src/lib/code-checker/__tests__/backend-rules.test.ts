/**
 * Backend Rules Unit Tests
 * Test các backend rules với các test cases cụ thể
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { ParsedJavaFile, FileInfo, RuleContext } from "../types";

// Architecture Rules
import {
  ServiceInterfacePatternRule,
  MapperComponentAnnotationRule,
  DomainBasedPackageRule,
} from "../rules/backend/architecture-rules";

// Exception Rules
import {
  ErrorCodeEnumRule,
  CustomExceptionRule,
  ExceptionFactoryMethodRule,
} from "../rules/backend/exception-rules";

// Response Rules
import {
  ResponseEntityRule,
  BaseResponseMethodsRule,
  PageableParameterRule,
} from "../rules/backend/response-rules";

// Transaction Rules
import {
  TransactionalWriteRule,
  TransactionalReadRule,
} from "../rules/backend/transaction-rules";

// Repository Rules
import {
  DeletedCheckFirstRule,
  SpringDataJpaNamingRule,
} from "../rules/backend/repository-rules";

// Naming Rules
import {
  EntityNamingRule,
  MapperNamingRule,
  ConstantNamingRule,
} from "../rules/backend/naming-rules";

// Security Rules
import {
  PreAuthorizeRequiredRule,
  AdminPackageRolesRule,
  CompanyPackageRolesRule,
} from "../rules/backend/security-rules";

// Entity Rules
import {
  ExtendBaseEntityRule,
  NoRelationshipAnnotationsRule,
  LongTypeForForeignKeyRule,
} from "../rules/backend/entity-rules";

// Mapper Rules
import {
  MapperNullCheckRule,
  RequiredMapperMethodsRule,
} from "../rules/backend/mapper-rules";

// Comment Rules
import {
  VietnameseCommentsRule,
  NoRequirementCommentsRule,
  NoLabelAnnotationRule,
} from "../rules/backend/comment-rules";

// Helper để tạo mock ParsedJavaFile
function createMockJavaFile(
  overrides: Partial<ParsedJavaFile> = {},
): ParsedJavaFile {
  const defaultFile: FileInfo = {
    path: "/project/src/main/java/com/tamabee/api_hr/service/UserServiceImpl.java",
    relativePath:
      "src/main/java/com/tamabee/api_hr/service/UserServiceImpl.java",
    type: "java",
    isPage: false,
    isComponent: false,
    isService: true,
    isController: false,
    isMapper: false,
    isEntity: false,
    isRepository: false,
  };

  return {
    file: overrides.file || defaultFile,
    lines: overrides.lines || [],
    lineCount: overrides.lineCount || 0,
    imports: overrides.imports || [],
    exports: overrides.exports || [],
    comments: overrides.comments || [],
    hasUseClient: false,
    hasUseServer: false,
    content: overrides.content || "",
    className: overrides.className || "UserServiceImpl",
    packageName: overrides.packageName || "com.tamabee.api_hr.service",
    classAnnotations: overrides.classAnnotations || [],
    methods: overrides.methods || [],
    fields: overrides.fields || [],
    extendsClass: overrides.extendsClass,
    implementsInterfaces: overrides.implementsInterfaces || [],
  };
}

// Helper để tạo mock RuleContext
function createMockContext(): RuleContext {
  return {
    projectRoot: "/project",
    allFiles: [],
    importGraph: {
      importedBy: new Map(),
      imports: new Map(),
    },
  };
}

describe("Backend Rules", () => {
  let context: RuleContext;

  beforeEach(() => {
    context = createMockContext();
  });

  // ============================================
  // Architecture Rules Tests
  // ============================================
  describe("Architecture Rules", () => {
    describe("BE-ARCH-001: ServiceInterfacePatternRule", () => {
      const rule = new ServiceInterfacePatternRule();

      it("should detect ServiceImpl without interface", () => {
        const file = createMockJavaFile({
          className: "UserServiceImpl",
          implementsInterfaces: [],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("không implement interface");
      });

      it("should pass when ServiceImpl implements correct interface", () => {
        const file = createMockJavaFile({
          className: "UserServiceImpl",
          implementsInterfaces: ["IUserService"],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });

    describe("BE-ARCH-002: MapperComponentAnnotationRule", () => {
      const rule = new MapperComponentAnnotationRule();

      it("should detect Mapper without @Component", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/mapper/UserMapper.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/mapper/UserMapper.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: true,
            isEntity: false,
            isRepository: false,
          },
          className: "UserMapper",
          classAnnotations: [],
          lines: ["public class UserMapper {"],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("thiếu @Component");
      });

      it("should pass when Mapper has @Component", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/mapper/UserMapper.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/mapper/UserMapper.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: true,
            isEntity: false,
            isRepository: false,
          },
          className: "UserMapper",
          classAnnotations: [{ name: "Component", parameters: {}, line: 1 }],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });
  });

  // ============================================
  // Exception Rules Tests
  // ============================================
  describe("Exception Rules", () => {
    describe("BE-EXC-001: ErrorCodeEnumRule", () => {
      const rule = new ErrorCodeEnumRule();

      it("should detect hardcoded error codes", () => {
        const file = createMockJavaFile({
          lines: [
            'throw new BadRequestException("INVALID_CREDENTIALS", "Invalid credentials");',
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("Hardcoded error code");
      });

      it("should pass when using ErrorCode enum", () => {
        const file = createMockJavaFile({
          lines: [
            'throw new BadRequestException(ErrorCode.INVALID_CREDENTIALS, "Invalid credentials");',
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });

    describe("BE-EXC-002: CustomExceptionRule", () => {
      const rule = new CustomExceptionRule();

      it("should detect generic exceptions", () => {
        const file = createMockJavaFile({
          lines: ['throw new RuntimeException("Something went wrong");'],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("generic exception");
      });
    });
  });

  // ============================================
  // Response Rules Tests
  // ============================================
  describe("Response Rules", () => {
    describe("BE-RESP-001: ResponseEntityRule", () => {
      const rule = new ResponseEntityRule();

      it("should detect Controller method not returning ResponseEntity", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/controller/UserController.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/controller/UserController.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: true,
            isMapper: false,
            isEntity: false,
            isRepository: false,
          },
          methods: [
            {
              name: "getUser",
              returnType: "User",
              annotations: [{ name: "GetMapping", parameters: {}, line: 1 }],
              line: 2,
              endLine: 5,
              modifier: "public",
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("không return ResponseEntity");
      });

      it("should pass when returning ResponseEntity<BaseResponse>", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/controller/UserController.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/controller/UserController.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: true,
            isMapper: false,
            isEntity: false,
            isRepository: false,
          },
          methods: [
            {
              name: "getUser",
              returnType: "ResponseEntity<BaseResponse<User>>",
              annotations: [{ name: "GetMapping", parameters: {}, line: 1 }],
              line: 2,
              endLine: 5,
              modifier: "public",
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });
  });

  // ============================================
  // Transaction Rules Tests
  // ============================================
  describe("Transaction Rules", () => {
    describe("BE-TXN-001: TransactionalWriteRule", () => {
      const rule = new TransactionalWriteRule();

      it("should detect write method without @Transactional", () => {
        const file = createMockJavaFile({
          methods: [
            {
              name: "createUser",
              returnType: "User",
              annotations: [],
              line: 1,
              endLine: 5,
              modifier: "public",
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("thiếu @Transactional");
      });

      it("should pass when write method has @Transactional", () => {
        const file = createMockJavaFile({
          methods: [
            {
              name: "createUser",
              returnType: "User",
              annotations: [{ name: "Transactional", parameters: {}, line: 1 }],
              line: 2,
              endLine: 5,
              modifier: "public",
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });

    describe("BE-TXN-002: TransactionalReadRule", () => {
      const rule = new TransactionalReadRule();

      it("should detect read method without @Transactional(readOnly)", () => {
        const file = createMockJavaFile({
          methods: [
            {
              name: "getUser",
              returnType: "User",
              annotations: [],
              line: 1,
              endLine: 5,
              modifier: "public",
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain(
          "thiếu @Transactional(readOnly = true)",
        );
      });

      it("should pass when read method has @Transactional(readOnly = true)", () => {
        const file = createMockJavaFile({
          methods: [
            {
              name: "getUser",
              returnType: "User",
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

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });
  });

  // ============================================
  // Repository Rules Tests
  // ============================================
  describe("Repository Rules", () => {
    describe("BE-REPO-001: DeletedCheckFirstRule", () => {
      const rule = new DeletedCheckFirstRule();

      it("should detect query without deleted check", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/repository/UserRepository.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/repository/UserRepository.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: false,
            isEntity: false,
            isRepository: true,
          },
          lines: [
            '@Query("SELECT u FROM UserEntity u WHERE u.email = :email")',
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("thiếu deleted = false");
      });

      it("should pass when deleted check is first", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/repository/UserRepository.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/repository/UserRepository.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: false,
            isEntity: false,
            isRepository: true,
          },
          lines: [
            '@Query("SELECT u FROM UserEntity u WHERE u.deleted = false AND u.email = :email")',
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });
  });

  // ============================================
  // Entity Rules Tests
  // ============================================
  describe("Entity Rules", () => {
    describe("BE-ENT-001: ExtendBaseEntityRule", () => {
      const rule = new ExtendBaseEntityRule();

      it("should detect Entity not extending BaseEntity", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/entity/UserEntity.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/entity/UserEntity.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: false,
            isEntity: true,
            isRepository: false,
          },
          className: "UserEntity",
          classAnnotations: [{ name: "Entity", parameters: {}, line: 1 }],
          extendsClass: undefined,
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("không extend BaseEntity");
      });

      it("should pass when Entity extends BaseEntity", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/entity/UserEntity.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/entity/UserEntity.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: false,
            isEntity: true,
            isRepository: false,
          },
          className: "UserEntity",
          classAnnotations: [{ name: "Entity", parameters: {}, line: 1 }],
          extendsClass: "BaseEntity",
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });

    describe("BE-ENT-002: NoRelationshipAnnotationsRule", () => {
      const rule = new NoRelationshipAnnotationsRule();

      it("should detect @ManyToOne annotation", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/entity/UserEntity.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/entity/UserEntity.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: false,
            isEntity: true,
            isRepository: false,
          },
          fields: [
            {
              name: "company",
              type: "CompanyEntity",
              annotations: [{ name: "ManyToOne", parameters: {}, line: 5 }],
              line: 6,
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("@ManyToOne");
      });
    });
  });

  // ============================================
  // Comment Rules Tests
  // ============================================
  describe("Comment Rules", () => {
    describe("BE-CMT-002: NoRequirementCommentsRule", () => {
      const rule = new NoRequirementCommentsRule();

      it("should detect requirement comments", () => {
        const file = createMockJavaFile({
          comments: [
            {
              content: "Validates: Requirements 1.1, 1.2",
              line: 1,
              endLine: 1,
              isBlock: false,
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("Requirements");
      });

      it("should pass when no requirement comments", () => {
        const file = createMockJavaFile({
          comments: [
            {
              content: "Lấy thông tin user theo ID",
              line: 1,
              endLine: 1,
              isBlock: false,
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });

    describe("BE-CMT-003: NoLabelAnnotationRule", () => {
      const rule = new NoLabelAnnotationRule();

      it("should detect @Label annotation in test files", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/test/java/com/tamabee/api_hr/UserServiceTest.java",
            relativePath:
              "src/test/java/com/tamabee/api_hr/UserServiceTest.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: false,
            isEntity: false,
            isRepository: false,
          },
          lines: ['@Label("Test user creation")'],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("@Label");
      });
    });
  });

  // ============================================
  // Security Rules Tests
  // ============================================
  describe("Security Rules", () => {
    describe("BE-SEC-001: PreAuthorizeRequiredRule", () => {
      const rule = new PreAuthorizeRequiredRule();

      it("should detect Controller method without @PreAuthorize", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/controller/admin/UserController.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/controller/admin/UserController.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: true,
            isMapper: false,
            isEntity: false,
            isRepository: false,
          },
          packageName: "com.tamabee.api_hr.controller.admin",
          methods: [
            {
              name: "getUsers",
              returnType: "ResponseEntity<BaseResponse<List<User>>>",
              annotations: [{ name: "GetMapping", parameters: {}, line: 1 }],
              line: 2,
              endLine: 5,
              modifier: "public",
            },
          ],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("thiếu @PreAuthorize");
      });

      it("should pass when Controller method has @PreAuthorize", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/controller/admin/UserController.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/controller/admin/UserController.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: true,
            isMapper: false,
            isEntity: false,
            isRepository: false,
          },
          packageName: "com.tamabee.api_hr.controller.admin",
          methods: [
            {
              name: "getUsers",
              returnType: "ResponseEntity<BaseResponse<List<User>>>",
              annotations: [
                { name: "GetMapping", parameters: {}, line: 1 },
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

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });
  });

  // ============================================
  // Mapper Rules Tests
  // ============================================
  describe("Mapper Rules", () => {
    describe("BE-MAP-002: RequiredMapperMethodsRule", () => {
      const rule = new RequiredMapperMethodsRule();

      it("should detect missing required methods", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/mapper/UserMapper.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/mapper/UserMapper.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: true,
            isEntity: false,
            isRepository: false,
          },
          className: "UserMapper",
          methods: [
            {
              name: "toEntity",
              returnType: "UserEntity",
              annotations: [],
              line: 1,
              endLine: 5,
              modifier: "public",
            },
          ],
        });

        const violations = rule.check(file, context);
        // Should detect missing toResponse and updateEntity
        expect(violations.length).toBe(2);
      });

      it("should pass when all required methods exist", () => {
        const file = createMockJavaFile({
          file: {
            path: "/project/src/main/java/com/tamabee/api_hr/mapper/UserMapper.java",
            relativePath:
              "src/main/java/com/tamabee/api_hr/mapper/UserMapper.java",
            type: "java",
            isPage: false,
            isComponent: false,
            isService: false,
            isController: false,
            isMapper: true,
            isEntity: false,
            isRepository: false,
          },
          className: "UserMapper",
          methods: [
            {
              name: "toEntity",
              returnType: "UserEntity",
              annotations: [],
              line: 1,
              endLine: 5,
              modifier: "public",
            },
            {
              name: "toResponse",
              returnType: "UserResponse",
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

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });
  });

  // ============================================
  // Naming Rules Tests
  // ============================================
  describe("Naming Rules", () => {
    describe("BE-NAME-003: ConstantNamingRule", () => {
      const rule = new ConstantNamingRule();

      it("should detect non-UPPER_SNAKE_CASE constants", () => {
        const file = createMockJavaFile({
          lines: ['public static final String maxRetryCount = "3";'],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(1);
        expect(violations[0].message).toContain("UPPER_SNAKE_CASE");
      });

      it("should pass when constant uses UPPER_SNAKE_CASE", () => {
        const file = createMockJavaFile({
          lines: ['public static final String MAX_RETRY_COUNT = "3";'],
        });

        const violations = rule.check(file, context);
        expect(violations.length).toBe(0);
      });
    });
  });
});

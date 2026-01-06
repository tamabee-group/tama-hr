import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  isAdminRoute,
  isDashboardRoute,
  checkAdminRouteAccess,
  checkDashboardRouteAccess,
  checkRouteAccess,
  removeLocalePrefix,
} from "./route-protection";
import type { UserRole } from "@/types/enums";
import { TAMABEE_ADMIN_ROLES } from "@/types/auth";

/**
 * Property 5: Admin Route Protection
 * Property 6: Dashboard Route Protection
 * Validates: Requirements 4.1, 4.2, 4.5
 */

// Tất cả UserRole values
const ALL_USER_ROLES: UserRole[] = [
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
  "EMPLOYEE_TAMABEE",
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
  "EMPLOYEE_COMPANY",
];

// Các locale được hỗ trợ
const LOCALES = ["vi", "en", "ja"];

// Generator cho UserRole
const userRoleArb = fc.constantFrom(...ALL_USER_ROLES);

// Generator cho locale
const localeArb = fc.constantFrom(...LOCALES);

// Generator cho path segment (không chứa /)
const pathSegmentArb = fc
  .stringMatching(/^[a-z0-9-]+$/)
  .filter((s) => s.length > 0 && s.length <= 20);

// Generator cho admin paths
const adminPathArb = fc.oneof(
  fc.constant("/admin"),
  fc.tuple(pathSegmentArb).map(([segment]) => `/admin/${segment}`),
  fc
    .tuple(pathSegmentArb, pathSegmentArb)
    .map(([s1, s2]) => `/admin/${s1}/${s2}`),
);

// Generator cho admin paths với locale
const adminPathWithLocaleArb = fc
  .tuple(localeArb, adminPathArb)
  .map(([locale, path]) => `/${locale}${path}`);

// Generator cho dashboard paths
const dashboardPathArb = fc.oneof(
  fc.constant("/dashboard"),
  fc.tuple(pathSegmentArb).map(([segment]) => `/dashboard/${segment}`),
  fc
    .tuple(pathSegmentArb, pathSegmentArb)
    .map(([s1, s2]) => `/dashboard/${s1}/${s2}`),
);

// Generator cho dashboard paths với locale
const dashboardPathWithLocaleArb = fc
  .tuple(localeArb, dashboardPathArb)
  .map(([locale, path]) => `/${locale}${path}`);

// Generator cho tenant domain
const tenantDomainArb = fc.oneof(
  fc.constant("tamabee"),
  fc
    .stringMatching(/^[a-z0-9-]+$/)
    .filter((s) => s.length >= 3 && s.length <= 30),
);

describe("Route Protection - Helper Functions", () => {
  describe("removeLocalePrefix", () => {
    it("should remove locale prefix from path", () => {
      fc.assert(
        fc.property(localeArb, pathSegmentArb, (locale, segment) => {
          const pathWithLocale = `/${locale}/${segment}`;
          const result = removeLocalePrefix(pathWithLocale);
          expect(result).toBe(`/${segment}`);
        }),
        { numRuns: 100 },
      );
    });

    it("should return path unchanged if no locale prefix", () => {
      fc.assert(
        fc.property(pathSegmentArb, (segment) => {
          const path = `/${segment}`;
          const result = removeLocalePrefix(path);
          expect(result).toBe(path);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("isAdminRoute", () => {
    it("should return true for /admin paths", () => {
      fc.assert(
        fc.property(adminPathArb, (path) => {
          expect(isAdminRoute(path)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("should return true for /admin paths with locale", () => {
      fc.assert(
        fc.property(adminPathWithLocaleArb, (path) => {
          expect(isAdminRoute(path)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("should return false for non-admin paths", () => {
      fc.assert(
        fc.property(dashboardPathArb, (path) => {
          expect(isAdminRoute(path)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("isDashboardRoute", () => {
    it("should return true for /dashboard paths", () => {
      fc.assert(
        fc.property(dashboardPathArb, (path) => {
          expect(isDashboardRoute(path)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("should return true for /dashboard paths with locale", () => {
      fc.assert(
        fc.property(dashboardPathWithLocaleArb, (path) => {
          expect(isDashboardRoute(path)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("should return false for non-dashboard paths", () => {
      fc.assert(
        fc.property(adminPathArb, (path) => {
          expect(isDashboardRoute(path)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });
});

describe("Route Protection - Property 5: Admin Route Protection", () => {
  /**
   * Property 5: Admin Route Protection
   * For any request to /admin/* routes, the middleware SHALL allow access
   * only for users with ADMIN_TAMABEE or MANAGER_TAMABEE role.
   * All other roles SHALL be redirected to /unauthorized.
   * Validates: Requirements 4.1
   */

  it("should allow ADMIN_TAMABEE and MANAGER_TAMABEE to access admin routes", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "ADMIN_TAMABEE",
          "MANAGER_TAMABEE",
        ) as fc.Arbitrary<UserRole>,
        (role) => {
          const result = checkAdminRouteAccess(role);
          expect(result.allowed).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should deny non-Tamabee-admin roles from admin routes", () => {
    // Lọc ra các roles không phải Tamabee admin
    const nonTamabeeAdminRoles = ALL_USER_ROLES.filter(
      (role) => !TAMABEE_ADMIN_ROLES.includes(role),
    );

    fc.assert(
      fc.property(fc.constantFrom(...nonTamabeeAdminRoles), (role) => {
        const result = checkAdminRouteAccess(role);
        expect(result.allowed).toBe(false);
        if (!result.allowed) {
          expect(result.reason).toBe("unauthorized_role");
        }
      }),
      { numRuns: 100 },
    );
  });

  it("should correctly check admin route access for any role", () => {
    fc.assert(
      fc.property(userRoleArb, (role) => {
        const result = checkAdminRouteAccess(role);

        // Nếu role là Tamabee admin, phải được phép
        if (TAMABEE_ADMIN_ROLES.includes(role)) {
          expect(result.allowed).toBe(true);
        } else {
          // Ngược lại, phải bị từ chối
          expect(result.allowed).toBe(false);
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe("Route Protection - Property 6: Dashboard Route Protection", () => {
  /**
   * Property 6: Dashboard Route Protection
   * For any request to /dashboard/* routes, the middleware SHALL allow access
   * only for users with valid tenantDomain in JWT (including "tamabee").
   * Users without tenantDomain SHALL be redirected to /unauthorized.
   * Validates: Requirements 4.2, 4.5
   */

  it("should allow access when tenantDomain is present", () => {
    fc.assert(
      fc.property(tenantDomainArb, (tenantDomain) => {
        const result = checkDashboardRouteAccess(tenantDomain);
        expect(result.allowed).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("should allow Tamabee users (tenantDomain = 'tamabee') to access dashboard", () => {
    const result = checkDashboardRouteAccess("tamabee");
    expect(result.allowed).toBe(true);
  });

  it("should deny access when tenantDomain is null or undefined", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined) as fc.Arbitrary<null | undefined>,
        (tenantDomain) => {
          const result = checkDashboardRouteAccess(tenantDomain);
          expect(result.allowed).toBe(false);
          if (!result.allowed) {
            expect(result.reason).toBe("missing_tenant_domain");
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should deny access when tenantDomain is empty string", () => {
    const result = checkDashboardRouteAccess("");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("missing_tenant_domain");
    }
  });
});

describe("Route Protection - Combined checkRouteAccess", () => {
  it("should check admin routes correctly", () => {
    fc.assert(
      fc.property(
        adminPathWithLocaleArb,
        userRoleArb,
        tenantDomainArb,
        (path, role, tenantDomain) => {
          const result = checkRouteAccess(path, role, tenantDomain);

          // Admin route chỉ check role, không check tenantDomain
          if (TAMABEE_ADMIN_ROLES.includes(role)) {
            expect(result.allowed).toBe(true);
          } else {
            expect(result.allowed).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should check dashboard routes correctly", () => {
    fc.assert(
      fc.property(
        dashboardPathWithLocaleArb,
        userRoleArb,
        fc.option(tenantDomainArb, { nil: undefined }),
        (path, role, tenantDomain) => {
          const result = checkRouteAccess(path, role, tenantDomain);

          // Dashboard route chỉ check tenantDomain, không check role
          if (tenantDomain) {
            expect(result.allowed).toBe(true);
          } else {
            expect(result.allowed).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should allow other routes for any user", () => {
    fc.assert(
      fc.property(
        pathSegmentArb,
        userRoleArb,
        fc.option(tenantDomainArb, { nil: undefined }),
        (segment, role, tenantDomain) => {
          // Path không phải admin hoặc dashboard
          const path = `/other/${segment}`;
          const result = checkRouteAccess(path, role, tenantDomain);

          // Các routes khác luôn được phép
          expect(result.allowed).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

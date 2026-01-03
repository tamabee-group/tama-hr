import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  isSettingsTabVisible,
  getVisibleSettingsTabs,
  isSettingsSectionVisible,
  SettingsTabKey,
} from "@/lib/utils/settings-visibility";
import { WorkMode } from "@/types/attendance-config";

/**
 * Property-Based Tests cho Settings Visibility
 * Feature: work-schedule-redesign
 * Property 7: Settings Sections Visibility by Work Mode
 */

// Arbitrary cho SettingsTabKey
const settingsTabKeyArbitrary = fc.constantFrom<SettingsTabKey>(
  "workMode",
  "attendance",
  "payroll",
  "overtime",
  "allowance",
  "deduction",
);

// Arbitrary cho WorkMode
const workModeArbitrary = fc.constantFrom<WorkMode>(
  WorkMode.FIXED_HOURS,
  WorkMode.FLEXIBLE_SHIFT,
);

// Arbitrary để tạo TabItem ngẫu nhiên
const tabItemArbitrary = fc.record({
  key: settingsTabKeyArbitrary,
  icon: fc.constant(null as unknown),
});

describe("Settings Visibility - Property Tests", () => {
  /**
   * Property 7: Settings Sections Visibility by Work Mode
   * For any work mode, the settings page should show/hide sections appropriately
   */
  describe("Property 7: Settings Sections Visibility by Work Mode", () => {
    it("workMode tab phải luôn hiển thị ở cả hai modes", () => {
      fc.assert(
        fc.property(workModeArbitrary, (workMode) => {
          const isVisible = isSettingsTabVisible("workMode", workMode);
          expect(isVisible).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("attendance tab phải luôn hiển thị ở cả hai modes", () => {
      fc.assert(
        fc.property(workModeArbitrary, (workMode) => {
          const isVisible = isSettingsTabVisible("attendance", workMode);
          expect(isVisible).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("payroll tab phải luôn hiển thị ở cả hai modes", () => {
      fc.assert(
        fc.property(workModeArbitrary, (workMode) => {
          const isVisible = isSettingsTabVisible("payroll", workMode);
          expect(isVisible).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("overtime tab phải luôn hiển thị ở cả hai modes", () => {
      fc.assert(
        fc.property(workModeArbitrary, (workMode) => {
          const isVisible = isSettingsTabVisible("overtime", workMode);
          expect(isVisible).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("allowance tab phải luôn hiển thị ở cả hai modes", () => {
      fc.assert(
        fc.property(workModeArbitrary, (workMode) => {
          const isVisible = isSettingsTabVisible("allowance", workMode);
          expect(isVisible).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("deduction tab phải luôn hiển thị ở cả hai modes", () => {
      fc.assert(
        fc.property(workModeArbitrary, (workMode) => {
          const isVisible = isSettingsTabVisible("deduction", workMode);
          expect(isVisible).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("getVisibleSettingsTabs phải trả về tất cả tabs khi tất cả đều visible", () => {
      fc.assert(
        fc.property(
          fc.array(tabItemArbitrary, { minLength: 1, maxLength: 6 }),
          workModeArbitrary,
          (tabs, workMode) => {
            const visibleTabs = getVisibleSettingsTabs(
              tabs as { key: SettingsTabKey }[],
              workMode,
            );

            // Vì tất cả tabs đều visible, số lượng phải bằng nhau
            expect(visibleTabs.length).toBe(tabs.length);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("getVisibleSettingsTabs phải preserve thứ tự của tabs", () => {
      fc.assert(
        fc.property(
          fc.array(tabItemArbitrary, { minLength: 2, maxLength: 6 }),
          workModeArbitrary,
          (tabs, workMode) => {
            const visibleTabs = getVisibleSettingsTabs(
              tabs as { key: SettingsTabKey }[],
              workMode,
            );

            // Thứ tự phải được giữ nguyên
            for (let i = 0; i < visibleTabs.length; i++) {
              expect(visibleTabs[i].key).toBe(tabs[i].key);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("isSettingsSectionVisible phải trả về true cho sections không có config", () => {
      fc.assert(
        fc.property(
          settingsTabKeyArbitrary,
          fc.string({ minLength: 1, maxLength: 20 }),
          workModeArbitrary,
          (tabKey, sectionKey, workMode) => {
            // Với section key ngẫu nhiên không có trong config, phải trả về true
            const randomSectionKey = `random_${sectionKey}`;
            const isVisible = isSettingsSectionVisible(
              tabKey,
              randomSectionKey,
              workMode,
            );
            expect(isVisible).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("visibility phải consistent - cùng input cho cùng output", () => {
      fc.assert(
        fc.property(
          settingsTabKeyArbitrary,
          workModeArbitrary,
          (tabKey, workMode) => {
            const result1 = isSettingsTabVisible(tabKey, workMode);
            const result2 = isSettingsTabVisible(tabKey, workMode);
            expect(result1).toBe(result2);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("getVisibleSettingsTabs phải idempotent", () => {
      fc.assert(
        fc.property(
          fc.array(tabItemArbitrary, { minLength: 1, maxLength: 6 }),
          workModeArbitrary,
          (tabs, workMode) => {
            const filtered1 = getVisibleSettingsTabs(
              tabs as { key: SettingsTabKey }[],
              workMode,
            );
            const filtered2 = getVisibleSettingsTabs(filtered1, workMode);

            expect(filtered1.length).toBe(filtered2.length);
            for (let i = 0; i < filtered1.length; i++) {
              expect(filtered1[i].key).toBe(filtered2[i].key);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

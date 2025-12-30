import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  isTransactionsSortedDescending,
  isTransactionsMatchFilter,
} from "@/app/[locale]/(AdminLayout)/company/wallet/_transaction-table";
import {
  WalletTransactionResponse,
  TransactionFilterRequest,
} from "@/types/wallet";
import { TransactionType } from "@/types/enums";

/**
 * Property-Based Tests cho Transaction Table
 * Feature: wallet-management-ui
 */

// Arbitrary để generate WalletTransactionResponse
const transactionTypeArb = fc.constantFrom<TransactionType>(
  "DEPOSIT",
  "BILLING",
  "REFUND",
  "COMMISSION",
);

// Generate chuỗi ngày ISO hợp lệ
const validDateStringArb = fc
  .integer({ min: 1704067200000, max: 1767225600000 }) // 2024-01-01 đến 2025-12-31 tính bằng ms
  .map((timestamp) => new Date(timestamp).toISOString());

const transactionArb = (
  createdAt?: string,
): fc.Arbitrary<WalletTransactionResponse> =>
  fc.record({
    id: fc.integer({ min: 1, max: 100000 }),
    transactionType: transactionTypeArb,
    amount: fc.integer({ min: 1, max: 10000000 }),
    balanceBefore: fc.integer({ min: 0, max: 100000000 }),
    balanceAfter: fc.integer({ min: 0, max: 100000000 }),
    description: fc.string({ minLength: 0, maxLength: 100 }),
    createdAt: createdAt ? fc.constant(createdAt) : validDateStringArb,
  });

// Generate danh sách transactions đã sắp xếp giảm dần theo createdAt
const sortedTransactionsArb = fc
  .array(
    fc.integer({ min: 1704067200000, max: 1767225600000 }), // timestamps
    { minLength: 0, maxLength: 20 },
  )
  .chain((timestamps) => {
    // Sắp xếp timestamps giảm dần
    const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
    const dateStrings = sortedTimestamps.map((ts) =>
      new Date(ts).toISOString(),
    );
    return fc.tuple(...dateStrings.map((dateStr) => transactionArb(dateStr)));
  })
  .map((transactions) => transactions as WalletTransactionResponse[]);

// Generate danh sách transactions không sắp xếp
const unsortedTransactionsArb = fc
  .array(fc.integer({ min: 1704067200000, max: 1767225600000 }), {
    minLength: 2,
    maxLength: 20,
  })
  .filter((timestamps) => {
    // Đảm bảo có ít nhất 2 timestamps không theo thứ tự giảm dần
    for (let i = 0; i < timestamps.length - 1; i++) {
      if (timestamps[i] < timestamps[i + 1]) {
        return true;
      }
    }
    return false;
  })
  .chain((timestamps) => {
    const dateStrings = timestamps.map((ts) => new Date(ts).toISOString());
    return fc.tuple(...dateStrings.map((dateStr) => transactionArb(dateStr)));
  })
  .map((transactions) => transactions as WalletTransactionResponse[]);

describe("TransactionTable - Property Tests", () => {
  /**
   * Property 5: Thứ tự giao dịch
   *
   * Với bất kỳ danh sách transactions nào hiển thị trong Transaction_Table,
   * transactions PHẢI được sắp xếp theo createdAt giảm dần (mới nhất trước).
   */
  describe("Property 5: Thứ tự giao dịch", () => {
    it("phải trả về true cho mảng rỗng", () => {
      expect(isTransactionsSortedDescending([])).toBe(true);
    });

    it("phải trả về true cho một transaction duy nhất", () => {
      fc.assert(
        fc.property(transactionArb(), (transaction) => {
          expect(isTransactionsSortedDescending([transaction])).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("phải trả về true cho transactions đã sắp xếp đúng (giảm dần theo createdAt)", () => {
      fc.assert(
        fc.property(sortedTransactionsArb, (transactions) => {
          expect(isTransactionsSortedDescending(transactions)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("phải trả về false cho transactions sắp xếp sai", () => {
      fc.assert(
        fc.property(unsortedTransactionsArb, (transactions) => {
          expect(isTransactionsSortedDescending(transactions)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("phải xác định đúng thứ tự sắp xếp cho bất kỳ transactions ngẫu nhiên nào", () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb(), { minLength: 0, maxLength: 20 }),
          (transactions) => {
            const result = isTransactionsSortedDescending(transactions);

            // Kiểm tra thủ công
            let expectedResult = true;
            for (let i = 0; i < transactions.length - 1; i++) {
              const current = new Date(transactions[i].createdAt).getTime();
              const next = new Date(transactions[i + 1].createdAt).getTime();
              if (current < next) {
                expectedResult = false;
                break;
              }
            }

            expect(result).toBe(expectedResult);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 6: Tính nhất quán của Filter
   *
   * Với bất kỳ filter nào được áp dụng trong Transaction_Table,
   * kết quả PHẢI chỉ chứa items khớp với tiêu chí filter.
   */
  describe("Property 6: Tính nhất quán của Filter", () => {
    it("phải trả về true cho transactions rỗng với bất kỳ filter nào", () => {
      fc.assert(
        fc.property(
          fc.record({
            transactionType: fc.option(transactionTypeArb, { nil: undefined }),
            startDate: fc.option(
              fc
                .date({
                  min: new Date("2024-01-01"),
                  max: new Date("2025-12-31"),
                  noInvalidDate: true,
                })
                .map((d) => d.toISOString().split("T")[0]),
              { nil: undefined },
            ),
            endDate: fc.option(
              fc
                .date({
                  min: new Date("2024-01-01"),
                  max: new Date("2025-12-31"),
                  noInvalidDate: true,
                })
                .map((d) => d.toISOString().split("T")[0]),
              { nil: undefined },
            ),
          }),
          (filter: TransactionFilterRequest) => {
            expect(isTransactionsMatchFilter([], filter)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải trả về true khi không áp dụng filter", () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb(), { minLength: 0, maxLength: 20 }),
          (transactions) => {
            expect(isTransactionsMatchFilter(transactions, {})).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải filter đúng theo transactionType", () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb(), { minLength: 1, maxLength: 20 }),
          transactionTypeArb,
          (transactions, filterType) => {
            const filter: TransactionFilterRequest = {
              transactionType: filterType,
            };
            const result = isTransactionsMatchFilter(transactions, filter);

            // Kiểm tra thủ công
            const allMatch = transactions.every(
              (t) => t.transactionType === filterType,
            );

            expect(result).toBe(allMatch);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải filter đúng theo khoảng ngày", () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb(), { minLength: 1, maxLength: 10 }),
          fc.date({
            min: new Date("2024-01-01"),
            max: new Date("2024-06-30"),
            noInvalidDate: true,
          }),
          fc.date({
            min: new Date("2024-07-01"),
            max: new Date("2025-12-31"),
            noInvalidDate: true,
          }),
          (transactions, startDateObj, endDateObj) => {
            const startDate = startDateObj.toISOString().split("T")[0];
            const endDate = endDateObj.toISOString().split("T")[0];

            const filter: TransactionFilterRequest = { startDate, endDate };
            const result = isTransactionsMatchFilter(transactions, filter);

            // Kiểm tra thủ công
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const allMatch = transactions.every((t) => {
              const transactionDate = new Date(t.createdAt);
              return transactionDate >= start && transactionDate <= end;
            });

            expect(result).toBe(allMatch);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải filter đúng theo tiêu chí kết hợp", () => {
      fc.assert(
        fc.property(
          fc.array(transactionArb(), { minLength: 1, maxLength: 10 }),
          transactionTypeArb,
          fc.date({
            min: new Date("2024-01-01"),
            max: new Date("2024-12-31"),
            noInvalidDate: true,
          }),
          (transactions, filterType, startDateObj) => {
            const startDate = startDateObj.toISOString().split("T")[0];

            const filter: TransactionFilterRequest = {
              transactionType: filterType,
              startDate,
            };
            const result = isTransactionsMatchFilter(transactions, filter);

            // Kiểm tra thủ công
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const allMatch = transactions.every((t) => {
              const transactionDate = new Date(t.createdAt);
              return (
                t.transactionType === filterType && transactionDate >= start
              );
            });

            expect(result).toBe(allMatch);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

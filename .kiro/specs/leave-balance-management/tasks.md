# Implementation Plan: Leave Balance Management

## Overview

- Tạo tính năng quản lý số ngày nghỉ phép cho Admin/Manager công ty. Bao gồm API endpoints, trang quản lý, và dialogs để cập nhật số ngày phép.

- Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt.

## Tasks

- [ ] 1. Tạo DTOs cho Leave Balance API
  - [x] 1.1 Tạo `UpdateLeaveBalanceRequest.java`
    - Fields: year (Integer), leaveType (LeaveType), totalDays (Integer)
    - File: `api-hr/src/main/java/com/tamabee/api_hr/dto/request/leave/UpdateLeaveBalanceRequest.java`
    - _Requirements: 1.2_
  - [x] 1.2 Tạo `BulkAllocateLeaveRequest.java`
    - Fields: year, leaveType, totalDays, employeeIds (List<Long>, optional)
    - File: `api-hr/src/main/java/com/tamabee/api_hr/dto/request/leave/BulkAllocateLeaveRequest.java`
    - _Requirements: 2.2_
  - [x] 1.3 Tạo `LeaveBalanceSummaryResponse.java`
    - Fields: employeeId, employeeName, employeeCode, balances (List<LeaveBalanceResponse>)
    - File: `api-hr/src/main/java/com/tamabee/api_hr/dto/response/leave/LeaveBalanceSummaryResponse.java`
    - _Requirements: 3.5_
  - [x] 1.4 Tạo `BulkAllocateResponse.java`
    - Fields: updatedCount (Integer)
    - File: `api-hr/src/main/java/com/tamabee/api_hr/dto/response/leave/BulkAllocateResponse.java`
    - _Requirements: 2.4_

- [ ] 2. Cập nhật Repository
  - [x] 2.1 Thêm query methods vào `LeaveBalanceRepository.java`
    - Thêm `findByYearAndEmployeeIdIn(Integer year, List<Long> employeeIds)`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/repository/leave/LeaveBalanceRepository.java`
    - _Requirements: 3.2_

- [ ] 3. Cập nhật Service Interface và Implementation
  - [x] 3.1 Thêm methods vào `ILeaveService.java`
    - `Page<LeaveBalanceSummaryResponse> getAllLeaveBalances(Integer year, String search, Pageable pageable)`
    - `LeaveBalanceResponse updateEmployeeLeaveBalance(Long employeeId, UpdateLeaveBalanceRequest request)`
    - `BulkAllocateResponse bulkAllocateLeaveBalance(BulkAllocateLeaveRequest request)`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/service/company/interfaces/ILeaveService.java`
    - _Requirements: 1.1, 2.1, 3.1_
  - [x] 3.2 Implement methods trong `LeaveServiceImpl.java`
    - Implement `getAllLeaveBalances`: query employees với balances, group by employee
    - Implement `updateEmployeeLeaveBalance`: create or update balance record
    - Implement `bulkAllocateLeaveBalance`: loop employees và create/update balances
    - File: `api-hr/src/main/java/com/tamabee/api_hr/service/company/impl/LeaveServiceImpl.java`
    - _Requirements: 1.3, 1.4, 1.5, 2.3_

- [ ] 4. Tạo Controller endpoints
  - [x] 4.1 Tạo `LeaveBalanceController.java`
    - GET `/api/company/leave-balances` với params: year, search, page, size
    - POST `/api/company/leave-balances/bulk` cho bulk allocation
    - File: `api-hr/src/main/java/com/tamabee/api_hr/controller/company/LeaveBalanceController.java`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 2.1_
  - [x] 4.2 Thêm endpoint vào `CompanyEmployeeController.java`
    - PUT `/api/company/employees/{id}/leave-balance`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/controller/company/CompanyEmployeeController.java`
    - _Requirements: 1.1, 1.6_

- [x] 5. Checkpoint - Verify Backend Changes
  - Chạy `./mvnw compile` để verify không có compile errors

- [ ] 6. Tạo Frontend API functions
  - [x] 6.1 Tạo `leave-balance-api.ts`
    - `getAllLeaveBalances(year, search, page, size)`
    - `updateEmployeeLeaveBalance(employeeId, data)`
    - `bulkAllocateLeaveBalance(data)`
    - File: `tama-hr/src/lib/apis/leave-balance-api.ts`
    - _Requirements: 4.1_

- [ ] 7. Tạo trang Leave Balance Management
  - [x] 7.1 Tạo `page.tsx` server component
    - File: `tama-hr/src/app/[locale]/(DashboardLayout)/dashboard/leave-balances/page.tsx`
    - _Requirements: 4.1_
  - [x] 7.2 Tạo `_leave-balance-content.tsx`
    - State management, data fetching, filters
    - File: `tama-hr/src/app/[locale]/(DashboardLayout)/dashboard/leave-balances/_leave-balance-content.tsx`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 7.3 Tạo `_leave-balance-table.tsx`
    - Table với columns: STT, Employee, Code, ANNUAL, SICK, Actions
    - File: `tama-hr/src/app/[locale]/(DashboardLayout)/dashboard/leave-balances/_leave-balance-table.tsx`
    - _Requirements: 4.2_

- [ ] 8. Tạo Dialogs
  - [x] 8.1 Tạo `_update-balance-dialog.tsx`
    - Dialog cập nhật số ngày phép cho 1 nhân viên
    - File: `tama-hr/src/app/[locale]/(DashboardLayout)/dashboard/leave-balances/_update-balance-dialog.tsx`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 8.2 Tạo `_bulk-allocate-dialog.tsx`
    - Dialog cấp phát hàng loạt
    - File: `tama-hr/src/app/[locale]/(DashboardLayout)/dashboard/leave-balances/_bulk-allocate-dialog.tsx`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 9. Cập nhật Sidebar Navigation
  - [x] 9.1 Thêm menu item vào sidebar config
    - Key: "leave-balances", Label: t("navigation.leaveBalances"), href: "/dashboard/leave-balances"
    - File: `tama-hr/src/app/[locale]/(DashboardLayout)/dashboard/_components/_sidebar-config.tsx`
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 10. Thêm Translations
  - [x] 10.1 Tạo `vi/leaveBalance.json`
    - File: `tama-hr/messages/vi/leaveBalance.json`
    - _Requirements: 8.1_
  - [x] 10.2 Tạo `en/leaveBalance.json`
    - File: `tama-hr/messages/en/leaveBalance.json`
    - _Requirements: 8.2_
  - [x] 10.3 Tạo `ja/leaveBalance.json`
    - File: `tama-hr/messages/ja/leaveBalance.json`
    - _Requirements: 8.3_
  - [x] 10.4 Thêm navigation label vào sidebar translations
    - Thêm `navigation.leaveBalances` vào vi/en/ja dashboard.json
    - _Requirements: 7.2_

- [x] 11. Final Checkpoint - Verify All Changes
  - Chạy `npx tsc --noEmit` để verify TypeScript không có errors

## Notes

- Chỉ ANNUAL và SICK có giới hạn số ngày, các loại khác không cần quản lý
- Mỗi năm có balance riêng biệt
- `remainingDays = totalDays - usedDays`

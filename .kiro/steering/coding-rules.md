# Coding Rules

## Navigation

- Sử dụng `router.push()` từ `next/navigation` để chuyển trang thay vì `window.location.href` hoặc `<a href>` để đảm bảo client-side navigation mượt mà và giữ state của ứng dụng.
- Với các link tĩnh, sử dụng component `<Link>` từ `next/link`.

## API Calls

- Client side: sử dụng `apiClient` từ `@/lib/utils/fetch-client`
- Server side: sử dụng `apiServer` từ `@/lib/utils/fetch-server`
- Khi gọi API phân trang, khai báo constants tường minh: `DEFAULT_PAGE`, `DEFAULT_LIMIT` và truyền tham số `page`, `limit` vào hàm

## Authentication

- Sử dụng `useAuth()` hook để truy cập thông tin user và các hàm auth
- Không truy cập localStorage trực tiếp, sử dụng các hàm từ `@/lib/auth`

## Comments

- Viết comment bằng tiếng Việt
- Ghi chú `@client-only` hoặc `@server-only` cho các hàm chỉ dùng được ở một môi trường

## Types & Enums

- Định nghĩa types trong `types/` directory
- Sử dụng constants từ `types/enums.ts` cho các giá trị cố định (roles, genders, statuses)
- Derive types từ constants để tránh duplicate: `type UserRole = keyof typeof USER_ROLE_LABELS`
- Không sử dụng `any` type

## Components

- Sử dụng `BaseTable` từ `@/app/[locale]/_components/_base/BaseTable` cho data tables
- Sử dụng `BaseSidebar` cho sidebar navigation
- Icon trong sidebar items là `ReactNode` (JSX element), không phải string

## Backend (Java/Spring Boot)

### Exception Handling

- Sử dụng `ErrorCode` enum từ `com.tamabee.api_hr.enums.ErrorCode` cho tất cả error codes
- Không hardcode error code string, luôn dùng enum: `ErrorCode.INVALID_CREDENTIALS` thay vì `"INVALID_CREDENTIALS"`
- Sử dụng các custom exception: `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `InternalServerException`
- Ưu tiên sử dụng static factory methods: `NotFoundException.user(id)`, `ConflictException.emailExists(email)`, `InternalServerException.fileUploadFailed(cause)`

### Response

- Controller trả về `ResponseEntity<BaseResponse<T>>` để kiểm soát HTTP status code
- Sử dụng `BaseResponse.success()`, `BaseResponse.created()`, `BaseResponse.error()` để tạo response

### Locale/Timezone

- Sử dụng `LocaleUtil.toTimezone()` để chuyển đổi locale code (vi, ja) sang timezone (Asia/Ho_Chi_Minh, Asia/Tokyo)
- Khi tạo user, locale được lưu dưới dạng timezone format

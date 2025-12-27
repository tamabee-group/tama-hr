# Kiro Coding Rules

## Navigation

### Client-Side Navigation

Sử dụng Next.js navigation để đảm bảo client-side navigation mượt mà và giữ state của ứng dụng.

```typescript
// ✅ Good - Sử dụng router.push() cho navigation động
import { useRouter } from "next/navigation";

const router = useRouter();
router.push("/dashboard");

// ✅ Good - Sử dụng Link cho navigation tĩnh
import Link from "next/link";

<Link href="/about">About</Link>

// ❌ Bad - Không sử dụng window.location hoặc <a href>
window.location.href = "/dashboard";
<a href="/about">About</a>
```

## API Calls

### Client-Side API

```typescript
// ✅ Good - Sử dụng apiClient cho client-side
import { apiClient } from "@/lib/utils";

const data = await apiClient.get<User>("/api/users/1");
await apiClient.post("/api/users", { name: "John" });
```

### Server-Side API

```typescript
// ✅ Good - Sử dụng apiServer cho server-side
import { apiServer } from "@/lib/utils";

const data = await apiServer.get<User>("/api/users/1");
```

### Pagination Constants

Khi gọi API phân trang, khai báo constants tường minh:

```typescript
// ✅ Good - Khai báo constants cho pagination
const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

async function getUsers(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT
): Promise<User[]> {
  const result = await apiServer.get<PageResponse<User>>(
    `/api/admin/users?page=${page}&size=${limit}`
  );
  return result.content;
}

// ❌ Bad - Hardcode giá trị
const result = await apiServer.get("/api/admin/users?page=0&size=10");
```

## Authentication

### useAuth Hook

```typescript
// ✅ Good - Sử dụng useAuth() hook
import { useAuth } from "@/hooks/useAuth";

const { user, logout, isAuthenticated } = useAuth();

// ❌ Bad - Truy cập localStorage trực tiếp
const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
```

### Auth Functions

```typescript
// ✅ Good - Sử dụng các hàm từ @/lib/auth
import { getAccessToken, setTokens, clearTokens } from "@/lib/auth";

const token = getAccessToken();
```

## Comments

### Language

- Viết comment bằng tiếng Việt
- Ghi chú `@client-only` hoặc `@server-only` cho các hàm chỉ dùng được ở một môi trường

```typescript
/**
 * Lấy danh sách người dùng từ API
 * @server-only
 */
async function getUsers(): Promise<User[]> {
  // Gọi API server-side
  return await apiServer.get<User[]>("/api/users");
}

/**
 * Xử lý đăng xuất người dùng
 * @client-only
 */
function handleLogout(): void {
  // Xóa token và chuyển hướng
  clearTokens();
  router.push("/login");
}
```

## Best Practices

### Type Safety

- Không sử dụng `any` type
- Định nghĩa types trong `types/` directory
- Sử dụng generics cho các hàm reusable

### Error Handling

- Wrap API calls trong try-catch
- Hiển thị error message thân thiện với user
- Log errors để debug

### Loading States

- Sử dụng Suspense cho Server Components
- Sử dụng loading states cho Client Components
- Hiển thị skeleton loaders

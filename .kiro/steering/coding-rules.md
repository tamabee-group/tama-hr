# Frontend Coding Rules (Next.js/TypeScript)

## Navigation

- Sử dụng `router.push()` từ `next/navigation` để chuyển trang
- Với các link tĩnh, sử dụng component `<Link>` từ `next/link`
- KHÔNG dùng `window.location.href` hoặc `<a href>`

## API Calls

- Client side: sử dụng `apiClient` từ `@/lib/utils/fetch-client`
- Server side: sử dụng `apiServer` từ `@/lib/utils/fetch-server`
- Khi gọi API phân trang, khai báo constants: `DEFAULT_PAGE`, `DEFAULT_LIMIT`

## Authentication

- Sử dụng `useAuth()` hook để truy cập thông tin user
- Không truy cập localStorage trực tiếp, sử dụng các hàm từ `@/lib/auth`

## Comments

- Viết comment bằng tiếng Việt
- Ghi chú `@client-only` hoặc `@server-only` cho các hàm chỉ dùng được ở một môi trường
- KHÔNG comment "Requirements" hoặc "Validates: Requirements" trong code

## Types & Enums

- Định nghĩa types trong `types/` directory
- Sử dụng constants từ `types/enums.ts` cho các giá trị cố định (chỉ chứa enum values, KHÔNG chứa translations)
- Derive types từ constants: `type UserRole = keyof typeof UserRole`
- KHÔNG sử dụng `any` type

## Components

- Sử dụng `BaseTable` từ `@/app/[locale]/_components/_base/base-table` cho data tables
- Sử dụng `BaseSidebar` từ `@/app/[locale]/_components/_base/base-sidebar` cho sidebar navigation
- Icon trong sidebar items là `ReactNode` (JSX element), không phải string
- Server Components by default, `'use client'` only when needed
- **File quá dài phải tách nhỏ**: Khi file component vượt quá 250 dòng, PHẢI tách thành các sub-components nhỏ hơn
  - Tách logic phức tạp thành custom hooks (`use-*.ts`)
  - Tách UI sections thành internal components (`_component-name.tsx`)
  - Mỗi component chỉ nên có 1 responsibility chính

## Shadcn/UI Components

- Khi thiếu component từ shadcn/ui, thêm bằng lệnh: `npx shadcn@latest add <component>`
- **KHÔNG** dùng flag `-y` (auto-confirm) vì có thể ghi đè lên component đã được customize
- Kiểm tra kỹ diff trước khi confirm để tránh mất code custom
- Components shadcn nằm trong `components/ui/`

## Statistics Cards

- KHÔNG sử dụng icons trong statistics cards - giữ giao diện gọn gàng, tránh "AI-generated" look
- Cấu trúc card đơn giản: label (text-sm text-muted-foreground) + value (text-2xl font-bold)
- Sử dụng màu sắc cho value để phân biệt ý nghĩa:
  - Xanh lá (text-green-600): số tiền, giá trị tích cực
  - Vàng (text-yellow-600): cảnh báo, chờ xử lý
  - Xanh dương (text-blue-600): thông tin, trạng thái trung lập
  - Đỏ (text-red-600): lỗi, giá trị tiêu cực
- Grid responsive: `grid-cols-2 lg:grid-cols-4`
- Card styling: `<Card className="py-2">` với `<CardContent>` (không dùng CardHeader)

```tsx
// Ví dụ chuẩn
<Card className="py-2">
  <CardContent>
    <p className="text-sm text-muted-foreground">{t("label")}</p>
    <p className="text-2xl font-bold text-green-600">{value}</p>
  </CardContent>
</Card>
```

## Performance

- Use Suspense boundaries với skeleton loaders
- Lazy load heavy components với `dynamic()`
- Optimize images với `next/image`
- Debounce search inputs (500ms)

## i18n (Internationalization)

### Cấu trúc Message Files

- Locales: `vi`, `en`, `ja`
- Translation files: `messages/{locale}.json`
- Namespaces: `common`, `auth`, `header`, `deposits`, `plans`, `companies`, `wallet`, `users`, `settings`, `enums`, `errors`, `validation`, `dialogs`, `commissions`, `shifts`, `salaryConfig`, `contracts`, `allowances`, `deductions`, `payroll`
- Key naming: camelCase, **TỐI ĐA 3 cấp** (namespace.group.key)

### Quy tắc độ sâu i18n keys (Max 3 Levels)

- **Tối đa 3 cấp**: `namespace.group.key` - KHÔNG được sâu hơn
- Cấp 1: Namespace (e.g., `shifts`, `payroll`, `contracts`)
- Cấp 2: Group hoặc key trực tiếp (e.g., `table`, `messages`, hoặc `title`)
- Cấp 3: Key cuối cùng (e.g., `employee`, `createSuccess`)

```json
// ✅ ĐÚNG - Tối đa 3 cấp
{
  "shifts": {
    "title": "Quản lý ca",                    // 2 cấp: shifts.title
    "templatesTitle": "Mẫu ca làm việc",      // 2 cấp: shifts.templatesTitle
    "templateCreateSuccess": "Tạo thành công", // 2 cấp: shifts.templateCreateSuccess
    "table": {
      "employee": "Nhân viên",                // 3 cấp: shifts.table.employee
      "status": "Trạng thái"                  // 3 cấp: shifts.table.status
    }
  }
}

// ❌ SAI - Quá 3 cấp (4 cấp)
{
  "shifts": {
    "templates": {
      "form": {
        "name": "Tên ca"                      // 4 cấp: shifts.templates.form.name
      }
    }
  }
}
```

- **Flatten nested keys**: Thay vì `shifts.templates.form.name`, dùng `shifts.templateName`
- **Group chỉ cho table columns**: Chỉ dùng group (cấp 2) cho `table`, `messages` khi cần thiết
- **Prefix cho context**: Dùng prefix thay vì nesting (e.g., `templateCreateSuccess` thay vì `templates.messages.createSuccess`)

### Sử dụng Translations

**Client Components:**

```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  return <h1>{t("title")}</h1>;
}
```

**Server Components:**

```tsx
import { getTranslations } from "next-intl/server";

export default async function MyPage() {
  const t = await getTranslations("deposits");
  return <h1>{t("title")}</h1>;
}
```

### Quy tắc i18n

- **KHÔNG** hardcode text trong components (Vietnamese, English, Japanese)
- **KHÔNG** sử dụng inline labels pattern: `const labels = { vi: {...}, en: {...} }`
- **LUÔN** dùng `useTranslations()` hoặc `getTranslations()` với namespace
- **KHÔNG** truyền locale parameter - next-intl tự xử lý
- Khi thêm key mới vào 1 locale file, **PHẢI** thêm vào tất cả locale files

### Enum Translations

- Enum translations nằm trong namespace `enums`
- Pattern: `enums.{enumName}.{enumValue}` (e.g., `enums.depositStatus.PENDING`)
- Sử dụng `getEnumLabel()` từ `@/lib/utils/get-enum-label`

```tsx
import { useTranslations } from "next-intl";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

const tEnums = useTranslations("enums");
const label = getEnumLabel("depositStatus", status, tEnums);
```

### Error Messages

- Error translations nằm trong namespace `errors`
- Sử dụng `getErrorMessage()` từ `@/lib/utils/get-error-message`
- Fallback to generic error nếu error code không tồn tại

```tsx
import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const tErrors = useTranslations("errors");
toast.error(getErrorMessage(errorCode, tErrors));
```

### Date Formatting

- Sử dụng `formatDate()`, `formatDateTime()` từ `@/lib/utils/format-date`
- Vietnamese/English: `dd/MM/yyyy` (e.g., 31/12/2025)
- Japanese: `yyyy年MM月dd日` (e.g., 2025年12月31日)
- **KHÔNG** dùng `toLocaleDateString()` trực tiếp

```tsx
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "next-intl";

const locale = useLocale();
const dateStr = formatDate(date, locale);
```

### Duration Formatting (Thời lượng)

- Format thời lượng (phút, giờ) theo locale:
  - **Vietnamese/English**: `HH:MM` (e.g., `01:30`, `00:45`)
  - **Japanese**: `X時YY分` (e.g., `1時30分`, `45分`)
- Không có dữ liệu hoặc giá trị âm: `--:--`
- Sử dụng `formatMinutesToTime()` từ `@/lib/utils/format-date` cho hiển thị chung
- Khi cần format inline trong component:

```tsx
function formatDurationByLocale(minutes: number, locale: string): string {
  if (minutes <= 0) return "--:--";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale === "ja") {
    return hours > 0
      ? `${hours}時${mins.toString().padStart(2, "0")}分`
      : `${mins}分`;
  }
  // vi, en: format HH:MM
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
```

### Toast Messages

- Toast messages **PHẢI** được translate
- Success: `t('messages.createSuccess')`
- Error: `getErrorMessage(errorCode, tErrors)`

## Theme

- Support dark/light mode với `next-themes`
- Primary color: `#00b1ce`
- Use CSS variables for colors

## Currency

- Đơn vị tiền tệ mặc định: **Yên Nhật (JPY)**
- Sử dụng `formatCurrency()` từ `@/lib/utils/format-currency` với locale `ja`
- Format: `¥1,234` (không có decimal)

## Tables

- Luôn thêm cột **STT (số thứ tự)** làm cột đầu tiên
- Tính STT: `page * pageSize + index + 1`
- Header: dùng translation key `common.stt` hoặc "#"
- Width cột STT: `w-[60px]` hoặc tương đương

## Image Upload

- **LUÔN** compress ảnh sang WebP trước khi upload
- Sử dụng `compressImageToWebP()` từ `@/lib/utils/compress-image-to-webp`
- Áp dụng cho: avatar, transfer proof, và tất cả ảnh upload khác
- Giảm dung lượng file đáng kể, cải thiện performance

## Settings Forms & Labels

- **Dùng từ ngắn gọn**: Khi Card/Section title đã cung cấp ngữ cảnh, labels trong form chỉ cần từ ngắn gọn
  - ✅ Card "Cấu hình giờ nghỉ" → labels: "Mặc định", "Tối thiểu", "Tối đa"
  - ❌ Card "Cấu hình giờ nghỉ" → labels: "Thời gian nghỉ mặc định", "Thời gian nghỉ tối thiểu"
- **Tránh lặp từ**: Không lặp lại từ đã có trong tiêu đề section/card
- **InputGroup cho đơn vị**: Sử dụng `InputGroup` từ shadcn/ui cho TẤT CẢ inputs có đơn vị (phút, giờ, %, ¥, mét, lần...)
- **Switch trước Label**: Đặt Switch trước Label, không dùng layout justify-between

```tsx
// ✅ ĐÚNG - InputGroup với đơn vị
<InputGroup>
  <InputGroupInput type="number" value={value} onChange={...} />
  <InputGroupAddon align="inline-end">
    <InputGroupText>{tCommon("minutes")}</InputGroupText>
  </InputGroupAddon>
</InputGroup>

// ❌ SAI - Input không có đơn vị
<Input type="number" value={value} onChange={...} />

// ✅ ĐÚNG - Switch trước Label
<div className="flex items-center gap-3">
  <Switch checked={value} onCheckedChange={onChange} />
  <Label className="cursor-pointer">{label}</Label>
</div>

// ❌ SAI - Label trước Switch với justify-between
<div className="flex items-center justify-between">
  <Label>{label}</Label>
  <Switch checked={value} onCheckedChange={onChange} />
</div>
```

## Forms

- **KHÔNG** sử dụng `react-hook-form` - quản lý form state bằng `useState`
- Sử dụng controlled components với `value` và `onChange`
- Validation thực hiện trong `onSubmit` handler hoặc inline
- Error state quản lý bằng `useState<Record<string, string>>({})`

```tsx
// Ví dụ chuẩn
const [formData, setFormData] = useState({ name: "", email: "" });
const [errors, setErrors] = useState<Record<string, string>>({});

const handleChange = (field: string, value: string) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
  // Clear error khi user sửa
  if (errors[field]) {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }
};

const handleSubmit = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.name) newErrors.name = t("validation.required");
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  // Submit logic
};
```

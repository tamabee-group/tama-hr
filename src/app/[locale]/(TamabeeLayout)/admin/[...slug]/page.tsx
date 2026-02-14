import { notFound } from "next/navigation";

/**
 * Catch-all route cho TamabeeLayout
 * Bắt tất cả routes không tồn tại trong /admin/*
 */
export default function AdminCatchAll() {
  notFound();
}

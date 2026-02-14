import { notFound } from "next/navigation";

/**
 * Catch-all route cho PersonalLayout
 * Bắt tất cả routes không tồn tại trong /me/*
 */
export default function PersonalCatchAll() {
  notFound();
}

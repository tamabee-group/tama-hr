import { notFound } from "next/navigation";

/**
 * Catch-all route cho DashboardLayout
 * Bắt tất cả routes không tồn tại trong /dashboard/*
 */
export default function DashboardCatchAll() {
  notFound();
}

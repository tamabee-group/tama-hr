import { notFound } from "next/navigation";

/**
 * Catch-all route cho SupportLayout
 * Bắt tất cả routes không tồn tại trong /support/*
 */
export default function SupportCatchAll() {
  notFound();
}

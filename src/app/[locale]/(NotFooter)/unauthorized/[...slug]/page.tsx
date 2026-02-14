import { notFound } from "next/navigation";

/**
 * Catch-all route cho unauthorized sub-routes
 * Bắt tất cả routes không tồn tại trong /unauthorized/*
 */
export default function UnauthorizedCatchAll() {
  notFound();
}

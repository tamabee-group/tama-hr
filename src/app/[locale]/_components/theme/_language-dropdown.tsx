"use client";

import { NextPage } from "next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

// Store đơn giản để track mounted state
const mountedStore = {
  mounted: false,
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  getSnapshot() {
    return this.mounted;
  },
  getServerSnapshot() {
    return false;
  },
  setMounted() {
    this.mounted = true;
    this.listeners.forEach((l) => l());
  },
};

// Trigger mount sau khi hydration
if (typeof window !== "undefined") {
  mountedStore.setMounted();
}

const Languages: NextPage = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Sử dụng useSyncExternalStore thay vì useEffect + useState
  const mounted = useSyncExternalStore(
    mountedStore.subscribe.bind(mountedStore),
    mountedStore.getSnapshot.bind(mountedStore),
    mountedStore.getServerSnapshot.bind(mountedStore),
  );

  const handleLanguageChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  // Hiển thị placeholder khi chưa mount
  if (!mounted) {
    return <div className="h-8 w-[100px] bg-transparent" />;
  }

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger
        size="sm"
        className="border-none shadow-none bg-transparent dark:bg-transparent"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-222">
        <SelectItem value="vi">Tiếng Việt</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default Languages;

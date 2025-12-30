"use client";

/**
 * Re-export SharedWalletCard từ shared components
 * Company wallet page sử dụng component này để hiển thị thông tin ví
 */
export {
  SharedWalletCard as WalletCard,
  type SharedWalletData,
} from "@/app/[locale]/(AdminLayout)/_components/_shared/_wallet-card";

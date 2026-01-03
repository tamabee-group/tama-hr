import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Geist, Geist_Mono, Kanit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./_components/_theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { setRequestLocale } from "next-intl/server";
import { AuthProvider } from "@/lib/auth";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kanit = Kanit({
  weight: ["400", "500", "600", "700"],
  variable: "--font-kanit",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Tamabee | Quản lý nhân sự thông minh",
  icons: {
    icon: "/logo/dark-bg-rounded.svg",
  },
  description:
    "Tamabee là cung cấp các dịch vụ phục vụ kinh doanh, giúp cho doanh nghiệp tiết kiệm công sức quản lý nhân sự một cách chính xác và hiệu quả.",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kanit.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader />
            <AuthProvider>
              <Toaster position="top-right" duration={2000} richColors={true} />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

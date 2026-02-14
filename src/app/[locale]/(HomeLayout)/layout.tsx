import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "../_components/_header/_header";
import Footer from "./_components/_footer";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing");

  return {
    title: "Tamabee | " + t("hero.title"),
    description: t("hero.subtitle"),
    openGraph: {
      title: "Tamabee | " + t("hero.title"),
      description: t("hero.subtitle"),
      images: ["/logo/dark-bg-rounded.svg"],
    },
  };
}

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

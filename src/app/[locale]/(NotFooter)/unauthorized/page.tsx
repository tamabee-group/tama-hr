import { getTranslations } from "next-intl/server";
import { UnauthorizedContent } from "./_unauthorized-content";

export async function generateMetadata() {
  const t = await getTranslations("unauthorized");
  return {
    title: t("title"),
  };
}

export default function UnauthorizedPage() {
  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex justify-center items-center py-16">
      <UnauthorizedContent />
    </div>
  );
}

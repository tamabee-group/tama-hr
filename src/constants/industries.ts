export const INDUSTRIES = [
  "technology",
  "manufacturing",
  "retail",
  "finance",
  "healthcare",
  "education",
  "construction",
  "hospitality",
  "logistics",
  "other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

/**
 * Lấy label của industry từ translation function
 * @param value - industry value
 * @param t - translation function từ useTranslations("enums.industry")
 */
export const getIndustryLabel = (
  value: string,
  t?: (key: string) => string,
): string => {
  if (!t) return value;
  return t(value);
};

import { PersonalLayoutClient } from "./_components/_personal-layout-client";

/**
 * PersonalLayout - Server Component layout cho /me/* routes
 * Client logic được xử lý trong PersonalLayoutClient
 */
export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PersonalLayoutClient>{children}</PersonalLayoutClient>;
}

import Header from "../(HomeLayout)/_components/Header";

export default function NotFooterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerHeight: number = 50;
  const widthContent: number = 1250;
  return (
    <div className="flex flex-col justify-center">
      <Header height={headerHeight} widthContent={widthContent} />
      <main
        style={{
          maxWidth: `${widthContent}px`,
          minHeight: `100vh`,
          paddingTop: `${headerHeight}px`,
        }}
        className="w-full m-auto px-4"
      >
        {children}
      </main>
    </div>
  );
}

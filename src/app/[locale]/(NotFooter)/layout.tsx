import Header from "../_components/_header/_header";

export default function NotFooterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const widthContent: number = 1250;
  return (
    <div className="flex flex-col justify-center">
      <Header />
      <main
        style={{
          maxWidth: `${widthContent}px`,
        }}
        className="w-full m-auto px-4"
      >
        {children}
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "なんでもよくない",
  description: "今日の晩ごはん、一緒に決めよう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

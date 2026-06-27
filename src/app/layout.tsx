import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pet Digital Twin / Nana",
  description: "A growing digital life for your pet.",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#F8F5F0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veylola Finds — Smart Deals & Trending Products",
  description: "Discover useful, trending and affordable products from AliExpress.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
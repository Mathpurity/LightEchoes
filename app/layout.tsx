import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIGHTECHOES Digital Library",
  description: "Discover the LIGHTECHOES collection. Preview books and choose personal, licensed digital reading.",
  referrer: "no-referrer",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

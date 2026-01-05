import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JUSTCOM Dashboard",
  description: "Employee dashboard for JUSTCOM shop management",
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

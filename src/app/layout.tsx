import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Velion",
  description: "Performance Affiliate Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} antialiased bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velion - The climb starts here",
  description: "Marketplace, warehousing, and fulfillment for your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-secondary text-dark`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

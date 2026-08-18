import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/components/ui/Toast";
import SupportChat from "@/components/ui/SupportChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velion - Performance Affiliate Platform",
  description: "Connect producers with sellers across Mozambique, South Africa and Angola.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-secondary text-light-text`}>
        <LanguageProvider>
          <ToastProvider>
            {children}
            <SupportChat />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

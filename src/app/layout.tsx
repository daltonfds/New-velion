import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeLanguageProvider } from "@/components/layout/ThemeLanguageProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://veliongroup.online"),
  title: "Newvelion",
  description: "Commerce infrastructure",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "https://veliongroup.online" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">
        <ThemeLanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}

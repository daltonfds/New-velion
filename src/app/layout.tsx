import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeLanguageProvider } from "@/components/layout/ThemeLanguageProvider";
import PublicFooter from "@/components/layout/PublicFooter";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
import NavigationHistory from "@/components/navigation/NavigationHistory";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={inter.className}>
        <ThemeLanguageProvider>
          <NavigationHistory />
          <ToastProvider>{children}<PublicFooter /><CookieConsentBanner /></ToastProvider>
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}

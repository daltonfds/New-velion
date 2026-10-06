import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeLanguageProvider } from "@/components/layout/ThemeLanguageProvider";

export const metadata: Metadata = {
  title: "Newvelion",
  description: "Infraestrutura de comércio",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        <ThemeLanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}

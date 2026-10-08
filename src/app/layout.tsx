import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeLanguageProvider } from "@/components/layout/ThemeLanguageProvider";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["400","500","600","700","800","900"],
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
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className="font-sans">
        <ThemeLanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}

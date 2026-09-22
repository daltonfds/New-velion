import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Velion",
  description: "Velion commerce platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={inter.variable}>
      <head>

      </head>

      <body className="font-sans text-textmain bg-bgmuted">
        {children}
      </body>
    </html>
  );
}

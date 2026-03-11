import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { GamificationProvider } from "@/contexts/GamificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fahman Hub",
  description: "تطبيق ويب للترتيب والمؤقت",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <GamificationProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </GamificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

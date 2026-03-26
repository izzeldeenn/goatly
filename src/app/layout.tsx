import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Analytics } from "@vercel/analytics/next";
import { FirstTimeSetup } from "@/components/FirstTimeSetup";
import { MusicProvider } from "@/contexts/MusicContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frogo",
  description: "تطبيق ويب للترتيب والمؤقت",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=ADLaM+Display&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet"/>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ThemeProvider>
            <GamificationProvider>
              <UserProvider>
                <MusicProvider>
                  <FirstTimeSetup />
                  {children}
                </MusicProvider>
              </UserProvider>
            </GamificationProvider>
          </ThemeProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}

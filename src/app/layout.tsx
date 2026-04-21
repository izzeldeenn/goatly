import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/effects.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { PointsProvider } from "@/contexts/PointsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StudySessionProvider } from "@/contexts/StudySessionContext";
import { Analytics } from "@vercel/analytics/next";
import { FirstTimeSetup } from "@/components/auth/FirstTimeSetup";
import { MusicProvider } from "@/contexts/MusicContext";
import { CustomThemeProvider } from "@/contexts/CustomThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goatly - مجتمع مفتوح المصدر للدراسة الجماعية | Open Source Study Community",
  description: "Goatly هو مجتمع مفتوح المصدر ومجاني للدراسة الجماعية. انضم لآلاف الطلاب للدراسة معاً، تحفيز بعضكم البعض، وتحقيق أهدافكم الأكاديمية معاً. مجاني دائماً ومفتوح المصدر.",
  keywords: ["مجتمع دراسة", "دراسة جماعية", "مجتمع مفتوح المصدر", "طلاب", "دراسة معاً", "تحفيز أكاديمي", "Goatly", "مجتمع مجاني", "open source community", "study together", "student community", "collaborative study"],
  authors: [{ name: "Izzeldeenn" }],
  creator: "Izzeldeenn",
  publisher: "Goatly Community",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "ar_AR",
    alternateLocale: ["en_US"],
    url: "https://goatly.app",
    siteName: "Goatly",
    title: "Goatly - مجتمع مفتوح المصدر للدراسة الجماعية",
    description: "انضم لمجتمعنا المفتوح المصدر والمجاني للدراسة الجماعية. درس معاً، تحفزوا معاً، ونجحوا معاً. مجاني دائماً ومفتوح المصدر.",
    images: [
      {
        url: "/goat.png",
        width: 1200,
        height: 630,
        alt: "Goatly - مجتمع مفتوح المصدر للدراسة الجماعية"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Goatly - مجتمع مفتوح المصدر للدراسة الجماعية",
    description: "انضم لمجتمعنا المفتوح المصدر والمجاني للدراسة الجماعية. درس معاً، تحفزوا معاً، ونجحوا معاً.",
    images: ["/goat.png"],
    creator: "@izzeldeenn"
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  },
  manifest: "/manifest.json",
  category: "Education",
  metadataBase: new URL("https://goatly.app"),
  alternates: {
    canonical: "https://goatly.app"
  }
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
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-H148YKHBMV"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H148YKHBMV');
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ThemeProvider>
            <CustomThemeProvider>
              <UserProvider>
                <PointsProvider>
                  <StudySessionProvider>
                    <MusicProvider>
                      <FirstTimeSetup />
                      {children}
                    </MusicProvider>
                  </StudySessionProvider>
                </PointsProvider>
              </UserProvider>
            </CustomThemeProvider>
          </ThemeProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}

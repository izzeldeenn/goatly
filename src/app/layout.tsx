import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/effects.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { PointsProvider } from "@/contexts/PointsContext";
import { CoinsProvider } from "@/contexts/CoinsContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StudySessionProvider } from "@/contexts/StudySessionContext";
import { Analytics } from "@vercel/analytics/next";
import { FirstTimeSetup } from "@/components/auth/FirstTimeSetup";
import { MusicProvider } from "@/contexts/MusicContext";
import { CustomThemeProvider } from "@/contexts/CustomThemeContext";
import { RoomProvider } from "@/contexts/RoomContext";
import { PremiumProvider } from "@/contexts/PremiumContext";

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
  keywords: ["مجتمع دراسة", "دراسة جماعية", "مجتمع مفتوح المصدر", "طلاب", "دراسة معاً", "تحفيز أكاديمي", "Goatly", "جوتلي", "مجتمع مجاني", "open source community", "study together", "student community", "collaborative study", "study rooms", "pomodoro timer", "academic motivation"],
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
  },
  verification: {
    google: "your-google-verification-code"
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Goatly",
              "url": "https://goatly.app",
              "description": "مجتمع مفتوح المصدر ومجاني للدراسة الجماعية",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://goatly.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://twitter.com/izzeldeenn"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Goatly",
              "url": "https://goatly.app",
              "logo": "https://goatly.app/goat.png",
              "description": "مجتمع مفتوح المصدر ومجاني للدراسة الجماعية",
              "founder": {
                "@type": "Person",
                "name": "Izzeldeenn"
              },
              "sameAs": [
                "https://twitter.com/izzeldeenn"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ThemeProvider>
            <CustomThemeProvider>
              <UserProvider>
                <CoinsProvider>
                  <PointsProvider>
                    <PremiumProvider>
                      <StudySessionProvider>
                        <MusicProvider>
                          <RoomProvider>
                            <FirstTimeSetup />
                            {children}
                          </RoomProvider>
                        </MusicProvider>
                      </StudySessionProvider>
                    </PremiumProvider>
                  </PointsProvider>
                </CoinsProvider>
              </UserProvider>
            </CustomThemeProvider>
          </ThemeProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}

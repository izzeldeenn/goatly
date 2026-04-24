import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goatly Extension - امتداد المتصفح للدراسة | Browser Extension for Study',
  description: 'قم بتحميل امتداد Goatly للمتصفح. حظر المواقع المشتتة، مؤقت التركيز، وتتبع الإنتاجية الأكاديمية.',
  keywords: ['امتداد متصفح', 'حظر المواقع', 'مؤقت التركيز', 'تتبع الإنتاجية', 'Goatly Extension', 'browser extension', 'site blocking', 'productivity tracking'],
  openGraph: {
    title: 'Goatly Extension - امتداد المتصفح للدراسة',
    description: 'قم بتحميل امتداد Goatly للمتصفح. حظر المواقع المشتتة، مؤقت التركيز، وتتبع الإنتاجية الأكاديمية.',
    url: 'https://goatly.app/extension',
    siteName: 'Goatly',
    locale: 'ar_AR',
    type: 'website',
    images: [
      {
        url: '/goat.png',
        width: 1200,
        height: 630,
        alt: 'Goatly Extension'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goatly Extension - امتداد المتصفح للدراسة',
    description: 'قم بتحميل امتداد Goatly للمتصفح. حظر المواقع المشتتة، مؤقت التركيز، وتتبع الإنتاجية الأكاديمية.',
    images: ['/goat.png']
  },
  alternates: {
    canonical: 'https://goatly.app/extension'
  }
};

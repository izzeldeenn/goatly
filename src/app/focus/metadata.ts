import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goatly Focus - دراسة مركزة مع مؤقت بومودورو | Focus Timer with Pomodoro',
  description: 'استخدم مؤقت بومودورو في Goatly للدراسة المركزة والفعالة. دراسة مركزة، فواصل ذكية، وتتبع التقدم الأكاديمي.',
  keywords: ['مؤقت بومودورو', 'دراسة مركزة', 'تركيز دراسي', 'إدارة الوقت', 'Goatly Focus', 'pomodoro timer', 'study focus', 'time management'],
  openGraph: {
    title: 'Goatly Focus - دراسة مركزة مع مؤقت بومودورو',
    description: 'استخدم مؤقت بومودورو في Goatly للدراسة المركزة والفعالة.',
    url: 'https://goatly.app/focus',
    siteName: 'Goatly',
    locale: 'ar_AR',
    type: 'website',
    images: [
      {
        url: '/goat.png',
        width: 1200,
        height: 630,
        alt: 'Goatly Focus'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goatly Focus - دراسة مركزة مع مؤقت بومودورو',
    description: 'استخدم مؤقت بومودورو في Goatly للدراسة المركزة والفعالة.',
    images: ['/goat.png']
  },
  alternates: {
    canonical: 'https://goatly.app/focus'
  }
};

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goatly Challenge - تحديات دراسية مع الأصدقاء | Study Challenges with Friends',
  description: 'شارك في تحديات دراسية مع أصدقائك في Goatly. تنافس، تحفز، ونجحوا معاً في تحقيق أهدافكم الأكاديمية.',
  keywords: ['تحديات دراسية', 'دراسة مع الأصدقاء', 'تنافس أكاديمي', 'تحفيز الطلاب', 'Goatly Challenge', 'study challenges', 'study with friends', 'academic competition'],
  openGraph: {
    title: 'Goatly Challenge - تحديات دراسية مع الأصدقاء',
    description: 'شارك في تحديات دراسية مع أصدقائك في Goatly. تنافس، تحفز، ونجحوا معاً.',
    url: 'https://goatly.app/challenge',
    siteName: 'Goatly',
    locale: 'ar_AR',
    type: 'website',
    images: [
      {
        url: '/goat.png',
        width: 1200,
        height: 630,
        alt: 'Goatly Challenge'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goatly Challenge - تحديات دراسية مع الأصدقاء',
    description: 'شارك في تحديات دراسية مع أصدقائك في Goatly. تنافس، تحفز، ونجحوا معاً.',
    images: ['/goat.png']
  },
  alternates: {
    canonical: 'https://goatly.app/challenge'
  }
};

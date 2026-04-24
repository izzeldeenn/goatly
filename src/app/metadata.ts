import { Metadata } from 'next';

export function generateMetadata(path: string): Metadata {
  const baseUrl = 'https://goatly.app';
  const title = 'Goatly - مجتمع مفتوح المصدر للدراسة الجماعية';
  const description = 'Goatly هو مجتمع مفتوح المصدر ومجاني للدراسة الجماعية. انضم لآلاف الطلاب للدراسة معاً، تحفيز بعضكم البعض، وتحقيق أهدافكم الأكاديمية معاً.';

  const pageMetadata: Record<string, { title: string; description: string }> = {
    '/': {
      title,
      description
    },
    '/focus': {
      title: 'Goatly Focus - دراسة مركزة مع مؤقت بومودورو | Focus Timer with Pomodoro',
      description: 'استخدم مؤقت بومودورو في Goatly للدراسة المركزة والفعالة. دراسة مركزة، فواصل ذكية، وتتبع التقدم الأكاديمي.'
    },
    '/extension': {
      title: 'Goatly Extension - امتداد المتصفح للدراسة | Browser Extension for Study',
      description: 'قم بتحميل امتداد Goatly للمتصفح. حظر المواقع المشتتة، مؤقت التركيز، وتتبع الإنتاجية الأكاديمية.'
    },
    '/challenge': {
      title: 'Goatly Challenge - تحديات دراسية مع الأصدقاء | Study Challenges with Friends',
      description: 'شارك في تحديات دراسية مع أصدقائك في Goatly. تنافس، تحفز، ونجحوا معاً في تحقيق أهدافكم الأكاديمية.'
    },
    '/rooms': {
      title: 'Goatly Rooms - غرف دراسة جماعية | Group Study Rooms',
      description: 'انضم لغرف الدراسة الجماعية في Goatly. دراسة معاً، مشاركة الموارد، وتحفيز متبادل بين الطلاب.'
    },
    '/social': {
      title: 'Goatly Social - مجتمع طلابي | Student Community',
      description: 'تواصل مع الطلاب في مجتمع Goatly. صداقات دراسية، مشاركة الموارد، ودعم أكاديمي.'
    }
  };

  const metadata = pageMetadata[path] || { title, description };

  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: `${baseUrl}${path}`,
      siteName: 'Goatly',
      locale: 'ar_AR',
      type: 'website',
      images: [
        {
          url: '/goat.png',
          width: 1200,
          height: 630,
          alt: metadata.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: ['/goat.png']
    },
    alternates: {
      canonical: `${baseUrl}${path}`
    }
  };
}

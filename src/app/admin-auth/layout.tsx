'use client';

import { AdminProvider } from '@/contexts/AdminContext';

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProvider>{children}</AdminProvider>;
}

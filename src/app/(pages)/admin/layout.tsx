import type React from 'react';
import { AdminSidebar } from '../../../components/admin/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
          <h1 className="font-bold text-lg">대시보드</h1>
          <div className="text-sm font-semibold text-gray-500"></div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

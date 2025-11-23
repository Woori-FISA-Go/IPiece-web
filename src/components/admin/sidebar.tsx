'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  PieChart,
  Activity,
  Boxes,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '대시보드', href: '/admin', icon: LayoutDashboard },
  { name: '공모 관리', href: '/admin/offering', icon: Megaphone },
  { name: '배당 관리', href: '/admin/dividends', icon: PieChart },
  { name: '모니터링', href: '/admin/monitoring', icon: Activity },
  { name: '블록체인', href: '/admin/blockchain', icon: Boxes },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden w-64 flex-col border-r bg-[#1A1A2E] text-white md:flex">
      <div className="flex h-16 items-center px-6 font-bold text-xl border-b border-gray-800">
        <span className="text-[#3869FA]">IPIECE</span> ADMIN
      </div>
      <div className="flex-1 py-6 flex flex-col gap-1 px-3">
        {navigation.map((item) => {
          const isActive =
            (pathname.startsWith(item.href) && item.href !== '/admin') ||
            pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#3869FA] text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-800">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
}

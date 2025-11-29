'use client';

import { useState, type ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Activity,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Cloud,
  LogOut,
  Megaphone,
  PieChart,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavigationItem = {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  nested?: boolean;
};

const navigation: NavigationItem[] = [
  { name: '시스템 모니터링', href: '/admin/monitoring?tab=system', icon: Activity },
  { name: '클라우드', href: '/admin/monitoring?tab=system&infra=cloud', icon: Cloud, nested: true },
  { name: '온프레미스', href: '/admin/monitoring?tab=system&infra=onprem', icon: Server, nested: true },
  { name: '블록체인 모니터링', href: '/admin/monitoring?tab=blockchain', icon: Boxes },
  { name: '공모 관리', href: '/admin/offering', icon: Megaphone },
  { name: '배당 관리', href: '/admin/dividend', icon: PieChart },
  { name: '블록체인', href: '/admin/blockchain', icon: Boxes },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const currentTab = searchParams?.get('tab') || 'system';
  const infraParam = searchParams?.get('infra');
  const currentInfra = infraParam === 'onprem' || infraParam === 'cloud' ? infraParam : null;

  const isMonitoringLinkActive = (item: NavigationItem) => {
    if (!pathname.startsWith('/admin/monitoring')) return false;
    try {
      const url = new URL(item.href, 'http://localhost');
      const tab = url.searchParams.get('tab') || 'system';
      if (tab !== currentTab) return false;
      const infra = url.searchParams.get('infra');
      if (infra) return infra === currentInfra;
      return currentInfra === null;
    } catch {
      return false;
    }
  };

  const isLinkActive = (item: NavigationItem) => {
    if (item.href.startsWith('/admin/monitoring')) return isMonitoringLinkActive(item);
    return (pathname.startsWith(item.href) && item.href !== '/admin') || pathname === item.href;
  };

  return (
    <div
      className={cn(
        'hidden shrink-0 flex-col border-r bg-[#1A1A2E] text-white md:flex transition-all duration-300 overflow-hidden',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-3">
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <span className="text-[#3869FA] font-bold text-lg">IPIECE</span>
          {!collapsed && <span className="font-bold text-xl truncate">ADMIN</span>}
        </div>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2d3655] bg-[#222841] text-white hover:border-[#3869FA] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3869FA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A2E] transition-colors shadow-sm"
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          type="button"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-1 px-2">
        {navigation.map((item) => {
          const active = isLinkActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                item.nested && !collapsed && 'pl-6 text-xs',
                active
                  ? 'bg-[#3869FA] text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>
      <div className="p-3 border-t border-gray-800">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors" type="button">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>로그아웃</span>}
        </button>
      </div>
    </div>
  );
}

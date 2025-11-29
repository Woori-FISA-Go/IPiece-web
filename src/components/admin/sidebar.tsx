'use client';

import Image from 'next/image';
import { type ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Activity,
  Boxes,
  Cloudy,
  LogOut,
  Megaphone,
  PieChart,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import appIcon from '@/assets/app_icon.svg';

type NavigationItem = {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  nested?: boolean;
};

const navigation: NavigationItem[] = [
  { name: '시스템 모니터링', href: '/admin/monitoring?tab=system', icon: Activity },
  { name: '클라우드', href: '/admin/monitoring?tab=system&infra=cloud', icon: Cloudy, nested: true },
  { name: '온프레미스', href: '/admin/monitoring?tab=system&infra=onprem', icon: Server, nested: true },
  { name: '블록체인 모니터링', href: '/admin/monitoring?tab=blockchain', icon: Boxes },
  { name: '공모 관리', href: '/admin/offering', icon: Megaphone },
  { name: '배당 관리', href: '/admin/dividend', icon: PieChart },
  { name: '블록체인', href: '/admin/blockchain', icon: Boxes },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
    <div className="hidden md:flex shrink-0 flex-col w-64 bg-white border-r border-slate-200 text-slate-900 shadow-sm rounded-tr-3xl rounded-br-3xl overflow-hidden">
      <div className="flex h-20 items-center gap-3 px-5 border-b border-slate-100">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-50 border border-slate-100">
          <Image src={appIcon} alt="관리자 프로필" fill sizes="40px" className="object-contain p-1.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-slate-900">IPIECE</span>
          <span className="text-xs font-medium text-slate-500">Admin</span>
        </div>
      </div>
      <div className="flex-1 py-6 flex flex-col gap-1 px-4">
        {navigation.map((item) => {
          const active = isLinkActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                item.nested && 'pl-10 text-xs font-medium',
                active
                  ? 'bg-[#e8f1ff] text-[#0d6efd] shadow-[0_8px_24px_rgba(13,110,253,0.12)]'
                  : 'text-slate-600 hover:text-[#0d6efd] hover:bg-slate-50',
              )}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1.5 rounded-r-full bg-[#0d6efd]" />}
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  active ? 'text-[#0d6efd]' : 'text-slate-500',
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-100">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-[#0d6efd] transition-colors" type="button">
          <LogOut className="h-4 w-4" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}

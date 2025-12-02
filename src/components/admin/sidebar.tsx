'use client';

import Image from 'next/image';
import { type ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Activity,
  Boxes,
  Cloud,
  CloudCog,
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
  { name: '\uC2DC\uC2A4\uD15C \uBAA8\uB2C8\uD130\uB9C1', href: '/admin/monitoring?tab=system', icon: Activity },
  { name: '\uD074\uB77C\uC6B0\uB4DC \uC2DC\uC2A4\uD15C', href: '/admin/monitoring?tab=system&infra=cloud-system', icon: Cloudy, nested: true },
  { name: '\uD074\uB77C\uC6B0\uB4DC \uC11C\uBE44\uC2A4', href: '/admin/monitoring?tab=system&infra=cloud-service', icon: CloudCog, nested: true },
  { name: '\uC628\uD504\uB808\uBBF8\uC2A4', href: '/admin/monitoring?tab=system&infra=onprem', icon: Server, nested: true },
  { name: '\uBE14\uB85D\uCCB4\uC778 \uBAA8\uB2C8\uD130\uB9C1', href: '/admin/monitoring?tab=blockchain', icon: Boxes },
  { name: '\uACF5\uBAA8 \uAD00\uB9AC', href: '/admin/offering', icon: Megaphone },
  { name: '\uBC30\uB2F9 \uAD00\uB9AC', href: '/admin/dividend', icon: PieChart },
  { name: '\uBE14\uB85D\uCCB4\uC778', href: '/admin/blockchain', icon: Boxes },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'system';
  const infraParam = searchParams?.get('infra');
  const currentInfra =
    infraParam === 'cloud-system' || infraParam === 'cloud-service' || infraParam === 'onprem'
      ? infraParam
      : null;

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
    <div className="hidden md:flex shrink-0 flex-col w-64 bg-[#0f172a] border-r border-slate-800 text-slate-50 shadow-inner shadow-slate-900/40 rounded-tr-3xl rounded-br-3xl overflow-hidden">
      <div className="flex h-20 items-center gap-3 px-5 border-b border-slate-800/80">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-800 border border-slate-700">
          <Image src={appIcon} alt="관리자 프로필" fill sizes="40px" className="object-contain p-1.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-white">IPIECE</span>
          <span className="text-xs font-medium text-slate-400">Admin</span>
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
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
                item.nested && 'pl-10 text-xs font-medium',
                active
                  ? 'bg-[#24355c] text-white ring-1 ring-[#4f7dfa]/60 ring-inset'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              )}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-2 rounded-r-full bg-[#7ea4ff]" aria-hidden="true" />}
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  active ? 'text-[#8bb2ff]' : 'text-slate-400',
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-800/80">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" type="button">
          <LogOut className="h-4 w-4" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}

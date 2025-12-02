'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { SecurityInfo } from '@/lib/mock-info';
import { ExternalLink } from 'lucide-react';

interface ImageInfoPanelProps {
  info: SecurityInfo;
}

export function ImageInfoPanel({ info }: ImageInfoPanelProps) {
  return (
    <Card className="flex h-[380px] flex-col rounded-2xl border shadow-sm overflow-hidden">
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#111827]">대표작품</h3>
          <Link
            href="https://www.naver.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="대표작품 자세히 보기"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative flex flex-1 w-full items-center justify-center rounded-xl bg-gray-200 text-sm text-gray-400 overflow-hidden">
          <div className="relative w-full h-full min-h-[220px] overflow-hidden rounded-lg">
            {info.heroImage ? (
              <Image
                src={info.heroImage}
                alt={`${info.name} 대표작품`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 480px, 100vw"
                priority
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">image</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

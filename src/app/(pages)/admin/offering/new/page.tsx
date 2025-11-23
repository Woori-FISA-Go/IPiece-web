'use client';

import type React from 'react';

import Link from 'next/link';
import { ChevronLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NewContestPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form to /v1/admin/products...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/offering">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">상품 등록</h2>
          <p className="text-sm text-gray-500">
            새로운 공모 상품 정보를 입력해주세요.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          {/* 기본 정보 */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product_name">
                    상품 이름 <span className="text-red-500">*</span>
                  </Label>
                  <Input id="product_name" placeholder="예: 맹구" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_name">
                    프로젝트 명 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="project_name"
                    placeholder="예: 맹구 시즌1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">
                    IP 저작권 소유자 <span className="text-red-500">*</span>
                  </Label>
                  <Input id="owner" placeholder="예: 깡솔" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exchange_listing">
                    상장 플랫폼 <span className="text-red-500">*</span>
                  </Label>
                  <Input id="exchange_listing" defaultValue="IPiece" required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 토큰 정보 */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">토큰 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="token_name">
                    토큰 이름 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="token_name"
                    placeholder="예: MANGU TOKEN"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token_symbol">
                    토큰 심볼 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="token_symbol"
                    placeholder="예: MGU (3자리)"
                    maxLength={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token_standard">토큰 표준</Label>
                  <Input
                    id="token_standard"
                    defaultValue="ERC-1400"
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token_quantity">
                    발행 토큰 수량 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="token_quantity"
                    type="number"
                    placeholder="10000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_amount">
                    총 발행 금액 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="issue_amount"
                    type="number"
                    placeholder="100000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dividend_ratio">
                    수익 배분 비율 (%) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dividend_ratio"
                    type="number"
                    placeholder="30.0"
                    step="0.1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_date">
                    발행일 <span className="text-red-500">*</span>
                  </Label>
                  <Input id="issue_date" type="datetime-local" required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 공모 정보 */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">공모 설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">상품 상태</Label>
                  <Select defaultValue="offering">
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offering">공모 진행중</SelectItem>
                      <SelectItem value="ended">공모 마감</SelectItem>
                      <SelectItem value="market">거래중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offering_price">
                    공모가 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="offering_price"
                    type="number"
                    placeholder="1000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offering_amount">
                    공모 모집 금액 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="offering_amount"
                    type="number"
                    placeholder="100000"
                    required
                  />
                </div>
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="offering_start_date">
                      공모 시작일시 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="offering_start_date"
                      type="datetime-local"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offering_end_date">
                      공모 종료일시 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="offering_end_date"
                      type="datetime-local"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* 이미지 업로드 */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">이미지 설정</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>메인 이미지</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-[#1A4DE5] hover:text-[#1A4DE5] transition-colors cursor-pointer bg-gray-50">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs">클릭하여 업로드</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>썸네일 이미지</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-[#1A4DE5] hover:text-[#1A4DE5] transition-colors cursor-pointer bg-gray-50">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs">클릭하여 업로드</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>상세 페이지 이미지</Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-[#1A4DE5] hover:text-[#1A4DE5] transition-colors cursor-pointer bg-gray-50">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs">클릭하여 업로드</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3 sticky top-20">
            <Button variant="outline" type="button">
              취소
            </Button>
            <Button className="bg-[#1A4DE5] hover:bg-[#153eb5]" type="submit">
              등록 완료
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

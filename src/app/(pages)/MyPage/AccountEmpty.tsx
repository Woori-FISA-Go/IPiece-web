// 1. next/image와 새 SVG 파일 import
import Image from "next/image"
import noDataIcon from "@/assets/images/no_data_icon.svg" // 👈 요청하신 파일 경로

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AccountEmpty() {
  return (
    <div className="space-y-6">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Transaction History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">거래내역</h2>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default" size="sm" className="bg-black hover:bg-gray-800 text-white">
              당일
            </Button>
            <Button variant="outline" size="sm">
              1주일
            </Button>
            <Button variant="outline" size="sm">
              1개월
            </Button>
            <Button variant="outline" size="sm">
              3개월
            </Button>
            <Button variant="outline" size="sm">
              기간 설정
            </Button>

            {/* Date Range */}
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="text"
                value="2025 / 10 / 23"
                readOnly
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 w-32"
              />
              <span className="text-gray-500">-</span>
              <input
                type="text"
                value="2025 / 10 / 23"
                readOnly
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 w-32"
              />
            </div>
          </div>

          {/* Transaction Table */}
          <Card className="border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-700 font-medium">날짜</TableHead>
                  <TableHead className="text-gray-700 font-medium">유형</TableHead>
                  <TableHead className="text-gray-700 font-medium">거래내용</TableHead>
                  <TableHead className="text-gray-700 font-medium text-right">거래내역</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="h-96">
                    <div className="flex flex-col items-center justify-center h-full">
                      {/* 2. 기존 SVG를 Image 컴포넌트로 교체 */}
                      <Image
                        src={noDataIcon} // import한 변수 사용
                        alt="거래 내역 없음"
                        className="mb-4" // 기존의 여백 스타일 유지
                        // width/height는 import된 SVG 파일에서 자동으로 읽어옵니다.
                      />
                      <p className="text-gray-500 text-sm">조회된 거래 내역이 없습니다.</p>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  )
}
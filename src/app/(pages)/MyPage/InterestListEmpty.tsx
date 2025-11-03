import Image from "next/image"
// ⚠️ 파일명 띄어쓰기 ('image 153.svg')는 'image-153.svg' 등으로 변경하시는 것이 좋습니다.
import interestEmptyIcon from "@/assets/images/image 153.svg"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InterestListEmpty() {
  return (
    <div className="w-full">
      {/* Total Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">총 0개</p>
      </div>

      {/* Table with Headers Only */}
      <div className="border rounded-lg mb-8">
        <Table className="table-fixed">
          <TableHeader>
            {/* ▼▼▼ [수정 1] 'bg-gray-50' 클래스 추가 ▼▼▼ */}
            <TableRow className="bg-gray-50">
              {/* ▼▼▼ [수정 2] 폰트 클래스를 'font-medium text-gray-700'로 통일 ▼▼▼ */}
              <TableHead className="w-[40%] font-medium text-gray-700">IP 정보</TableHead>
              <TableHead className="w-[20%] text-center font-medium text-gray-700">상품 분류</TableHead>
              <TableHead className="w-[25%] text-center font-medium text-gray-700">현재가</TableHead>
              <TableHead className="w-[15%] text-center font-medium text-gray-700">관심</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{/* Empty body - no rows */}</TableBody>
        </Table>
      </div>

      {/* Empty State Content */}
      <div className="flex flex-col items-center justify-center py-16">
        {/* Search Icon */}
        <div className="mb-6">
          <Image
            src={interestEmptyIcon}
            alt="관심 목록 없음"
            // width/height는 import된 SVG 파일에서 자동으로 읽어옵니다.
          />
        </div>

        {/* Empty State Text */}
        <div className="text-center mb-8">
          <p className="text-gray-900 mb-2 text-base">관심 목록에 추가한 상품이 없습니다.</p>
          <p className="text-gray-600 text-sm">새로운 상품을 둘러보고 관심상품에 등록해보세요.</p>
        </div>

        <Button
          className="bg-[#3386E5] hover:bg-[#2868B5] text-white w-[197px] h-[45px] rounded-md"
        >
          IP 목록 둘러보기
        </Button>
      </div>
    </div>
  )
}
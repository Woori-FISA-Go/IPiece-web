import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import noDataIcon from "@/assets/images/no_data_icon.svg"

// Sample transaction data with detailed token information
const transactions = [
  {
    date: "2025.09.25 23:00",
    type: "구매",
    content: "다이노툰 토큰 구매",
    tokens: "+2 Dino Tokens",
    amount: "200 KRW",
  },
  {
    date: "2025.09.25 23:00",
    type: "배당금",
    content: "다이노봇 배당금",
    tokens: null,
    amount: "+200 KRW",
  },
  {
    date: "2025.09.25 23:00",
    type: "판매",
    content: "다이노봇 토큰 판매",
    tokens: "-2 Dino Tokens",
    amount: "+200 KRW",
  },
  {
    date: "2025.09.25 23:00",
    type: "판매",
    content: "다이노봇 토큰 판매",
    tokens: "-2 Dino Tokens",
    amount: "+200 KRW",
  },
  {
    date: "2025.09.25 23:00",
    type: "판매",
    content: "다이노봇 토큰 판매",
    tokens: "-2 Dino Tokens",
    amount: "+200 KRW",
  },
]

export default function AccountHistoryTable({ accountState }: { accountState: "noAccount" | "emptyHistory" | "hasHistory" }) {
  return (
    <>
      {/* [수정] 
        1. Card에서 max-h-[400px]와 overflow-y-auto 제거
        2. Card에 flex flex-col 추가 (자식 요소가 flex-grow를 쓸 수 있게)
      */}
      <Card className="border border-gray-200 flex-grow flex flex-col">
        {/* [수정]
        1. AccountDepositPanel과 동일한 스크롤 구조를 위해 div 래퍼 추가
        2. 이 div가 flex-grow로 남는 공간을 채우고, max-h-400px로 스크롤을 만듭니다.
        */}
        <div className="overflow-y-auto max-h-[400px] flex-grow">
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
              {(accountState === "emptyHistory" || accountState === "noAccount") ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-96">
                    <div className="flex flex-col items-center justify-center h-full">
                      <Image src={noDataIcon} alt="No transaction history" width={96} height={96} className="mb-4" />
                      <p className="text-gray-500 text-sm">조회된 거래 내역이 없습니다.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction, index) => (
                  <TableRow key={index} className="h-16">
                    <TableCell className="text-sm text-gray-700 py-4">{transaction.date}</TableCell>
                    <TableCell className="text-sm py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === "구매" || transaction.type === "매수"
                            ? "bg-red-50 text-red-600"
                            : transaction.type === "판매" || transaction.type === "매도"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 py-4">{transaction.content}</TableCell>
                    <TableCell className="text-sm text-right py-4">
                      <div className="font-medium text-black">{transaction.amount}</div>
                      {transaction.tokens && <div className="text-xs text-gray-400 mt-1">{transaction.tokens}</div>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  )
}
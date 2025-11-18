import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Sample transaction data
const transactions = [
  { date: "2025.10.23", type: "매수", content: "다이노봇 14주 매수", amount: "-1,400 KRW" },
  { date: "2025.10.22", type: "입금", content: "가상계좌 입금", amount: "+50,000 KRW" },
  { date: "2025.10.21", type: "매도", content: "초구만 5주 매도", amount: "+600 KRW" },
  { date: "2025.10.20", type: "매수", content: "뽀모도 10주 매수", amount: "-1,200 KRW" },
  { date: "2025.10.19", type: "입금", content: "가상계좌 입금", amount: "+30,000 KRW" },
]

// Sample deposit/withdrawal data
const depositHistory = [
  { date: "2025.10.22 14:30", type: "입금", amount: "+50,000 KRW", balance: "79,329 KRW" },
  { date: "2025.10.19 09:15", type: "입금", amount: "+30,000 KRW", balance: "29,329 KRW" },
  { date: "2025.10.15 16:45", type: "출금", amount: "-20,000 KRW", balance: "0 KRW" },
]

export default function AccountWithHistory() {
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
                {transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm text-gray-700">{transaction.date}</TableCell>
                    <TableCell className="text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.type === "매수"
                            ? "bg-red-50 text-red-600"
                            : transaction.type === "매도"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-green-50 text-green-600"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{transaction.content}</TableCell>
                    <TableCell
                      className={`text-sm text-right font-medium ${
                        transaction.amount.startsWith("+") ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      {transaction.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* Right Section - Virtual Account Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">가상계좌 입출금 내역</h2>

          <Card className="border border-gray-200 p-6">
            {/* Balance Summary */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">총 보유</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">79,329</span>
                  <span className="text-xs text-gray-500 ml-1">KRW</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">거래가능</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">79,329</span>
                  <span className="text-xs text-gray-500 ml-1">KRW</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button className="flex-1 py-2 text-sm font-medium text-blue-500 border-b-2 border-blue-500">내역</button>
              <button className="flex-1 py-2 text-sm text-gray-500 hover:text-gray-700">입금</button>
              <button className="flex-1 py-2 text-sm text-gray-500 hover:text-gray-700">출금</button>
            </div>

            {/* Deposit/Withdrawal History */}
            <div className="space-y-3">
              {depositHistory.map((item, index) => (
                <div key={index} className="pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">{item.date}</span>
                    <span
                      className={`text-sm font-medium ${
                        item.amount.startsWith("+") ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      {item.amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{item.type}</span>
                    <span className="text-xs text-gray-500">잔액: {item.balance}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowUp,
  ArrowDown,
  Wallet,
  Users,
  ShoppingCart,
  Activity,
} from 'lucide-react';

const summaryData = [
  {
    title: '총 공모 금액',
    value: '₩12.4B',
    change: '+12.5%',
    trend: 'up',
    icon: Wallet,
    color: 'bg-blue-500',
  },
  {
    title: '신규 가입자',
    value: '1,234',
    change: '+18.2%',
    trend: 'up',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    title: '진행중인 공모',
    value: '8',
    change: '-2.4%',
    trend: 'down',
    icon: ShoppingCart,
    color: 'bg-orange-500',
  },
  {
    title: '블록체인 트랜잭션',
    value: '84.2k',
    change: '+4.5%',
    trend: 'up',
    icon: Activity,
    color: 'bg-purple-500',
    tagColor: { text: 'text-purple-600', bg: 'bg-purple-50' },
  },
];

const topSecondaryTrades = [
  { name: '다이노탱 1차', trades: 482, avgPrice: 1200 },
  { name: '겨울 멈무', trades: 361, avgPrice: 950 },
  { name: '봄날의 햇살', trades: 295, avgPrice: 1320 },
  { name: '우주 여행자', trades: 188, avgPrice: 2100 },
  { name: '루나 크리스탈', trades: 142, avgPrice: 3100 },
];

const topPriceTokens = [
  { name: '루나 크리스탈', pricePerToken: 31250 },
  { name: '우주 여행자', pricePerToken: 25700 },
  { name: '다이노탱 1차', pricePerToken: 18400 },
  { name: '겨울 멈무', pricePerToken: 15200 },
  { name: '봄날의 햇살', pricePerToken: 13900 },
];

const recentTx = [
  {
    id: 1,
    type: '공모 참여',
    user: 'user_123',
    amount: '+ 500,000원',
    date: '2분 전',
    status: 'success',
  },
  {
    id: 2,
    type: '배당 지급',
    user: 'system',
    amount: '- 12,000원',
    date: '5분 전',
    status: 'pending',
  },
  {
    id: 3,
    type: '토큰 전송',
    user: 'user_987',
    amount: '150 DINO',
    date: '12분 전',
    status: 'success',
  },
  {
    id: 4,
    type: '공모 참여',
    user: 'user_456',
    amount: '+ 1,200,000원',
    date: '30분 전',
    status: 'success',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className={`p-2 rounded-full ${item.color} bg-opacity-10`}>
                  <item.icon
                    className={`h-4 w-4 ${item.color.replace('bg-', 'text-')}`}
                  />
                </div>
                {item.trend === 'up' ? (
                  <div
                    className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                      item.tagColor
                        ? `${item.tagColor.text} ${item.tagColor.bg}`
                        : 'text-green-500 bg-green-50'
                    }`}
                  >
                    <ArrowUp className="mr-1 h-3 w-3" />
                    {item.change}
                  </div>
                ) : (
                  <div className="flex items-center text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    <ArrowDown className="mr-1 h-3 w-3" />
                    {item.change}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">
                  {item.title}
                </h3>
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-stretch">
        <Card className="border-none shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              2차거래 체결 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {topSecondaryTrades.map((item, index) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-400">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        최근 거래 {item.trades.toLocaleString()}건
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {item.avgPrice.toLocaleString()}원
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              토큰가 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {topPriceTokens.map((item, index) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-400">
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-900">{item.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {item.pricePerToken.toLocaleString()}원
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              최근 트랜잭션
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center ${
                        tx.status === 'success'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.type}</p>
                      <p className="text-xs text-gray-500">{tx.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        tx.amount.startsWith('+')
                          ? 'text-blue-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Monitoring */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              시스템 모니터링
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">서버 부하</span>
                  <span>45%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-[#3869FA]"
                    style={{ width: '45%' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">메모리 사용량</span>
                  <span>62%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-[#E53333]"
                    style={{ width: '62%' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">스토리지</span>
                  <span>28%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: '28%' }}
                  />
                </div>
              </div>
              <div className="mt-8 p-4 rounded-lg bg-gray-50 border">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-gray-800">
                    모든 시스템 정상 가동 중
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

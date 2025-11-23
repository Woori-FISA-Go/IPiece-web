'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Wallet,
  Users,
  ShoppingCart,
  Activity,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

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
  },
];

const chartData = [
  { name: '1월', revenue: 4000, expenses: 2400 },
  { name: '2월', revenue: 3000, expenses: 1398 },
  { name: '3월', revenue: 2000, expenses: 9800 },
  { name: '4월', revenue: 2780, expenses: 3908 },
  { name: '5월', revenue: 1890, expenses: 4800 },
  { name: '6월', revenue: 2390, expenses: 3800 },
  { name: '7월', revenue: 3490, expenses: 4300 },
];

const pieData = [
  { name: '진행중', value: 400, color: '#3869FA' },
  { name: '대기', value: 300, color: '#B8D9FF' },
  { name: '마감', value: 300, color: '#1A1A2E' },
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
                  <div className="flex items-center text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Analytics Chart */}
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">
              월별 수익 및 지출
            </CardTitle>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₩${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#3869FA"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#FFB8B8"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              공모 상태 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center w-full">
                {pieData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-500">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">
                      {Math.floor((item.value / 1000) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
        <Card className="border-none shadow-sm bg-[#1A1A2E] text-white">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              시스템 모니터링
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">서버 부하</span>
                  <span>45%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-[#3869FA]"
                    style={{ width: '45%' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">메모리 사용량</span>
                  <span>62%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-[#E53333]"
                    style={{ width: '62%' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">스토리지</span>
                  <span>28%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: '28%' }}
                  />
                </div>
              </div>
              <div className="mt-8 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">
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

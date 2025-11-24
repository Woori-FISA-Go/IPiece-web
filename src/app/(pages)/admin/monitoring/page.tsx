'use client';

import { useState, useEffect, Fragment } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Server,
  Zap,
  Database,
  Globe,
  Blocks,
  Users,
  Gauge,
  Timer,
  BarChart3,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

// Mock data for system monitoring charts
const cpuData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  usage: Math.floor(Math.random() * 40) + 30,
  threshold: 80,
}));

const apiResponseData = Array.from({ length: 20 }, (_, i) => ({
  endpoint: `/api/v${i + 1}`,
  time: Math.floor(Math.random() * 300) + 50,
}));

const successRateData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i * 2}:00`,
  success: Math.floor(Math.random() * 5) + 95,
  error: Math.floor(Math.random() * 5),
}));

const trafficData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  requests: Math.floor(Math.random() * 5000) + 2000,
  errors: Math.floor(Math.random() * 100) + 10,
}));

interface BlockchainStatus {
  chain_id: string;
  latest_block_number: number;
  peer_count: number;
  syncing: boolean;
  network_id: string;
  healthy: boolean;
}

type BlockchainTx = {
  tx_id: number;
  tx_hash: string;
  status: string;
  tx_type: string;
  user_id: number;
  from_address: string | null;
  to_address: string | null;
  token_address: string | null;
  amount: number | null;
  block_number: number | null;
  block_hash: string | null;
  gas_used: number | null;
  created_at: string;
};

type TransactionsResponse = {
  items?: BlockchainTx[];
  page?: number;
  page_size?: number;
  total_count?: number;
};
export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('system');
  const [blockchainStatus, setBlockchainStatus] =
    useState<BlockchainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<BlockchainTx[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [expandedTxIds, setExpandedTxIds] = useState<number[]>([]);

  // System metrics (mock data)
  const systemMetrics = {
    cpu: 45.2,
    memory: 68.5,
    disk: 52.1,
    network: 234.5,
    uptime: '15d 7h 23m',
    avgResponseTime: 127,
    successRate: 99.2,
    mtts: 0.8, // Mean Time To Success
  };

  useEffect(() => {
    if (activeTab === 'blockchain') {
      fetchBlockchainStatus();
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchBlockchainStatus = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/v1/admin/blockchain/status');
      if (!response.ok) {
        console.error('Failed to load blockchain status', response.status);
        setBlockchainStatus({
          chain_id: 'unknown',
          latest_block_number: 0,
          peer_count: 0,
          syncing: false,
          network_id: 'unknown',
          healthy: false,
        });
        return;
      }
      const data = await response.json();
      setBlockchainStatus(data);
    } catch (error) {
      console.error('Failed to fetch blockchain status:', error);
      setBlockchainStatus({
        chain_id: 'unknown',
        latest_block_number: 0,
        peer_count: 0,
        syncing: false,
        network_id: 'unknown',
        healthy: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTxLoading(true);
      const response = await apiFetch('/v1/admin/blockchain/transactions?page=1&page_size=50');
      if (!response.ok) {
        throw new Error(`Failed to load transactions: ${response.status}`);
      }
      const data = (await response.json()) as TransactionsResponse;
      setTransactions(data.items ?? []);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">시스템 모니터링</h2>
        <p className="text-muted-foreground mt-1">
          실시간 시스템 상태 및 블록체인 네트워크를 모니터링합니다.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white border">
          <TabsTrigger value="system" className="gap-2">
            <Server className="w-4 h-4" />
            시스템 모니터링
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="gap-2">
            <Blocks className="w-4 h-4" />
            블록체인 모니터링
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-2">
            <Activity className="w-4 h-4" />
            운영 모니터링
          </TabsTrigger>
        </TabsList>

        {/* System Monitoring */}
        <TabsContent
          value="system"
          className="space-y-6 bg-white p-6 rounded-xl shadow-sm"
        >
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU Usage */}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">
                      CPU 사용률
                    </p>
                    <p className="text-3xl font-bold">{systemMetrics.cpu}%</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>정상</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">
                      메모리 사용률
                    </p>
                    <p className="text-3xl font-bold">
                      {systemMetrics.memory}%
                    </p>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>정상</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Success Rate */}
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">
                      API 성공률
                    </p>
                    <p className="text-3xl font-bold">
                      {systemMetrics.successRate}%
                    </p>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>우수</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Response Time */}
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">
                      평균 응답 시간
                    </p>
                    <p className="text-3xl font-bold">
                      {systemMetrics.avgResponseTime}ms
                    </p>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <Zap className="w-3 h-3" />
                      <span>빠름</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Timer className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      디스크 사용률
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {systemMetrics.disk}%
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      네트워크 사용량
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {systemMetrics.network}MB/s
                    </p>
                  </div>
                  <Network className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      시스템 가동 시간
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {systemMetrics.uptime}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">MTTS</p>
                    <p className="text-2xl font-bold mt-1">
                      {systemMetrics.mtts}s
                    </p>
                  </div>
                  <Gauge className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  CPU 사용률 (24시간)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient
                        id="cpuGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#cpuGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="threshold"
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* API Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-600" />
                  API 응답 속도 (최근 20개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={apiResponseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="endpoint"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="time" fill="#fb923c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  API 성공률 (12시간)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={successRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[90, 100]}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="success"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="성공"
                    />
                    <Line
                      type="monotone"
                      dataKey="error"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="실패"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  트래픽 현황 (24시간)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient
                        id="trafficGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#trafficGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Blockchain Monitoring */}
        <TabsContent value="blockchain" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : blockchainStatus ? (
            <>
              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Network Health */}
                <Card className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">
                          네트워크 상태
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {blockchainStatus.healthy ? (
                            <>
                              <Badge
                                variant="default"
                                className="bg-emerald-500 hover:bg-emerald-600"
                              >
                                정상
                              </Badge>
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </>
                          ) : (
                            <>
                              <Badge variant="destructive">장애</Badge>
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {blockchainStatus.syncing
                            ? '동기화 중...'
                            : '동기화 완료'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Latest Block */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">
                          최신 블록 번호
                        </p>
                        <p className="text-3xl font-bold">
                          {blockchainStatus.latest_block_number}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          실시간 업데이트
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Blocks className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Peer Count */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">
                          연결된 피어
                        </p>
                        <p className="text-3xl font-bold">
                          {blockchainStatus.peer_count}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          네트워크 노드
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Info */}
              <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      네트워크 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          네트워크 ID
                        </span>
                      </div>
                      <span className="font-mono font-semibold">
                        {blockchainStatus.network_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Chain ID
                        </span>
                      </div>
                      <span className="font-mono font-semibold">
                        {blockchainStatus.chain_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          동기화 상태
                        </span>
                      </div>
                      <Badge
                        variant={
                          blockchainStatus.syncing ? 'secondary' : 'default'
                        }
                      >
                        {blockchainStatus.syncing ? '진행 중' : '완료'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      최근 트랜잭션
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {txLoading && (
                      <p className="text-sm text-muted-foreground">불러오는 중...</p>
                    )}
                    {!txLoading &&
                      transactions.slice(0, 20).map((tx) => {
                        const isExpanded = expandedTxIds.includes(tx.tx_id);
                        return (
                          <Fragment key={tx.tx_id}>
                            <div className="p-3 rounded-lg border bg-slate-50">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold">
                                    {tx.tx_type} #{tx.tx_id}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono break-all">
                                    {tx.tx_hash}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(tx.created_at).toLocaleString('ko-KR')}
                                  </p>
                                </div>
                                <div className="text-right space-y-1">
                                  <Badge
                                    className={
                                      tx.status === 'SUCCESS'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-200 text-gray-700'
                                    }
                                  >
                                    {tx.status}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      setExpandedTxIds((prev) =>
                                        prev.includes(tx.tx_id)
                                          ? prev.filter((id) => id !== tx.tx_id)
                                          : [...prev, tx.tx_id],
                                      )
                                    }
                                  >
                                    ⋯
                                  </Button>
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="mt-3 grid gap-1 text-xs text-muted-foreground font-mono">
                                  <div>From: {tx.from_address ?? '-'}</div>
                                  <div>To: {tx.to_address ?? '-'}</div>
                                  <div>Token: {tx.token_address ?? '-'}</div>
                                  <div>Block#: {tx.block_number ?? '-'}</div>
                                  <div>Block Hash: {tx.block_hash ?? '-'}</div>
                                  <div>Gas Used: {tx.gas_used ?? '-'}</div>
                                  <div>
                                    Amount:{' '}
                                    {tx.amount !== null ? (
                                      <span className="font-semibold">
                                        {tx.amount.toLocaleString()}
                                        <span className="text-xs text-muted-foreground ml-1">₩</span>
                                      </span>
                                    ) : (
                                      '-'
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Fragment>
                        );
                      })}
                    {!txLoading && transactions.slice(0, 20).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        표시할 트랜잭션이 없습니다.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  블록체인 상태를 불러올 수 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Operations Monitoring */}
        <TabsContent value="operations">
          <Card>
            <CardContent className="p-24 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                  <Activity className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold">운영 모니터링</h3>
                <p className="text-muted-foreground">
                  운영 모니터링 기능은 현재 준비 중입니다.
                  <br />곧 더 나은 서비스로 찾아뵙겠습니다.
                </p>
                <Badge variant="secondary" className="mt-4">
                  Coming Soon
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
// Mock data
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

const tabMeta: Record<'system' | 'blockchain' | 'operations', { title: string; description: string }> = {
  system: {
    title: '시스템 모니터링',
    description: '실시간 시스템 상태 및 블록체인 네트워크를 모니터링합니다.',
  },
  blockchain: {
    title: '블록체인 모니터링',
    description: '체인 상태, 블록 진행 상황, 트랜잭션 흐름을 확인합니다.',
  },
  operations: {
    title: '운영 모니터링',
    description: '운영 관점의 주요 지표를 확인합니다.',
  },
};

type BlockchainStatus = {
  chain_id: string;
  latest_block_number: number;
  peer_count: number;
  syncing: boolean;
  network_id: string;
  healthy: boolean;
};

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
};

type GrafanaPanelKey =
  | 'ec2'
  | 'eks'
  | 'eks-pod'
  | 'alb'
  | 'rds'
  | 'vpn'
  | 'nat'
  | 's3'
  | 'sensitive-db'
  | 'rpc'
  | 'blockchain-validate';

type InfraCategory = 'cloud' | 'onprem';

type GrafanaPanel = {
  key: GrafanaPanelKey;
  label: string;
  description: string;
  envKey: string;
  url?: string;
};

const withLightTheme = (url?: string) => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('theme')) parsed.searchParams.set('theme', 'light');
    return parsed.toString();
  } catch {
    if (url.includes('theme=')) return url;
    return url.includes('?') ? `${url}&theme=light` : `${url}?theme=light`;
  }
};

const grafanaPanels: GrafanaPanel[] = [
  {
    key: 'ec2',
    label: 'EC2',
    description: 'EC2 인스턴스 상태, CPU/메모리/네트워크 지표를 확인합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_EC2_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_EC2_URL),
  },
  {
    key: 'eks',
    label: 'EKS',
    description: 'EKS 클러스터/노드/파드 자원 사용량과 상태를 확인합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_EKS_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_EKS_URL),
  },
  {
    key: 'eks-pod',
    label: 'EKS Pod',
    description: 'EKS 파드별 리소스 사용률과 이벤트를 모니터링합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_EKS_POD_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_EKS_POD_URL),
  },
  {
    key: 'alb',
    label: 'ALB',
    description: 'ALB 요청 추이, 지연 시간, 타겟 그룹 헬스 상태를 살펴봅니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_ALB_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_ALB_URL),
  },
  {
    key: 'rds',
    label: 'RDS',
    description: 'RDS CPU/커넥션/지연시간과 장애 징후를 모니터링합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_RDS_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_RDS_URL),
  },
  {
    key: 'vpn',
    label: 'VPN',
    description: 'VPN 터널 상태와 트래픽 흐름을 확인합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_VPN_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_VPN_URL),
  },
  {
    key: 'nat',
    label: 'NAT',
    description: 'NAT 게이트웨이 트래픽과 세션 상태를 추적합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_NAT_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_NAT_URL),
  },
  {
    key: 's3',
    label: 'S3',
    description: 'S3 버킷 요청 및 에러, 지연시간을 확인합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_S3_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_S3_URL),
  },
  {
    key: 'sensitive-db',
    label: 'Sensitive DB',
    description: '민감 데이터베이스 상태와 보안 이벤트를 모니터링합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_SENSITIVE_DB_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_SENSITIVE_DB_URL),
  },
  {
    key: 'rpc',
    label: 'RPC',
    description: 'RPC 노드의 응답 지연과 오류, 트래픽을 확인합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_RPC_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_RPC_URL),
  },
  {
    key: 'blockchain-validate',
    label: 'Blockchain Validate',
    description: '블록체인 밸리데이터, 블록 지연 등 상태를 확인합니다.',
    envKey: 'NEXT_PUBLIC_GRAFANA_BLOCKCHAIN_VALIDATE_URL',
    url: withLightTheme(process.env.NEXT_PUBLIC_GRAFANA_BLOCKCHAIN_VALIDATE_URL),
  },
];

const infraGroups: Record<InfraCategory, GrafanaPanelKey[]> = {
  cloud: ['eks', 'alb', 'rds', 'vpn', 'nat', 's3'],
  onprem: ['sensitive-db', 'rpc', 'blockchain-validate'],
};

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'blockchain' | 'operations'>('system');
  const [infraCategory, setInfraCategory] = useState<InfraCategory>('cloud');
  const [infraTab, setInfraTab] = useState<GrafanaPanelKey>('eks');
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<BlockchainTx[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [expandedTxIds, setExpandedTxIds] = useState<number[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  const systemMetrics = {
    cpu: 45.2,
    memory: 68.5,
    disk: 52.1,
    network: 234.5,
    uptime: '15d 7h 23m',
    avgResponseTime: 127,
    successRate: 99.2,
    mtts: 0.8,
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'system' || tab === 'blockchain' || tab === 'operations') {
      setActiveTab(tab as typeof activeTab);
    }
    const infra = searchParams.get('infra');
    if (infra === 'cloud' || infra === 'onprem') {
      setInfraCategory(infra);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'blockchain') {
      fetchBlockchainStatus();
      fetchTransactions();
    }
  }, [activeTab]);

  useEffect(() => {
    const available = infraGroups[infraCategory];
    if (!available.includes(infraTab)) {
      setInfraTab(available[0]);
    }
  }, [infraCategory, infraTab]);

  const fetchBlockchainStatus = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/v1/admin/blockchain/status');
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as BlockchainStatus;
      setBlockchainStatus(data);
    } catch (error) {
      console.error('Failed to fetch blockchain status', error);
      setBlockchainStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTxLoading(true);
      const response = await apiFetch('/v1/admin/blockchain/transactions?page=1&page_size=50');
      if (!response.ok) throw new Error(String(response.status));
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{tabMeta[activeTab]?.title}</h2>
        <p className="text-muted-foreground mt-1">{tabMeta[activeTab]?.description}</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const nextTab = value as typeof activeTab;
          setActiveTab(nextTab);
          const params = new URLSearchParams(searchParams?.toString() ?? '');
          params.set('tab', nextTab);
          if (nextTab === 'system') {
            params.set('infra', infraCategory);
          } else {
            params.delete('infra');
          }
          router.replace(`?${params.toString()}`);
        }}
        className="space-y-6"
      >
        <TabsList className="bg-white border hidden">
          <TabsTrigger value="blockchain">블록체인 모니터링</TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="space-y-6">
          <Card className="shadow-sm border bg-white">
            <CardContent className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">모니터링 영역</p>
                  <p className="text-sm text-muted-foreground">
                    {infraCategory === 'cloud' ? '클라우드' : '온프레미스'} 인프라 상태를 보고 있어요. 변경은 좌측 사이드바에서 선택하세요.
                  </p>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border">
                  {infraCategory === 'cloud' ? 'Cloud' : 'On-Prem'}
                </Badge>
              </div>

              <Tabs
                value={infraTab}
                onValueChange={(value) => setInfraTab(value as GrafanaPanelKey)}
                className="space-y-4"
              >
                <TabsList className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-lg shadow-inner w-full overflow-hidden">
                  {grafanaPanels
                    .filter((panel) => infraGroups[infraCategory].includes(panel.key))
                    .map((panel) => (
                    <TabsTrigger
                      key={panel.key}
                      value={panel.key}
                      className="min-w-[120px] justify-center text-sm rounded-md px-3 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-semibold"
                    >
                      {panel.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {grafanaPanels
                  .filter((panel) => infraGroups[infraCategory].includes(panel.key))
                  .map((panel) => (
                    <TabsContent
                      key={panel.key}
                      value={panel.key}
                      className="space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-900">{panel.label} Dashboard</p>
                          <p className="text-sm text-muted-foreground">{panel.description}</p>
                        </div>
                        {panel.url ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">Grafana 연결</Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border border-amber-200">URL 미설정</Badge>
                        )}
                      </div>
                      <div className="rounded-lg border bg-slate-50 overflow-hidden">
                        {panel.url ? (
                          <iframe
                            key={panel.key}
                            src={panel.url}
                            title={`${panel.label} Grafana Dashboard`}
                            className="w-full h-[1100px] min-h-[800px] bg-white"
                            frameBorder="0"
                            scrolling="no"
                            loading="lazy"
                            allowFullScreen
                          />
                        ) : (
                          <div className="px-6 py-10 flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-2">
                              <p className="font-medium text-slate-900">{panel.label} Dashboard URL이 아직 없어요.</p>
                              <p className="text-sm text-muted-foreground">`.env.local`에 {panel.envKey} 값을 채운 뒤 새로고침하면 반영돼요.</p>
                            </div>
                            <Badge variant="secondary" className="font-mono text-xs bg-white text-slate-700 border">
                              {panel.envKey}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="blockchain" className="space-y-6">
          <Card className="shadow-sm border bg-white">
            <CardContent className="space-y-6 pt-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : blockchainStatus ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-emerald-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground font-medium">네트워크 상태</p>
                            <div className="flex items-center gap-2 mt-2">
                              {blockchainStatus.healthy ? (
                                <>
                                  <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">정상</Badge>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </>
                              ) : (
                                <>
                                  <Badge variant="destructive">이상</Badge>
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                </>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{blockchainStatus.syncing ? '동기화 중...' : '동기화 완료'}</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-emerald-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground font-medium">최신 블록 번호</p>
                            <p className="text-3xl font-bold">{blockchainStatus.latest_block_number}</p>
                            <p className="text-xs text-muted-foreground mt-2">실시간 업데이트</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Blocks className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground font-medium">연결 피어</p>
                            <p className="text-3xl font-bold">{blockchainStatus.peer_count}</p>
                            <p className="text-xs text-muted-foreground mt-2">네트워크 노드</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Server className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">네트워크 정보</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">네트워크 ID</span>
                          </div>
                          <span className="font-mono font-semibold">{blockchainStatus.network_id}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Chain ID</span>
                          </div>
                          <span className="font-mono font-semibold">{blockchainStatus.chain_id}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">동기화 상태</span>
                          </div>
                          <Badge variant={blockchainStatus.syncing ? 'secondary' : 'default'}>
                            {blockchainStatus.syncing ? '진행 중' : '완료'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-semibold">최근 트랜잭션</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                        {txLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
                        {!txLoading &&
                          transactions.slice(0, 20).map((tx) => {
                            const isExpanded = expandedTxIds.includes(tx.tx_id);
                            return (
                              <Fragment key={tx.tx_id}>
                                <div className="p-3 rounded-lg border bg-slate-50">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold">{tx.tx_type} #{tx.tx_id}</p>
                                      <p className="text-xs text-muted-foreground font-mono break-all">{tx.tx_hash}</p>
                                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString('ko-KR')}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                      <Badge className={tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}>
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
                                        ▼
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
                                      <div>Amount: {tx.amount !== null ? tx.amount.toLocaleString() : '-'}</div>
                                    </div>
                                  )}
                                </div>
                              </Fragment>
                            );
                          })}
                        {!txLoading && transactions.slice(0, 20).length === 0 && (
                          <p className="text-sm text-muted-foreground">표시할 트랜잭션이 없습니다.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">블록체인 상태를 불러오지 못했습니다.</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">CPU 사용률</p>
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

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">메모리 사용률</p>
                    <p className="text-3xl font-bold">{systemMetrics.memory}%</p>
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

            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">API 성공률</p>
                    <p className="text-3xl font-bold">{systemMetrics.successRate}%</p>
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

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">평균 응답 시간</p>
                    <p className="text-3xl font-bold">{systemMetrics.avgResponseTime}ms</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">디스크 사용률</p>
                    <p className="text-2xl font-bold mt-1">{systemMetrics.disk}%</p>
                  </div>
                  <Database className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">네트워크 사용량</p>
                    <p className="text-2xl font-bold mt-1">{systemMetrics.network}MB/s</p>
                  </div>
                  <Network className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">시스템 가동 시간</p>
                    <p className="text-xl font-bold mt-1">{systemMetrics.uptime}</p>
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
                    <p className="text-2xl font-bold mt-1">{systemMetrics.mtts}s</p>
                  </div>
                  <Gauge className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  CPU 사용률(24시간)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} fill="url(#cpuGradient)" />
                    <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                    <XAxis dataKey="endpoint" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Bar dataKey="time" fill="#fb923c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  API 성공률(12시간)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={successRateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[90, 100]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="성공" />
                    <Line type="monotone" dataKey="error" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} name="실패" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                      <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} fill="url(#trafficGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

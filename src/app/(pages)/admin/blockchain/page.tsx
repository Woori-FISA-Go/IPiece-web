'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Coins,
  Factory,
  Send,
  UserPlus,
  Search,
  Wallet,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  X,
  Banknote,
  Flame,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  hash: string;
  status: string;
  block_number: number;
  from: string;
  to: string;
  timestamp: string;
  gas_used: string;
}

type ContractsResponse = {
  krwt?: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: string;
  };
  tokenFactory?: {
    address: string;
    tokensCreated: number;
    owner: string;
  };
  tokens?: Array<{
    projectId: string;
    address: string;
    dividendAddress: string;
  }>;
};

type TokenListItem = {
  name: string;
  symbol: string;
  totalSupply: number;
  faceValue: number;
  ownerUserId: number;
  contractAddress: string;
  status: string;
  transactionHash: string;
  createdAt: string;
};

type TokenListResponse = {
  tokens: TokenListItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
};

type TransactionListItem = {
  tx_id: number;
  tx_hash: string;
  status: string;
  tx_type: string;
  amount: number;
};

type TransactionListResponse = {
  items: TransactionListItem[];
  page: number;
  page_size: number;
  total_count: number;
};

const getStatusStyle = (status?: string) => {
  if (status === 'DEPLOYED') return 'bg-transparent text-blue-700 border-0';
  if (status === 'PENDING')
    return 'bg-amber-100 text-amber-700 border border-amber-200';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

const TxStatusIcon = ({ status }: { status: string }) => {
  const isSuccess = status?.toLowerCase() === 'success';
  const base =
    'h-6 w-6 rounded-full flex items-center justify-center border -mr-1';
  const successCls = `${base} bg-emerald-100 border-emerald-200 text-emerald-700`;
  const failCls = `${base} bg-rose-100 border-rose-200 text-rose-700`;
  return isSuccess ? (
    <div className={successCls}>
      <Check className="h-4 w-4" />
    </div>
  ) : (
    <div className={failCls}>
      <X className="h-4 w-4" />
    </div>
  );
};

export default function BlockchainPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const [txHash, setTxHash] = useState('');
  const [txInfo, setTxInfo] = useState<Transaction | null>(null);
  const [contracts, setContracts] = useState<ContractsResponse | null>(null);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [tokenList, setTokenList] = useState<TokenListItem[]>([]);
  const [tokenPage, setTokenPage] = useState(0);
  const [tokenHasMore, setTokenHasMore] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const tokenListContainerRef = useRef<HTMLDivElement | null>(null);
  const TOKEN_PAGE_SIZE = 2;
  const [txList, setTxList] = useState<TransactionListItem[]>([]);
  const [txListLoading, setTxListLoading] = useState(false);
  const [resultModal, setResultModal] = useState<{
    open: boolean
    message: string
    isError?: boolean
    action?: 'mint' | 'burn'
  }>({
    open: false,
    message: '',
    isError: false,
    action: undefined,
  });

  // KRWT 소각
  const [burnData, setBurnData] = useState({
    user_id: '',
    wallet_address: '',
    amount: '',
    withdrawal_request_id: '',
    memo: '',
  });

  // KRWT 발행
  const [mintData, setMintData] = useState({
    user_id: '',
    wallet_address: '',
    amount: '',
    bank_transaction_id: '',
    memo: '',
  });

  // 토큰 전송
  const [transferData, setTransferData] = useState({
    token_address: '',
    to: '',
    amount: '',
    investment_id: '',
  });

  // 화이트리스트
  const [whitelistData, setWhitelistData] = useState({
    token_address: '',
    user_id: '',
    wallet_address: '',
  });

  useEffect(() => {
    fetchContracts();
    fetchTokenList(0, true);
  }, []);

  useEffect(() => {
    if (activeTab === 'transaction' && !txList.length) {
      fetchTransactionList();
    }
  }, [activeTab]);

  const fetchContracts = async () => {
    try {
      setContractsLoading(true);
      const res = await apiFetch('/v1/admin/blockchain/contracts');
      if (!res.ok) throw new Error(`contracts ${res.status}`);
      const data = (await res.json()) as ContractsResponse;
      setContracts(data);
    } catch (error) {
      console.error('Failed to fetch contracts', error);
      setContracts(null);
    } finally {
      setContractsLoading(false);
    }
  };

  const fetchTokenList = async (page: number, replace = false) => {
    if (tokenLoading || (!tokenHasMore && !replace)) return;
    try {
      setTokenLoading(true);
      const res = await apiFetch(
        `/v1/admin/blockchain/tokens?page=${page}&size=${TOKEN_PAGE_SIZE}&sort=createdAt,DESC`,
      );
      if (!res.ok) throw new Error(`token list ${res.status}`);
      const data = (await res.json()) as TokenListResponse;
      const nextPage = (data.currentPage ?? page) + 1;
      const mapped =
        data.tokens?.map((token, idx) => {
          const fallback =
            (token as any)?.address ??
            token.contractAddress ??
            token.transactionHash ??
            `token-${token.symbol ?? 'unknown'}-${page}-${idx}`;
          return {
            ...token,
            conAddress: (token as any)?.conAddress ?? token.contractAddress ?? fallback,
          };
        }) ?? [];
      setTokenList((prev) => (replace ? mapped : [...prev, ...mapped]));
      setTokenPage(nextPage);
      const totalPages = data.totalPages ?? 0;
      setTokenHasMore(nextPage < totalPages);
    } catch (error) {
      console.error('Failed to fetch token list', error);
      if (replace) setTokenList([]);
      setTokenHasMore(false);
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    const target = loadMoreRef.current;
    const root = tokenListContainerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && tokenHasMore && !tokenLoading) {
          fetchTokenList(tokenPage);
        }
      },
      { root, rootMargin: '200px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [tokenPage, tokenHasMore, tokenLoading]);

  const fetchTransactionList = async () => {
    try {
      setTxListLoading(true);
      const res = await apiFetch(
        '/v1/admin/blockchain/transactions?page=1&page_size=50',
      );
      if (!res.ok) throw new Error(`transactions ${res.status}`);
      const data = (await res.json()) as TransactionListResponse;
      setTxList(data.items ?? []);
    } catch (error) {
      console.error('Failed to fetch transaction list', error);
      setTxList([]);
    } finally {
      setTxListLoading(false);
    }
  };

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast({
        title: '해시가 복사되었습니다.',
        description: hash,
      });
    } catch {
      toast({
        title: '복사 실패',
        description: '클립보드 복사 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '복사되었습니다.',
        description: text,
      });
    } catch {
      toast({
        title: '복사 실패',
        description: '클립보드 복사 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleBurnKRWT = async () => {
    const userIdNum = Number(burnData.user_id);
    const amountNum = Number(burnData.amount);
    if (!userIdNum || !amountNum) {
      setResultModal({
        open: true,
        isError: true,
        message: '유저 ID와 금액을 모두 입력해 주세요.',
      });
      return;
    }
    try {
      const payload = {
        userId: userIdNum,
        amount: amountNum,
        memo: burnData.memo,
      };
      const response = await fetch('http://localhost:8080/v1/blockchain/wallet/krwt/burn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNzY0MTQ0MDk3LCJleHAiOjE3NjQzODYwMTd9.KZbP4A6Yf8agTjWV8sA2ev8yk3U37ufdrwGppPhVOvw',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.detail || data?.message || `status ${response.status}`);
      }
      setResultModal({
        open: true,
        isError: false,
        action: 'burn',
        message: `유저 ${payload.userId}번의 ${payload.amount}원이 소각 되었습니다.`,
      });
      setBurnData({
        user_id: '',
        amount: '',
        memo: '',
      });
    } catch (error) {
      setResultModal({
        open: true,
        isError: true,
        message:
          error instanceof Error
            ? `소각 실패: ${error.message}`
            : 'KRWT 소각 중 오류가 발생했습니다.',
      });
    }
  };

  const handleMintKRWT = async () => {
    const userIdNum = Number(mintData.user_id);
    const amountNum = Number(mintData.amount);
    if (!userIdNum || !amountNum) {
      setResultModal({
        open: true,
        isError: true,
        message: '유저 ID와 금액을 모두 입력해 주세요.',
      });
      return;
    }
    try {
      const payload = {
        userId: userIdNum,
        amount: amountNum,
        memo: mintData.memo,
      };
      const response = await fetch('http://localhost:8080/v1/blockchain/wallet/krwt/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNzY0MTQ0MDk3LCJleHAiOjE3NjQzODYwMTd9.KZbP4A6Yf8agTjWV8sA2ev8yk3U37ufdrwGppPhVOvw',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.detail || data?.message || `status ${response.status}`);
      }
      setResultModal({
        open: true,
        isError: false,
        action: 'mint',
        message: `유저 ${payload.userId}번에게 ${payload.amount}원이 입금 되었습니다.`,
      });
      setMintData({
        user_id: '',
        amount: '',
        memo: '',
      });
    } catch (error) {
      setResultModal({
        open: true,
        isError: true,
        message:
          error instanceof Error
            ? `발행 실패: ${error.message}`
            : 'KRWT 발행 중 오류가 발생했습니다.',
      });
    }
  };

  const handleTransferToken = async () => {
    try {
      const response = await fetch('/v1/admin/blockchain/tokens/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferData),
      });
      const data = await response.json();
      alert(`토큰이 전송되었습니다!\nTx: ${data.transaction_hash}`);
      setTransferData({
        token_address: '',
        to: '',
        amount: '',
        investment_id: '',
      });
    } catch (error) {
      alert('토큰 전송에 실패했습니다.');
    }
  };

  const handleAddWhitelist = async () => {
    try {
      const response = await fetch('/v1/admin/blockchain/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whitelistData),
      });
      const data = await response.json();
      alert(`화이트리스트에 추가되었습니다!\nTx: ${data.transaction_hash}`);
      setWhitelistData({ token_address: '', user_id: '', wallet_address: '' });
    } catch (error) {
      alert('화이트리스트 추가에 실패했습니다.');
    }
  };

  const handleFetchTransaction = async () => {
    if (!txHash.trim()) {
      toast({
        title: '트랜잭션 해시를 입력하세요',
        description: '조회할 트랜잭션 해시를 입력해 주세요.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await apiFetch(
        `/v1/blockchain/transactions/${txHash.trim()}`,
      );
      if (!response.ok) {
        toast({
          title: '조회 실패',
          description: `트랜잭션을 불러오지 못했습니다. (status: ${response.status})`,
          variant: 'destructive',
        });
        return;
      }
      const data = await response.json();
      const normalized: Transaction = {
        hash: data.hash ?? '',
        status: data.status ?? '',
        block_number: data.blockNumber ?? data.block_number ?? null,
        from: data.from ?? '',
        to: data.to ?? '',
        timestamp: data.timestamp ?? data.createdAt ?? '',
        gas_used: data.gasUsed ?? data.gas_used ?? '',
      };
      setTxInfo(normalized);
    } catch (error) {
      toast({
        title: '조회 실패',
        description: '트랜잭션 조회 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">블록체인</h2>
        <p className="text-muted-foreground mt-2">
          스마트 컨트랙트 및 토큰을 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">
                  총 토큰 수
                </p>
                <p className="text-3xl font-bold tracking-tight">5</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-emerald-600 font-medium">↑ +2</span>
                  <span className="text-muted-foreground">이번 달</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Coins className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">
                  KRWT 발행량
                </p>
                <p className="text-3xl font-bold tracking-tight">10B</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">총 공급량</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">
                  총 거래 건수
                </p>
                <p className="text-3xl font-bold tracking-tight">1,234</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-emerald-600 font-medium">↑ +12.5%</span>
                  <span className="text-muted-foreground">지난 주 대비</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">
                  총 보유자 수
                </p>
                <p className="text-3xl font-bold tracking-tight">856</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-emerald-600 font-medium">↑ +18</span>
                  <span className="text-muted-foreground">이번 달</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 탭 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="transaction">트랜잭션</TabsTrigger>
          <TabsTrigger value="krwt">KRWT 관리</TabsTrigger>
          {/* <TabsTrigger value="whitelist">화이트리스트</TabsTrigger> */}
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>스마트 컨트랙트 현황</CardTitle>
                <CardDescription>
                  배포된 스마트 컨트랙트 목록입니다.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowContracts((prev) => !prev)}
                aria-label={showContracts ? '접기' : '펼치기'}
              >
                {showContracts ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            {showContracts && (
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Coins className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {contracts?.krwt?.name ?? 'KRWT (Korean Won Token)'}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {contracts?.krwt?.address ?? '주소 불러오는 중'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          총발행: {contracts?.krwt?.totalSupply ?? '-'} /
                          소유자: {contracts?.krwt?.owner ?? '-'}
                        </p>
                      </div>
                    </div>
                    <Badge>{contractsLoading ? '로드 중' : '운영 중'}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Factory className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold">Token Factory</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {contracts?.tokenFactory?.address ??
                            '주소 불러오는 중'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          생성 토큰:{' '}
                          {contracts?.tokenFactory?.tokensCreated ?? 0} /
                          소유자: {contracts?.tokenFactory?.owner ?? '-'}
                        </p>
                      </div>
                    </div>
                    <Badge>{contractsLoading ? '로드 중' : '운영 중'}</Badge>
                  </div>

                  {contracts?.tokens?.map((token) => (
                    <div
                      key={token.projectId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <Coins className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">프로젝트 토큰</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            프로젝트 ID: {token.projectId}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            토큰: {token.address}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            배당 컨트랙트: {token.dividendAddress}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">배포됨</Badge>
                    </div>
                  ))}

                  {!contractsLoading && !contracts?.tokens?.length && (
                    <p className="text-sm text-muted-foreground">
                      등록된 토큰이 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <div className="grid gap-4">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-blue-600" />
                    블록체인 토큰 목록
                  </CardTitle>
                  <CardDescription>
                    최신 생성된 토큰을 확인하고 스크롤로 더 불러옵니다.
                  </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                ref={tokenListContainerRef}
                className="grid grid-cols-1 gap-3 max-h-[700px] overflow-y-auto pr-2 md:grid-cols-2"
              >
                  {tokenList.map((token, index) => {
                    const address =
                      (token as any)?.conAddress ??
                      token.contractAddress ??
                      (token as any)?.address ??
                      '-';
                    const keyValue = `${address}-${token.transactionHash ?? 'tx'}-${index}`;
                    return (
                    <div
                      key={keyValue}
                      className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-gray-900">
                              {token.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            생성일 {new Date(token.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusStyle(
                            token.status,
                          )}`}
                        >
                          {token.status}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-white/80 px-3 py-2 border border-white">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">총 발행량</p>
                            <p className="font-semibold">{token.totalSupply.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/80 px-3 py-2 border border-white">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">1토큰 가격</p>
                            <p className="font-semibold">{token.faceValue.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <p className="text-xs text-muted-foreground">Contract Address</p>
                          <div className="flex items-center gap-2">
                            <p className="flex-1 font-mono text-xs break-all text-slate-700">
                              {address}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200"
                              onClick={() => handleCopy(address)}
                              title="주소 복사"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <p className="text-xs text-muted-foreground">Transaction Hash</p>
                          <p className="font-mono text-xs break-all text-slate-700">
                            {token.transactionHash}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tokenLoading && (
                  <p className="text-sm text-muted-foreground text-center">불러오는 중...</p>
                )}
                {!tokenLoading && !tokenList.length && (
                  <p className="text-sm text-muted-foreground text-center">
                    표시할 토큰이 없습니다.
                  </p>
                )}
                <div ref={loadMoreRef} />
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* 트랜잭션 조회 탭 */}
        <TabsContent value="transaction" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  트랜잭션 목록
                </CardTitle>
                <CardDescription>
                  최근 트랜잭션을 간단하게 확인합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-[640px] overflow-y-auto space-y-3 pr-1">
                  {txList.map((item) => (
                    <div
                      key={item.tx_id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <p className="text-base font-semibold leading-none">
                            트랜잭션 ID: {item.tx_id}
                          </p>
                          <span className="text-[10px] font-semibold text-blue-700 px-2 py-0.5 rounded-full">
                            {item.tx_type}
                          </span>
                        </div>
                        <TxStatusIcon status={item.status} />
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          금액:{' '}
                          <span className="font-semibold text-gray-600">
                            {item.amount.toLocaleString()}원
                          </span>
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-xs text-gray-600">
                          트랜잭션 해시:
                        </span>
                        <p className="flex-1 font-mono text-[12px] break-all text-slate-700">
                          {item.tx_hash}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200"
                          onClick={() => copyHash(item.tx_hash)}
                          title="해시 복사"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {txListLoading && (
                    <p className="text-sm text-muted-foreground text-center">
                      불러오는 중...
                    </p>
                  )}
                  {!txListLoading && !txList.length && (
                    <p className="text-sm text-muted-foreground text-center">
                      표시할 트랜잭션이 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  트랜잭션 조회
                </CardTitle>
                <CardDescription>
                  트랜잭션 해시로 상세 정보를 조회합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="0x3be1a6df59be6937c2e4aca0d040ff2dcf897e81..."
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button onClick={handleFetchTransaction}>
                    <Search className="h-4 w-4 mr-2" />
                    조회
                  </Button>
                </div>

                {txInfo && (
                  <div className="border rounded-lg p-6 space-y-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">트랜잭션 상세</h3>
                      <TxStatusIcon status={txInfo.status} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          트랜잭션 해시
                        </Label>
                        <p className="font-mono text-sm mt-1 break-all">
                          {txInfo.hash}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          블록 번호
                        </Label>
                        <p className="font-semibold mt-1">
                          {txInfo.block_number}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">
                          보낸 주소
                        </Label>
                        <p className="font-mono text-sm mt-1 break-all">
                          {txInfo.from}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">
                          받은 주소
                        </Label>
                        <p className="font-mono text-sm mt-1 break-all">
                          {txInfo.to}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          가스 사용량
                        </Label>
                        <p className="font-semibold mt-1">{txInfo.gas_used}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          타임스탬프
                        </Label>
                        <p className="font-semibold mt-1">
                          {new Date(txInfo.timestamp).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KRWT 관리 탭 */}
        <TabsContent value="krwt" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* KRWT 발행 */}
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-600">
                  <Banknote className="h-5 w-5" />
                  KRWT 발행 (입금)
                </CardTitle>
                <CardDescription>
                  은행 입금 확인 후 KRWT를 발행합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mint-user-id">사용자 ID *</Label>
                  <Input
                    id="mint-user-id"
                    placeholder=""
                    value={mintData.user_id}
                    onChange={(e) =>
                      setMintData({ ...mintData, user_id: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mint-amount">발행 금액 *</Label>
                  <Input
                    id="mint-amount"
                    type="number"
                    placeholder=""
                    value={mintData.amount}
                    onChange={(e) =>
                      setMintData({ ...mintData, amount: e.target.value })
                    }
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mint-memo">메모</Label>
                  <Textarea
                    id="mint-memo"
                    placeholder="은행 입금 확인"
                    value={mintData.memo}
                    onChange={(e) =>
                      setMintData({ ...mintData, memo: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <Button onClick={handleMintKRWT} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Banknote className="h-4 w-4 mr-2" />
                  KRWT 발행
                </Button>
              </CardContent>
            </Card>

            {/* KRWT 소각 */}
            <Card className="border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <Flame className="h-5 w-5" />
                  KRWT 소각 (출금)
                </CardTitle>
                <CardDescription>
                  출금 요청에 따라 KRWT를 소각합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="burn-user-id">사용자 ID *</Label>
                  <Input
                    id="burn-user-id"
                    placeholder=""
                    value={burnData.user_id}
                    onChange={(e) =>
                      setBurnData({ ...burnData, user_id: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="burn-amount">소각 금액 *</Label>
                  <Input
                    id="burn-amount"
                    type="number"
                    placeholder=""
                    value={burnData.amount}
                    onChange={(e) =>
                      setBurnData({ ...burnData, amount: e.target.value })
                    }
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="burn-memo">메모</Label>
                  <Textarea
                    id="burn-memo"
                    placeholder="출금 처리"
                    value={burnData.memo}
                    onChange={(e) =>
                      setBurnData({ ...burnData, memo: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleBurnKRWT}
                  className="w-full bg-slate-700 hover:bg-slate-800"
                >
                  <Flame className="h-4 w-4 mr-2" />
                  KRWT 소각
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 토큰 전송 탭 */}
        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                토큰 전송
              </CardTitle>
              <CardDescription>
                프로젝트 토큰을 지정한 주소로 전송합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-token-address">
                  토큰 컨트랙트 주소 *
                </Label>
                <Input
                  id="transfer-token-address"
                  placeholder="0x625b13759b6c4d081f24be302bdc8bf7169006ba"
                  value={transferData.token_address}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      token_address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-to">받는 주소 *</Label>
                <Input
                  id="transfer-to"
                  placeholder="0x661636826fc779294f3d0d9ea2d12b8e8c3e30ec"
                  value={transferData.to}
                  onChange={(e) =>
                    setTransferData({ ...transferData, to: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-amount">전송 수량 *</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="100"
                  value={transferData.amount}
                  onChange={(e) =>
                    setTransferData({ ...transferData, amount: e.target.value })
                  }
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment-id">투자 ID (선택)</Label>
                <Input
                  id="investment-id"
                  placeholder="i1b2c3d4-5e6f-47a8-9b01-223344556677"
                  value={transferData.investment_id}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      investment_id: e.target.value,
                    })
                  }
                />
              </div>

              <Button
                onClick={handleTransferToken}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                토큰 전송
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 화이트리스트 탭 */}
        <TabsContent value="whitelist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                화이트리스트 추가
              </CardTitle>
              <CardDescription>
                토큰 거래가 가능한 화이트리스트에 지갑 주소를 추가합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whitelist-token-address">
                  토큰 컨트랙트 주소 *
                </Label>
                <Input
                  id="whitelist-token-address"
                  placeholder="0x625b13759b6c4d081f24be302bdc8bf7169006ba"
                  value={whitelistData.token_address}
                  onChange={(e) =>
                    setWhitelistData({
                      ...whitelistData,
                      token_address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whitelist-user-id">사용자 ID *</Label>
                <Input
                  id="whitelist-user-id"
                  placeholder="u1b2c3d4-5e6f-47a8-9b01-223344556677"
                  value={whitelistData.user_id}
                  onChange={(e) =>
                    setWhitelistData({
                      ...whitelistData,
                      user_id: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whitelist-wallet">지갑 주소 *</Label>
                <Input
                  id="whitelist-wallet"
                  placeholder="0x661636826fc779294f3d0d9ea2d12b8e8c3e30ec"
                  value={whitelistData.wallet_address}
                  onChange={(e) =>
                    setWhitelistData({
                      ...whitelistData,
                      wallet_address: e.target.value,
                    })
                  }
                />
              </div>

              <Button onClick={handleAddWhitelist} className="w-full" size="lg">
                <UserPlus className="h-4 w-4 mr-2" />
                화이트리스트 추가
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <Dialog
          open={resultModal.open}
          onOpenChange={(open) => setResultModal((prev) => ({ ...prev, open }))}
        >
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2">
                {resultModal.isError ? (
                  <X className="h-5 w-5 text-red-600" />
                ) : resultModal.action === 'burn' ? (
                  <Flame className="h-5 w-5 text-orange-600 drop-shadow" />
                ) : (
                  <Banknote className="h-5 w-5 text-indigo-700 drop-shadow" />
                )}
                <DialogTitle className={resultModal.isError ? 'text-red-600' : undefined}>
                  {resultModal.isError ? '처리 실패' : '처리 완료'}
                </DialogTitle>
              </div>
              <DialogDescription>{resultModal.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setResultModal({ open: false, message: '', action: undefined })}>
                확인
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
}

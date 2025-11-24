'use client';

import { useEffect, useState } from 'react';
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
  Coins,
  Factory,
  Send,
  UserPlus,
  Search,
  Plus,
  Wallet,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface TokenInfo {
  contract_address: string;
  name: string;
  symbol: string;
  total_supply: number;
  decimals: number;
  owner: string;
  dividend_contract: string;
  holders_count: number;
  total_transferred: number;
  deployed_at: string;
}

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

export default function BlockchainPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [txHash, setTxHash] = useState('');
  const [txInfo, setTxInfo] = useState<Transaction | null>(null);
  const [contracts, setContracts] = useState<ContractsResponse | null>(null);
  const [contractsLoading, setContractsLoading] = useState(false);

  // 토큰 생성
  const [createTokenData, setCreateTokenData] = useState({
    name: '',
    total_supply: '',
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
  }, []);

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

  const handleCreateToken = async () => {
    try {
      const response = await fetch('/v1/admin/blockchain/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createTokenData),
      });
      const data = await response.json();
      alert(
        `토큰이 생성되었습니다!\nProject ID: ${data.project_id}\nToken Address: ${data.token_address}`,
      );
      setCreateTokenData({ name: '', total_supply: '' });
    } catch (error) {
      alert('토큰 생성에 실패했습니다.');
    }
  };

  const handleFetchTokenInfo = async () => {
    try {
      const response = await fetch(
        `/v1/admin/blockchain/tokens/${tokenAddress}`,
      );
      const data = await response.json();
      setTokenInfo(data);
    } catch (error) {
      alert('토큰 정보 조회에 실패했습니다.');
    }
  };

  const handleBurnKRWT = async () => {
    try {
      const response = await fetch('/v1/admin/blockchain/krwt/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(burnData),
      });
      const data = await response.json();
      alert(
        `KRWT가 소각되었습니다!\nTx: ${data.transaction_hash}\n이전 잔고: ${data.previous_balance}\n새 잔고: ${data.new_balance}`,
      );
      setBurnData({
        user_id: '',
        wallet_address: '',
        amount: '',
        withdrawal_request_id: '',
        memo: '',
      });
    } catch (error) {
      alert('KRWT 소각에 실패했습니다.');
    }
  };

  const handleMintKRWT = async () => {
    try {
      const response = await fetch('/v1/admin/blockchain/krwt/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mintData),
      });
      const data = await response.json();
      alert(`KRWT가 발행되었습니다!\nTx: ${data.transaction_hash}`);
      setMintData({
        user_id: '',
        wallet_address: '',
        amount: '',
        bank_transaction_id: '',
        memo: '',
      });
    } catch (error) {
      alert('KRWT 발행에 실패했습니다.');
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
    try {
      const response = await fetch(
        `/v1/admin/blockchain/transactions/${txHash}`,
      );
      const data = await response.json();
      setTxInfo(data);
    } catch (error) {
      alert('트랜잭션 조회에 실패했습니다.');
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
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="create">토큰 생성</TabsTrigger>
          <TabsTrigger value="krwt">KRWT 관리</TabsTrigger>
          <TabsTrigger value="transfer">토큰 전송</TabsTrigger>
          <TabsTrigger value="whitelist">화이트리스트</TabsTrigger>
          <TabsTrigger value="transaction">트랜잭션</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                토큰 정보 조회
              </CardTitle>
              <CardDescription>
                토큰 컨트랙트 주소로 상세 정보를 조회합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="0x625b13759b6c4d081f24be302bdc8bf7169006ba"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleFetchTokenInfo}>
                  <Search className="h-4 w-4 mr-2" />
                  조회
                </Button>
              </div>

              {tokenInfo && (
                <div className="border rounded-lg p-6 space-y-4 bg-muted/50">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        토큰 이름
                      </Label>
                      <p className="font-semibold mt-1">{tokenInfo.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        토큰 심볼
                      </Label>
                      <p className="font-semibold mt-1">{tokenInfo.symbol}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        총 발행량
                      </Label>
                      <p className="font-semibold mt-1">
                        {tokenInfo.total_supply.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        보유자 수
                      </Label>
                      <p className="font-semibold mt-1">
                        {tokenInfo.holders_count}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        컨트랙트 주소
                      </Label>
                      <p className="font-mono text-sm mt-1 break-all">
                        {tokenInfo.contract_address}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        배당 컨트랙트 주소
                      </Label>
                      <p className="font-mono text-sm mt-1 break-all">
                        {tokenInfo.dividend_contract}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        총 전송량
                      </Label>
                      <p className="font-semibold mt-1">
                        {tokenInfo.total_transferred.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        배포 시각
                      </Label>
                      <p className="font-semibold mt-1">
                        {new Date(tokenInfo.deployed_at).toLocaleString(
                          'ko-KR',
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>스마트 컨트랙트 현황</CardTitle>
              <CardDescription>
                배포된 스마트 컨트랙트 목록입니다.
              </CardDescription>
            </CardHeader>
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
                        총발행: {contracts?.krwt?.totalSupply ?? '-'} / 소유자:{' '}
                        {contracts?.krwt?.owner ?? '-'}
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
                        {contracts?.tokenFactory?.address ?? '주소 불러오는 중'}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        생성 토큰: {contracts?.tokenFactory?.tokensCreated ?? 0} / 소유자:{' '}
                        {contracts?.tokenFactory?.owner ?? '-'}
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
                    <Badge variant="secondary">배포됨</Badge>
                  </div>
                ))}

                {!contractsLoading && !contracts?.tokens?.length && (
                  <p className="text-sm text-muted-foreground">등록된 토큰이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 토큰 생성 탭 */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                프로젝트 토큰 생성
              </CardTitle>
              <CardDescription>
                새로운 프로젝트 토큰을 블록체인에 배포합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token-name">토큰 이름 *</Label>
                <Input
                  id="token-name"
                  placeholder="NewProjectToken"
                  value={createTokenData.name}
                  onChange={(e) =>
                    setCreateTokenData({
                      ...createTokenData,
                      name: e.target.value,
                    })
                  }
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">최대 100자</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-supply">총 발행량 *</Label>
                <Input
                  id="total-supply"
                  type="number"
                  placeholder="100000"
                  value={createTokenData.total_supply}
                  onChange={(e) =>
                    setCreateTokenData({
                      ...createTokenData,
                      total_supply: e.target.value,
                    })
                  }
                  min={1}
                />
                <p className="text-xs text-muted-foreground">최소 1 이상</p>
              </div>

              <Button onClick={handleCreateToken} className="w-full" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                토큰 생성
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KRWT 관리 탭 */}
        <TabsContent value="krwt" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* KRWT 발행 */}
            <Card className="border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <ArrowUpCircle className="h-5 w-5" />
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
                    placeholder="u1b2c3d4-5e6f-47a8-9b01-223344556677"
                    value={mintData.user_id}
                    onChange={(e) =>
                      setMintData({ ...mintData, user_id: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mint-wallet">지갑 주소 *</Label>
                  <Input
                    id="mint-wallet"
                    placeholder="0x661636826fc779294f3d0d9ea2d12b8e8c3e30ec"
                    value={mintData.wallet_address}
                    onChange={(e) =>
                      setMintData({
                        ...mintData,
                        wallet_address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mint-amount">발행 금액 *</Label>
                  <Input
                    id="mint-amount"
                    type="number"
                    placeholder="500000"
                    value={mintData.amount}
                    onChange={(e) =>
                      setMintData({ ...mintData, amount: e.target.value })
                    }
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-tx-id">은행 거래 ID *</Label>
                  <Input
                    id="bank-tx-id"
                    placeholder="123456789"
                    value={mintData.bank_transaction_id}
                    onChange={(e) =>
                      setMintData({
                        ...mintData,
                        bank_transaction_id: e.target.value,
                      })
                    }
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

                <Button
                  onClick={handleMintKRWT}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  KRWT 발행
                </Button>
              </CardContent>
            </Card>

            {/* KRWT 소각 */}
            <Card className="border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <ArrowDownCircle className="h-5 w-5" />
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
                    placeholder="u1b2c3d4-5e6f-47a8-9b01-223344556677"
                    value={burnData.user_id}
                    onChange={(e) =>
                      setBurnData({ ...burnData, user_id: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="burn-wallet">지갑 주소 *</Label>
                  <Input
                    id="burn-wallet"
                    placeholder="0x661636826fc779294f3d0d9ea2d12b8e8c3e30ec"
                    value={burnData.wallet_address}
                    onChange={(e) =>
                      setBurnData({
                        ...burnData,
                        wallet_address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="burn-amount">소각 금액 *</Label>
                  <Input
                    id="burn-amount"
                    type="number"
                    placeholder="300000"
                    value={burnData.amount}
                    onChange={(e) =>
                      setBurnData({ ...burnData, amount: e.target.value })
                    }
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawal-id">출금 요청 ID *</Label>
                  <Input
                    id="withdrawal-id"
                    placeholder="w1b2c3d4-5e6f-47a8-9b01-223344556677"
                    value={burnData.withdrawal_request_id}
                    onChange={(e) =>
                      setBurnData({
                        ...burnData,
                        withdrawal_request_id: e.target.value,
                      })
                    }
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
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
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

        {/* 트랜잭션 조회 탭 */}
        <TabsContent value="transaction" className="space-y-4">
          <Card>
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
                    <Badge
                      variant={
                        txInfo.status === 'success' ? 'default' : 'destructive'
                      }
                    >
                      {txInfo.status === 'success' ? '성공' : '실패'}
                    </Badge>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

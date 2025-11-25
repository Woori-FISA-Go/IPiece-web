'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fragment } from 'react';
import { Plus, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

type DividendStatus = 'SCHEDULED' | 'EXECUTED' | 'CANCELLED' | 'COMPLETED';

interface Dividend {
  id: number;
  product_id: number;
  product_name?: string;
  status: DividendStatus;
  record_date: string;
  payout_date: string;
  total_amount: number;
  memo?: string;
}

interface DividendResult {
  dividend_id: number;
  recipient_count: number;
  total_paid: number;
  failed_count: number;
  payout_date?: string;
  items: Array<{
    payout_id: number;
    account_id: number;
    payout_amount: number;
    payout_status: string;
    payout_date: string;
  }>;
}

type ApiDividend = Partial<Dividend> & { dividend_id?: number };
type PayoutResponse = {
  dividend_id: number;
  recipient_count?: number;
  total_paid?: number;
  failed_count?: number;
  summary?: {
    recipient_count: number;
    total_paid: number;
    failed_count: number;
  };
  items?: Array<{
    payout_id: number;
    account_id: number;
    payout_amount: number;
    payout_status: string;
    payout_date: string;
  }>;
};

function normalizeDividend(raw: ApiDividend): Dividend {
  return {
    id: raw.id ?? raw.dividend_id ?? Date.now(),
    product_id: raw.product_id ?? 0,
    product_name: raw.product_name,
    status: raw.status ?? 'SCHEDULED',
    record_date: raw.record_date ?? '',
    payout_date: raw.payout_date ?? '',
    total_amount: raw.total_amount ?? 0,
    memo: raw.memo,
  };
}

const MOCK_DIVIDENDS: Dividend[] = [
  {
    id: 101,
    product_id: 1,
    product_name: '다이노탱 1차',
    status: 'SCHEDULED',
    record_date: '2025-02-10T12:00:00+09:00',
    payout_date: '2025-02-20T12:00:00+09:00',
    total_amount: 50000000,
    memo: '2025년 1차 정기 배당',
  },
  {
    id: 102,
    product_id: 2,
    product_name: '겨울 멈무 시즌1',
    status: 'EXECUTED',
    record_date: '2025-01-05T12:00:00+09:00',
    payout_date: '2025-01-15T12:00:00+09:00',
    total_amount: 32000000,
    memo: '완료된 배당 예시',
  },
];

export default function DividendPage() {
  const [dividends, setDividends] = useState<Dividend[]>(MOCK_DIVIDENDS);
  const [completedDividendIds, setCompletedDividendIds] = useState<number[]>([]);
  const [results, setResults] = useState<DividendResult[]>([]);
  const [expandedDividends, setExpandedDividends] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDividend, setEditingDividend] = useState<Dividend | null>(null);
  const [activeTab, setActiveTab] = useState<'declarations' | 'results'>(
    'declarations',
  );

  // 한 달 범위 계산 및 필터링
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const formatRangeDate = (date: Date) =>
    `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  const monthRangeLabel = `${formatRangeDate(monthStart)} ~ ${formatRangeDate(monthEnd)}`;
  const isWithinMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;
    return d >= monthStart && d <= monthEnd;
  };

  const scheduledThisMonth = dividends.filter(
    (d) => d.status === 'SCHEDULED' && isWithinMonth(d.payout_date),
  );
  const executedThisMonth = dividends.filter(
    (d) =>
      (d.status === 'EXECUTED' || d.status === 'COMPLETED') &&
      isWithinMonth(d.payout_date),
  );
  const dividendsInMonthForTotal = dividends.filter(
    (d) =>
      (d.status === 'SCHEDULED' || d.status === 'EXECUTED' || d.status === 'COMPLETED') &&
      isWithinMonth(d.payout_date),
  );
  console.log(
    '[dividends] monthly total calc',
    dividendsInMonthForTotal.map((d) => ({
      id: d.id ?? d.product_id,
      amount: d.total_amount,
    })),
  );
  const totalAmountThisMonth = dividendsInMonthForTotal.reduce(
    (sum, d) => sum + (d.total_amount || 0),
    0,
  );

  const scheduledDividends = dividends
    .filter((dividend) => dividend.status === 'SCHEDULED')
    .sort((a, b) => {
      const nowTime = Date.now();
      const aTime = new Date(a.payout_date).getTime();
      const bTime = new Date(b.payout_date).getTime();
      const aDiff = Math.abs(aTime - nowTime);
      const bDiff = Math.abs(bTime - nowTime);
      return aDiff - bDiff;
    });

  useEffect(() => {
    fetchDividends();
  }, []);

  useEffect(() => {
    if (activeTab !== 'results') return;
    if (completedDividendIds.length === 0) {
      setResults([]);
      return;
    }
    fetchResults(completedDividendIds);
  }, [activeTab, completedDividendIds]);

  const fetchDividends = async () => {
    try {
      const response = await apiFetch('/v1/admin/dividends');
      if (!response.ok) {
        setDividends(MOCK_DIVIDENDS);
        setCompletedDividendIds([]);
        return;
      }
      const data = (await response.json()) as {
        items?: ApiDividend[];
        page?: number;
        page_size?: number;
        total_count?: number;
      };
      console.log('[dividends] response', data);
      if (data.items) {
        console.log(
          '[dividends] item ids',
          data.items.map((d) => d.id ?? d.dividend_id),
        );
      }
      const normalized = data.items
        ? data.items.map((item) => normalizeDividend(item))
        : MOCK_DIVIDENDS;
      setDividends(normalized);
      const completed = normalized
        .filter((item) => item.status === 'COMPLETED' && item.id)
        .map((item) => item.id ?? 0)
        .filter((id) => id !== 0);
      console.log('[dividends] completed ids', completed);
      setCompletedDividendIds(completed);
    } catch (error) {
      console.error('Failed to fetch dividends:', error);
      setDividends(MOCK_DIVIDENDS);
      setCompletedDividendIds([]);
    }
  };

  const fetchResults = async (dividendIds: number[]) => {
    try {
      const params = new URLSearchParams({ page: '1', page_size: '50' });
      const requests = dividendIds.map(async (id) => {
        const res = await apiFetch(
          `/v1/admin/dividends/${id}/payouts?${params.toString()}`,
          { method: 'GET' },
        );
        if (!res.ok) {
          throw new Error(`Failed payouts fetch for ${id}: ${res.status}`);
        }
        const data = (await res.json()) as PayoutResponse;
        const recipientCount = data.summary?.recipient_count ?? data.recipient_count ?? 0;
        const totalPaid = data.summary?.total_paid ?? data.total_paid ?? 0;
        const failedCount = data.summary?.failed_count ?? data.failed_count ?? 0;
        const payoutDateFromItems =
          data.items && data.items.length > 0 ? data.items[0].payout_date : undefined;
        return {
          dividend_id: data.dividend_id ?? id,
          recipient_count: recipientCount,
          total_paid: totalPaid,
          failed_count: failedCount,
          payout_date: payoutDateFromItems,
          items: data.items ?? [],
        } satisfies DividendResult;
      });
      const results = await Promise.all(requests);
      const sorted = results.sort((a, b) => {
        const aTime = a.payout_date ? new Date(a.payout_date).getTime() : 0;
        const bTime = b.payout_date ? new Date(b.payout_date).getTime() : 0;
        return bTime - aTime;
      });
      setResults(sorted);
    } catch (error) {
      console.error('Failed to fetch payout results:', error);
      setResults([]);
    }
  };

  const handleExecuteDividend = async (dividendId: number) => {
    if (!confirm('배당을 실행하시겠습니까?')) return;

    try {
      const response = await fetch(
        `/v1/admin/dividends/${dividendId}/execute`,
        {
          method: 'POST',
        },
      );
      if (response.ok) {
        alert('배당이 실행되었습니다.');
        fetchDividends();
      }
    } catch (error) {
      alert('배당 실행에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: DividendStatus) => {
    const variants = {
      SCHEDULED: { label: '예정', className: 'bg-blue-100 text-blue-700' },
      EXECUTED: { label: '완료', className: 'bg-green-100 text-green-700' },
      COMPLETED: { label: '완료', className: 'bg-green-100 text-green-700' },
      CANCELLED: { label: '취소', className: 'bg-gray-100 text-gray-600' },
    };
    const { label, className } = variants[status];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">배당 관리</h2>
          <p className="text-gray-500 mt-1">배당 선언 및 집행을 관리합니다.</p>
        </div>
        <Button
          onClick={() => {
            setEditingDividend(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          배당 선언 생성
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">이번 달 예정 배당</p>
              <p className="text-2xl font-bold">{scheduledThisMonth.length}건</p>
              <p className="text-xs text-gray-400 mt-1">{monthRangeLabel}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">이번 달 실행 배당</p>
              <p className="text-2xl font-bold">{executedThisMonth.length}건</p>
              <p className="text-xs text-gray-400 mt-1">{monthRangeLabel}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">이번 달 배당 총액</p>
              <p className="text-2xl font-bold">
                {totalAmountThisMonth.toLocaleString()}원
              </p>
              <p className="text-xs text-gray-400 mt-1">{monthRangeLabel}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('declarations')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'declarations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            배당 선언 목록
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'results'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            배당 집행 결과
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'declarations' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-700">
                    배당 ID
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    상품명
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    상태
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    기준일
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    지급 예정일
                  </th>
                  <th className="text-right p-4 font-medium text-gray-700">
                    배당 총액
                  </th>
                  <th className="text-center p-4 font-medium text-gray-700">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduledDividends.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500">
                      배당 선언이 없습니다.
                    </td>
                  </tr>
                ) : (
                  scheduledDividends.map((dividend, idx) => {
                    const rowKey =
                      dividend.id ??
                      dividend.product_id ??
                      `pending-${idx}-${dividend.record_date}`;
                    const displayId =
                      dividend.id ?? dividend.product_id ?? '미할당';
                    return (
                      <tr key={rowKey} className="border-b hover:bg-gray-50">
                        <td className="p-4">{displayId}</td>
                        <td className="p-4">
                          {dividend.product_name || `상품 #${dividend.product_id}`}
                        </td>
                        <td className="p-4">{getStatusBadge(dividend.status)}</td>
                        <td className="p-4">
                          {new Date(dividend.record_date).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="p-4">
                          {new Date(dividend.payout_date).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {dividend.total_amount.toLocaleString()}원
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {dividend.status === 'SCHEDULED' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingDividend(dividend);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  수정
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleExecuteDividend(dividend.id)}
                                >
                                  실행
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'results' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-700">
                    배당 ID
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    지급일시
                  </th>
                  <th className="text-left p-4 font-medium text-gray-700">
                    수령자 수
                  </th>
                  <th className="text-right p-4 font-medium text-gray-700">
                    지급 총액
                  </th>
                  <th className="text-right p-4 font-medium text-gray-700">
                    실패 건수
                  </th>
                  <th className="text-center p-4 font-medium text-gray-700">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      배당 집행 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  results.map((result) => {
                    const isExpanded = expandedDividends.includes(result.dividend_id);
                    const toggle = () => {
                      setExpandedDividends((prev) =>
                        prev.includes(result.dividend_id)
                          ? prev.filter((id) => id !== result.dividend_id)
                          : [...prev, result.dividend_id],
                      );
                    };
                    return (
                      <Fragment key={result.dividend_id}>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-4">{result.dividend_id}</td>
                          <td className="p-4">
                            {result.payout_date
                              ? new Date(result.payout_date).toLocaleString('ko-KR')
                              : '-'}
                          </td>
                          <td className="p-4">
                            {result.recipient_count.toLocaleString()}명
                          </td>
                          <td className="p-4 text-right">
                            {result.total_paid.toLocaleString()}원
                          </td>
                          <td className="p-4 text-right">
                            {result.failed_count.toLocaleString()}건
                          </td>
                          <td className="p-4 text-center">
                            <Button variant="outline" size="sm" onClick={toggle}>
                              상세 보기
                          </Button>
                          </td>
                        </tr>
                        {isExpanded && result.items.length > 0 && (
                          <tr className="border-b bg-gray-50/70">
                            <td colSpan={6} className="p-4">
                              <div className="space-y-3">
                                {result.items.map((item) => (
                                  <div
                                    key={item.payout_id}
                                    className="flex flex-wrap items-center justify-between rounded-lg border p-3 bg-white"
                                  >
                                    <div className="space-y-1">
                                      <p className="text-sm text-gray-500">
                                        지급 ID: {item.payout_id} / 계좌 ID: {item.account_id}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        지급일시: {new Date(item.payout_date).toLocaleString('ko-KR')}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge
                                        className={
                                          item.payout_status === 'SUCCESS' || item.payout_status === 'PAID'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-200 text-gray-700'
                                        }
                                      >
                                        {item.payout_status}
                                      </Badge>
                                      <span className="text-sm font-semibold">
                                        {item.payout_amount.toLocaleString()}원
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <DividendModal
          dividend={editingDividend}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDividend(null);
          }}
          onSave={(saved) => {
            setIsModalOpen(false);
            setEditingDividend(null);
            setDividends((prev) => {
              const existingIndex = prev.findIndex((d) => d.id === saved.id);
              if (existingIndex !== -1) {
                const next = [...prev];
                next[existingIndex] = saved;
                return next;
              }
              return [saved, ...prev];
            });
          }}
        />
      )}
    </div>
  );
}

interface DividendModalProps {
  dividend: Dividend | null;
  onClose: () => void;
  onSave: (saved: Dividend) => void;
}

function DividendModal({ dividend, onClose, onSave }: DividendModalProps) {
  const [formData, setFormData] = useState({
    product_id: dividend?.product_id || 0,
    record_date: dividend?.record_date || '',
    payout_date: dividend?.payout_date || '',
    total_amount: dividend?.total_amount || 0,
    memo: dividend?.memo || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id) {
      alert('상품 ID를 입력해주세요.');
      return;
    }
    if (!formData.total_amount) {
      alert('배당 총액을 입력해주세요.');
      return;
    }

    try {
      const body = dividend
        ? { dividend_id: dividend.id, ...formData }
        : formData;

      const response = await apiFetch('/v1/admin/dividends', {
        // 백엔드가 PUT 미지원 시 POST로 통일
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const saved = (await response.json()) as ApiDividend | undefined;
        const fallback: ApiDividend = {
          id: dividend?.id ?? saved?.id ?? saved?.dividend_id ?? Date.now(),
          product_id: formData.product_id,
          product_name: dividend?.product_name ?? saved?.product_name,
          status: dividend?.status ?? 'SCHEDULED',
          record_date: formData.record_date,
          payout_date: formData.payout_date,
          total_amount: formData.total_amount,
          memo: formData.memo,
        };
        alert(dividend ? '배당이 수정되었습니다.' : '배당이 생성되었습니다.');
        onSave(normalizeDividend(saved ?? fallback));
        return;
      }

      let message = '배당 저장에 실패했습니다.';
      try {
        const err = await response.json();
        message = err?.detail ?? err?.message ?? message;
      } catch {
        // ignore parse error, fall back to default message
      }
      alert(`${message} (status: ${response.status})`);
    } catch (error) {
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">
            {dividend ? '배당 선언 수정' : '배당 선언 생성'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              상품 ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.product_id === 0 ? '' : formData.product_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  product_id:
                    e.target.value === '' ? 0 : Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              기준일 (Record Date) <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.record_date.slice(0, 16)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  record_date: e.target.value + ':00+09:00',
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              지급 예정일 (Payout Date) <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.payout_date.slice(0, 16)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  payout_date: e.target.value + ':00+09:00',
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              배당 총액 (원) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.total_amount === 0 ? '' : formData.total_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total_amount:
                    e.target.value === '' ? 0 : Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">메모</label>
            <textarea
              rows={3}
              value={formData.memo}
              onChange={(e) =>
                setFormData({ ...formData, memo: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="예: 2025년 1차 배당"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              취소
            </Button>
            <Button type="submit" className="flex-1">
              {dividend ? '수정' : '생성'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

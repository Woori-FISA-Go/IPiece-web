'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

type DividendStatus = 'SCHEDULED' | 'EXECUTED' | 'CANCELLED';

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
  executed_at: string;
  total_recipients: number;
  success_count: number;
  failure_count: number;
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
  const [results, setResults] = useState<DividendResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDividend, setEditingDividend] = useState<Dividend | null>(null);
  const [activeTab, setActiveTab] = useState<'declarations' | 'results'>(
    'declarations',
  );

  // 한 달 내 예정된 배당 개수
  const upcomingDividends = dividends.filter((d) => {
    const payoutDate = new Date(d.payout_date);
    const today = new Date();
    const oneMonthLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return (
      d.status === 'SCHEDULED' &&
      payoutDate >= today &&
      payoutDate <= oneMonthLater
    );
  }).length;

  const scheduledDividends = dividends.filter(
    (dividend) => dividend.status === 'SCHEDULED',
  );

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    // Mock data for dividend results
    setResults([
      {
        dividend_id: 1,
        executed_at: '2025-01-15T10:00:00+09:00',
        total_recipients: 150,
        success_count: 150,
        failure_count: 0,
      },
    ]);
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
        fetchResults();
      }
    } catch (error) {
      alert('배당 실행에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: DividendStatus) => {
    const variants = {
      SCHEDULED: { label: '예정', className: 'bg-blue-100 text-blue-700' },
      EXECUTED: { label: '완료', className: 'bg-green-100 text-green-700' },
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
              <p className="text-sm text-gray-500">30일 내 예정 배당</p>
              <p className="text-2xl font-bold">{upcomingDividends}건</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 배당 실행</p>
              <p className="text-2xl font-bold">{results.length}건</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">총 배당 금액</p>
              <p className="text-2xl font-bold">
                {dividends
                  .reduce((sum, d) => sum + d.total_amount, 0)
                  .toLocaleString()}
                원
              </p>
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
                  <th className="text-left p-4 font-medium text-gray-700">
                    메모
                  </th>
                  <th className="text-center p-4 font-medium text-gray-700">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {scheduledDividends.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-500">
                      배당 선언이 없습니다.
                    </td>
                  </tr>
                ) : (
                  scheduledDividends.map((dividend) => (
                    <tr key={dividend.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{dividend.id}</td>
                      <td className="p-4">
                        {dividend.product_name ||
                          `상품 #${dividend.product_id}`}
                      </td>
                      <td className="p-4">{getStatusBadge(dividend.status)}</td>
                      <td className="p-4">
                        {new Date(dividend.record_date).toLocaleDateString(
                          'ko-KR',
                        )}
                      </td>
                      <td className="p-4">
                        {new Date(dividend.payout_date).toLocaleDateString(
                          'ko-KR',
                        )}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {dividend.total_amount.toLocaleString()}원
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">
                        {dividend.memo || '-'}
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
                                onClick={() =>
                                  handleExecuteDividend(dividend.id)
                                }
                              >
                                실행
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
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
                    실행 일시
                  </th>
                  <th className="text-right p-4 font-medium text-gray-700">
                    총 대상자
                  </th>
                  <th className="text-right p-4 font-medium text-gray-700">
                    성공
                  </th>
                  <th className="text-right p-4 font-medium text-gray-700">
                    실패
                  </th>
                  <th className="text-right p-4 font-medium text-gray-700">
                    성공률
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
                  results.map((result) => (
                    <tr
                      key={result.dividend_id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4">{result.dividend_id}</td>
                      <td className="p-4">
                        {new Date(result.executed_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="p-4 text-right">
                        {result.total_recipients}명
                      </td>
                      <td className="p-4 text-right text-green-600 font-medium">
                        {result.success_count}명
                      </td>
                      <td className="p-4 text-right text-gray-500 font-medium">
                        {result.failure_count}명
                      </td>
                      <td className="p-4 text-right">
                        <Badge className="bg-green-100 text-green-700">
                          {(
                            (result.success_count / result.total_recipients) *
                            100
                          ).toFixed(1)}
                          %
                        </Badge>
                      </td>
                    </tr>
                  ))
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
      const method = dividend ? 'PUT' : 'POST';
      const body = dividend
        ? { dividend_id: dividend.id, ...formData }
        : formData;

      const response = await apiFetch('/v1/admin/dividends', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const saved = (await response.json()) as Dividend | undefined;
        const fallback: Dividend = {
          id: saved?.id ?? dividend?.id ?? Date.now(),
          product_id: formData.product_id,
          product_name: dividend?.product_name ?? saved?.product_name,
          status: dividend?.status ?? 'SCHEDULED',
          record_date: formData.record_date,
          payout_date: formData.payout_date,
          total_amount: formData.total_amount,
          memo: formData.memo,
        };
        alert(dividend ? '배당이 수정되었습니다.' : '배당이 생성되었습니다.');
        onSave(saved ?? fallback);
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

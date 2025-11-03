export type RevenuePoint = { t: string; value: number };

export type SecurityInfo = {
  id: string;
  name: string; // 다이노땅
  issueDate: string; // 2025.02.13
  publisher: string; // iPiece Co., Ltd.
  totalIssue: string; // 100,000,000 KRW (1,000,000 DinoTokens)
  tokenStandard: string; // ERC-1400 (Security Token Standard)
  listing: string; // iPiece Secondary Market
  summary: string; // IP 소개 문단
  heroImage?: string; // 대표작품 이미지 URL(없으면 placeholder)
  revenueMonthly: RevenuePoint[];
};

export type Notice = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  subtitle?: string; // 부제/요약
  year: number; // 그룹핑용
  url?: string;
};

export const MOCK_INFO: SecurityInfo = {
  id: '1',
  name: '다이노땅',
  issueDate: '2025.02.13',
  publisher: 'iPiece Co., Ltd.',
  totalIssue: '100,000,000 KRW (1,000,000 DinoTokens)',
  tokenStandard: 'ERC-1400 (Security Token Standard)',
  listing: 'iPiece Secondary Market',
  summary:
    '가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하가나다라마바사아자차카타파하',
  heroImage: '', // 빈 값이면 placeholder 렌더
  revenueMonthly: Array.from({ length: 24 }, (_, i) => {
    // 2년치 월별 수익료 (목업: 9k±1.2k)
    const base = 9000;
    const jitter = Math.sin(i * 1.7) * 600 + (i % 5) * 90;
    return { t: `${(i % 12) + 1}월`, value: Math.max(0, base + jitter) };
  }),
};

export const MOCK_NOTICES: Notice[] = [
  {
    id: 'n20251015',
    date: '2025-10-15',
    title: '기업설명회 안내',
    subtitle: '기업설명회(IR) 개최',
    year: 2025,
    url: 'https://example.com/notice/n20251015',
  },
  {
    id: 'n20251002',
    date: '2025-10-02',
    title: '투자주의종목 안내',
    subtitle: '',
    year: 2025,
    url: 'https://example.com/notice/n20251002',
  },
  {
    id: 'n20251010',
    date: '2025-10-10',
    title: '파생상품시장 안내',
    subtitle: '',
    year: 2025,
    url: 'https://example.com/notice/n20251010',
  },
  {
    id: 'n20250827',
    date: '2025-08-27',
    title: '권리락/배당락 안내',
    subtitle: '중간(분기)배당락 기준가격 안내',
    year: 2025,
    url: 'https://example.com/notice/n20250827',
  },
  {
    id: 'n20250718',
    date: '2025-07-18',
    title: '반기보고서 공시',
    subtitle: '2025년 상반기 재무현황',
    year: 2025,
    url: 'https://example.com/notice/n20250718',
  },
  {
    id: 'n20250630',
    date: '2025-06-30',
    title: '감사보고서 제출',
    subtitle: '',
    year: 2025,
    url: 'https://example.com/notice/n20250630',
  },
  {
    id: 'n20250615',
    date: '2025-06-15',
    title: '신규 파트너십 체결 공시',
    subtitle: '글로벌 유통사와 전략적 제휴',
    year: 2025,
    url: 'https://example.com/notice/n20250615',
  },
  {
    id: 'n20250520',
    date: '2025-05-20',
    title: '주총 결과 안내',
    subtitle: '정기 주주총회 주요 의결사항',
    year: 2025,
    url: 'https://example.com/notice/n20250520',
  },
  {
    id: 'n20250428',
    date: '2025-04-28',
    title: '분기배당 공시',
    subtitle: '1분기 배당 지급 일정',
    year: 2025,
    url: 'https://example.com/notice/n20250428',
  },
];

export type OfferingStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';

export type OfferingItem = {
  id: string;
  title: string;
  author: string;
  priceKRW: number;
  progressPct?: number;
  status: OfferingStatus;
  imageUrl: string;
  liked?: boolean;
};

export const MOCK_OFFERINGS: OfferingItem[] = [
  {
    id: '1',
    title: 'IP 이름',
    author: '회사 이름 • 작가 이름',
    priceKRW: 8200,
    progressPct: 0,
    status: 'UPCOMING',
    imageUrl:
      'https://dinotaeng.com/file_data/dinotaeng/2022/12/30/4d9dece4baad9c4bd537dc077572d6ea.png',
    liked: true,
  },
  {
    id: '2',
    title: 'IP 이름',
    author: '회사 이름 • 작가 이름',
    priceKRW: 8200,
    progressPct: 30,
    status: 'ONGOING',
    imageUrl:
      'https://dinotaeng.com/file_data/dinotaeng/2022/12/30/4d9dece4baad9c4bd537dc077572d6ea.png',
  },
  {
    id: '3',
    title: 'IP 이름',
    author: '회사 이름 • 작가 이름',
    priceKRW: 8200,
    progressPct: 60,
    status: 'ONGOING',
    imageUrl:
      'https://dinotaeng.com/file_data/dinotaeng/2022/12/30/4d9dece4baad9c4bd537dc077572d6ea.png',
  },
  {
    id: '4',
    title: 'IP 이름',
    author: '회사 이름 • 작가 이름',
    priceKRW: 8200,
    progressPct: 75,
    status: 'ONGOING',
    imageUrl:
      'https://dinotaeng.com/file_data/dinotaeng/2022/12/30/4d9dece4baad9c4bd537dc077572d6ea.png',
    liked: true,
  },
  {
    id: '5',
    title: 'IP 이름',
    author: '회사 이름 • 작가 이름',
    priceKRW: 8200,
    progressPct: 30,
    status: 'ONGOING',
    imageUrl:
      'https://dinotaeng.com/file_data/dinotaeng/2022/12/30/4d9dece4baad9c4bd537dc077572d6ea.png',
  },
  {
    id: '6',
    title: 'IP 이름',
    author: '회사 이름 • 작가 이름',
    priceKRW: 8200,
    status: 'ENDED',
    imageUrl:
      'https://dinotaeng.com/file_data/dinotaeng/2022/12/30/4d9dece4baad9c4bd537dc077572d6ea.png',
  },
];

export type IPOItem = {
  id: string;
  title: string;
  author: string;
  priceKRW: number;
  changePct: number; // Changed from progress to changePct
  imageUrl: string;
  liked?: boolean;
};

export const sampleIPOData: IPOItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  title: 'IP 이름',
  author: '회사 이름 or 작가 이름',
  priceKRW: 300,
  changePct: i % 3 === 0 ? 0.45 : -0.45,
  imageUrl:
    'https://cafe24img.poxo.com/dinotaeng/web/product/medium/202402/1a99099cfbb60588334407718ab59b7c.png',
  liked: i % 5 === 0,
}));

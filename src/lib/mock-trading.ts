export type Candle = {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type OrderRow = {
  askQty?: number;
  bidQty?: number;
  price: number;
  changePct: number;
};

export type MockItem = {
  id: string;
  title: string;
  priceKRW: number;
  changePct: number;
};

const createPseudoRandom = (seed: number) => {
  let current = seed;
  return () => {
    const x = Math.sin(current++) * 10000;
    return x - Math.floor(x);
  };
};

const createCandles = ({
  length,
  basePrice,
  variance,
  priceVariance,
  extraVariance,
  minVolume,
  maxVolume,
  labelFormatter,
  seed,
}: {
  length: number;
  basePrice: number;
  variance: number;
  priceVariance: number;
  extraVariance: number;
  minVolume: number;
  maxVolume: number;
  labelFormatter: (index: number) => string;
  seed: number;
}) => {
  const random = createPseudoRandom(seed);

  return Array.from({ length }, (_, i) => {
    const open = basePrice + (random() * variance - variance / 2);
    const close = open + (random() * priceVariance - priceVariance / 2);
    const high = Math.max(open, close) + random() * extraVariance;
    const low = Math.min(open, close) - random() * extraVariance;
    const volume =
      Math.floor(random() * (maxVolume - minVolume + 1)) + minVolume;

    return {
      t: labelFormatter(i),
      o: Math.round(open),
      h: Math.round(high),
      l: Math.round(low),
      c: Math.round(close),
      v: volume,
    };
  });
};

// Deterministic candles for 1D (40 data points)
export const MOCK_CANDLES_1D: Candle[] = createCandles({
  length: 40,
  basePrice: 8500,
  variance: 500,
  priceVariance: 400,
  extraVariance: 200,
  minVolume: 100,
  maxVolume: 1000,
  seed: 42,
  labelFormatter: (index) => {
    const hour = Math.floor((index / 40) * 12) + 10;
    const minute = (index % 4) * 15;
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  },
});

// Deterministic candles for 1W (7 data points)
export const MOCK_CANDLES_1W: Candle[] = createCandles({
  length: 7,
  basePrice: 8500,
  variance: 800,
  priceVariance: 600,
  extraVariance: 300,
  minVolume: 1000,
  maxVolume: 5000,
  seed: 1337,
  labelFormatter: (index) =>
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
});

// Deterministic candles for 1M (30 data points)
export const MOCK_CANDLES_1M: Candle[] = createCandles({
  length: 30,
  basePrice: 8500,
  variance: 1200,
  priceVariance: 800,
  extraVariance: 400,
  minVolume: 2000,
  maxVolume: 10000,
  seed: 9001,
  labelFormatter: (index) => `10/${index + 1}`,
});

// Order book data
export const ORDERBOOK: OrderRow[] = [
  { askQty: 1, price: 9900, changePct: 2.4 },
  { askQty: 6, price: 9800, changePct: 1.8 },
  { askQty: 2, price: 9600, changePct: 1.1 },
  { askQty: 1, price: 9400, changePct: 0.5 },
  { bidQty: 1, price: 9200, changePct: -0.4 },
  { bidQty: 6, price: 9150, changePct: -0.8 },
  { bidQty: 2, price: 9100, changePct: -1.1 },
  { bidQty: 1, price: 9050, changePct: -1.6 },
  { bidQty: 8, price: 9000, changePct: -2.0 },
];

export const SUMMARY_STATS = {
  upper: 9900,
  lower: 6200,
  prevClose: 8600,
  weekHigh: 9900,
  weekLow: 6200,
  weeklyVolume: {
    current: 5,
    previous: 12,
  },
};

// Mock items for detail page
export const MOCK_ITEMS: MockItem[] = [
  { id: '1', title: '다이노땅', priceKRW: 9900, changePct: 1.45 },
  { id: '2', title: '겨울왕국', priceKRW: 8200, changePct: -0.45 },
  { id: '3', title: '스페이스 어드벤처', priceKRW: 10500, changePct: 2.3 },
];

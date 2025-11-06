export type ItemStatus = "OFFERING" | "TRADING"

export type Item = {
  id: string
  title: string
  priceKRW: number
  status: ItemStatus
  liked?: boolean
  imageUrl?: string
}

export type Banner = {
  id: string
  alt: string
  imageUrl?: string
}

// Fallback demo data used when API is unavailable
export const SAMPLE_OFFERING: Item[] = [
  { id: 'd1', title: '다이노땅', priceKRW: 200, status: 'OFFERING', liked: false, imageUrl: '/placeholder.svg' },
  { id: 'd2', title: '다이노땅', priceKRW: 300, status: 'OFFERING', liked: false, imageUrl: '/placeholder.svg' },
  { id: 'd3', title: '다이노땅', priceKRW: 200, status: 'OFFERING', liked: false, imageUrl: '/placeholder.svg' },
  { id: 'd4', title: '다이노땅', priceKRW: 200, status: 'OFFERING', liked: false, imageUrl: '/placeholder.svg' },
]

export const SAMPLE_TRADING: Item[] = [
  { id: 'w1', title: '위비프렌즈', priceKRW: 300, status: 'TRADING', liked: false, imageUrl: '/placeholder.svg' },
  { id: 'w2', title: '위비프렌즈', priceKRW: 200, status: 'TRADING', liked: false, imageUrl: '/placeholder.svg' },
  { id: 'w3', title: '위비프렌즈', priceKRW: 300, status: 'TRADING', liked: false, imageUrl: '/placeholder.svg' },
  { id: 'w4', title: '위비프렌즈', priceKRW: 200, status: 'TRADING', liked: false, imageUrl: '/placeholder.svg' },
]

export const SAMPLE_BANNERS: Banner[] = [
  { id: 'b1', alt: '배너 1', imageUrl: '' },
  { id: 'b2', alt: '배너 2', imageUrl: '' },
]
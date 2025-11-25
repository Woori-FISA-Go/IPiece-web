export interface PortfolioRatioItem {
  productName: string
  ratio: number
  thumbnailImg?: string
}

export interface AssetListItem {
  productId: number
  productName: string
  tokenName: string
  thumbnailImg?: string
  quantity: number
  avgBuyPrice: number
  totalBuyPrice: number
  currentPrice: number
  currentValue: number
  profit: number
  profitRate: number
}

export interface OfferingParticipationItem {
  productId: number
  productName: string
  tokenName: string
  thumbnailImg?: string
  quantity: number
  offeringPrice: number
  buyPrice: number
  progressRate: number
  offeringStartDate?: string
  offeringEndDate?: string
}

export interface MyHomeResponse {
  user_id: number
  user_made_id: string
  total_krw: number
  total_assets: number
  total_buy_amount: number
  total_evaluation: number
  total_profit: number
  total_profit_rate: number
  available_krw: number
  holding_count: number
  portfolio_ratio: PortfolioRatioItem[]
  asset_list: AssetListItem[]
  offering_list: OfferingParticipationItem[]
  offering_total_count?: number | null
  offeringTotalCount?: number | null
  offering_has_next?: boolean | null
  offeringHasNext?: boolean | null
  offering_next_page?: number | null
  offeringNextPage?: number | null
}

export interface AccountHistoryItem {
  id: string
  createdAt: string
  txType: string
  displayType?: string
  description?: string
  quantity?: number
  tokenName?: string
  amountKrw?: number
}

export interface AccountJournalEntry {
  id: string
  createdAt: string
  txType: string
  description?: string
  amountKrw?: number
}

export interface AccountJournalSummary {
  accountNo?: string
  balanceKrw?: number
  pendingPrice?: number
  totalBalance?: number
  totalPrice?: number
}

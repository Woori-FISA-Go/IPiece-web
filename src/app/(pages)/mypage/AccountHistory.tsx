"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import AccountHistoryTable from "@/components/mypage/AccountHistoryTable"
import AccountDepositPanel from "@/components/mypage/AccountDepositPanel"
import AccountFilter, { type FilterKey } from "@/components/mypage/AccountFilter"
import { apiFetch } from "@/lib/api-client"
import type { AccountHistoryItem, AccountJournalEntry, AccountJournalSummary } from "@/components/mypage/types"

type AccountState = "noAccount" | "emptyHistory" | "hasHistory"

interface AccountHistoryProps {
  accountState: AccountState
  setAccountState: (value: AccountState) => void
}

export default function AccountHistory({ accountState, setAccountState }: AccountHistoryProps) {
  const [startDate, setStartDate] = useState(() => formatDateForDisplay(new Date()))
  const [endDate, setEndDate] = useState(() => formatDateForDisplay(new Date()))
  const [activeFilter, setActiveFilter] = useState<FilterKey>("day")

  const [historyItems, setHistoryItems] = useState<AccountHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const [journalSummary, setJournalSummary] = useState<AccountJournalSummary | null>(null)
  const [journalItems, setJournalItems] = useState<AccountJournalEntry[]>([])
  const [journalLoading, setJournalLoading] = useState(false)
  const [journalError, setJournalError] = useState<string | null>(null)

  const [hasAccount, setHasAccount] = useState(true)
  const [hasHistoryData, setHasHistoryData] = useState(false)
  const [hasJournalData, setHasJournalData] = useState(false)
  const [accountUserName, setAccountUserName] = useState<string | null>(null)

  const normalizedDateFrom = useMemo(() => formatDateForApi(startDate), [startDate])
  const normalizedDateTo = useMemo(() => formatDateForApi(endDate), [endDate])

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const params = new URLSearchParams({
        date_from: normalizedDateFrom,
        date_to: normalizedDateTo,
      })
      const res = await apiFetch(`/v1/mypage/account?${params.toString()}`)
      if (!res.ok) {
        const clone = res.clone()
        let payload: Record<string, unknown> | undefined
        try {
          payload = (await clone.json()) as Record<string, unknown>
        } catch {
          /* ignore */
        }
        if (res.status === 404) {
          setHistoryItems([])
          setHasHistoryData(false)
          setHasAccount(false)
          if (typeof payload?.user_made_id === "string") {
            setAccountUserName(payload.user_made_id)
          } else if (typeof payload?.userMadeId === "string") {
            setAccountUserName(payload.userMadeId)
          }
          setHistoryError(null)
          return
        }
        throw new Error(
          (payload?.detail as string) || (payload?.message as string) || "거래 내역을 불러오지 못했습니다.",
        )
      }
      setHasAccount(true)
      const data = (await res.json()) as {
        items?: unknown[]
        history?: unknown[] | { items?: unknown[] }
        user_made_id?: string
        userMadeId?: string
      }
      if (typeof data.user_made_id === "string" || typeof data.userMadeId === "string") {
        setAccountUserName((data.user_made_id as string) || (data.userMadeId as string) || null)
      }
      const historyItemsSource = extractHistoryItems(data)
      const mapped = mapHistoryItems(historyItemsSource)
      setHistoryItems(mapped)
      setHasHistoryData(mapped.length > 0)
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "거래 내역을 불러오지 못했습니다.")
    } finally {
      setHistoryLoading(false)
    }
  }, [normalizedDateFrom, normalizedDateTo])

  const fetchJournals = useCallback(async () => {
    setJournalLoading(true)
    setJournalError(null)
    try {
      const res = await apiFetch("/v1/mypage/account/journals")
      if (!res.ok) {
        const clone = res.clone()
        let payload: Record<string, unknown> | undefined
        try {
          payload = (await clone.json()) as Record<string, unknown>
        } catch {
          /* ignore */
        }
        if (res.status === 404) {
          setJournalSummary(null)
          setJournalItems([])
          setHasJournalData(false)
          setHasAccount(false)
          if (typeof payload?.user_made_id === "string") {
            setAccountUserName(payload.user_made_id)
          } else if (typeof payload?.userMadeId === "string") {
            setAccountUserName(payload.userMadeId)
          }
          setJournalError(null)
          return
        }
        throw new Error(
          (payload?.detail as string) || (payload?.message as string) || "입출금 내역을 불러오지 못했습니다.",
        )
      }
      setHasAccount(true)
      const data = (await res.json()) as {
        account_no?: string
        accountNo?: string
        balance_krw?: number
        balanceKrw?: number
        pending_price?: number
        pendingPrice?: number
        total_balance?: number
        totalBalance?: number
        total_price?: number
        totalPrice?: number
        items?: unknown[]
        user_made_id?: string
        userMadeId?: string
      }
      if (typeof data.user_made_id === "string" || typeof data.userMadeId === "string") {
        setAccountUserName((data.user_made_id as string) || (data.userMadeId as string) || null)
      }
      const summary: AccountJournalSummary = {
        accountNo: (data.accountNo as string) ?? (data.account_no as string) ?? undefined,
        balanceKrw: (data.balanceKrw as number) ?? (data.balance_krw as number) ?? undefined,
        pendingPrice: (data.pendingPrice as number) ?? (data.pending_price as number) ?? undefined,
        totalBalance:
          (data.totalBalance as number) ??
          (data.total_balance as number) ??
          (data.totalPrice as number) ??
          (data.total_price as number) ??
          undefined,
        totalPrice: (data.totalPrice as number) ?? (data.total_price as number) ?? undefined,
      }
      const mappedItems = mapJournalItems(data.items ?? [])
      setJournalSummary(summary)
      setJournalItems(mappedItems)
      setHasJournalData(mappedItems.length > 0)
    } catch (error) {
      setJournalError(error instanceof Error ? error.message : "입출금 내역을 불러오지 못했습니다.")
    } finally {
      setJournalLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  useEffect(() => {
    if (!hasAccount) {
      setAccountState("noAccount")
    } else if (hasHistoryData || hasJournalData) {
      setAccountState("hasHistory")
    } else {
      setAccountState("emptyHistory")
    }
  }, [hasAccount, hasHistoryData, hasJournalData, setAccountState])

  const handleAccountCreated = useCallback(async () => {
    await Promise.all([fetchHistory(), fetchJournals()])
  }, [fetchHistory, fetchJournals])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col space-y-4 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">거래내역</h2>

          <AccountFilter
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />

          <AccountHistoryTable
            items={historyItems}
            isLoading={historyLoading}
            error={historyError}
            onRetry={fetchHistory}
          />
        </div>

        <AccountDepositPanel
          accountState={accountState}
          summary={journalSummary}
          items={journalItems}
          isLoading={journalLoading}
          error={journalError}
          userName={accountUserName}
          onAccountCreated={handleAccountCreated}
        />
      </div>
    </div>
  )
}

function formatDateForApi(value: string) {
  if (!value) return ""
  const normalized = value.replace(/\./g, "/").replace(/-/g, "/")
  const [year, month, day] = normalized.split("/")
  if (year && month && day) {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }
  return value.replace(/\//g, "-")
}

function extractHistoryItems(data: {
  history?: unknown[] | { items?: unknown[] }
  items?: unknown[]
}): unknown[] {
  if (Array.isArray(data.history)) {
    return data.history
  }
  if (data.history && Array.isArray((data.history as { items?: unknown[] }).items)) {
    return (data.history as { items?: unknown[] }).items ?? []
  }
  if (Array.isArray(data.items)) {
    return data.items
  }
  return []
}

function formatDateForDisplay(date: Date) {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
}

function mapHistoryItems(items: unknown[]): AccountHistoryItem[] {
  return (items || []).map((raw, index) => {
    const item = raw as Record<string, unknown>
    const quantity = parseMaybeNumber(
      (item.quantity as number | string | undefined) ??
        (item.tokenQuantity as number | string | undefined) ??
        (item.token_quantity as number | string | undefined) ??
        (item.amount_token as number | string | undefined) ??
        (item.tokenAmount as number | string | undefined) ??
        (item.token_amount as number | string | undefined),
    )
    const tokenName =
      (item.tokenName as string) ||
      (item.token_name as string) ||
      (item.tokenSymbol as string) ||
      (item.token_symbol as string) ||
      (item.symbol as string)
    const amountKrw = parseMaybeNumber(
      (item.accountKrw as number | string | undefined) ??
        (item.account_krw as number | string | undefined) ??
        (item.amountKrw as number | string | undefined) ??
        (item.amount_krw as number | string | undefined) ??
        (item.price as number | string | undefined) ??
        (item.priceKrw as number | string | undefined) ??
        (item.price_krw as number | string | undefined),
    )

    return {
      id: (item.id as string) ?? `${item.createdAt ?? item.created_at ?? "history"}-${index}`,
      createdAt: (item.createdAt as string) ?? (item.created_at as string) ?? "",
      txType: (
        (item.txType as string) ??
        (item.tx_type as string) ??
        (item.type as string) ??
        (item.transactionType as string)
      )
        ?.toString()
        ?.toUpperCase() ?? "",
      displayType:
        (item.typeLabel as string) ??
        (item.type_name as string) ??
        (item.type as string) ??
        (item.transactionTypeLabel as string),
      description:
        (item.description as string) ??
        (item.detail as string) ??
        (item.memo as string) ??
        (item.title as string) ??
        (item.transactionDetail as string),
      quantity,
      tokenName,
      amountKrw,
    }
  })
}

function mapJournalItems(items: unknown[]): AccountJournalEntry[] {
  return (items || []).map((raw, index) => {
    const item = raw as Record<string, unknown>
    return {
      id: (item.id as string) ?? `${item.createdAt ?? item.created_at ?? "journal"}-${index}`,
      createdAt: (item.createdAt as string) ?? (item.created_at as string) ?? "",
      txType:
        (
          (item.txType as string) ??
          (item.tx_type as string) ??
          (item.type as string) ??
          (item.transactionType as string)
        )
          ?.toString()
          ?.toUpperCase() ?? "",
      description: (item.description as string) ?? (item.detail as string) ?? undefined,
      amountKrw: parseMaybeNumber(
        (item.amountKrw as number | string | undefined) ??
          (item.amount_krw as number | string | undefined) ??
          (item.accountKrw as number | string | undefined) ??
          (item.amount as number | string | undefined),
      ),
    }
  })
}

function parseMaybeNumber(value?: number | string | null) {
  if (typeof value === "number") {
    if (Number.isNaN(value)) return undefined
    return value
  }
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "")
    if (!normalized) return undefined
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

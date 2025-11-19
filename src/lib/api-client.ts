import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearTokens, getRefreshToken } from "./auth"

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

type ErrorResponse = {
  detail?: string
  type?: string
  status?: number
}

export async function apiFetch(input: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {})
  const accessToken = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  const doFetch = async () => {
    const res = await fetch(`${apiBase}${input}`, { ...init, headers })
    if (res.status !== 401) return res

    // Try refresh on 401 with EXPIRED_TOKEN
    let err: ErrorResponse | undefined
    try {
      err = (await res.clone().json()) as ErrorResponse
    } catch {
      // ignore parse failure
    }

    if (err?.type !== "EXPIRED_TOKEN") {
      return res
    }

    const refreshed = await tryRefresh()
    if (!refreshed) {
      clearTokens()
      return res
    }

    // retry original request with new access token
    const retryHeaders = new Headers(headers)
    const newAccess = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (newAccess) {
      retryHeaders.set("Authorization", `Bearer ${newAccess}`)
    }
    return fetch(`${apiBase}${input}`, { ...init, headers: retryHeaders })
  }

  return doFetch()
}

async function tryRefresh() {
  if (typeof window === "undefined") return false
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetch(`${apiBase}/v1/auth/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      clearTokens()
      return false
    }

    const data = (await res.json()) as { accessToken?: string; refreshToken?: string }
    if (data.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    return true
  } catch (err) {
    console.error("Refresh token failed", err)
    clearTokens()
    return false
  }
}

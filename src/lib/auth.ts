export const ACCESS_TOKEN_KEY = "accessToken"
export const REFRESH_TOKEN_KEY = "refreshToken"

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getUserId() {
  if (typeof window === "undefined") return null
  const token = getAccessToken()
  if (!token) return null
  try {
    const [, payloadBase64] = token.split(".")
    if (!payloadBase64) return null
    const payload = JSON.parse(atob(payloadBase64)) as { sub?: unknown; userId?: unknown; uid?: unknown }
    const raw = payload.sub ?? payload.userId ?? payload.uid
    if (raw === undefined || raw === null) return null
    const asNumber = Number(raw)
    return Number.isNaN(asNumber) ? String(raw) : asNumber
  } catch {
    return null
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export async function apiGet(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, { ...init, next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`)
  return res.json()
}

export async function apiPost(path: string, body?: unknown, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  })
  if (!res.ok) throw new Error(`POST ${path} ${res.status}`)
  return res.json()
}

export { API_BASE }


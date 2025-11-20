import type { OfferingStatus } from "@/lib/mock-offering"

export function deriveOfferingStatus(params: {
  progressRate?: number
  offeringStartDate?: string
  offeringEndDate?: string
}): OfferingStatus {
  const { progressRate, offeringStartDate, offeringEndDate } = params
  const now = new Date()
  const start = offeringStartDate ? new Date(offeringStartDate) : null
  const end = offeringEndDate ? new Date(offeringEndDate) : null

  if (typeof progressRate === "number" && progressRate >= 100) {
    return "ENDED"
  }

  if (start && !Number.isNaN(start.getTime()) && now < start) {
    return "UPCOMING"
  }

  if (end && !Number.isNaN(end.getTime()) && now > end) {
    return "ENDED"
  }

  if (
    start &&
    end &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    now >= start &&
    now <= end
  ) {
    return "ONGOING"
  }

  return "ONGOING"
}

export function resolveImage(src?: string) {
  if (!src) return undefined
  if (src.startsWith("http://") || src.startsWith("https://")) return src
  const base = process.env.NEXT_PUBLIC_API_URL ?? ""
  const normalized = src.startsWith("/") ? src : `/${src}`
  return `${base}${normalized}`
}

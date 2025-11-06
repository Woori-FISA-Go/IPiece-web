export type OfferingStatus = "offering" | "scheduled" | "closed"

export interface OfferingItem {
  id: string
  title: string
  subtitle: string
  priceKRW: number
  status: OfferingStatus
  statusLabel: string
  timeline: string
  thumbnail: string | null
  liked: boolean
}

export const OFFERING_STATUS_OPTIONS: { value: OfferingStatus; label: string }[] = [
  { value: "offering", label: "공모 중" },
  { value: "scheduled", label: "공모 예정" },
  { value: "closed", label: "공모 완료" },
]

export const MOCK_OFFERINGS: OfferingItem[] = [
  {
    id: "dino-tang",
    title: "다이노탱 시즌1 한정판",
    subtitle: "애니메이션 파생 캐릭터 IP",
    priceKRW: 100000,
    status: "offering",
    statusLabel: "공모 중",
    timeline: "~ 2025.12.12",
    thumbnail: null,
    liked: false,
  },
  {
    id: "space-odyssey",
    title: "스페이스 오디세이 OST",
    subtitle: "영화 OST 판권",
    priceKRW: 80000,
    status: "offering",
    statusLabel: "공모 중",
    timeline: "~ 2025.11.20",
    thumbnail: null,
    liked: false,
  },
  {
    id: "classic-series",
    title: "클래식 소설 리마스터",
    subtitle: "전세계 동시 발간 프로젝트",
    priceKRW: 120000,
    status: "scheduled",
    statusLabel: "공모 예정",
    timeline: "2026.01 예정",
    thumbnail: null,
    liked: false,
  },
  {
    id: "webtoon-star",
    title: "웹툰 스타 시즌2",
    subtitle: "IP 확장 굿즈 제작",
    priceKRW: 95000,
    status: "scheduled",
    statusLabel: "공모 예정",
    timeline: "2026.02 예정",
    thumbnail: null,
    liked: false,
  },
  {
    id: "retro-game",
    title: "레트로 게임 리마스터",
    subtitle: "콘솔/모바일 동시 출시",
    priceKRW: 110000,
    status: "closed",
    statusLabel: "공모 완료",
    timeline: "2024.09 완료",
    thumbnail: null,
    liked: false,
  },
  {
    id: "indie-music",
    title: "인디 뮤직 페스티벌",
    subtitle: "전세계 온라인 중계",
    priceKRW: 70000,
    status: "closed",
    statusLabel: "공모 완료",
    timeline: "2024.08 완료",
    thumbnail: null,
    liked: false,
  },
]

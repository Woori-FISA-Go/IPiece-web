import { Card, CardContent } from "@/components/ui/card"
import { Settings } from "lucide-react"
import Image from "next/image"
import profilePicture from "@/assets/images/profile-picture.png"

interface UserProfileCardProps {
  hasAssets?: boolean
}

export default function UserProfileCard({ hasAssets = true }: UserProfileCardProps) {
  const characters = [
    { id: 1, emoji: "🦖", name: "다이노봇" },
    { id: 2, emoji: "🎨", name: "뽀모도" },
    { id: 3, emoji: "🌸", name: "뽀뽀" },
    { id: 4, emoji: "⚡", name: "조가수" },
    { id: 5, emoji: "🌿", name: "크롱" },
    { id: 6, emoji: "🌊", name: "조구만" },
  ]

  return (
    <Card>
      <CardContent className="pt-2 px-6 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image src={profilePicture} alt="Profile picture" width={40} height={40} />
            <div className="font-bold text-gray-900">달보</div>
          </div>
          <button className="text-gray-400 hover:text-gray-600" aria-label="설정">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Character Icons */}
        <div className="mb-2">
          <div className="text-sm text-gray-700 mb-2">보유 IP</div>
          {hasAssets ? (
            <div className="flex gap-2">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="w-10 h-10 bg-amber-100 rounded flex items-center justify-center text-xl"
                  title={char.name}
                >
                  {char.emoji}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-lg font-bold text-gray-900">0개</div>
          )}
        </div>

        {/* Financial Information */}
        <div className="flex justify-between items-center text-sm mt-6 gap-x-8">
            <div className="flex items-center w-1/2">
                <span className="text-gray-500">보유 KRW</span>
                <span className="text-lg font-bold text-gray-900 ml-auto">{hasAssets ? "29,329" : "0"} <span className="text-xs font-normal">KRW</span></span>
            </div>
            <div className="flex items-center w-1/2">
                <span className="text-gray-500">총 보유자산</span>
                <span className="text-lg font-bold text-gray-900 ml-auto">{hasAssets ? "384,892" : "0"} <span className="text-xs font-normal">KRW</span></span>
            </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4 grid grid-cols-2 gap-x-8 text-sm">
            <div>
              <div className="flex justify-between">
                <span className="text-gray-500">총 매수</span>
                <span>{hasAssets ? "3,213,943" : "0"} <span className="text-xs">KRW</span></span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">총 평가</span>
                <span>{hasAssets ? "435,982" : "0"} <span className="text-xs">KRW</span></span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">주문가능</span>
                <span>{hasAssets ? "29,329" : "0"} <span className="text-xs">KRW</span></span>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-gray-500">총평가손익</span>
                <span className={hasAssets ? "text-red-500" : ""}>{hasAssets ? "+1,847,437" : "0"} <span className="text-xs">KRW</span></span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">총평가수익률</span>
                <span className={hasAssets ? "text-red-500" : ""}>{hasAssets ? "+15" : "0"}<span className="text-xs">%</span></span>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  )
}

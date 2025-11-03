"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import UserProfileCard from "@/app/(pages)/mypage/components/UserProfileCard"
import PortfolioPieChart from "@/app/(pages)/mypage/components/PortfolioPieChart"
import AssetTable from "@/app/(pages)/mypage/components/AssetTable"
import Image from "next/image"
import myHomeEmptyState from "@/assets/images/my-home-empty-state.png"
import profilePicture from "@/assets/images/profile-picture.png"

interface MyPortfolioProps {
  hasAssets?: boolean
}

export default function MyPortfolio({ hasAssets = true }: MyPortfolioProps) {
  if (!hasAssets) {
    return (
      <>
        {/* Top Section: Profile Card and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UserProfileCard hasAssets={false} />
          <PortfolioPieChart hasAssets={false} />
        </div>

        {/* Bottom Section: Asset Table */}
        <AssetTable hasAssets={false} />
      </>
    )
  }

  return (
    <>
      {/* Top Section: Profile Card and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UserProfileCard />
        <PortfolioPieChart />
      </div>

      {/* Bottom Section: Asset Table */}
      <AssetTable />
    </>
  )
}

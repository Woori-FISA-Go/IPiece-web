"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import Logo from "../../main/assets/Logo.png"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ username: "", password: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const oneWeek = 60 * 60 * 24 * 7
    const username = formData.username || 'guest'
    document.cookie = `logged_in=true; Max-Age=${oneWeek}; Path=/`
    document.cookie = `user_name=${encodeURIComponent(username)}; Max-Age=${oneWeek}; Path=/`
    router.push('/main')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-6 md:px-12 lg:px-0">
      {/* Logo: floats on white, outside gray card */}
      <div className="flex justify-center mb-8">
        <Link href="/main" className="cursor-pointer" aria-label="Go to main">
          <Image src={Logo} alt="IPIECE Logo" className="h-14 w-auto object-contain" />
        </Link>
      </div>

      {/* Card */}
      <div className="bg-[#FAFAFA] rounded-[10px] p-10 w-full max-w-[470px] border border-gray-200">
        <div className="mx-auto w-[86%]">
          <h1 className="text-[20px] font-bold text-left mb-5">{"\uB85C\uADF8\uC778"}</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-semibold mb-1">{"\uC544\uC774\uB514"}</label>
              <Input
                type="text"
                placeholder={"\uC544\uC774\uB514\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full h-[48px] text-[14px] text-[#1F2229] rounded-[8px] border border-[#E0E4EC] bg-white placeholder:text-[12px] placeholder:text-[#6C7384] focus-visible:ring-0 focus-visible:border-[#3386E5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-1">{"\uBE44\uBC00\uBC88\uD638"}</label>
              <Input
                type="password"
                placeholder={"\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-[48px] text-[14px] text-[#1F2229] rounded-[8px] border border-[#E0E4EC] bg-white placeholder:text-[12px] placeholder:text-[#6C7384] focus-visible:ring-0 focus-visible:border-[#3386E5]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3386E5] text-white py-6 rounded-[8px] text-[13px] font-semibold hover:bg-[#2970cc] transition mt-8 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              {"\uB2E4\uC74C"}
            </Button>
          </form>
          <div className="text-center mt-6 text-[11px]">
            <span className="text-[#A2A2A2] text-[11px]">{"IPiece\uAC00 \uCC98\uC74C\uC774\uC2E0\uAC00\uC694?"}</span>
            <button
              onClick={() => router.push("/auth/verification")}
              className="ml-3 text-[#3386E5] font-semibold text-[12px] cursor-pointer no-underline"
            >
              {"\uD68C\uC6D0\uAC00\uC785"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

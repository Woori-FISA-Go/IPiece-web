"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import Logo from "../../main/assets/Logo.png"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/auth"
import { apiFetch } from "@/lib/api-client"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.username.trim() || !formData.password) {
      setError("아이디와 비밀번호를 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      const res = await apiFetch(`/v1/auth/token/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formData.username.trim(),
          password: formData.password,
        }),
      })

      if (!res.ok) {
        let detailMessage: string | undefined
        try {
          const errBody = (await res.json()) as { detail?: string }
          detailMessage = errBody?.detail
        } catch (parseErr) {
          console.error("Failed to parse error response", parseErr)
        }
        setError(detailMessage || `로그인에 실패했습니다. (코드 ${res.status})`)
        return
      }

      const data = (await res.json()) as {
        accessToken?: string
        refreshToken?: string
        message?: string
      }

      if (data.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
      if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)

      if (typeof window !== "undefined") {
        // lightweight logged-in flag for UI; token validation should be done server-side where needed
        localStorage.setItem("logged_in", "true")
      }

      router.push("/main")
    } catch (err) {
      console.error("Login failed", err)
      const message =
        err instanceof TypeError
          ? "서버에 연결할 수 없습니다. 네트워크를 확인하거나 잠시 후 다시 시도해주세요."
          : err instanceof Error && err.message
            ? err.message
            : "아이디/비밀번호를 확인하거나 잠시 후 다시 시도해주세요."
      setError(message)
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-[20px] font-bold text-left mb-5">{"로그인"}</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-semibold mb-1">{"아이디"}</label>
              <Input
                type="text"
                placeholder={"아이디를 입력해주세요."}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full h-[48px] text-[14px] text-[#1F2229] rounded-[8px] border border-[#E0E4EC] bg-white placeholder:text-[12px] placeholder:text-[#6C7384] focus-visible:ring-0 focus-visible:border-[#3386E5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold mb-1">{"비밀번호"}</label>
              <Input
                type="password"
                placeholder={"비밀번호를 입력해주세요."}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-[48px] text-[14px] text-[#1F2229] rounded-[8px] border border-[#E0E4EC] bg-white placeholder:text-[12px] placeholder:text-[#6C7384] focus-visible:ring-0 focus-visible:border-[#3386E5]"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3386E5] text-white py-6 rounded-[8px] text-[13px] font-semibold hover:bg-[#2970cc] transition mt-8 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "다음"}
            </Button>
            {error ? <p className="text-xs text-red-500 text-center">{error}</p> : null}
          </form>
          <div className="text-center mt-6 text-[11px]">
            <span className="text-[#A2A2A2] text-[11px]">{"IPiece가 처음이신가요?"}</span>
            <button
              onClick={() => router.push("/auth/verification")}
              className="ml-3 text-[#3386E5] font-semibold text-[12px] cursor-pointer no-underline"
            >
              {"회원가입"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

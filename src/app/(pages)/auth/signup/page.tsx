"use client"

import dynamic from "next/dynamic"
import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog"
import { MediaUploadModal } from "../components/media-upload-modal"
import Logo from "../../main/assets/Logo.png"
import FolderIcon from "../assets/folder_icon.png"
import type { LottieRefCurrentProps } from "lottie-react"
import { apiFetch } from "@/lib/api-client"

const inputFieldClass =
  "h-[52px] rounded-[8px] border border-[#E0E4EC] bg-white px-4 text-[14px] text-[#1F2229] placeholder:text-[#A0A6B0] focus-visible:ring-0 focus-visible:border-[#3386E5]"

const labelClass = "block text-[12px] font-semibold mb-2"
const helperTextClass = "text-[12px]"
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })
const CELEBRATION_PATH = "/Users/joeun/Desktop/woori/IPiece-web/src/assets/lottie/Celebration.lottie"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneFromVerify = useMemo(() => searchParams.get("phone") || "", [searchParams])
  const birthFromVerify = useMemo(() => searchParams.get("birth") || "", [searchParams])
  const verifiedFromVerify = useMemo(() => searchParams.get("verified") === "true", [searchParams])

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    name: "",
    address: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  const handleCheckUsername = async () => {
    const username = formData.username.trim()

    if (!username) {
      setUsernameError("아이디를 입력해주세요.")
      setUsernameAvailable(false)
      return
    }

    if (username.length < 5) {
      setUsernameError("아이디는 5자 이상이어야 합니다.")
      setUsernameAvailable(false)
      return
    }

    if (!/^[A-Za-z0-9]+$/.test(username)) {
      setUsernameError("아이디는 영문과 숫자만 사용할 수 있습니다.")
      setUsernameAvailable(false)
      return
    }

    try {
      setIsCheckingUsername(true)
      const search = new URLSearchParams({ id: username })
      const res = await apiFetch(`/v1/signup/duplicate-check?${search.toString()}`, {
        method: "GET",
      })

      const data = (await res.json().catch(() => ({}))) as { available?: boolean; message?: string }

      if (!res.ok || data.available === false) {
        setUsernameError(data.message || "중복 확인에 실패했습니다.")
        setUsernameAvailable(false)
        return
      }

      setUsernameError(null)
      setUsernameAvailable(true)
    } catch (error) {
      console.error("Failed to check username availability", error)
      setUsernameError("서버 연결을 확인하고 다시 시도해주세요.")
      setUsernameAvailable(false)
    } finally {
      setIsCheckingUsername(false)
    }
  }

  const buildPasswordErrors = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push("비밀번호는 최소 8자 이상이어야 합니다.")
    if (!/[A-Z]/.test(password)) errors.push("비밀번호는 대문자가 1자 이상 포함되어야 합니다.")
    if (!/[a-z]/.test(password)) errors.push("비밀번호는 소문자가 1자 이상 포함되어야 합니다.")
    if (!/[0-9]/.test(password)) errors.push("비밀번호는 숫자가 1자 이상 포함되어야 합니다.")
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) errors.push("비밀번호는 특수문자가 1자 이상 포함되어야 합니다.")
    return errors
  }

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value })
    setPasswordErrors(value ? buildPasswordErrors(value) : [])
    if (formData.passwordConfirm) {
      setPasswordMatch(value === formData.passwordConfirm)
    }
  }

  const handlePasswordConfirmChange = (value: string) => {
    setFormData({ ...formData, passwordConfirm: value })
    if (formData.password && value) {
      setPasswordMatch(formData.password === value)
    } else {
      setPasswordMatch(null)
    }
  }

  const isFormValid = () =>
    !!(
      formData.username &&
      usernameAvailable &&
      usernameError === null &&
      formData.password &&
      passwordErrors.length === 0 &&
      formData.passwordConfirm &&
      passwordMatch &&
      formData.name &&
      formData.address &&
      uploadedFiles.length > 0 &&
      phoneFromVerify &&
      birthFromVerify &&
      verifiedFromVerify
    )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError(null)
    if (!isFormValid()) return
    if (!uploadedFiles[0]) {
      setSubmitError("신분증 파일을 업로드해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      const fileUrl = uploadedFiles[0]
      const blob = await fetch(fileUrl).then((res) => res.blob())
      const fileName = "id_card" + (blob.type.includes("pdf") ? ".pdf" : ".png")
      const idCardFile = new File([blob], fileName, { type: blob.type || "application/octet-stream" })

      const requestPayload = {
        id: formData.username,
        password: formData.password,
        name: formData.name,
        address: formData.address,
        phone: phoneFromVerify,
        birth: birthFromVerify,
        verified: verifiedFromVerify,
      }

      const body = new FormData()
      body.append("request", new Blob([JSON.stringify(requestPayload)], { type: "application/json" }))
      body.append("id_card", idCardFile)

      const res = await apiFetch("/v1/signup/info", {
        method: "POST",
        body,
      })

      if (!res.ok) {
        let message: string | undefined
        try {
          const err = (await res.json()) as { detail?: string; message?: string }
          message = err.detail || err.message
        } catch {
          /* ignore */
        }
        throw new Error(message || "회원가입에 실패했습니다.")
      }

      setShowSuccessModal(true)
    } catch (err) {
      console.error("Signup failed", err)
      setSubmitError(err instanceof Error ? err.message : "회원가입에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (showSuccessModal && lottieRef.current?.setSpeed) {
      lottieRef.current.setSpeed(0.7)
    }
  }, [showSuccessModal])

  const handleCloseSuccess = () => {
    setShowSuccessModal(false)
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-6 md:px-12 lg:px-0">
      <div className="w-full max-w-[520px] rounded-[12px] border border-[#E6E9F0] bg-white p-9 shadow-md">
        <div className="flex justify-start mb-4">
          <Link href="/main" className="cursor-pointer" aria-label="Go to main">
            <Image src={Logo} alt="IPIECE Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>
        <h1 className="mb-6 text-left text-[20px] font-bold">회원가입</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className={labelClass}>
              아이디 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="아이디를 입력해주세요."
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => {
                    const nextValue = e.target.value.replace(/[^A-Za-z0-9]/g, "")
                    setUsernameAvailable(null)
                    if (nextValue && nextValue.length < 5) {
                      setUsernameError("아이디는 5자 이상이어야 합니다.")
                    } else {
                      setUsernameError(null)
                    }
                    return { ...prev, username: nextValue }
                  })
                }
                className={`flex-1 ${inputFieldClass}`}
              />
              <Button
                type="button"
                onClick={handleCheckUsername}
                disabled={isCheckingUsername}
                variant="outline"
                className="h-[52px] whitespace-nowrap rounded-[8px] border-[#3386E5] bg-transparent px-4 text-[12px] hover:bg-blue-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isCheckingUsername ? "확인 중..." : "중복검사"}
              </Button>
            </div>
            {usernameAvailable === true && (
              <div className="flex items-center gap-2 rounded-md bg-[#EDFDF8] px-3 py-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Done-AThFoSt9DqXEuLi0jwjFydhA4t28tr.png"
                  alt="Success"
                  width={16}
                  height={16}
                />
                <span className={`${helperTextClass} text-black`}>사용 가능한 아이디입니다.</span>
              </div>
            )}
            {usernameAvailable === false && usernameError && (
              <div className="flex items-center gap-2 rounded-md bg-[#FEF1F2] px-3 py-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Error-K9PTWKSZz4DbA3eEFw6aS3Om28TIS2.png"
                  alt="Error"
                  width={16}
                  height={16}
                />
                <span className={`${helperTextClass} text-[#E83B46]`}>{usernameError}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={inputFieldClass}
            />
            {passwordErrors.length > 0 && formData.password && (
              <div className="mt-2 space-y-1">
                {passwordErrors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md bg-[#FEF1F2] px-3 py-2">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Error-K9PTWKSZz4DbA3eEFw6aS3Om28TIS2.png"
                      alt="Error"
                      width={16}
                      height={16}
                    />
                    <span className={`${helperTextClass} text-[#E83B46]`}>{error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={formData.passwordConfirm}
              onChange={(e) => handlePasswordConfirmChange(e.target.value)}
              className={inputFieldClass}
            />
            {passwordMatch === false && (
              <p className={`${helperTextClass} text-[#E83B46]`}>비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>이름</label>
            <Input
              type="text"
              placeholder="이름을 입력해주세요."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputFieldClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>주소</label>
            <Input
              type="text"
              placeholder="주소를 입력해주세요."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={inputFieldClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>신분증 사진 업로드</label>
            <div
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer rounded-[10px] border border-dashed border-[#94B7F5] bg-[#F8FAFF] p-6 text-center transition hover:bg-[#eef4ff]"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F1FF]">
                <Image src={FolderIcon} alt="폴더 아이콘" width={28} height={28} className="h-7 w-7 object-contain" />
              </div>
              <p className="text-sm font-medium text-[#1F2229]">Drag your file(s) to start uploading</p>
              <div className="my-3 text-xs text-[#A0A6B0]">OR</div>
              <div className="inline-flex h-[36px] items-center justify-center rounded-[8px] border border-[#3386E5] px-4 text-[12px] font-semibold text-[#3386E5]">
                Browse files
              </div>
              {uploadedFiles.length > 0 ? (
                <p className="mt-3 text-xs text-[#1F2229]">{uploadedFiles.length}개 파일 업로드됨</p>
              ) : null}
            </div>
            <div className="flex items-start gap-2 rounded-md bg-[#E8F4FF] px-3 py-2 text-[11px] text-[#1D4ED8]">
              <span className="leading-5">ℹ️</span>
              <span>주민번호 뒷자리는 반드시 가리고 올려주세요</span>
            </div>
          </div>

          {submitError ? <p className="text-sm text-red-500 text-right">{submitError}</p> : null}

          <Button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className="w-full bg-[#3386E5] text-white py-6 rounded-[8px] text-[13px] font-semibold hover:bg-[#2970cc] transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:bg-[#E8EBF1] disabled:text-[#9EA4B3]"
          >
            {isSubmitting ? "가입 중..." : "가입하기"}
          </Button>
        </form>
      </div>

      <MediaUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={(files) => {
          setUploadedFiles(files)
          setIsModalOpen(false)
        }}
      />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="w-full max-w-sm gap-0 bg-white p-0 rounded-2xl">
          <DialogTitle className="sr-only">회원가입 완료</DialogTitle>
          <div className="flex flex-col items-center gap-4 px-6 py-8">
            <div className="h-48 w-48">
              <Lottie lottieRef={lottieRef} path={CELEBRATION_PATH} loop={false} autoplay />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-semibold text-[#0f172a]">회원가입에 성공했습니다.</h3>
              <p className="text-sm text-[#6b7280]">로그인 페이지로 이동합니다.</p>
            </div>
            <Button
              className="h-11 w-full rounded-lg bg-[#3386E5] hover:bg-[#2a75d0]"
              onClick={handleCloseSuccess}
            >
              로그인 하러가기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

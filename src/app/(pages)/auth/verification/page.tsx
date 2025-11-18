"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import Logo from "../../main/assets/Logo.png"
import DownIcon from "../assets/down_icon.png"

const CARRIERS = ["SKT", "KT", "LG U+", "알뜰폰"] as const

type Carrier = (typeof CARRIERS)[number]

type AgreementId = "phone" | "personal" | "junior"

type FormState = {
  name: string
  nationality: string
  birthDate: string
  gender: string
  phoneNumber: string
  verificationCode: string
}

const inputClass =
  "h-[52px] rounded-[8px] border border-[#E0E4EC] bg-white px-4 text-[14px] text-[#1F2229] placeholder:text-[#7A808F] focus-visible:ring-0 focus-visible:border-[#3386E5]"

const selectClass =
  "option-centered h-[52px] w-full rounded-[8px] border border-[#E0E4EC] bg-white pl-4 pr-8 text-[14px] font-semibold text-[#8C92A3] text-center focus:outline-none focus:border-[#3386E5] cursor-pointer appearance-none [text-align-last:center]"

const secondaryButtonBase =
  "h-[52px] rounded-[8px] text-[14px] font-semibold transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"

const carrierButtonBase =
  "flex flex-1 h-[60px] items-center justify-center text-[15px] font-semibold transition border border-[#E0E4EC] cursor-pointer"

const DEFAULT_CARRIER_TEXT = "text-[#8C92A3]"

const AGREEMENTS = [
  { id: "phone", label: "휴대폰 본인 확인 서비스 약관동의", required: true },
  { id: "personal", label: "개인(신용)정보 수집 이용 동의", required: true },
  { id: "junior", label: "준회원 이용약관", required: false },
] satisfies Array<{ id: AgreementId; label: string; required: boolean }>

export default function VerificationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>({
    name: "",
    nationality: "",
    birthDate: "",
    gender: "",
    phoneNumber: "",
    verificationCode: "",
  })
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | "">("")
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationConfirmed, setVerificationConfirmed] = useState(false)
  const [agreements, setAgreements] = useState({
    all: false,
    phone: false,
    personal: false,
    junior: false,
  })

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length < 4) return digits
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  const formatBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8)
    if (digits.length <= 4) return digits
    if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`
  }

  const handleSendVerification = () => {
    if (!formData.phoneNumber) return
    setVerificationSent(true)
    alert("인증번호가 발송되었습니다")
  }

  const handleConfirmVerification = () => {
    if (formData.verificationCode) setVerificationConfirmed(true)
  }

  const toggleAgreement = (key: AgreementId, checked: boolean) => {
    setAgreements((prev) => {
      const next = { ...prev, [key]: checked }
      next.all = next.phone && next.personal && next.junior
      return next
    })
  }

  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      all: checked,
      phone: checked,
      personal: checked,
      junior: checked,
    })
  }

  const isFormValid = () =>
    !!(
      formData.name &&
      formData.birthDate &&
      formData.nationality &&
      formData.gender &&
      selectedCarrier &&
      formData.phoneNumber &&
      verificationConfirmed &&
      agreements.phone &&
      agreements.personal
    )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!formData.nationality) {
      alert("국적을 선택해주세요")
      return
    }
    if (!formData.gender) {
      alert("성별을 선택해주세요")
      return
    }
    if (isFormValid()) router.push("/auth/signup")
  }

  const renderCarrierButton = (carrier: Carrier, index: number) => {
    const isSelected = selectedCarrier === carrier
    const tone = isSelected
      ? "bg-[#3386E5] text-white hover:bg-[#2D75D6]"
      : `bg-white ${DEFAULT_CARRIER_TEXT} hover:bg-[#F4F6FA]`
    const separator = index !== 0 ? "border-l border-l-[#E0E4EC]" : ""
    return (
      <button
        key={carrier}
        type="button"
        onClick={() => setSelectedCarrier(carrier)}
        className={`${carrierButtonBase} ${tone} ${separator}`}
      >
        {carrier}
      </button>
    )
  }

  const secondaryButtonClass = (disabled: boolean) =>
    disabled
      ? `${secondaryButtonBase} bg-[#E7EAF1] text-[#9EA4B3]`
      : `${secondaryButtonBase} bg-[#BCC0C8] text-white hover:bg-[#B0B5BE]`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-6 md:px-12 lg:px-0">
      <div className="w-full max-w-[520px] rounded-[12px] border border-[#E6E9F0] bg-white p-9 shadow-md">
        <div className="flex justify-start mb-4">
          <Link href="/main" className="cursor-pointer" aria-label="Go to main">
            <Image src={Logo} alt="IPIECE Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-[26px] font-bold text-left text-[#1F2229]">Welcome To IPiece</h1>
            <h2 className="text-[18px] font-bold text-[#22242A]">본인인증</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,22%)] items-start gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-[17px] font-semibold text-[#262933]">이름</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-semibold text-transparent select-placeholder" aria-hidden="true">
                  국적
                </span>
                <div className="relative flex justify-center">
                  <select
                    className={selectClass}
                    aria-label="국적"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    style={{ textAlign: "center", textAlignLast: "center" }}
                  >
                    <option value="" className="text-center" style={{ textAlign: "center" }}>
                      국적
                    </option>
                    <option value="내국인" className="text-center" style={{ textAlign: "center" }}>
                      내국인
                    </option>
                    <option value="외국인" className="text-center" style={{ textAlign: "center" }}>
                      외국인
                    </option>
                  </select>
                  <Image
                    src={DownIcon}
                    alt=""
                    width={18}
                    height={18}
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[14px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,22%)] items-start gap-3 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[17px] font-semibold text-[#262933]">생년월일</label>
                <Input
                  type="text"
                  placeholder="YYYY MM DD"
                  maxLength={10}
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: formatBirthDate(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-semibold text-transparent select-placeholder" aria-hidden="true">
                  성별
                </span>
                <div className="relative flex justify-center">
                  <select
                    className={selectClass}
                    aria-label="성별"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{ textAlign: "center", textAlignLast: "center" }}
                  >
                    <option value="" className="text-center" style={{ textAlign: "center" }}>
                      성별
                    </option>
                    <option value="남성" className="text-center" style={{ textAlign: "center" }}>
                      남성
                    </option>
                    <option value="여성" className="text-center" style={{ textAlign: "center" }}>
                      여성
                    </option>
                  </select>
                  <Image
                    src={DownIcon}
                    alt=""
                    width={18}
                    height={18}
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[14px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex rounded-[8px] overflow-hidden border border-[#E0E4EC] my-2">
              {CARRIERS.map((carrier, index) => renderCarrierButton(carrier, index))}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-4">
              <Input
                type="tel"
                placeholder="휴대전화 번호"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: formatPhone(e.target.value) })}
                className={inputClass}
              />
              <Button
                type="button"
                onClick={handleSendVerification}
                disabled={verificationSent}
                className={secondaryButtonClass(verificationSent)}
              >
                인증번호 발송
              </Button>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-4">
              <Input
                type="text"
                placeholder="인증번호를 입력해주세요"
                value={formData.verificationCode}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^\d*$/.test(value)) setFormData({ ...formData, verificationCode: value })
                }}
                disabled={!verificationSent}
                className={inputClass}
              />
              <Button
                type="button"
                onClick={handleConfirmVerification}
                disabled={verificationConfirmed || !verificationSent}
                className={secondaryButtonClass(verificationConfirmed || !verificationSent)}
              >
                확인
              </Button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="all"
                  checked={agreements.all}
                  onCheckedChange={(checked) => handleAllAgreement(checked === true)}
                />
                <label htmlFor="all" className="text-[15px] font-semibold text-[#262933] cursor-pointer">
                  약관에 모두 동의
                </label>
              </div>

              <div className="space-y-3 pl-7">
                {AGREEMENTS.map(({ id, label, required }) => (
                  <div key={id} className="flex items-center space-x-3">
                    <Checkbox
                      id={id}
                      checked={agreements[id]}
                      onCheckedChange={(checked) => toggleAgreement(id as AgreementId, checked === true)}
                    />
                    <label htmlFor={id} className="text-[15px] font-semibold text-[#343842] cursor-pointer">
                      {label}
                      <span className="ml-2 text-[11px] font-normal text-[#7A808F]">
                        {required ? "(필수)" : "(선택)"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-7">
              <Button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full h-[56px] rounded-[8px] text-[14px] font-semibold transition cursor-pointer disabled:cursor-not-allowed ${
                  isFormValid()
                    ? "bg-[#3386E5] text-white hover:bg-[#2D75D6]"
                    : "bg-[#D9DDE5] text-[#A0A6B0]"
                }`}
              >
                다음
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

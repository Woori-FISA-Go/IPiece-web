"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { MediaUploadModal } from "../components/media-upload-modal"
import Logo from "../../main/assets/Logo.png"

const inputFieldClass =
  "h-[52px] rounded-[8px] border border-[#E0E4EC] bg-white px-4 text-[14px] text-[#1F2229] placeholder:text-[#A0A6B0] focus-visible:ring-0 focus-visible:border-[#3386E5]"

const labelClass = "block text-[12px] font-semibold mb-2"

const helperTextClass = "text-[12px]"

export default function SignupPage(): JSX.Element {
  const router = useRouter()
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
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const handleCheckUsername = () => {
    const username = formData.username.trim()

    if (!username) {
      setUsernameError("\uC544\uC774\uB514\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.")
      setUsernameAvailable(false)
      return
    }

    if (username.length < 5) {
      setUsernameError("\uC544\uC774\uB514\uB294 5\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.")
      setUsernameAvailable(false)
      return
    }

    if (!/^[A-Za-z0-9]+$/.test(username)) {
      setUsernameError("\uC544\uC774\uB514\uB294 \uC601\uBB38\uACFC \uC22B\uC790\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")
      setUsernameAvailable(false)
      return
    }

    try {
      if (typeof window !== "undefined") {
        const storedList = window.localStorage.getItem("ipiece_users")
        const existingUsers: Array<{ username: string }> = storedList ? JSON.parse(storedList) : []

        if (existingUsers.some((user) => user.username === username)) {
          setUsernameError("\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.")
          setUsernameAvailable(false)
          return
        }

        const legacyUser = window.localStorage.getItem("ipiece_user")
        if (legacyUser) {
          const parsed = JSON.parse(legacyUser)
          if (parsed?.username === username) {
            setUsernameError("\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.")
            setUsernameAvailable(false)
            return
          }
        }
      }

      setUsernameError(null)
      setUsernameAvailable(true)
    } catch (error) {
      console.error("Failed to check username availability", error)
      setUsernameError("\uC544\uC774\uB514 \uD655\uC778 \uC911 \uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.")
      setUsernameAvailable(false)
    }
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push("鍮꾨?踰덊샇??理쒖냼 8???댁긽?댁뼱???⑸땲??")
    if (!/[A-Z]/.test(password)) errors.push("鍮꾨?踰덊샇???臾몄옄媛 ?ы븿?섏뼱???⑸땲??")
    if (!/[a-z]/.test(password)) errors.push("鍮꾨?踰덊샇???뚮Ц?먭? ?ы븿?섏뼱???⑸땲??")
    if (!/[0-9]/.test(password)) errors.push("鍮꾨?踰덊샇???レ옄媛 ?ы븿?섏뼱???⑸땲??")
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) errors.push("鍮꾨?踰덊샇???뱀닔臾몄옄媛 ?ы븿?섏뼱???⑸땲??")
    return errors
  }

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value })
    setPasswordErrors(value ? validatePassword(value) : [])
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
      uploadedFiles.length > 0
    )

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!isFormValid()) return
    try {
      const user = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        address: formData.address,
        files: uploadedFiles,
      }
      if (typeof window !== "undefined") {
        const storedList = window.localStorage.getItem("ipiece_users")
        const users: Array<typeof user> = storedList ? JSON.parse(storedList) : []
        if (users.some((existing) => existing.username === user.username)) {
          setUsernameError("\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.")
          setUsernameAvailable(false)
          alert("\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC544\uC774\uB514\uC785\uB2C8\uB2E4.")
          return
        }
        users.push(user)
        window.localStorage.setItem("ipiece_users", JSON.stringify(users))
        window.localStorage.setItem("ipiece_user", JSON.stringify(user))
      }
      router.push("/auth/login")
    } catch (e) {
      alert("\uAC00\uC785 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.")
    }
  }
  const dragText = "Drag your file to start uploading"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10 px-6 md:px-12 lg:px-0">
      <div className="w-full max-w-[520px] rounded-[12px] border border-[#E6E9F0] bg-white p-9 shadow-md">
        <div className="flex justify-start mb-4">
          <Link href="/main" className="cursor-pointer" aria-label="Go to main">
            <Image src={Logo} alt="IPIECE Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>
        <h1 className="mb-6 text-left text-[20px] font-bold">{"\uD68C\uC6D0\uAC00\uC785"}</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className={labelClass}>
              {"\uC544\uC774\uB514"} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={"\uC544\uC774\uB514\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."}
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => {
                    const nextValue = e.target.value.replace(/[^A-Za-z0-9]/g, "")
                    setUsernameAvailable(null)
                    if (nextValue && nextValue.length < 5) {
                      setUsernameError("\uC544\uC774\uB514\uB294 5\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.")
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
                variant="outline"
                className="h-[52px] whitespace-nowrap rounded-[8px] border-[#3386E5] bg-transparent px-4 text-[12px] hover:bg-blue-50 cursor-pointer"
              >
                {"\uC911\uBCF5\uAC80\uC0AC"}
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
                <span className={`${helperTextClass} text-black`}>
                  {"\uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uC544\uC774\uB514\uC785\uB2C8\uB2E4."}
                </span>
              </div>
            )}
            {usernameError && (
              <div className="flex items-center gap-2 rounded-md bg-[#FEF1F2] px-3 py-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Error-K9PTWKSZz4DbA3eEFw6aS3Om28TIS2.png"
                  alt="Error"
                  width={16}
                  height={16}
                />
                <span className={`${helperTextClass} text-black`}>{usernameError}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <label className={labelClass}>
                {"\uBE44\uBC00\uBC88\uD638"} <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-500">
                {"8\uC790 \uC774\uC0C1, \uB300/\uC18C\uBB38\uC790, \uC22B\uC790, \uD2B9\uC218\uBB38\uC790 \uD3EC\uD568"}
              </span>
            </div>
            <Input
              type="password"
              placeholder={"\uBE44\uBC00\uBC88\uD638 \uC785\uB825"}
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
                    <span className={`${helperTextClass} text-black`}>{error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              {"\uBE44\uBC00\uBC88\uD638 \uD655\uC778"} <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              placeholder={"\uBE44\uBC00\uBC88\uD638 \uD655\uC778"}
              value={formData.passwordConfirm}
              onChange={(e) => handlePasswordConfirmChange(e.target.value)}
              className={inputFieldClass}
            />
            {passwordMatch === false && (
              <div className="flex items-center gap-2 rounded-md bg-[#FEF1F2] px-3 py-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Error-K9PTWKSZz4DbA3eEFw6aS3Om28TIS2.png"
                  alt="Error"
                  width={16}
                  height={16}
                />
                <span className={`${helperTextClass} text-black`}>
                  {"\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              {"\uC774\uB984"} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder={"\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694."}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={(e) =>
                setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\uAC00-\uD7A3\s]/g, "") })
              }
              className={inputFieldClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              {"\uC8FC\uC18C"} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder={"\uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={inputFieldClass}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>
              {"\uC2E0\uBD84\uC99D \uC5C5\uB85C\uB4DC"} <span className="text-red-500">*</span>
            </label>
            <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-7 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
              <div className="flex flex-col items-center gap-2.5">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upload-K5PppdKIVEW0RAgCfvo4VeVLkTxlaG.png"
                  alt="Upload"
                  width={48}
                  height={48}
                />
                <p className="text-[12px] text-gray-600">{dragText}</p>
                <p className="text-[11px] text-gray-400">OR</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-[8px] border-[#3386E5] px-4 py-2 text-[12px] text-[#3386E5] hover:bg-blue-50 cursor-pointer"
                >
                  Browse files
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-[#F0F5FF] px-3 py-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Info-rmFP19dDCiXfeGyzBAKgeTtDTHSSrA.png"
                alt="Info"
                width={16}
                height={16}
              />
              <span className={`${helperTextClass} text-black`}>
                {"\uC8FC\uBBFC\uBC88\uD638 \uB4B7\uC790\uB9AC\uB294 \uBC18\uB4DC\uC2DC \uAC00\uB9AC\uACE0 \uC62C\uB824\uC8FC\uC138\uC694"}
              </span>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="rounded bg-gray-50 p-2 text-[12px] text-gray-700">
                    {file}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full h-[56px] rounded-[8px] text-[14px] font-semibold transition cursor-pointer disabled:cursor-not-allowed ${
              isFormValid()
                ? "bg-[#3386E5] text-white hover:bg-[#2D75D6]"
                : "bg-[#D9DDE5] text-[#A0A6B0]"
            }`}
          >
            {"\uAC00\uC785\uD558\uAE30"}
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
    </div>
  )
}





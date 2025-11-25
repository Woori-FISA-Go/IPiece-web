'use client'

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { apiFetch } from '@/lib/api-client'

type FormState = {
  productName: string
  projectName: string
  owner: string
  tokenName: string
  tokenSymbol: string
  tokenQuantity: string
  issuePrice: string
  issueDate: string
  dividendRatio: string
  offeringPrice: string
  offeringAmount: string
  offeringStartDate: string
  offeringEndDate: string
  presentImg: string | null
  thumbnailImg: string | null
  detailImg: string | null
}

const currencyFormatter = new Intl.NumberFormat('ko-KR')

export default function NewContestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formState, setFormState] = useState<FormState>({
    productName: '',
    projectName: '',
    owner: '',
    tokenName: '',
    tokenSymbol: '',
    tokenQuantity: '',
    issuePrice: '',
    issueDate: '',
    dividendRatio: '',
    offeringPrice: '',
    offeringAmount: '',
    offeringStartDate: '',
    offeringEndDate: '',
    presentImg: null,
    thumbnailImg: null,
    detailImg: null,
  })
  const [status, setStatus] = useState<'offering' | 'ended' | 'market'>('offering')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target
    const field = id as keyof FormState
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
    key: keyof Pick<FormState, 'presentImg' | 'thumbnailImg' | 'detailImg'>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setFormState((prev) => ({
        ...prev,
        [key]: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const isOfferingQuantityMismatch = useMemo(() => {
    const tokenQuantity = Number(formState.tokenQuantity)
    const offeringAmount = Number(formState.offeringAmount)
    if (Number.isNaN(tokenQuantity) || Number.isNaN(offeringAmount)) return false
    return tokenQuantity !== offeringAmount
  }, [formState.tokenQuantity, formState.offeringAmount])

  const isOfferingPriceMismatch = useMemo(() => {
    const issuePrice = Number(formState.issuePrice)
    const offeringPrice = Number(formState.offeringPrice)
    if (Number.isNaN(issuePrice) || Number.isNaN(offeringPrice)) return false
    return issuePrice !== offeringPrice
  }, [formState.issuePrice, formState.offeringPrice])

  const offeringTotal = useMemo(() => {
    const price = Number(formState.offeringPrice)
    const amount = Number(formState.offeringAmount)
    if (Number.isNaN(price) || Number.isNaN(amount)) return null
    return price * amount
  }, [formState.offeringPrice, formState.offeringAmount])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isOfferingQuantityMismatch) {
      toast({
        title: '모집 수량을 확인해 주세요',
        description: '토큰 정보의 발행 수량과 공모 모집 수량이 일치해야 합니다.',
      })
      return
    }
    if (isOfferingPriceMismatch) {
      toast({
        title: '공모가를 확인해 주세요',
        description: '토큰당 발행 금액과 공모 설정의 공모가가 동일해야 합니다.',
      })
      return
    }
    if (offeringTotal === null) {
      toast({
        title: '공모 정보를 입력해 주세요',
        description: '공모가와 공모 모집 수량을 모두 입력해야 합니다.',
      })
      return
    }
    if (!formState.presentImg || !formState.thumbnailImg || !formState.detailImg) {
      toast({
        title: '이미지를 업로드해 주세요',
        description: '메인, 썸네일, 상세 페이지 이미지를 모두 첨부해야 합니다.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        product_name: formState.productName,
        project_name: formState.projectName,
        owner: formState.owner,
        issue_amount: offeringTotal,
        issue_date: formState.issueDate ? new Date(formState.issueDate).toISOString() : null,
        token_name: formState.tokenName,
        token_symbol: formState.tokenSymbol,
        token_quantity: Number(formState.tokenQuantity),
        dividend_ratio: Number(formState.dividendRatio) / 100,
        present_img: formState.presentImg,
        thumbnail_img: formState.thumbnailImg,
        offering: {
          offering_amount: Number(formState.offeringAmount),
          offering_price: Number(formState.offeringPrice),
          offering_start_date: formState.offeringStartDate
            ? new Date(formState.offeringStartDate).toISOString()
            : null,
          offering_end_date: formState.offeringEndDate
            ? new Date(formState.offeringEndDate).toISOString()
            : null,
          detail_img: formState.detailImg,
          status,
        },
      }

      const res = await apiFetch('/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let message = '상품 등록에 실패했습니다.'
        try {
          const data = await res.json()
          message = (data.detail as string) || (data.message as string) || message
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      toast({
        title: '상품 등록 완료',
        description: '새로운 공모 상품이 성공적으로 등록되었습니다.',
      })
      router.push('/admin/offering')
    } catch (error) {
      toast({
        title: '등록 실패',
        description: error instanceof Error ? error.message : '상품 등록 중 문제가 발생했습니다.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/offering">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">상품 등록</h2>
          <p className="text-sm text-gray-500">새로운 공모 상품 정보를 입력해 주세요.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardContent className="space-y-6 p-6">
              <h3 className="text-lg font-semibold">기본 정보</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="productName">
                    상품 이름 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="productName"
                    placeholder="예: 맹구"
                    value={formState.productName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    프로젝트 명 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    placeholder="예: 맹구 시즌1"
                    value={formState.projectName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">
                    IP 저작권 소유자 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="owner"
                    placeholder="예: 깡솔"
                    value={formState.owner}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>상장 플랫폼</Label>
                  <Input value="IPiece" disabled className="bg-gray-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6 p-6">
              <h3 className="text-lg font-semibold">토큰 정보</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tokenName">
                    토큰 이름 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tokenName"
                    placeholder="예: MANGU TOKEN"
                    value={formState.tokenName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol">
                    토큰 심볼 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tokenSymbol"
                    placeholder="예: MGU (3자리)"
                    maxLength={3}
                    value={formState.tokenSymbol}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>토큰 표준</Label>
                  <Input value="ERC-1400" disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenQuantity">
                    발행 토큰 수량 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tokenQuantity"
                    type="number"
                    placeholder="10000"
                    value={formState.tokenQuantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuePrice">
                    토큰당 발행 금액 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="issuePrice"
                    type="number"
                    placeholder="1000"
                    value={formState.issuePrice}
                    onChange={handleInputChange}
                    required
                  />
                  {isOfferingPriceMismatch ? (
                    <p className="text-xs text-red-500">공모 설정의 공모가와 동일해야 합니다.</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dividendRatio">
                    수익 배분 비율 (%) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dividendRatio"
                    type="number"
                    placeholder="30.0"
                    step="0.1"
                    value={formState.dividendRatio}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDate">
                    발행일 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="issueDate"
                    type="datetime-local"
                    value={formState.issueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-6 p-6">
              <h3 className="text-lg font-semibold">공모 설정</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>상품 상태</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as 'offering' | 'ended' | 'market')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offering">공모 진행중</SelectItem>
                      <SelectItem value="ended">공모 마감</SelectItem>
                      <SelectItem value="market">거래중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offeringPrice">
                    공모가 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="offeringPrice"
                    type="number"
                    placeholder="1000"
                    value={formState.offeringPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="offeringAmount">
                      공모 모집 수량 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="offeringAmount"
                      type="number"
                      placeholder="100000"
                      value={formState.offeringAmount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>총 공모 금액</Label>
                    <Input
                      value={offeringTotal !== null ? `${currencyFormatter.format(offeringTotal)} KRW` : ''}
                      placeholder="-"
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offeringStartDate">
                    공모 시작일시 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="offeringStartDate"
                    type="datetime-local"
                    value={formState.offeringStartDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offeringEndDate">
                    공모 종료일시 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="offeringEndDate"
                    type="datetime-local"
                    value={formState.offeringEndDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-6 p-6">
              <h3 className="text-lg font-semibold">이미지 설정</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>메인 이미지</Label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-gray-500 hover:border-[#1A4DE5] hover:text-[#1A4DE5]">
                    <Upload className="mb-2 h-8 w-8" />
                    <span className="text-xs">
                      {formState.presentImg ? '업로드 완료' : '클릭하여 업로드'}
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleImageUpload(event, 'presentImg')}
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>썸네일 이미지</Label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-gray-500 hover:border-[#1A4DE5] hover:text-[#1A4DE5]">
                    <Upload className="mb-2 h-8 w-8" />
                    <span className="text-xs">
                      {formState.thumbnailImg ? '업로드 완료' : '클릭하여 업로드'}
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleImageUpload(event, 'thumbnailImg')}
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>상세 페이지 이미지</Label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-gray-500 hover:border-[#1A4DE5] hover:text-[#1A4DE5]">
                    <Upload className="mb-2 h-8 w-8" />
                    <span className="text-xs">
                      {formState.detailImg ? '업로드 완료' : '클릭하여 업로드'}
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleImageUpload(event, 'detailImg')}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky top-20 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              className="bg-[#1A4DE5] hover:bg-[#153eb5]"
              type="submit"
              disabled={isSubmitting || isOfferingQuantityMismatch || isOfferingPriceMismatch}
            >
              {isSubmitting ? '등록 중...' : '등록 완료'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

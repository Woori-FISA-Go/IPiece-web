import Image from "next/image"
import Logo from "../assets/Logo.png"

type FooterProps = {
  containerClassName?: string
  backgroundClassName?: string
}

export function Footer({ containerClassName, backgroundClassName }: FooterProps) {
  const defaultSpacing = 'container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20'
  const resolvedContainer = containerClassName ?? defaultSpacing
  const background = backgroundClassName ?? 'bg-[#E6F0FC]'
  const footerClass = `${background} py-8 mt-12`

  return (
    <footer className={footerClass}>
      <div className={resolvedContainer}>
        <div className="mb-4">
          <Image src={Logo} alt="iPiece" width={100} height={27} className="h-7 w-auto" />
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>대표자 : Masterpiece(주) | 제휴문의 : sto@ipiece.com, 전화문의 : 02-5643-2523</p>
          <p>서울특별시 양구구 밀튼로브로 434 IPiece</p>
          <p className="text-xs mt-3">Copyright © iPiece INVESTMENT SECURITIES CO., LTD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

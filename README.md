# IPiece - Frontend 🎨

> **블록체인 기반 캐릭터 IP 증권형 토큰(STO) 거래 플랫폼**

IPiece는 캐릭터 IP를 증권형 토큰(STO)으로 발행하여, 개인 투자자들이 소액으로 유망 캐릭터 IP에 투자하고 배당 수익을 얻을 수 있는 STO 플랫폼입니다.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat&logo=reactquery&logoColor=white)](https://tanstack.com/query/latest) [![Zustand](https://img.shields.io/badge/Zustand-000000?style=flat)](https://github.com/pmndrs/zustand) [![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/) [![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)

---

## 📚 목차

- [1. 프로젝트 소개](#1-프로젝트-소개)
- [2. 팀원 및 역할](#2-팀원-및-역할)
- [3. 주요 기능](#3-주요-기능)
- [4. 기술 스택 및 선정 이유](#4-️-기술-스택-및-선정-이유)
- [5. IPiece 서비스 페이지별 주요 기능](#5--IPiece-서비스-페이지별-주요-기능)
- [6. 관리자 페이지별 주요 기능](#6.--관리자-페이지별-주요-기능)
- [7. 프로젝트 구조](#6--프로젝트-구조)
- [8. 설치 및 실행](#7--설치-및-실행)
- [9. 관련 링크](#8--관련-링크)

---

## 1. 프로젝트 소개

### 배경 및 목적

기존 캐릭터 IP 투자 시장은 높은 진입 장벽으로 인해 대형 투자자와 기관에게만 기회가 열려 있었습니다. IPiece는 블록체인 기술을 활용해 **캐릭터 IP를 증권형 토큰으로 조각(Piece)내어**, 누구나 소액으로 간편하게 투자할 수 있는 민주화된 투자 환경을 제공하는 것을 목표로 합니다.

### 🗓️ 프로젝트 기간

- **총 개발 기간:** 2025.10.21 ~ 2025.12.5 (7주)

---

## 2. 팀원 및 역할

| 이름       | 역할                      | GitHub                                         |
| :--------- | :------------------------ | :--------------------------------------------- |
| **이조은** | **Trading,Offering Page** | [@LeeJoEun-01](https://github.com/LeeJoEun-01) |
| **강한솔** | **MainPage**              | [@kkangsol](https://github.com/kkangsol)       |
| **황병길** | **Mypage**                | [@Gill010147](https://github.com/Gill010147)   |

---

## 3. 주요 기능

-   **📈 캐릭터 IP 공모:** 신규 캐릭터 IP의 증권형 토큰(STO) 청약 기능을 제공합니다.
-   **🔄 실시간 2차 거래:** 주식 호가창과 유사한 UI에서 유저 간 실시간 토큰 거래를 지원합니다.
-   **📊 포트폴리오 관리:** 보유 자산 현황, 총 자산, 평가 손익을 시각화하여 제공합니다.
-   **💳 가상계좌 및 거래내역:** KRW 입출금 및 모든 거래 내역(구매, 판매, 배당)을 투명하게 조회할 수 있습니다.
-   **💖 관심 목록:** 유망 IP를 관심 목록에 추가하고, 가격 변동을 모니터링할 수 있습니다.

---

## 4. 🛠️ 기술 스택 및 선정 이유

| 구분             | 기술                                                                                                                  | 선정 이유                                                                                                               |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Framework**    | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)                       | App Router 기반의 직관적인 라우팅과 SSR/SSG 지원을 통한 SEO 및 초기 로딩 속도 최적화를 위해 채택했습니다.               |
| **Language**     | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)              | 정적 타입 검사를 통해 런타임 에러를 사전에 방지하고, 명확한 인터페이스로 팀 협업 효율을 높였습니다.                     |
| **Styling**      | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)         | 유틸리티 우선의 빠른 스타일링과 일관된 디자인 시스템 구축에 용이하며, `shadcn/ui`와 시너지가 좋습니다.                  |
| **UI Library**   | ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white)                | v0.dev를 통한 빠른 UI 프로토타이핑 및 코드 생성이 가능하며, 커스터마이징이 자유롭습니다.                                |
| **Server State** | ![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat&logo=reactquery&logoColor=white)            | API 데이터 페칭, 캐싱, 자동 리페칭 등 복잡한 서버 상태 관리를 선언적으로 처리하여 비동기 로직을 단순화했습니다.         |
| **Client State** | 🐻 **Zustand**                                                                                                        | Redux 등 대비 보일러플레이트가 현저히 적고, 간결한 API로 모달, 인증 등 전역 클라이언트 상태를 효율적으로 관리합니다.    |
| **Form**         | ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat&logo=reacthookform&logoColor=white) | 폼 내부의 불필요한 리렌더링을 최소화하여 성능을 최적화하고, Zod를 통해 스키마 기반의 강력한 유효성 검사를 구현했습니다. |
| **Real-time**    | 🔄 **STOMP/SockJS**                                                                                                   | 실시간 호가/차트 등 양방향 통신을 STOMP/SockJS로 구현하며, 자동 재연결을 지원해 안정적입니다.                           |
| **Chart**        | 📊 **Recharts**                                                                                                       | React 친화적인 컴포넌트 기반 API를 제공하며, 포트폴리오 파이 차트 등 반응형 데이터 시각화에 적합합니다.                 |
| **Package**      | ![pnpm](https://img.shields.io/badge/pnpm-F69220?style=flat&logo=pnpm&logoColor=white)                                | `npm` 대비 빠른 설치 속도와 `node_modules` 디스크 공간 효율화를 통해 개발 환경을 개선했습니다.                          |

---

## 5. 📱 IPiece 서비스 페이지별 주요 기능

### 1. 메인 페이지 (`/`)

[메인 페이지 GIF/이미지]
| 제목 | 화면 캡처 |
| ---- | -------- |
| 메인 페이지 <br> | <img width="100%" alt="image" src="https://github.com/user-attachments/assets/f387ae74-9dd7-421f-870d-c4dfacf05de2" /> |
| 공모 상세페이지 <br> `/offering/{product_id}` | <img width="100%" alt="image" src="https://github.com/user-attachments/assets/bc538037-f60a-45f2-8d3a-1d7a7f045779" /> |
| 로그인 페이지 <br> `/auth/login` | <img width="100%" alt="image" src="https://github.com/user-attachments/assets/dc3fcb6e-f0ac-4e72-8d7d-b0d0057632b4" /> |
| 본인인증 페이지 <br> `/auth/vertification` | <img width="100%" alt="image" src="https://github.com/user-attachments/assets/d4a2da61-5d5b-4a52-a949-683a8fd67165" /> |
| 회원가입 페이지 <br> `/auth/signup` | <img width="100%" alt="image" src="https://github.com/user-attachments/assets/9e0ec8fb-f624-42c2-997a-8bcceb78cd8c" /> |

- 현재 공모 중인 캐릭터 IP 리스트를 슬라이드로 제공합니다.
- 실시간 거래량 기준 인기 IP 목록을 표시합니다.
- 주요 공지사항 및 이벤트 배너를 노출합니다.

### 2. IP 공모 페이지 (`/offering`)

[공모 상세 페이지 GIF/이미지]
| 제목 | 화면 캡처 |
| ---- | -------- |
| 공모 리스트 <br> `/offering` | <img src="https://github.com/user-attachments/assets/4c9d4a21-0688-4b16-bca7-74dedce4b141"> |
| 거래 리스트 <br> `/trading` | <img width="1000" alt="image" src="https://github.com/user-attachments/assets/7a1f9884-5502-4bc6-b510-b494a80688a4" /> |

- 캐릭터 IP의 상세 정보(로드맵, 수익 구조)를 제공합니다.
- 실시간 청약률을 프로그레스 바로 시각화합니다.
- 청약 신청 폼을 통해 공모에 참여할 수 있습니다.

### 3. 2차 거래 페이지 (`/trading/[id]`)

[실시간 거래 페이지 GIF/이미지]
| 제목 | 화면 캡처 |
| ---- | -------- |
| 거래 상세 - 차트/호가 <br> `/trading/{id}` | <img src="https://github.com/user-attachments/assets/48414710-b140-41ba-86af-34bcf8cd33c8">|
| 거래 상세 - 종목소개/공시 <br> `/trading/{id}` | <img width="1000" alt="image" src="https://github.com/user-attachments/assets/d6eb0ba2-2224-4d90-a57f-a88b2eda77de" /> |

- `Socket.io`를 연동한 실시간 호가창 및 체결 내역을 제공합니다.
- `Recharts`를 이용한 실시간 가격 변동 차트를 표시합니다.
- 시장가/지정가 매수 및 매도 주문 기능을 제공합니다.

### 4. 마이페이지 (`/mypage`)

[마이페이지 GIF/이미지]
| 제목 | 화면 캡처 |
| ---- | -------- |
| MY HOME <br> `/자산 있음` | <img width="1233" height="858" alt="image" src="https://github.com/user-attachments/assets/23db89e3-d2da-4759-97c6-2d661b1fc4cd" /> |
| MY HOME <br> `/자산 없음` | <img width="1155" height="869" alt="image" src="https://github.com/user-attachments/assets/ab017314-427a-4028-bf70-adb2060fa7eb" /> |
| 내 계좌 <br> `/계좌 없음` | <img width="1224" height="770" alt="image" src="https://github.com/user-attachments/assets/8371423a-3319-47bd-9f45-1d6c96389ac5" /> |
| 내 계좌 <br> `/거래 내역 없음` | <img width="1228" height="776" alt="image" src="https://github.com/user-attachments/assets/e44dd261-ec12-4eb2-bb7b-870802719849" /> |
| 내 계좌 <br> `/거래 내역 있음` | <img width="1222" height="857" alt="image" src="https://github.com/user-attachments/assets/c8b7a72d-6a20-4221-aae9-aede8e8b4bd7" /> |

> `AccountHistory` (거래내역)와 `AccountDepositPanel` (가상계좌) 컴포넌트가 조합된 화면입니다.

**주요 기능 (포트폴리오)**

- 보유 IP 자산을 `Recharts` 파이 차트로 시각화합니다.
- 총 보유 자산, 총 매수 금액, 평가 손익(%)을 실시간으로 계산하여 요약 제공합니다.

**주요 기능 (거래 내역)**

- 전체 거래 내역 (구매, 판매, 배당, 입출금)을 날짜순으로 정렬합니다.
- 당일, 1주일, 1개월, 3개월 등 기간별 필터링 기능을 제공합니다.

**주요 기능 (가상계좌)**

- 총 보유 KRW 및 거래 가능 KRW를 표시합니다.
- '내역', '입금', '출금' 탭으로 구분하여 입출금 내역을 관리합니다.

### 5. 관심 목록 (`/mypage/interest`)

[관심 목록 페이지 GIF/이미지]
| 제목 | 화면 캡처 |
| ---- | -------- |
| 관심 <br> `/관심 있음` | <img width="1226" height="777" alt="image" src="https://github.com/user-attachments/assets/6c1e6cac-1883-4f62-bf43-8870053b4a7e" /> |
| 관심 <br> `/관심 없음` | <img width="1226" height="673" alt="image" src="https://github.com/user-attachments/assets/a98584be-da21-4640-91f5-71af3048486e" /> |

- 관심 등록한 IP 목록과 현재가를 실시간으로 모니터링합니다.
- 클릭 시 해당 IP의 거래 페이지로 즉시 이동합니다.

---

## 6. 🔐 관리자 페이지별 주요 기능

플랫폼의 핵심 기능을 관리하고 모니터링하기 위한 종합적인 관리자 페이지입니다.

### 1. 대시보드 (`/admin`)

| 제목 | 화면 캡처 |
| ---- | -------- |
| 관리자 대시보드 | <img width="1897" height="862" alt="image" src="https://github.com/user-attachments/assets/d6af2d8c-5c0d-4313-8679-fe09b1a6ebac" /> |

-   총 공모 금액, 신규 가입자, 블록체인 트랜잭션 등 핵심 지표를 실시간으로 시각화하여 제공합니다.

### 2. 공모 관리 (`/admin/offering`)

| 제목 | 화면 캡처 |
| ---- | -------- |
| 공모 상품 목록 | [공모 상품 목록 이미지를 여기에 삽입해 주세요] |
| 신규 공모 등록 | [신규 공모 등록 이미지를 여기에 삽입해 주세요] |

-   신규 IP 상품의 공모를 생성하고, 공모 진행 현황을 관리하며, 종료된 공모를 2차 거래 마켓으로 전환합니다.

### 3. 블록체인 관리 (`/admin/blockchain`)

| 제목 | 화면 캡처 |
| ---- | -------- |
| 컨트랙트 현황 | [컨트랙트 현황 이미지를 여기에 삽입해 주세요] |
| 토큰 관리 | [토큰 관리 이미지를 여기에 삽입해 주세요] |

-   컨트랙트 현황 조회, 토큰(KRWT, STO) 발행/소각/전송 등 블록체인 관련 작업을 수행합니다.

### 4. 배당 관리 (`/admin/dividend`)

| 제목 | 화면 캡처 |
| ---- | -------- |
| 배당 생성/관리 | [배당 생성/관리 이미지를 여기에 삽입해 주세요] |

-   IP 상품별 수익 배당을 생성하고, 지급 내역을 관리합니다.

### 5. 모니터링 (`/admin/monitoring`)

| 제목 | 화면 캡처 |
| ---- | -------- |
| 인프라 모니터링 | [인프라 모니터링 이미지를 여기에 삽입해 주세요] |
| 블록체인 모니터링 | <img width="1872" height="860" alt="image" src="https://github.com/user-attachments/assets/71f62cac-a004-4d74-8b49-42b0ee0db9fb" /> |


-   Grafana 연동 대시보드를 통해 클라우드 인프라와 블록체인 네트워크 상태를 실시간으로 모니터링합니다.

## 7. 📂 프로젝트 구조

```bash
IPiece-web/
├── src/
│   ├── app/                    # Next.js App Router (페이지 라우팅)
│   │   ├── (pages)/           # 공통 레이아웃 적용 페이지 그룹
│   │   │   ├── admin/         # 관리자 페이지
│   │   │   ├── auth/          # 인증 (로그인, 회원가입)
│   │   │   ├── main/          # 메인 페이지
│   │   │   ├── mypage/        # 마이페이지
│   │   │   ├── offering/      # 공모 페이지
│   │   │   └── trading/       # 거래 페이지
│   │   ├── api/               # API 라우트
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── globals.css        # 전역 스타일
│   ├── assets/                # 이미지, 아이콘 등 정적 에셋
│   ├── components/            # 재사용 UI 컴포넌트
│   │   ├── common/            # 여러 페이지에서 사용되는 공통 컴포넌트
│   │   └── ui/                # shadcn/ui 기반 원자 단위 컴포넌트
│   ├── constants/             # 공통 상수
│   ├── hooks/                 # 커스텀 훅
│   ├── lib/                   # API 클라이언트, 유틸리티 함수
│   └── styles/                # 전역 스타일시트 (globals.css 외)
├── public/                    # 정적 파일 (favicon 등)
├── .env.local.example         # 환경 변수 예시 
├── next.config.ts             # Next.js 설정
├── package.json
└── tsconfig.json
```

## 7. 🚀 설치 및 실행

### 요구사항

- Node.js 20.x 이상
- pnpm 9.x 이상

### 1. 저장소 클론

```bash
git clone [https://github.com/Woori-FISA-Go/IPiece-web.git](https://github.com/Woori-FISA-Go/IPiece-web.git)
cd IPiece-web
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고, 내부 값을 실제 환경에 맞게 수정합니다.

```bash
cp .env.local.example .env.local
```

**.env.local 파일 예시**

```bash
# .env.local
# API 엔드포인트
NEXT_PUBLIC_API_URL=[https://api.ipiece.com](https://api.ipiece.com)
NEXT_PUBLIC_WS_URL=wss://api.ipiece.com

# 블록체인 RPC
NEXT_PUBLIC_RPC_URL=[http://172.16.4.60:8545](http://172.16.4.60:8545)
NEXT_PUBLIC_CHAIN_ID=11020
```

### 4. 실행

**개발 서버 실행**

```bash
pnpm dev
```

**프로덕션 빌드 및 실행**

```bash
pnpm build
pnpm start
```

## 8. 🔗 관련 링크
* 👩‍💻 [Backend Repository](https://github.com/Woori-FISA-Go/IPiece-server)
* ⛓️ [Blockchain Repository](https://github.com/Woori-FISA-Go/IPiece-blockchain)

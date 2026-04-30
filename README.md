# kairos-frontend

> 운동 용품 전문 커머스 플랫폼으로<br>
> 토스페이먼츠 결제 연동과 OAuth2 소셜 로그인을 포함한 완전한 쇼핑 경험을 제공합니다.
<br>
<img width="1512" height="807" alt="스크린샷 2026-04-30 오후 12 34 03" src="https://github.com/user-attachments/assets/890ace03-17c2-45e1-b885-3669a16c40fc" />

<br>
<br>

## 📋 프로젝트 개요

kairos-frontend는 운동 용품 커머스 플랫폼의 클라이언트 사이드를 담당합니다.
Context API를 활용한 전역 상태 관리, Axios 인터셉터 기반 JWT 자동 처리, 토스페이먼츠 SDK 연동을 통해 안정적인 쇼핑 플로우를 구현했습니다.

- **서비스 URL**: https://kaiiros.shop

<br>

### 주요 특징

- **JWT 자동 처리**: Axios 인터셉터로 모든 요청에 토큰 자동 첨부, 401 시 자동 로그아웃
- **전역 상태 관리**: Context API로 로그인 상태(AuthContext), 장바구니(CartContext) 관리
- **토스페이먼츠 연동**: 카드, 카카오페이 등 다양한 결제 수단 지원
- **OAuth2 소셜 로그인**: Google, Kakao 로그인 + 개인정보 동의 흐름
- **회원가입 유효성 검사**: 이메일 실시간 중복 확인, 비밀번호 강도 검사
- **관리자 페이지**: 상품/주문/회원 관리 대시보드
- **반응형 UI**: 커스텀 CSS로 구현된 미니멀 디자인

<br>

## 🏗️ 프로젝트 구조

```
src
├── api
│   └── index.js              # Axios 인스턴스, JWT 인터셉터, API 함수 모음
│
├── context
│   ├── AuthContext.js        # 로그인 상태 전역 관리 (user, login, logout, register)
│   └── CartContext.js        # 장바구니 상태 전역 관리 (cartItems, cartCount)
│
├── components
│   └── Navbar.js             # 네비게이션 바 (로그인 상태에 따라 메뉴 변경)
│
└── pages
    ├── Home.js               # 메인 페이지 (신상품 3개 표시)
    ├── Shop.js               # 상품 목록 (카테고리 필터)
    ├── ProductDetail.js      # 상품 상세 + 장바구니 담기
    ├── Cart.js               # 장바구니 + 배송 정보 입력 + 토스 결제창 연동
    ├── Login.js              # 로그인 + 회원가입 (유효성 검사 + 개인정보 동의)
    ├── MyPage.js             # 주문 내역 + 주문 취소 + 배송 정보 수정
    ├── FindAccount.js        # 아이디/비밀번호 찾기
    ├── Payment.js            # 결제 성공 콜백 처리
    ├── PaymentFail.js        # 결제 실패 페이지
    ├── AdditionalInfo.js     # 소셜 로그인 추가 정보 입력 + 개인정보 동의
    ├── OAuth2Callback.js     # OAuth2 콜백 처리 (토큰 저장 후 메인으로)
    ├── Orders.js             # 주문 목록
    ├── OrderDetail.js        # 주문 상세
    ├── Info.js               # 브랜드 소개
    └── admin
        ├── AdminLayout.js    # 관리자 레이아웃 (사이드바, ADMIN 권한 체크)
        ├── AdminDashboard.js # 대시보드 (매출, 주문, 상품, 회원 통계)
        ├── AdminProducts.js  # 상품 관리 (CRUD + Cloudinary 이미지 업로드)
        ├── AdminOrders.js    # 주문 관리 (상태 변경, 상세 패널)
        └── AdminUsers.js     # 회원 관리 (권한 변경)
```

<br>

## 🔧 핵심 모듈 설명

### 1. API 모듈 (src/api/index.js)
Axios 인스턴스에 JWT 인터셉터를 적용하여 인증을 자동으로 처리합니다.

- **요청 인터셉터**: `localStorage`에서 토큰을 가져와 `Authorization` 헤더에 자동 첨부
- **응답 인터셉터**: 401 응답 시 토큰 삭제 후 로그인 페이지로 자동 리다이렉트

### 2. AuthContext
로그인 상태를 전역으로 관리합니다.

- `login`: 이메일/비밀번호 로그인 후 토큰 및 유저 정보 저장
- `logout`: 토큰 삭제, 카카오 로그인 유저는 카카오 세션도 함께 해제
- `register`: 회원가입 후 자동 로그인

### 3. CartContext
장바구니 상태를 전역으로 관리합니다.

- 백엔드 API와 동기화하여 실시간 장바구니 상태 유지
- `cartCount`로 Navbar에 아이템 수 표시

### 4. 결제 흐름

```
Cart.js에서 주문하기 클릭
    → orderAPI.create() 호출 (주문 생성)
    → TossPayments.requestPayment() 호출 (결제창 오픈)
    → 결제 완료 → /payment/success?paymentKey=...&orderId=...&amount=...
    → Payment.js에서 /api/payments/confirm 호출 (백엔드 검증)
    → 주문 완료 페이지로 이동
```

### 5. OAuth2 소셜 로그인 흐름

```
Google 로그인 버튼 클릭
    → window.location.href = 'http://localhost:8080/oauth2/authorization/google'
    → Google 로그인 완료
    → 신규 회원: /additional-info?provider=google (개인정보 동의)
    → 기존 회원: /oauth2/callback?token=JWT토큰
    → OAuth2Callback.js에서 토큰 저장 후 메인 이동

Kakao 로그인 버튼 클릭
    → window.location.href = 'http://localhost:8080/oauth2/authorization/kakao'
    → Kakao 로그인 완료
    → /additional-info?provider=kakao (이름/이메일 입력 + 개인정보 동의)
    → 메인 이동
```

### 6. 회원가입 유효성 검사

```
이메일 입력 → 형식 검사 (정규식) → 중복 확인 (실시간 API 호출)
비밀번호 입력 → 강도 검사 (10자+, 숫자, 특수기호)
비밀번호 확인 → 일치 여부 확인
개인정보 동의 → 필수 체크 후 회원가입 버튼 활성화
```

<br>

## 📦 기술 스택 및 의존성

| 분류 | 기술 |
|------|------|
| Framework | React 18 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| 상태 관리 | Context API |
| 결제 | Toss Payments SDK |
| 배포 | Vercel |

<br>

## 🚀 빌드 및 실행

### 사전 요구사항

- Node.js 18+
- npm

### 환경 변수 설정

`.env` 파일 생성:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_TOSS_CLIENT_KEY=test_ck_your_client_key
```

### 로컬 실행

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드

```bash
npm run build
```

<br>

## 📝 페이지 라우팅

| URL | 페이지 | 인증 필요 |
|-----|--------|-----------|
| / | 메인 (신상품 표시) | - |
| /shop | 상품 목록 (카테고리 필터) | - |
| /shop/:id | 상품 상세 | - |
| /cart | 장바구니 + 결제 | 필요 |
| /login | 로그인 + 회원가입 | - |
| /mypage | 마이페이지 | 필요 |
| /orders | 주문 목록 | 필요 |
| /orders/:id | 주문 상세 | 필요 |
| /payment/success | 결제 성공 콜백 | 필요 |
| /payment/fail | 결제 실패 | - |
| /find-account | 아이디/비밀번호 찾기 | - |
| /additional-info | 소셜 로그인 추가 정보 | - |
| /oauth2/callback | OAuth2 콜백 처리 | - |
| /info | 브랜드 소개 | - |
| /admin | 관리자 대시보드 | ADMIN |
| /admin/products | 상품 관리 | ADMIN |
| /admin/orders | 주문 관리 | ADMIN |
| /admin/users | 회원 관리 | ADMIN |

<br>

## 📊 시스템 요구사항

- Node.js 18+
- npm 9+

<br>

## 🛠️ 트러블슈팅

### 토스페이먼츠 400 에러
- 문제: `orderId`에 허용되지 않는 문자 포함
- 해결: `orderId` 형식을 `kairos-{id}-{timestamp}` (하이픈만 사용)로 변경

### OAuth2 카카오 세션 유지 문제
- 문제: 카카오 로그인 후 세션이 남아 다음 로그인 시 로그인창 생략
- 해결: 로그아웃 시 `kauth.kakao.com/oauth/logout` 호출로 카카오 세션 함께 해제

### 메인 화면 상품 map is not a function 오류
- 문제: API 응답이 Page 객체(`content` 포함)인데 배열로 처리
- 해결: `res.data.content` 또는 `res.data` 분기 처리

<br>

## 📄 배포

- 플랫폼: Vercel
- 도메인: https://kaiiros.shop (가비아 DNS → Vercel 연결)
- 배포 방식: GitHub 연동 자동 배포 (main 브랜치 push 시 자동 빌드)

```
GitHub push → Vercel 감지 → 빌드 → 배포
```

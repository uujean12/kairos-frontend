# kairos-frontend

> 운동 용품 전문 커머스 플랫폼 **kairos**의 프론트엔드
<img width="1512" height="819" alt="스크린샷 2026-04-30 오후 12 17 04" src="https://github.com/user-attachments/assets/3e2e3fed-af00-4b3d-a38a-c6a494c6e1d5" />


---

## 프로젝트 소개

kairos는 필라테스, 요가, 피트니스, 리커버리 등 다양한 운동 종목별 용품을 제공하는 커머스 플랫폼입니다.

- **서비스 URL**: https://kaiiros.shop
vercel로 배포하였습니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 18 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| 상태 관리 | Context API (AuthContext, CartContext) |
| 결제 | Toss Payments SDK |
| 배포 | Vercel |

---

## 주요 기능

### 사용자
- 회원가입 (이메일 중복 확인, 비밀번호 강도 검사, 개인정보 동의)
- 로그인 / 로그아웃
- OAuth2 소셜 로그인 (Google, Kakao)
- 아이디/비밀번호 찾기

### 쇼핑
- 메인 페이지 (신상품 표시)
- 카테고리별 상품 조회 (PILATES, YOGA, FITNESS, RECOVERY)
- 상품 검색
- 상품 상세 페이지
- 장바구니 (추가, 수량 변경, 삭제)

### 결제
- 토스페이먼츠 결제창 연동 (카드, 카카오페이 등)
- 배송 정보 입력
- 결제 성공/실패 처리

### 마이페이지
- 주문 내역 조회
- 주문 취소
- 내 정보 조회 (이름, 이메일, 등급)
- 배송 정보 수정 (전화번호, 주소)

### 관리자
- 상품 관리 (등록, 수정, 삭제, 이미지 업로드)
- 주문 관리 (상태 변경, 상세 조회)
- 회원 관리 (권한 변경)
- 대시보드 (매출, 주문, 상품, 회원 통계)

---

## 프로젝트 구조

```
src
├── api
│   └── index.js          # Axios 인스턴스, API 함수 모음
├── context
│   ├── AuthContext.js    # 로그인 상태 전역 관리
│   └── CartContext.js    # 장바구니 상태 전역 관리
├── components
│   └── Navbar.js         # 네비게이션 바
└── pages
    ├── Home.js            # 메인 페이지
    ├── Shop.js            # 상품 목록
    ├── ProductDetail.js   # 상품 상세
    ├── Cart.js            # 장바구니 + 결제
    ├── Login.js           # 로그인 + 회원가입
    ├── MyPage.js          # 마이페이지
    ├── FindAccount.js     # 아이디/비밀번호 찾기
    ├── Payment.js         # 결제 성공 콜백
    ├── PaymentFail.js     # 결제 실패
    ├── AdditionalInfo.js  # 소셜 로그인 추가 정보
    ├── OAuth2Callback.js  # OAuth2 콜백 처리
    ├── Orders.js          # 주문 목록
    ├── OrderDetail.js     # 주문 상세
    └── admin
        ├── AdminLayout.js    # 관리자 레이아웃
        ├── AdminDashboard.js # 대시보드
        ├── AdminProducts.js  # 상품 관리
        ├── AdminOrders.js    # 주문 관리
        └── AdminUsers.js     # 회원 관리
```

---

## 핵심 구현 포인트

### 1. JWT 인증 자동 처리

Axios 인터셉터를 통해 모든 요청에 JWT 토큰을 자동으로 첨부하고, 401 응답 시 자동으로 로그인 페이지로 이동합니다.

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. 토스페이먼츠 결제 연동

주문 생성 후 토스페이먼츠 결제창을 띄우고, 결제 완료 후 백엔드에서 검증합니다.

```javascript
const tossPayments = window.TossPayments(process.env.REACT_APP_TOSS_CLIENT_KEY);
await tossPayments.requestPayment('카드', {
  amount: orderAmount,
  orderId: `kairos-${orderId}-${Date.now()}`,
  orderName: '상품명',
  successUrl: `${window.location.origin}/payment/success`,
  failUrl: `${window.location.origin}/payment/fail`,
});
```

### 3. OAuth2 소셜 로그인 흐름

```
Google 로그인 → 개인정보 동의 페이지 → 메인
카카오 로그인 → 이름/이메일 입력 + 개인정보 동의 → 메인
```

### 4. 회원가입 유효성 검사

- 이메일 형식 검사 (정규식)
- 이메일 중복 확인 (실시간 API 호출)
- 비밀번호 강도 검사 (10자 이상, 숫자, 특수기호 포함)
- 비밀번호 확인 일치 여부
- 개인정보 처리방침 동의 필수

---

## 로컬 실행

### 사전 요구사항
- Node.js 18+
- npm

### 환경 변수 설정

`.env` 파일 생성:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_TOSS_CLIENT_KEY=test_ck_your_client_key
```

### 실행

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000` 접속

---

## 환경 변수

| 변수명 | 설명 |
|--------|------|
| REACT_APP_API_URL | 백엔드 API URL |
| REACT_APP_TOSS_CLIENT_KEY | 토스페이먼츠 클라이언트 키 |

---

## 페이지 라우팅

| URL | 페이지 | 인증 필요 |
|-----|--------|-----------|
| / | 메인 | - |
| /shop | 상품 목록 | - |
| /shop/:id | 상품 상세 | - |
| /cart | 장바구니 | 필요 |
| /login | 로그인/회원가입 | - |
| /mypage | 마이페이지 | 필요 |
| /orders | 주문 목록 | 필요 |
| /orders/:id | 주문 상세 | 필요 |
| /payment/success | 결제 성공 | 필요 |
| /payment/fail | 결제 실패 | - |
| /find-account | 아이디/비밀번호 찾기 | - |
| /additional-info | 소셜 로그인 추가 정보 | - |
| /oauth2/callback | OAuth2 콜백 | - |
| /admin | 관리자 대시보드 | ADMIN |
| /admin/products | 상품 관리 | ADMIN |
| /admin/orders | 주문 관리 | ADMIN |
| /admin/users | 회원 관리 | ADMIN |

---

## 트러블슈팅

### 토스페이먼츠 400 에러
- **문제**: `orderId`에 허용되지 않는 문자 포함
- **해결**: `orderId` 형식을 `kairos-{id}-{timestamp}` (하이픈만 사용)로 변경

### OAuth2 카카오 세션 유지 문제
- **문제**: 카카오 로그인 후 세션이 남아 다음 로그인 시 로그인창 생략
- **해결**: 로그아웃 시 카카오 세션도 함께 해제 (`kauth.kakao.com/oauth/logout` 호출)

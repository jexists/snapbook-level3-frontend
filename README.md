# 📷 snapbook — 프론트엔드 (Next.js)

1인 동네 사진관(마재원 작가님)의 촬영 예약 웹앱 **snapbook**의 화면입니다.
손님은 촬영 종류 → 주간 달력에서 시간 → 요청 사항 → 이용 안내 동의 → 확인, 5단계로 예약하고,
관리자는 한 달 달력·하루 일정·AI가 정리한 "준비할 것"을 한눈에 봅니다.

- 백엔드 저장소: [snapbook-level3-backend](https://github.com/jexists/snapbook-level3-backend)
- 기획서: [기획서.md](./기획서.md)
- 모든 이름·연락처·예약은 가상 데이터입니다.

> ⏳ 백엔드가 Render 무료 서버라서, 한동안 아무도 접속하지 않았다면 **첫 화면의 데이터가 뜨기까지 30초~1분** 걸릴 수 있습니다.

## 확인용 계정

로그인 화면(`/login`)은 하나입니다. 아이디에 따라 관리자 화면이나 손님 화면으로 들어갑니다.

| 역할 | 아이디 | 비밀번호 | 할 수 있는 일 |
|---|---|---|---|
| 관리자 | `admin` | `studio1234` | `/admin` 달력·예약 처리·촬영 종류·가상 데이터 |
| 일반(손님) | `customer1` | `demo1234` | 예약하기·내 예약 확인 |

- 손님 계정은 `customer1` ~ `customer6`까지 있고 비밀번호는 모두 `demo1234`입니다.
- 관리자 화면의 **가상 데이터 다시 채우기**를 누르면 예약이 처음 상태로 돌아갑니다. (관리자 계정은 그대로 남습니다)

## 기술

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4

## 로컬에서 실행

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL = 백엔드 주소
npm install
npm run dev -- --port 3100   # http://localhost:3100
```

- 손님 화면: `/` (예약하기, 예약 확인하기)
- 관리자 화면: `/admin`

## Vercel에 배포하기

Vercel 대시보드 → **Add New → Project** → 이 저장소를 Import합니다.
Framework는 `Next.js`로 자동 인식되고, 빌드 명령·출력 폴더는 기본값 그대로 두면 됩니다.

### 설정값 (Environment Variables)

| 이름 | 뜻 | 예시 |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | 백엔드(Render) 주소. 끝에 `/`는 붙이지 않습니다 | `https://snapbook-level3-backend.onrender.com` |

- `NEXT_PUBLIC_`으로 시작하는 값은 **빌드할 때** 화면 코드에 들어갑니다. 값을 바꿨다면 Vercel에서 **Redeploy**를 눌러야 반영됩니다.
- 배포가 끝나면 나온 Vercel 주소를 백엔드의 `FRONTEND_ORIGIN`에 넣어야 화면에서 API를 부를 수 있습니다.

## 확인

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 구조

```
src/
├─ app/                 페이지 진입점만 (손님은 (customer), 관리자는 admin/(panel))
├─ components/ui/       여러 화면이 같이 쓰는 부품: Button, 입력칸, FormField, Panel, Badge,
│                       ConfirmDialog, Stepper, SegmentedControl, 로딩·빈 화면·오류 표시
├─ components/layout/   손님 머리글, 페이지 제목
├─ features/
│  ├─ auth/             로그인 상태, 역할 확인, 로그인·가입 폼
│  ├─ booking/          주간 달력(WeekGrid: 손님 예약·변경·관리자 예약 추가 공용), 5단계 예약
│  ├─ my-reservations/  예약 확인·상세·변경
│  └─ admin/            한 달 달력, 주간 줄, 하루 일정, 예약 처리, 검색, 촬영 종류, 가상 데이터
├─ hooks/               데이터 불러오기(useApi), 폼 오류
├─ lib/                 API 호출(api.ts 한 곳), 한국 시간 표시, 문구
└─ types/               백엔드 응답 타입
```

- 디자인 색·글꼴·모서리는 `src/app/globals.css`의 `@theme` 한 곳에서 정합니다.
- 로그인 토큰은 브라우저에 저장합니다. 화면의 회색 칸·버튼 숨김은 안내일 뿐이고, 권한과 규칙은 백엔드가 최종으로 확인합니다.

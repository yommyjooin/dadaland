# 다다랜드 운영요원

다다페스타 다다랜드 당일(10/31) 운영요원용 웹앱이에요. 운영요원 카드의 QR로 열어요.

- **내 일정**: 이름을 한 번 고르면 지금 맡은 부스, 남은 시간, 다음 일정, 인수·인계 상대를 보여줘요.
- **지금**: 부스별 현재 담당자, 휴식 중·지원 인원, 다음 교대.
- **부스**: 부스별 담당 시간, 대본, 수시 확인 사항, 부스 상태(보통 / 대기 많음 / 도움 필요).
- **전체표**: 전체 타임테이블.
- **안내**: 공지 올리기·보기, 운영 규칙, 당일 흐름, 탐정 수칙, 공간 배치도.

행사 당일이 아니면 화면 위 슬라이더로 시간을 골라 미리 볼 수 있어요.

## 배포 (Vercel + Supabase)

1. Supabase에서 새 프로젝트를 만들고, SQL Editor에서 `supabase/schema.sql`을 실행해요.
2. Vercel에서 이 저장소를 Import 해요. 프레임워크는 SvelteKit으로 자동 인식돼요.
3. Vercel 프로젝트 Settings → Environment Variables에 아래 두 값을 넣고 다시 배포해요.
   - `PUBLIC_SUPABASE_URL`: Supabase Project Settings → API의 Project URL
   - `PUBLIC_SUPABASE_ANON_KEY`: 같은 곳의 anon public key
4. 환경변수가 없으면 실시간 기능(부스 상태, 휴식 체크, 공지)만 숨겨지고 나머지는 그대로 동작해요.

공간 배치도는 `static/plan.png`로 넣으면 안내 탭에 나와요.

## 일정 바꾸기

일정과 대본은 `src/lib/data.json` 한 파일에 있어요. `people[].slots`는 11개 칸(11:20, 12:00, 12:30 … 16:30부터 30분)이고, 값은 부스 글자(가~카), `휴`(휴식), `지`(지원), `-`(근무 전)예요.

## 개발

```bash
npm install
cp .env.example .env   # 실시간 기능을 로컬에서 쓰려면 값 채우기
npm run dev
```

## 행사 후

로그인 없이 쓰도록 열어 둔 쓰기 권한은 `supabase/schema.sql` 맨 아래 '정리' 부분을 실행해서 닫아 주세요.

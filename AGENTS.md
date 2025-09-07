항상 한국어로 대답해줘. Always answering in KOREAN.

# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Application code.
  - `routes/`: Page-level React routes (game screens, settings, release notes).
  - `components/`: Reusable UI components.
  - `stores/`: Zustand stores (e.g., `useDailyQuizStore`).
  - `lib/`: Utilities and calculators (e.g., `lib/quiz/*`, `rng.ts`).
  - `types/`: Shared TypeScript types.
  - `index.css`, `pixel-animations.css`: Global styles (Tailwind-based).
- `public/`: Static assets and PWA files (`manifest.json`, `og-image*`, `robots.txt`).
- `dist/`: Build output (ignored from lint and git).

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server with HMR.
- `npm run build`: Type-check (`tsc -b`) and build for production.
- `npm run preview`: Serve the production build locally.
- `npm run lint`: Lint the project using ESLint config in `eslint.config.js`.

## Coding Style & Naming Conventions
- TypeScript strict mode is enabled; fix all type errors before merging.
- React 19 with function components and hooks; prefer composable, small components.
- File naming: PascalCase for components/routes (`GameRPS.tsx`), camelCase for utilities (`format.ts`), `useX.ts` for hooks, stores as `...Store.ts`.
- Exports: routes default-export a page component; shared components use named exports.
- Formatting via ESLint rules; use `npm run lint -- --fix` before PRs. Indentation: 2 spaces.

## Testing Guidelines
- No test setup yet. Recommended: Vitest + React Testing Library.
- Test files: `*.test.ts` or `*.test.tsx`, colocated next to the code or under `src/__tests__`.
- Aim for unit tests of utilities (`lib/*`) and interaction tests for routes/components.

## Commit & Pull Request Guidelines
- Use Conventional Commits style: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- PRs should include: concise description, linked issues, screenshots/GIFs for UI, and steps to validate.
- Keep PRs focused and small; ensure `npm run lint` and local `build` pass.

## Security & Configuration Tips
- Vite env vars must be prefixed with `VITE_` (e.g., `VITE_API_BASE`). Do not commit secrets.
- PWA: when changing `public/manifest.json` or service worker config in `vite.config.ts`, clear caches or bump versions to avoid stale assets.
- Static assets live in `public/`; prefer imports in `src/` for hashed builds when possible.

---
 
## UI Notes – Omok (오목)

- 보드 중앙 정렬: 게임 보드는 수평·수직 모두 중앙 정렬되도록 중간 컨테이너에 `flex-1 flex items-center justify-center`를 사용합니다.
- 교차점 착점: 돌은 칸이 아닌 격자 선의 교차점에 절대배치로 렌더링합니다. 가장자리 마진은 `cellSize/2`를 사용합니다.
- 크기/가독성: 기본 13×13, `cellSize=22px`로 355px 화면에서 스크롤 없이 보이며 레트로 톤('#C89F65' 보드, '#452' 격자)을 사용합니다.
- 접근성: 교차점 버튼은 원형 터치 영역(지름 ≈ `0.8×cellSize`)과 `aria-label`(예: "3, 5 교차점에 두기")을 제공합니다.

---

# desgin guideline
---
alwaysApply: true
---
## Requirements

### 1. 전체 컨셉
- 성인을 위한 두뇌 훈련 미니 퀴즈 모음
- 감성: **패미컴/고전 RPG 콘솔 UI**
- 스타일: 도트 텍스처, CRT 느낌, 픽셀 폰트
- 톤: "게임 속 시험 치는 기분", "추억의 콘솔 감성"
- 플랫폼: 모바일 세로형 웹앱 (355px 최적화)

---

### 2. 화면 구성

#### 픽셀 마스코트
- 🧠 이모지 기반 심플한 마스코트
- 원형 배경에 두뇌 이모지 표시
- 상단 중앙 배치

#### 홈 화면 (게임 선택)
- 상단: 픽셀 마스코트 + "두뇌수련" 타이틀
- 중앙: **2열 카드 그리드** (6개 게임)
- 각 카드: 아이콘, 게임명, 설명, [시작하기] 버튼
- 하단: 설정 버튼 + 푸터 크레딧
- 스타일:
  - 고전 콘솔 메뉴창 (3px 테두리, 음영 처리)
  - 호버 시 초록색 테두리 + 위로 이동
  - 신규/고난이도 배지 표시

#### 게임 화면 (문제 풀이: 시험 모드)
- 상단: ← 홈으로 버튼 + 문제 진행도 (Q3/5) + ProgressBar
- 중단: 문제 텍스트 (콘솔 대사창 스타일) + 문제 아이콘
- 입력창: 사각형 박스 안에 숫자 입력 (천 단위 자동 포맷)
- 하단: 콘솔 키패드 스타일 버튼 (3x4 그리드)
- 정답 피드백:
  - 정답 → 초록: "▶ 정답입니다!"
  - 오답 → 빨강: "▶ 오답입니다..."
  - 계산 근거 표시 (예: `400 × 1,400 = 560,000`)

#### 결과 화면
- 점수: "오늘의 점수" + 큰 점수 표시
- 상세 결과: 맞춘 개수, 소요시간
- 공유 기능: "내 결과 자랑하기" (클립보드 복사)
- CTA 버튼: "홈으로"
- 설정 진입점 (반응속도 게임 제외)

#### 설정 화면
- 환율 설정: 달러 환율 입력 (숫자)
- 문제 개수 설정: 3/5/7/10개 선택 (2x2 그리드)
- 자동 저장 메시지

---

### 3. 비주얼 가이드

#### 컬러 팔레트 (구현됨)
- 배경: 네이비/블랙 (#1C1C2A)
- 기본 UI: 화이트/그레이 (#E0E0E0)
- 포인트: 레드(#FF5555), 그린(#88FF88), 블루(#5599FF)

#### 폰트 (구현됨)
- Press Start 2P (Google Fonts)
- 픽셀 스타일 텍스트 그림자 효과

#### UI 컴포넌트 (구현됨)
- `.console-window`: 3px 테두리 + 내부 음영
- `.pixel-button`: 2px 테두리 + 호버/액티브 상태
- `.keypad-grid`: 3열 그리드 레이아웃
- `.number-input`: 중앙 정렬 + 천 단위 포맷
- `.progress-bar`: 초록색 진행 바
- `.feedback-badge`: 정답/오답 배지

#### 반응형 브레이크포인트 (구현됨)
- 355px: 기본 최적화
- 375px: iPhone Mini 최적화
- 320px: 매우 작은 화면 최적화

---

### 4. 게임별 구현 상태

#### ✅ 가위바위보 (신규)
- 아이콘: ✊
- 설명: "지시문을 보고\n5초 안에 선택!"
- 특징: 2초 타이머, 시스템 선택 표시, 지시문 기반 선택

#### ✅ 인증번호 외우기
- 아이콘: 📱
- 설명: "6자리 수\n기억하기"
- 특징: 숫자 기억력 테스트

#### ✅ 달러 암산
- 아이콘: 💵
- 설명: "$40 = ?원"
- 특징: 환율 설정 가능, 천 단위 포맷

#### ✅ 평수 변환 (고난이도)
- 아이콘: 📏
- 설명: "1평 = ?㎡"
- 특징: 1평 = 3.3058㎡, 소수점 계산

#### ✅ 꿈에서 할아버지가 (고난이도)
- 아이콘: 👴
- 설명: "뭐라고 하셨더라?"
- 특징: 숫자 기억력 + 복잡한 계산

#### ✅ 뱅샐 유전자검사 대비 훈련장
- 아이콘: ⚡
- 설명: "3,2,1... 클릭!"
- 특징: 반응속도 측정, 평균 시간 표시

---

## Output Format
When prompted to "generate", output:
1) Tokens (colors, font, spacing)  
2) Components (cards, keypad, progress bar, etc.)  
3) Screens (홈, 게임, 결과) 레이아웃  
4) States (default/hover/pressed/correct/wrong)  
5) Microcopy (KR)  
6) Suggested file structure (e.g., /ui/Keypad.tsx)

---

## Notes
- Focus on **console game look & feel**  
- Remove all sound/vibration related options  
- Prioritize **retro console menus & dialogue box style**  
- Keep layouts mobile-first (355px 최적화)
- All games use **3-10 question sets** (설정 가능)
- **PWA ready** with offline support

## Current Wireframes

### 홈화면 (구현됨)
┌─────────── 모바일 화면 (355px) ───────────┐
│                                           │
│              🧠 두뇌수련                   │
│           [픽셀 마스코트]                 │
│                                           │
│   ┌──────────┐    ┌──────────┐           │
│   │ ✊        │    │ 📱       │           │
│   │가위바위보│    │인증번호  │           │
│   │지시문을  │    │외우기    │           │
│   │보고 5초  │    │6자리 수  │           │
│   │안에 선택!│    │기억하기  │           │
│   │[시작하기]│    │[시작하기]│           │
│   └──────────┘    └──────────┘           │
│                                           │
│   ┌──────────┐    ┌──────────┐           │
│   │ 💵       │    │ 📏       │           │
│   │달러 암산 │    │평수 변환 │           │
│   │$40 = ?원 │    │1평 = ?㎡ │           │
│   │[시작하기]│    │[시작하기]│           │
│   └──────────┘    └──────────┘           │
│                                           │
│   ┌──────────┐    ┌──────────┐           │
│   │ 👴       │    │ ⚡       │           │
│   │꿈에서    │    │뱅샐      │           │
│   │할아버지가│    │유전자검사│           │
│   │뭐라고    │    │대비 훈련장│           │
│   │하셨더라? │    │3,2,1...  │           │
│   │[시작하기]│    │클릭!     │           │
│   └──────────┘    └──────────┘           │
│                                           │
│                    [설정]                 │
│                                           │
└───────────────────────────────────────────┘

### 게임 화면 (구현됨)
┌─────────── 모바일 화면 (355px) ───────────┐
│ ← 홈으로                                  │
│━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│ 문제 3/5  [▓▓▓░░]                        │
│                                           │
│     $400 = ? 원                           │
│                                           │
│         [💵]                              │
│                                           │
│     ┌──────────────────┐                 │
│     │    560,000       │                 │
│     └──────────────────┘                 │
│                                           │
│  ┌─────┐  ┌─────┐  ┌─────┐               │
│  │ 7 │  │ 8 │  │ 9 │                   │
│  └─────┘  └─────┘  └─────┘               │
│  ┌─────┐  ┌─────┐  ┌─────┐               │
│  │ 4 │  │ 5 │  │ 6 │                   │
│  └─────┘  └─────┘  └─────┘               │
│  ┌─────┐  ┌─────┐  ┌─────┐               │
│  │ 1 │  │ 2 │  │ 3 │                   │
│  └─────┘  └─────┘  └─────┘               │
│  ┌─────┐  ┌─────┐  ┌─────┐               │
│  │지우기│  │ 0 │  │제출 │               │
│  └─────┘  └─────┘  └─────┘               │
└───────────────────────────────────────────┘

### 결과 화면 (구현됨)
┌─────────── 모바일 화면 (355px) ───────────┐
│                                           │
│              🎉                           │
│         오늘의 점수                       │
│                                           │
│             80점                          │
│                                           │
│   ┌───────────────────┐                  │
│   │ 맞춘 개수: 4/5    │                  │
│   │ 소요 시간: 2분 30초│                  │
│   └───────────────────┘                  │
│                                           │
│   [🤝 내 결과 자랑하기]                   │
│                                           │
│   [홈으로]                               │
│                                           │
│   퀴즈 개수를 늘리고 싶다면?              │
│   [설정하기]                             │
│                                           │
└───────────────────────────────────────────┘

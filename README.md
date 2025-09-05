SSAFIT — Frontend Only (LocalStorage + Bootstrap + Vanilla JS)

개요
- SSAFIT는 순수 프론트엔드(백엔드 없음) 웹앱입니다. 영상·리뷰·회원·커뮤니티·운동계획 등을 브라우저 LocalStorage에 저장하고, Bootstrap 5 + 바닐라 ES Modules로 UI/로직을 구현했습니다.
- 해시 라우팅(#/...)과 접근성(label/aria/포커스)을 기본 준수하며, 데이터 백업/복원(Export/Import), 시드 주입, AI 코치(옵션)까지 제공합니다.

주요 기술
- UI: Bootstrap 5.x, Bootstrap Icons
- 날짜: day.js, FullCalendar 6
- 로직: Vanilla JS(ES Modules), LocalStorage
- AI(옵션): Google Generative AI Web SDK(esm) — 사용자 제공 API 키로만 호출

폴더 구조
```
/
├─ index.html                  # 앱 엔트리, CDN 로딩
├─ assets/
│  ├─ css/custom.css           # 테마/컴포넌트 확장 스타일
│  ├─ data/videos.json         # 제공 YouTube JSON (시드 폴백)
│  └─ img/                     # 파비콘/캐러셀 이미지 등
└─ src/
   ├─ app.js                   # 부트스트랩(시드/라우터/AI FAB)
   ├─ routes/router.js         # 해시 라우터(:id 지원)
   ├─ pages/                   # 화면(홈/영상/상세/찜/커뮤니티/계획/데이터 등)
   ├─ components/              # 비디오 카드/리뷰 리스트/모달/페이지네이션/프로필모달/AI챗모달
   ├─ services/                # 비즈 규칙(영상/리뷰/사용자/커뮤니티/계획/추천/팔로우/AI)
   ├─ repos/                   # LocalStorage CRUD 전담(불변 배열)
   └─ utils/                   # dom/validate/toast/id/date/seed/state
```

기능 맵 (F01–F20)
- F01–F04 영상 CRUD: 등록/조회/수정/삭제, 상세 iframe 재생, 조회수 증가
- F05 영상 검색/정렬: 키워드·부위 필터, 인기/리뷰수/평점/최신 정렬
- F06 찜: 상세에서 토글, `/favorites` 목록
- F07–F10 리뷰 CRUD: 작성/수정/삭제, 평균 평점 표시
- F11–F15 회원/세션: 가입/로그인/로그아웃, 프로필 수정
- F16 팔로우: 프로필 모달에서 팔로우/언팔 + 팔로워/팔로잉
- F17 커뮤니티: 게시판 글 CRUD, 조회수/댓글수, 댓글 CRUD
- F18 운동계획: 월 달력(FullCalendar 또는 경량 달력), 일정 CRUD
- F19–F20 AI(모의/선택): AI 코치(우측 하단 버튼) — 루틴/계획 제안 및 “계획 추가” 액션 제공

시드(Seed)
- 최초 로드시 제공 JSON(우선순위: pjt/[SSAFIT] 제공파일/video.json → assets/data/videos.json → 내장 더미)을 fetch하여 변환 규칙으로 `ssafit:videos`에 upsert.
- 중복 방지: `ssafit:meta.lastSeedVersion`으로 제어.
- 커뮤니티 시드: 운영자 글 5개(공지/후기/팁/질문/잡담) + 태그/조회수 기본값
- 운동계획 시드: 이번 달 월/수/금에 전신/하체/코어 루틴 예시(운영자 계정에 생성)

데이터 관리
- `/data` 페이지에서 컬렉션별/전체 Export/Import/삭제/재시드 지원
  - 컬렉션: videos/reviews/users/favorites/follows/posts/plans/session/meta
  - 전체 백업/복원(JSON): 사이트 간 이관/복구에 사용
- 상단 네비에도 “데이터” 링크가 있어 언제든 접근 가능

AI 코치(옵션)
- 우측 하단의 채팅 버튼 → AI 채팅 모달
- API 키 입력 필수: 모달 상단 “API 키” 버튼으로 Gemini API Key를 입력/저장(LocalStorage: `ssafit:ai.key`).
- 키가 없으면 모의 코치 규칙으로 간단 응답(전신/하체/코어 추천 등)
- AI 응답에 추천이 포함되면 “전신/하체/코어 루틴 계획 추가” 버튼이 자동 노출 → 오늘 일정으로 즉시 추가
- 대화 히스토리: LocalStorage(`ssafit:ai.history`)에 보존/복원, “새 대화/내보내기” 제공

실행 방법
1) 정적 서버로 열기(권장)
   - VS Code Live Server 확장 또는 Python: `python3 -m http.server 5173` 후 `http://localhost:5173/index.html`
2) 브라우저로 `index.html` 열기(일부 fetch가 file://에서 제한될 수 있음 → 정적 서버 권장)

접근성/테마
- 플로팅 라벨, invalid-feedback, 스킵 링크/aria-live, 포커스 링 등 기본 구현
- PocketSalad 계열 라이트 그린 테마로 전반 통일(내비/버튼/배지/달력/카드/토스트)

이미지/파비콘
- 홈 히어로 캐러셀: `assets/img/KirbyCurl.png`, `KirbyDeadlift.png`, `KirbyRun.png`
- 파비콘/매니페스트: `assets/img/favicon.svg`, `assets/img/site.webmanifest`

한계/주의
- 서버가 없으므로 LocalStorage를 초기화하면 데이터가 사라집니다(Export로 백업 권장).
- `.env` 자동 로딩은 지원하지 않습니다. AI 키는 모달에서 직접 입력하세요.
- 정적 배포 환경에서 FullCalendar를 비활성화하려면 `index.html`의 FC CDN을 제거하세요(경량 달력 폴백 동작).

주요 LocalStorage 키
- `ssafit:videos/reviews/users/favorites/follows/posts/plans/meta/session`
- `ssafit:ai.key`(AI 키), `ssafit:ai.history`(AI 대화)

개발 팁
- 시드 재주입: `ssafit:videos`/`ssafit:posts` 삭제 + `ssafit:meta.lastSeedVersion/communitySeeded` 제거 후 새로고침
- 테마 수정: `assets/css/custom.css`의 CSS 변수/컴포넌트 오버라이드


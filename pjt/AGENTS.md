# SSAFIT Front-only MASTER DOC (LocalStorage + Bootstrap + Vanilla JS)



## 0) 프로젝트 범위·제약

* **Frontend Only**: 모든 데이터는 **브라우저 LocalStorage**(CRUD). (과제 안내: JS로 더미 로드+LocalStorage 구현, Bootstrap UI 구성. )
* **CSS는 Bootstrap 5.x**, 아이콘은 **Bootstrap Icons**, 로직은 **바닐라 JS(ES Modules)**. (필수 라이브러리/툴 명시. )
* **해시 라우팅**(`#/…`), 접근성(label/aria/포커스) 기본 수칙 준수.
* **데이터 제공**: 수업에서 **YouTube 영상 JSON 파일**이 제공됨(샘플 포함). 이를 초기 시드로 활용.&#x20;

---

## 1) 빠른 시작

* 정적 서버: VSCode Live Server
* CDN: Bootstrap, Bootstrap Icons, day.js, uuid, (선택) Chart.js. (참고 링크 명시. )
* 첫 실행 시 **시드 주입**(중복 방지). JSON Import/Export 제공.

---

## 2) 폴더 구조

```
/ (repo root)
├─ index.html
├─ assets/
│  ├─ css/custom.css
│  └─ data/videos.json      # 제공 JSON 배치 위치(필수)
└─ src/
   ├─ app.js
   ├─ routes/router.js
   ├─ pages/                # 화면별 모듈
   ├─ components/           # 카드/모달/페이지네이션 등
   ├─ services/             # 도메인 규칙(검증·정렬·검색·권한)
   ├─ repos/                # LocalStorage CRUD 전담
   ├─ utils/                # dom/validate/toast/id/date/seed
   └─ store/                # (선택) 메모리 캐시
```

---

## 3) 라우팅 규칙

* `/` 홈, `/videos`, `/videos/new`, `/videos/:id`, `/videos/:id/edit`
* `/reviews?videoId=...`, `/favorites`
* `/users`, `/users/:id`, `/profile`
* `/auth/register`, `/auth/login`
* `/community`, `/community/new`, `/community/:id`
* `/plans`, `/plans/new`, `/plans/:id/edit`

---

## 4) 기능 요구사항 매핑 (F01–F20)

| 코드      | 분류     | 요약          | 수용 기준(핵심)                                         |
| ------- | ------ | ----------- | ------------------------------------------------- |
| F01–F04 | 영상     | 등록/조회/수정/삭제 | 제목/부위/난이도/태그/썸네일/링크, 수정·삭제 후 목록 반영.               |
| F05     | 영상     | 검색/정렬       | 키워드·부위·인기·리뷰수 정렬/검색.                              |
| F07–F10 | 리뷰     | CRUD        | 영상 상세 탭에서 작성/평점/수정/삭제 + 평균 평점.                    |
| F11–F15 | 회원     | CRUD+로그인    | 가입/조회/수정/삭제(또는 비활성화), 로그인/로그아웃.                   |
| F06     | 찜      | 토글/목록       | 상세에서 찜 토글, `/favorites` 목록.                       |
| F16     | 팔로우    | 추가/취소/목록    | 사용자 프로필에서 팔로우/언팔.                                 |
| F17     | 커뮤니티   | 게시판 CRUD    | 제목/본문/조회수/댓글수.                                    |
| F18     | 운동계획   | CRUD+달력     | 월 달력(day.js) 배지/일정 표시.                            |
| F19–F20 | AI(심화) | 추천·코칭(모의)   | 규칙 기반 모의 구현(후일 LLM 연계).                           |
| 채점      | 평가     | 점수표         | 기본: 영상/회원(각 30), 추가: 찜/커뮤니티(각 10), 심화: AI(각 10).  |

---

## 5) 데이터 스키마 & **제공 JSON 매핑 규칙**

### 5.1 엔티티 스키마(요약)

* **Video** `{ id, title, bodyPart('상체'|'하체'|'전신'|'코어'|'유산소'|'복부'|'기타), difficulty, tags[], thumbnailUrl?, youtubeId?, views, createdAt, updatedAt, authorId? }`

  * ※ **기존 스키마에 ‘복부’ 추가**(제공 JSON의 `part`에 맞춤).
* **Review** `{ id, videoId, userId, rating(1..5), content, createdAt, updatedAt }`
* **User** `{ id, username, displayName, email, passwordHash, bio?, disabled?, createdAt, updatedAt }`
* **Favorite** `{ id, userId, videoId, createdAt }`, **Follow**, **Post**, **Plan** — 동일.

### 5.2 LocalStorage 네임스페이스

* `ssafit:videos`, `ssafit:reviews`, `ssafit:users`, `ssafit:favorites`, `ssafit:follows`, `ssafit:posts`, `ssafit:plans`, `ssafit:meta`, `ssafit:session`

### 5.3 **제공 JSON → Video 변환(MUST)**

* JSON 예시 항목:
  `{"id":"gMaB-fG4u4g","title":"…","part":"전신","channelName":"ThankyouBUBU","url":"https://www.youtube.com/embed/gMaB-fG4u4g"}`&#x20;
* 매핑 규칙:

  * `youtubeId` = JSON.`id`
  * `title` = JSON.`title`
  * `bodyPart` = JSON.`part` (허용값: 상체/하체/전신/복부 등)
  * `thumbnailUrl` = `https://i.ytimg.com/vi/{youtubeId}/hqdefault.jpg` (파생)
  * `views` = 0 (초기값)
  * `tags` = \[] (초기), 필요 시 `channelName`을 태그로 추가
  * **내부 키 `id`** = `uuid()` (LocalStorage 내부용 일관성 유지)
  * `authorId` = (옵션) 채널명으로 가상 사용자 생성 후 연결 (`channelName`)
  * `createdAt/updatedAt` = `Date.now()`
  * `difficulty` = (규칙 기반 초기값) 전신/하체/상체→‘중급’ 기본, 복부/코어→‘초급’ 기본(수정 가능)
* **임베드 URL**(`url`)은 상세 페이지 iframe에 활용 가능(또는 `youtubeId` 기반으로 재구성). (JSON 다른 항목도 동일 형식. )

### 5.4 시드 주입 로직

* 최초 로드 시 `assets/data/videos.json`을 **fetch**하여 변환·저장.
* `ssafit:meta.lastSeedVersion`으로 **중복 주입 차단**.
* JSON fetch 실패 시, **내장 더미**로 폴백.

### 5.5 Import/Export

* **설정 화면**에서 전체 Export(JSON) / Import(JSON) 제공(로컬 백업/이관).

---

## 6) UI·스타일 가이드 (Bootstrap)

* 레이아웃: `container`/`row`/`col-*`, 카드/리스트는 `card`/`list-group`.
* 폼: `form-floating` + `is-invalid`/`invalid-feedback`.
* 버튼: `btn btn-primary|outline-*`(기본 `btn-sm`).
* 모달/토스트: Bootstrap Modal/Toast 유틸 공용.
* 접근성: 모든 입력은 `label for`/`aria-*`, 스킵 링크(`#content`), 모달 Esc/포커스.

---

## 7) 모듈 경계·인터페이스

### Repositories (LocalStorage I/O 전담)

* `findAll()`, `findById(id)`, `create(payload)`, `update(id, patch)`, `remove(id)`, `bulkUpsert(list)`

### Services (비즈니스 규칙)

* **videosService**: `list(filters)→{items,total}`, `get(id)→{…reviewCount,isFavorite}`, `create/edit/remove`, `toggleFavorite`, `increaseViews`
* **reviewsService**: 리뷰 CRUD·평균 평점
* **usersService**: 가입/중복/비활성화/로그인·세션
* **communityService**: 게시글 CRUD + 조회수/댓글수
* **plansService**: 달력 데이터(day.js) + 일정 CRUD
* **recoService(선택)**: 규칙 기반 추천(최근 시청 부위/난이도 → 인기)

---

## 8) 검증·에러 UX

* 제출 전 `reportValidity()` + 커스텀 검증.
* 실패: 해당 인풋 `invalid-feedback` + 포커스.
* 용량 초과 등 예외: 토스트 + Export 안내.
* 권한 오류: “권한 없음” 토스트.

---

## 9) 테스트(수용)

* 전역: 시드 1회, JSON Import/Export.
* 영상: CRUD→목록/상세 반영, 검색/정렬/페이징.
* 리뷰: CRUD/평균.
* 회원: 중복·로그인/로그아웃.
* 찜/팔로우/커뮤니티/계획: 각 CRUD 정상.
* **데이터 연계**: JSON 기반 시드가 영상/리뷰/찜/추천 흐름에 반영되는지.

---

## 10) 커밋/브랜치

* 커밋: `feat|fix|refactor|docs|style|test|chore`
* 브랜치: `dev`, `feat/<scope>`, `fix/<scope>`



# v0.dev 프롬프트 모음

promise999 웹 MVP를 v0.dev로 뽑기 위한 프롬프트. 순서대로 복사해서 사용.

## 디자인 원칙
- **무채색만** (black / white / grayscale) — 정당 색을 쓰지 않는 것이 서비스의 중립성 시그널
- **Serif 본문 + Sans-serif 헤더** — "공공 아카이브/위키" 톤
- **당선/낙선은 색 대신 채움 vs 외곽선**으로 구분 (filled = 당선, outlined = 낙선)
- **정당은 작은 모노 라벨** — 채색·아이콘 없음, 텍스트만
- **한국어 본문 최적화** — Pretendard 또는 Noto Sans KR, 줄간격 1.7

---

## 프롬프트 0 — 디자인 시스템 기준 (모든 후속 프롬프트에 붙여넣기)

```
Build in Next.js 14 App Router with TypeScript, Tailwind CSS, and shadcn/ui.
All UI copy must be in Korean.

STRICT DESIGN CONSTRAINTS (this is a politically sensitive product — neutrality is a feature):
- Monochrome only. Allowed colors: pure white (#FFFFFF), pure black (#000000), and grayscale steps (#F5F5F5, #E5E5E5, #D4D4D4, #A3A3A3, #525252, #262626).
- Absolutely no party colors, no blue/red accents, no category colors. If you need to emphasize, use weight, size, or a 1px black border.
- Elected candidates: filled black circle/badge. Defeated: outlined (1px border, transparent fill). Undecided: dashed outline.
- Party affiliation is shown as a small monospace text label with a thin border, not as a colored pill.
- Typography: headings in a clean sans-serif (use font-sans with tracking-tight), body in a serif (font-serif, leading-relaxed) for an archival/encyclopedia feel. Use Korean-friendly fonts via next/font — Pretendard for sans, Noto Serif KR for serif.
- Generous whitespace. Max content width 1100px. Card edges are square (rounded-none) or very subtle (rounded-sm).
- Icons: lucide-react, stroke-1, never filled. Icon color always currentColor.
- Accessibility: WCAG AA contrast, full keyboard nav, aria-labels in Korean.

COPYRIGHT & TONE:
- Footer must say: "모든 공약 원문은 중앙선거관리위원회 정책·공약마당(policy.nec.go.kr) 기준입니다."
- Never use evaluative language ("훌륭한", "실현 가능한") — stick to descriptive verbs.
```

---

## 프롬프트 1 — 랜딩 페이지

```
[prepend design-system prompt above]

Build a landing page for "promise999 — 한국 선거 공약 아카이브".

HERO section:
- Left: H1 "모든 선거 공약을, 한곳에서." + subcopy in serif: "중앙선거관리위원회 원문을 기반으로 한, 전국·역대 선거의 공약을 비교할 수 있는 공공 아카이브."
- Right: a search input with placeholder "후보자 이름, 선거구, 정당으로 검색" and a small "주소로 내 선거구 찾기" text link below it.
- No hero image. Just whitespace and typography.

TRUST bar (below hero, one row):
- 4 stats in plain text with thin dividers:
  • "수록 선거 23회"
  • "후보자 공약 41,280건"
  • "정당 정책 158건"
  • "용어 풀이 1,200+개"
(use placeholder numbers)

"오는 선거" card (single featured election):
- Header: "제9회 전국동시지방선거"
- "2026년 6월 3일 (D-40)"
- Row of 7 small squares for the 7 ballot types (시·도지사 / 교육감 / 광역의원 지역구 / 광역의원 비례 / 시·군·구청장 / 기초의원 지역구 / 기초의원 비례). Each square is just text + count, no icons.
- CTA button (black fill, white text, square): "내 투표용지 미리보기"

"이 서비스의 3가지 원칙" section (3 columns, text only):
1. 중립 — "공약 원문 그대로. AI는 해석이 아닌 요약·분류만."
2. 이력 — "같은 후보의 과거 공약까지 함께 봅니다."
3. 공식 — "모든 데이터는 중앙선관위 공식 소스."

"최근 추가된 공약" list (recent activity feed):
- 8 rows, each: [선거명 소문자 label] / 후보 이름 / 정당(모노 라벨) / 공약 첫줄 요약 / 시간
- Example row: "제22대 국회의원 · 김민수 · [국민의힘] · 지역 필수의료 체계 구축을 최우선 과제로 — 3시간 전"

FOOTER:
- Links: 소개 / 데이터 출처 / FAQ / API / 개발 문의
- Disclaimer about 선관위 출처
- "이 서비스는 특정 정당·후보를 지지하거나 반대하지 않습니다."

No animations, no gradients, no shadows larger than shadow-sm.
```

---

## 프롬프트 2 — "내 투표용지" 선거 개요 페이지

```
[prepend design-system prompt]

Build a page at `/elections/[sg_id]` showing an overview of one election, styled as a physical ballot paper.

HEADER:
- H1: "제9회 전국동시지방선거"
- Metadata row: "투표일 2026년 6월 3일 (수) · 선거인 약 4,430만 명 · 후보자 약 9,200명"
- Small toggle: [ 전국 ] [ 내 지역 ] (default 전국)

MAIN CONTENT:
Show a 7-column grid of "ballot cards", each representing one ballot type the voter will receive.
Each card has:
- Top strip (black, white text): ballot number + type, e.g. "① 시·도지사"
- Candidate list: each row is a candidate with
  - Candidate number (기호) in a square black outlined box
  - Name in serif
  - Party label in mono brackets: [더불어민주당] (no color)
  - A tiny "공약 보기" underlined link
  - Elected rows get a filled black dot to the right; withdrew rows are strikethrough gray
- Bottom of card: "총 N명 출마"

The 7 ballot types (in ballot number order):
① 시·도지사
② 교육감
③ 광역의원 비례대표
④ 광역의원 지역구
⑤ 시·군·구청장
⑥ 기초의원 지역구
⑦ 기초의원 비례대표

Grid behavior: on desktop 4 cards per row, tablet 2, mobile 1. Stack vertically on narrow screens.

SIDE PANEL (sticky, right, desktop only):
- "이 선거 한눈에 보기"
  - 투표율 (과거 대비 꺾은선, 무채색)
  - 주요 정당 의석 변화 (흑백 막대)
- Everything is monochrome SVG

Below the grid, "공약 한줄 스캔" section: horizontally scrollable strip of cards, each showing one pledge in 2 lines + candidate name. Gray 1px border, no fill.

Use Korean sample data for Seoul. Include at least 6 candidates per ballot card.
```

---

## 프롬프트 3 — 후보자 상세 페이지 + 공약

```
[prepend design-system prompt]

Build a page at `/candidates/[candidacy_id]` showing one candidate's pledges and full history.

TOP PROFILE BLOCK:
- Left: square photo placeholder (100x120, 1px black border, grayscale)
- Right:
  - H1: candidate name in serif, large
  - Sub-line: "제9회 전국동시지방선거 · 서울특별시장 · 기호 2번"
  - Party in mono brackets: [국민의힘]
  - Status badge: one of "출마중" / "당선" (filled black) / "낙선" (outlined) / "사퇴" (strikethrough + "사퇴 2026.5.28" note)
  - Meta grid: 생년월일 / 학력 / 직업 (from hbjhakruk, hbjjikup in NEC data)
  - Action row: "공약서 PDF 원본" / "선관위 원본 링크" / "URL 공유"

TAB NAV (underline style, no pills):
[공약] [이력] [공보 PDF] [비교]

TAB 1 — 공약:
- "핵심 공약" (5개 카드, no color coding)
  - Each card: 순번 / 제목 / 2–3줄 요약 / 분야 라벨 (회색 박스)
  - "원문 읽기" 링크 → /pledges/[id]
- "상세 공약" accordion list, 20–30개, 분야별 그룹핑
- Top of section: small disclaimer box (gray background): "아래 공약 요약은 원문에서 기계적으로 추출·분류한 결과입니다. 평가·해석을 포함하지 않습니다."

TAB 2 — 이력 (공약 변화 타임라인, 이 서비스의 킬러 기능):
- Vertical timeline, oldest to newest
- Each event is one candidacy: 연도 · 선거명 · 소속 정당 · 선거구 · 결과(당선/낙선)
- For consecutive runs, a "공약 변화" card between events with 3 sub-items:
  - 유지된 공약 (continued)
  - 바뀐 공약 (changed, with before → after)
  - 빠진 / 새로 등장한 공약 (dropped / new)
- Tone of variance text: descriptive only. Never "약속을 어겼다", "공약이 후퇴했다" 같은 평가어 금지. Use neutral verbs: "유지", "변경", "제외", "추가".

TAB 3 — 공보 PDF: embedded PDF viewer (placeholder iframe), with "원본 다운로드" link.

TAB 4 — 비교: side-by-side 2-column compare with another candidate in the same race (candidate picker dropdown).

Sticky footer note: "모든 공약 원문은 중앙선거관리위원회 공식 자료입니다."
```

---

## 프롬프트 4 — 공약 비교 페이지

```
[prepend design-system prompt]

Build a compare page at `/pledges/compare?ids=...` that lets users put 2–4 candidates side by side.

TOP BAR:
- "후보 비교"
- A row of "slots" (up to 4). Each slot is a square card with a small "+" placeholder when empty. Clicking it opens a search modal to add a candidate.
- Global filter row: [분야 ▾] [선거 ▾] [정당 ▾]

COMPARISON GRID:
- Rows = pledge categories (경제 / 복지 / 교육 / 주거 / 교통 / 환경 / 행정 / 안전 / 문화 …)
- Columns = selected candidates
- Each cell: bullet list of 1–3 pledges in that category, text only, no icons, no color
- Empty cell: "해당 분야 공약 없음" in light gray italic

Beneath the grid:
- "공통 키워드" module: word cloud rendered in varying font sizes only, all black. No color.
- "차별 공약" module: for each candidate, pledges that no other candidate proposed (gray-bordered card).

Above the grid, disclaimer box:
"이 비교는 원문을 분야별로 나열한 것입니다. 어떤 공약이 더 좋거나 실현 가능한지 판단하지 않습니다."

Print-friendly: add an Export to PDF button (black outline square).
```

---

## 프롬프트 5 — 용어 풀이 (위키 스타일)

```
[prepend design-system prompt]

Build a term glossary page at `/terms/[slug]`. Style it like an encyclopedia entry.

LAYOUT:
- Left rail: 가나다 index (ㄱㄴㄷㄹ…), sticky, monochrome.
- Center: article
  - H1: 용어명
  - Light gray quote block: 1–2 sentence neutral definition
  - Section "배경" — 2–3 paragraphs, serif body, leading-relaxed
  - Section "관련 공약" — list of pledges that cite this term, each row is a link:
    "2022 서울시장 · 김○○ · 「…」 공약에서 언급" → /pledges/[id]
  - Section "관련 용어" — simple link list
  - Footer line: "출처: {source} · 마지막 업데이트 {date}"
- Right rail: on-this-page TOC, monochrome, very thin.

Never use evaluative adjectives in definitions. Neutral, descriptive only.

Sample term: "지방교부세" — show a complete page using this as the seed.
```

---

## 추가 팁 — v0에서 더 잘 뽑히는 법

1. 위 프롬프트 0(디자인 시스템)을 **매번 붙여넣기**. v0는 한 세션 안에서도 약속을 잊어버립니다.
2. 첫 결과에서 색이 들어가면, "Replace all non-monochrome colors with grayscale. Keep only #000 and #FFF and grays." 한 줄만 추가로 요청.
3. 한국어 폰트가 깨지면: "Use Pretendard via @next/font/google or a Google Fonts CDN link in the layout." 추가.
4. shadcn/ui 컴포넌트가 컬러를 끌고 들어오면: "Override all default shadcn variants to use only neutral colors. Replace `destructive` and `primary` variants with black/white variants."
5. 샘플 데이터는 항상 한국어로 — v0가 영어 placeholder를 넣으면 "Replace all placeholder strings with plausible Korean sample data, Korean names, Korean party names, Korean district names." 요청.

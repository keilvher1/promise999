# web

Next.js 프론트엔드 (SEO 최적화).

## 목표 아키텍처 (Phase 1~2)
- Next.js 14+ / App Router
- 서버 컴포넌트로 SSR — 후보자 개별 페이지가 구글 색인 대상
- 데이터 레이어: 초기엔 SQLite 직접 읽기, 확장 시 Supabase/PostgreSQL로 스위치

## 핵심 페이지 (초안)
```
/                              — 랜딩
/elections/[sg_id]             — 선거별 개요
/elections/[sg_id]/map         — 지역 기반 UX ("내 투표용지")
/candidates/[candidacy_id]     — 후보자 상세 + 공약
/persons/[person_id]           — 동일인 전체 이력 (공약 변화 타임라인)
/parties/[party_id]            — 정당별 정책 연혁
/pledges/compare               — 후보 간 공약 비교
/terms/[slug]                  — 용어 풀이 (위키피디아 스타일)
```

## Phase 1에선 만들지 않는 것
- 로그인/계정
- 댓글/게시판
- 주소→선거구 매칭 (서버 연산 비용 커서 Phase 2)

## 초기화
```bash
npx create-next-app@latest . --typescript --app --tailwind --eslint
```
(Phase 1 시작 시점에 실행)

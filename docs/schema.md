# 데이터 스키마 (v0.1 초안)

## 설계 원칙
1. **선관위 원본 ID 그대로 보존** — `nec_code`, `nec_candidate_id`, `sg_id` 등 원본 식별자 필드 필수.
2. **동일인 매칭을 1급 시민으로** — `persons`(마스터) ↔ `candidacies`(출마 이벤트) 분리. 생년월일이 핵심.
3. **정당 변천 추적** — `parties.successor_party_id` self-FK 로 통합·개명 체인.
4. **지역·선거구 경계 변경 대응** — `valid_from/valid_to` 시간축 필드.
5. **공약은 계층 구조** — `pledges`(묶음, 파일 단위) → `pledge_items`(개별 항목).
6. **원문 보존 의무** — PDF 해시(`source_checksum`)와 로컬 경로(`pdf_path_local`) 동시 저장. AI 생성물은 `ai_*` 프리픽스로 원문과 분리.
7. **SQLite → PostgreSQL 호환 SQL** — 문법은 양쪽 모두 통과하는 범위로 제한. 실제 파일은 [`schema.sql`](./schema.sql).

## 핵심 테이블

### `elections` — 상위 선거
제9회 지선, 제21대 대선 같은 단위. 지선은 하위 7종 선거를 `sub_elections`로 분해.

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | PK | |
| `sg_id` | TEXT UNIQUE | 선관위 sgId (`0020260603`) |
| `name` | TEXT | "제9회 전국동시지방선거" |
| `election_date` | DATE | 2026-06-03 |
| `kind` | TEXT | `PRESIDENT` / `ASSEMBLY` / `LOCAL` / `BYELECTION` / `EDUCATION` |
| `is_byelection` | INTEGER | 0/1 |

### `sub_elections` — 지선의 하위 선거
| 필드 | 설명 |
|------|------|
| `parent_election_id` | `elections.id` |
| `sub_sg_id` | 선관위 subSgId |
| `sg_typecode` | 1~11 (codes.md 참조) |
| `is_proportional` | 비례대표 여부 |

### `regions` / `constituencies`
- `regions`: 시도·시군구·읍면동 계층. `code`는 선관위 내부 코드. `valid_from/valid_to`로 경계 변경.
- `constituencies`: 선거구. `sub_elections` 1:N. 광역의원/기초의원의 경우 행정구역과 선거구가 다를 수 있음.

### `parties`
- `nec_code` = 선관위 jdid
- `successor_party_id` = 후신 정당 FK (통합·개명 추적)

### `persons` — 동일인 마스터
| 필드 | 설명 |
|------|------|
| `name`, `name_hanja` | 현재 표기 (개명 전/후 중 최신) |
| `birth_date` | **동일인 매칭의 핵심** |
| `gender` | `M`/`F`/`?` |
| `match_confidence` | 0.0~1.0. 1대~6대 총선처럼 생년월일 부정확한 경우 낮춤 |
| `merged_into_id` | 사후 중복 병합 시 타겟 person FK |

UNIQUE(`name`, `birth_date`) — 생년월일 미상은 NULL이므로 자동 충돌 방지.

### `candidacies` — 한 선거·한 후보 단위
| 필드 | 설명 |
|------|------|
| `person_id` | persons FK |
| `sub_election_id` | sub_elections FK |
| `constituency_id` | constituencies FK |
| `party_id` | parties FK (당시 소속) |
| `nec_candidate_id` | 선관위 huboId |
| `candidate_number` | 기호 |
| `proportional_order` | 비례 순번 |
| `name_as_registered` | 출마 당시 이름 (개명 전 추적) |
| `is_elected` | 0/1/NULL |
| `vote_count`, `vote_pct` | 득표 |
| `withdrew_at`, `withdrawal_reason` | 사퇴·사망·등록무효 |

UNIQUE(`sub_election_id`, `nec_candidate_id`).

### `pledges` — 공약 파일 단위
후보 선거공약서 PDF 1개, 정당 10대공약 PDF 1개 등 "파일 = 레코드". `source_type`로 종류 구분.

| 필드 | 설명 |
|------|------|
| `candidacy_id` | nullable (정당 공약은 NULL) |
| `party_id` | nullable (후보 공약은 NULL) |
| `sub_election_id` | 정당 공약용 |
| `source_type` | `candidate` / `winner` / `party` / `top5` / `top10` |
| `source_file_type` | fileTypeName 원문 (선거공약서/선거공보/5대공약/...) |
| `pdf_url` | cdn.nec.go.kr 원본 URL |
| `pdf_path_local` | `data/pdf/...` |
| `source_checksum` | SHA-256 |
| `is_submitted` | 미제출(0) 추적 |

### `pledge_items` — 개별 공약 항목
PDF 안의 "5대 공약" 각 항목, 또는 긴 공약서에서 파싱한 소제목 단위.

| 필드 | 설명 |
|------|------|
| `pledge_id` | pledges FK |
| `order_index` | 1,2,3,... |
| `title` | 제목 |
| `description` | 원문 텍스트 |
| `category` | 사람이 부여한 분야 (nullable) |
| `ai_summary` | Claude가 생성한 중립 요약 |
| `ai_category` | Claude가 부여한 분야 (경제/복지/교육/환경/...) |
| `ai_tags` | 콤마 리스트 |
| `ai_generated_at` | 생성 시각 |
| `content_hash` | 변화 추적용 해시 |

### `terms` / `term_occurrences` — 용어 풀이
- `terms`: 어려운 용어 사전 (중립 정의, 출처 표기).
- `term_occurrences`: 각 공약에 등장한 용어의 역인덱스.

### `pledge_comparisons` — 공약 이력 비교
동일인의 두 `pledge_item`을 페어링해 변화 타입을 기록.

| 필드 | 설명 |
|------|------|
| `person_id` | persons FK |
| `earlier_pledge_item_id`, `later_pledge_item_id` | 비교 쌍 |
| `diff_type` | `continued`(유지) / `changed`(내용변경) / `dropped`(빠짐) / `new`(신규) |
| `ai_summary` | 변화 요약 |

### `crawl_jobs` — 크롤링 실행 이력
재시도·백필·상태 모니터링용.

## ER 개관
```
elections ── 1 : N ──> sub_elections ── 1 : N ──> constituencies
                              │
                              └── 1 : N ──> candidacies ─┐
parties ─ 1 : N ─────────────────────────────────────┘   │
persons ─ 1 : N ─────────────────────────────────────────┘
                              │
candidacies ─ 1 : N ──> pledges ── 1 : N ──> pledge_items
parties     ─ 1 : N ──> pledges
sub_elections ─ 1 : N ──> pledges  (정당정책용)

pledge_items ── N : N ── terms   (term_occurrences)
pledge_items ── N : N ── pledge_items (self, via pledge_comparisons)
```

## 남겨둔 결정 포인트
1. 공약 원문을 DB에 저장할지 파일시스템에만 둘지 — 현재 안은 **`content_raw`로 DB에도 넣고 파일은 보강**.
2. 투·개표 상세(읍면동별) 별도 `vote_results` 테이블이 필요한지 — **Phase 2에서 추가**.
3. AI 재처리 이력 관리 — 현재는 덮어쓰기. 필요 시 `ai_versions` 이력 테이블 추가.
4. 공공데이터포털 API 응답 스키마 확인 후, `source_url` 외에 `api_response_snapshot`(JSON column) 추가 검토.

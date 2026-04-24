# promise999 — 한국 선거 공약 아카이브

중앙선거관리위원회 공식 데이터를 기반으로, 흩어진 선거 공약을 한곳에 모으고 과거 이력까지 추적하는 공공 아카이브 서비스.

> **무채색 기반의 중립 디자인** — 정당 색을 쓰지 않는 것이 서비스의 중립성 시그널입니다.

## 타겟 이벤트
- **D-Day: 2026년 6월 3일** — 제9회 전국동시지방선거
- 커버: 광역단체장 / 교육감 / 광역의원(지역·비례) / 기초단체장 / 기초의원(지역·비례) — 7종
- 확장: 2006년 이후 주요 선거 전면 아카이브

## 데이터 소스
**공공데이터포털(data.go.kr) 선관위 6개 API + 정책·공약마당(policy.nec.go.kr)** 조합.

| ID | API | 용도 |
|----|-----|------|
| 15040587 | 선거공약 | 공약 원문 (목표/이행방법/재원조달) |
| 15000908 | 후보자 정보 | huboid, 프로필, 학력, 경력 |
| 15000864 | 당선인 정보 | 당선 플래그 + 득표수(dugsu) + 득표율(dugyul) |
| 15000900 | 투·개표 | 후보자별·지역별 개표 (낙선자 득표 포함) |
| 15000897 | 코드정보 | 선거·지역·선거구·정당 마스터 코드 |
| 15000836 | 투표소 | 사전/선거일 투표소 — 2026 "내 투표소 찾기" |

자세한 API 스펙: [`docs/apis.md`](docs/apis.md) · 정찰 리포트: [`docs/recon-report.md`](docs/recon-report.md)

## 디렉토리 구조
```
/app              Next.js 16 App Router 페이지
/components       UI 컴포넌트 (shadcn/ui 기반 + custom)
/lib              데이터 레이어
  ├ db.ts           Neon(@neondatabase/serverless) 연결
  ├ queries.ts      서버사이드 DB 쿼리
  └ *-data.ts       타입 + 샘플 데이터
/crawler          Python 크롤러
  ├ sources/        data.go.kr / policy.nec.go.kr 어댑터
  ├ store/          Neon 적재 헬퍼
  └ scripts/        파일럿·백필 실행 스크립트
/docs             설계 문서 (schema, apis, recon, codes)
/data             (gitignored) 수집 원본·PDF
/public, /styles, /hooks   Next.js 표준
```

## 로컬 실행
### 1) 사전 준비
- **Neon DB**: https://neon.tech 에서 프로젝트 생성 → connection string 복사
- **공공데이터포털 키**: https://www.data.go.kr 가입 후 위 6개 API 활용신청 (자동승인)

### 2) `.env` 설정
```bash
cp .env.example .env
# 편집해 DATABASE_URL, DATA_GO_KR_API_KEY_* 채우기
```

### 3) DB 스키마 적용
```bash
# docs/schema.postgres.sql 을 Neon에 적용
# (또는 Neon 콘솔의 SQL Editor에서 복붙 실행)
```

### 4) 크롤러로 데이터 적재
```bash
pip install -r crawler/requirements.txt
python3 crawler/scripts/ping_data_go_kr.py                  # 6개 API 상태 확인
python3 crawler/scripts/seed_pilot_2022.py                  # 기본 구조 시드
python3 crawler/scripts/crawl_seoul_mayor_2022.py           # 후보+공약 크롤
python3 crawler/scripts/update_winners_2022.py              # 당선 플래그 보강
python3 crawler/scripts/update_votes_seoul_mayor_2022.py    # 전원 득표 집계
```

### 5) 웹 개발 서버
```bash
pnpm install          # 또는 npm install / yarn
pnpm dev
```
→ http://localhost:3000
- `/elections/0020220601` 에서 Neon 실데이터 (제8회 지선, 서울시장 5명)
- 기타 경로는 샘플 데이터 fallback

## Vercel 배포
1. 이 레포를 Vercel에 Import
2. Environment Variables에 `DATABASE_URL` 추가 (Neon 값)
3. Deploy → 엣지 런타임으로 Neon HTTP 쿼리 실행

## AI 적용 원칙
- ✅ 용어 자동 풀이, 공약 분야 분류, 동일인 공약 변화 추출
- ❌ 공약의 효과·타당성·실현 가능성 평가, 후보 간 우열 판단

## 로드맵
- **Phase 1** (~5월 초): 파일럿 — ✅ 2022 서울시장 크롤링·적재, ✅ 웹 ↔ Neon 연동
- **Phase 2** (~5월 14일): 전국 2022 확장, 과거 데이터 대량 백필, AI 배치 처리
- **Phase 3** (5.14 ~ 6.3): 2026 예비후보자/후보자 실시간 수집
- **Phase 4** (6.3 이후): 결과 연동, 공약 이행 추적

---
**Disclaimer**: 이 서비스는 특정 정당·후보를 지지하거나 반대하지 않으며, 모든 공약 원문은 중앙선거관리위원회 및 공공데이터포털의 공식 데이터를 그대로 사용합니다.

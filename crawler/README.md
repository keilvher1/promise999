# crawler

선관위 공식 데이터 수집 모듈.

## 구조
```
crawler/
  sources/
    policy_nec.py        # policy.nec.go.kr (공약 PDF + 내부 JSON API)
    data_go_kr.py        # data.go.kr 공공데이터포털 API (후보·투개표·당선인)
    info_nec.py          # info.nec.go.kr (후보 상세 팝업 한정)
  parsers/
    pdf_parser.py        # pypdf + OCR 폴백
    html_parser.py
  store/
    db.py                # SQLite 연결 / upsert 헬퍼
    models.py            # 경량 데이터클래스 (필요 시)
  scripts/
    pilot_2022_local.py  # 2022 지선 파일럿
    backfill.py          # 과거 선거 백필
    daily_sync.py        # 2026 후보등록 후 실시간 수집
```

## 실행 환경
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## 설정
환경변수(.env):
- `DATA_GO_KR_API_KEY` — 공공데이터포털 활용 키 (docs/recon-report.md §3 참조)
- `DB_PATH` — SQLite 파일 경로 (기본: `../data/db/promise999.sqlite`)
- `RATE_LIMIT_POLICY_NEC` — 초당 요청 수 (기본: 2)
- `USER_AGENT` — 식별용 UA (법적 분쟁 방지 차원에서 연락처 포함 권장)

## 원칙
1. **원본 보존** — 모든 fetch는 `data/raw`에 JSON/HTML 스냅샷을 먼저 저장 후 파싱.
2. **Rate-limit 준수** — `policy.nec.go.kr`는 초당 2회 이하, `data.go.kr`는 할당량 내, `info.nec.go.kr`는 공개 팝업 URL 외엔 접근 금지.
3. **재시도 안전성** — `crawl_jobs` 테이블에 작업 단위를 기록해 중복 실행 방지.
4. **선관위 robots.txt 존중** — `info.nec.go.kr`는 `Disallow: /`이므로 기본적으로 API 우회.

# data

수집된 원본·정제 데이터.

```
raw/         선관위 원본 JSON/HTML 스냅샷 (디버깅·재처리용)
pdf/         선관위 PDF (공약서·공보·정당정책)
processed/   PDF에서 추출한 텍스트, 정제된 중간 산출물
db/          SQLite 파일 (promise999.sqlite)
```

## 파일명 규칙 (권장)
- PDF: `{sg_id}_{sub_sg_id}_{huboId}_{file_type}.pdf`
  - ex) `0020220601_{sub}_1234_선거공약서.pdf`
- 정당 PDF: `{sg_id}_party_{jdid}_{file_type}.pdf`
- raw JSON: `{source}_{endpoint_shortname}_{timestamp}.json`

## DB 초기화
```bash
sqlite3 data/db/promise999.sqlite < docs/schema.sql
```

## 주의
- `raw/`와 `pdf/`는 선관위 저작물 원본이므로 리포지토리 커밋 금지 (`.gitignore` 처리).
- PDF SHA-256 해시는 `pledges.source_checksum`에 저장 — 중복 다운로드 방지 + 변경 추적.

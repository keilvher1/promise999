-- ===========================================================================
-- promise999 — NEC 정책공약마당 PDF 추가 스키마.
-- 1) pledges 에 PDF 메타 컬럼 추가 (URL/페이지수/원문 사이즈)
-- 2) pledge_items 에 source 컬럼 추가 (data.go.kr API 출처와 PDF 출처 구분)
-- 3) 전체 PDF 본문 저장용 별도 테이블 (검색·재가공 용도)
-- ===========================================================================

ALTER TABLE pledges
  ADD COLUMN IF NOT EXISTS pdf_url     TEXT,
  ADD COLUMN IF NOT EXISTS pdf_pages   INTEGER,
  ADD COLUMN IF NOT EXISTS pdf_bytes   INTEGER,
  ADD COLUMN IF NOT EXISTS pdf_kind    TEXT;  -- 전단형선거공보/책자형선거공보/선거공약서/10대공약

ALTER TABLE pledge_items
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'api';
  -- 'api' = data.go.kr 선거공약 API
  -- 'nec_pdf' = policy.nec.go.kr PDF (전체 본문 저장)

CREATE TABLE IF NOT EXISTS pledge_pdf_texts (
  id            BIGSERIAL PRIMARY KEY,
  candidacy_id  BIGINT NOT NULL REFERENCES candidacies(id) ON DELETE CASCADE,
  pdf_kind      TEXT NOT NULL,             -- 동일 후보가 여러 종류 PDF 가질 수 있음
  pdf_url       TEXT NOT NULL,
  full_text     TEXT NOT NULL,
  pages         INTEGER,
  bytes         INTEGER,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidacy_id, pdf_kind)
);
CREATE INDEX IF NOT EXISTS idx_pledge_pdf_texts_candidacy ON pledge_pdf_texts(candidacy_id);

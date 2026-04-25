-- ===========================================================================
-- promise999 정정요청·문의 (corrections / contact).
-- ===========================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'correction_target_kind') THEN
    CREATE TYPE correction_target_kind AS ENUM (
      'candidacy', 'pledge', 'pledge_item', 'election', 'sub_election',
      'general'   -- 사이트 전체에 대한 일반 문의
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'correction_status') THEN
    CREATE TYPE correction_status AS ENUM (
      'open',         -- 접수 (기본)
      'investigating', -- 조사 중
      'fixed',         -- 수정 완료
      'rejected',      -- 반려 (사실/근거 불충분)
      'duplicate'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS corrections (
  id            BIGSERIAL PRIMARY KEY,
  target_kind   correction_target_kind NOT NULL,
  target_id     BIGINT,                                    -- general이면 NULL
  category      TEXT NOT NULL CHECK (category IN
    ('factual','typo','translation','outdated','source','feature','other')),
  body          TEXT NOT NULL CHECK (char_length(body) BETWEEN 10 AND 4000),
  source_url    TEXT,                                       -- 사용자가 제공한 출처 URL
  contact_email TEXT,                                       -- 답신 받기 원하면 (선택)
  reporter_hash TEXT NOT NULL,                              -- IP+SALT (어뷰즈/중복방지)
  status        correction_status NOT NULL DEFAULT 'open',
  admin_note    TEXT,
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT corrections_target_consistent CHECK (
    (target_kind = 'general' AND target_id IS NULL) OR
    (target_kind <> 'general' AND target_id IS NOT NULL)
  ),
  CONSTRAINT corrections_email_format CHECK (
    contact_email IS NULL OR contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);
CREATE INDEX IF NOT EXISTS idx_corrections_status_created
  ON corrections(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_corrections_target
  ON corrections(target_kind, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_corrections_reporter
  ON corrections(reporter_hash, created_at DESC);

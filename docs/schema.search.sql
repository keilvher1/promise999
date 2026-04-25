-- ===========================================================================
-- promise999 검색 로그 (실시간/연관 검색어용).
-- ===========================================================================

CREATE TABLE IF NOT EXISTS search_log (
  id          BIGSERIAL PRIMARY KEY,
  query       TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 200),
  query_norm  TEXT NOT NULL,                  -- lower + trim, 집계용
  voter_hash  TEXT,                            -- IP+SALT 해시 (어뷰즈 방지)
  result_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_log_norm_recent
  ON search_log (query_norm, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_log_recent
  ON search_log (created_at DESC);

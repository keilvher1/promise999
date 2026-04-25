-- ===========================================================================
-- promise999 공약 좋아요(likes) 스키마.
-- IP 기반 — IP+SALT SHA-256 해시로 동일 IP 중복 차단.
-- 날짜 미포함이라 같은 IP는 영구 1표.
-- ===========================================================================

-- 좋아요 대상: pledge (전체) 또는 pledge_item (개별 공약 항목)
CREATE TABLE IF NOT EXISTS pledge_likes (
  id            BIGSERIAL PRIMARY KEY,
  pledge_id      BIGINT REFERENCES pledges(id) ON DELETE CASCADE,
  pledge_item_id BIGINT REFERENCES pledge_items(id) ON DELETE CASCADE,
  voter_hash     TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pledge_like_target_xor CHECK (
    (pledge_id IS NOT NULL AND pledge_item_id IS NULL) OR
    (pledge_id IS NULL AND pledge_item_id IS NOT NULL)
  ),
  UNIQUE NULLS NOT DISTINCT (voter_hash, pledge_id, pledge_item_id)
);
CREATE INDEX IF NOT EXISTS idx_pledge_likes_pledge ON pledge_likes(pledge_id) WHERE pledge_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pledge_likes_item ON pledge_likes(pledge_item_id) WHERE pledge_item_id IS NOT NULL;

-- 카운트 집계 컬럼 (조회 성능 위해 비정규화)
ALTER TABLE pledges     ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pledge_items ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

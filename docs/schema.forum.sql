-- ===========================================================================
-- promise999 익명 토론장(forum) 스키마.
-- Neon(PostgreSQL) 전용. 기존 schema.postgres.sql 적용 후 추가로 실행.
-- ===========================================================================

-- 게시글이 attach되는 대상 종류.
--   election     → elections.id
--   sub_election → sub_elections.id
--   candidacy    → candidacies.id
--   pledge       → pledges.id
--   pledge_item  → pledge_items.id
--   global       → 전체 광장(target_id NULL)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forum_target_kind') THEN
    CREATE TYPE forum_target_kind AS ENUM (
      'election', 'sub_election', 'candidacy', 'pledge', 'pledge_item', 'global'
    );
  END IF;
END $$;

-- 게시글
CREATE TABLE IF NOT EXISTS forum_threads (
  id            BIGSERIAL PRIMARY KEY,
  target_kind   forum_target_kind NOT NULL,
  target_id     BIGINT,                       -- target_kind='global'일 때 NULL
  title         TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body          TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 8000),
  -- 익명 작성자: 닉네임은 자동 생성된 표시용, author_hash는 IP+UA+salt SHA-256
  author_nick   TEXT NOT NULL,
  author_hash   TEXT NOT NULL,                -- 동일인 식별/레이트리밋용
  -- 운영
  is_hidden     SMALLINT NOT NULL DEFAULT 0,  -- 1=숨김(신고/관리자)
  hide_reason   TEXT,
  reply_count   INTEGER NOT NULL DEFAULT 0,
  upvotes       INTEGER NOT NULL DEFAULT 0,
  downvotes     INTEGER NOT NULL DEFAULT 0,
  report_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- target_kind='global'일 때만 target_id NULL 허용
  CONSTRAINT forum_threads_target_consistent CHECK (
    (target_kind = 'global' AND target_id IS NULL) OR
    (target_kind <> 'global' AND target_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_forum_threads_target ON forum_threads(target_kind, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_hash ON forum_threads(author_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON forum_threads(created_at DESC) WHERE is_hidden = 0;

-- 댓글 (1단계 reply만 지원, parent_id로 nested 가능)
CREATE TABLE IF NOT EXISTS forum_replies (
  id            BIGSERIAL PRIMARY KEY,
  thread_id     BIGINT NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_id     BIGINT REFERENCES forum_replies(id) ON DELETE CASCADE,
  body          TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  author_nick   TEXT NOT NULL,
  author_hash   TEXT NOT NULL,
  is_hidden     SMALLINT NOT NULL DEFAULT 0,
  hide_reason   TEXT,
  upvotes       INTEGER NOT NULL DEFAULT 0,
  downvotes     INTEGER NOT NULL DEFAULT 0,
  report_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_hash ON forum_replies(author_hash, created_at DESC);

-- 신고
CREATE TABLE IF NOT EXISTS forum_reports (
  id            BIGSERIAL PRIMARY KEY,
  thread_id     BIGINT REFERENCES forum_threads(id) ON DELETE CASCADE,
  reply_id      BIGINT REFERENCES forum_replies(id) ON DELETE CASCADE,
  reporter_hash TEXT NOT NULL,
  reason        TEXT NOT NULL CHECK (reason IN
    ('spam','abuse','offtopic','illegal','disinfo','other')),
  detail        TEXT,
  resolved      SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT forum_report_target_xor CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  ),
  -- 같은 사람이 같은 글을 중복 신고 못 하게
  UNIQUE NULLS NOT DISTINCT (reporter_hash, thread_id, reply_id)
);

-- 추천/비추천 (UI에 토글로 노출, 같은 사용자 재투표는 갱신)
CREATE TABLE IF NOT EXISTS forum_votes (
  id            BIGSERIAL PRIMARY KEY,
  thread_id     BIGINT REFERENCES forum_threads(id) ON DELETE CASCADE,
  reply_id      BIGINT REFERENCES forum_replies(id) ON DELETE CASCADE,
  voter_hash    TEXT NOT NULL,
  vote          SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT forum_vote_target_xor CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE NULLS NOT DISTINCT (voter_hash, thread_id, reply_id)
);

-- 레이트 리밋: 동일 author_hash로 분당 N건 글/댓글 차단용
CREATE OR REPLACE VIEW forum_rate_view AS
SELECT author_hash, COUNT(*) AS posts_last_minute
FROM (
  SELECT author_hash, created_at FROM forum_threads
  WHERE created_at > NOW() - INTERVAL '60 seconds'
  UNION ALL
  SELECT author_hash, created_at FROM forum_replies
  WHERE created_at > NOW() - INTERVAL '60 seconds'
) x
GROUP BY author_hash;

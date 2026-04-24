-- promise999 스키마 (PostgreSQL 14+, Neon 호환)
-- SQLite 원본(schema.sql)에서 포팅. 차이점:
--   AUTOINCREMENT → BIGSERIAL
--   TIMESTAMP → TIMESTAMPTZ DEFAULT NOW()
--   PRAGMA 제거 (Postgres는 FK 기본 활성화)
--   CHECK에 IS NULL 조건 불필요 (Postgres는 NULL이 CHECK 통과)

-- =====================================================================
-- 1. 선거
-- =====================================================================
CREATE TABLE IF NOT EXISTS elections (
  id              BIGSERIAL PRIMARY KEY,
  sg_id           TEXT    NOT NULL UNIQUE,
  name            TEXT    NOT NULL,
  election_date   DATE    NOT NULL,
  kind            TEXT    NOT NULL CHECK (kind IN ('PRESIDENT','ASSEMBLY','LOCAL','BYELECTION','EDUCATION','OTHER')),
  is_byelection   SMALLINT NOT NULL DEFAULT 0 CHECK (is_byelection IN (0,1)),
  source_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_elections_date ON elections(election_date);

-- =====================================================================
-- 2. 하위 선거
-- =====================================================================
CREATE TABLE IF NOT EXISTS sub_elections (
  id                  BIGSERIAL PRIMARY KEY,
  parent_election_id  BIGINT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  sub_sg_id           TEXT    NOT NULL,
  sg_typecode         SMALLINT NOT NULL CHECK (sg_typecode BETWEEN 1 AND 11),
  sg_type_name        TEXT    NOT NULL,
  name                TEXT    NOT NULL,
  is_proportional     SMALLINT NOT NULL DEFAULT 0 CHECK (is_proportional IN (0,1)),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_election_id, sub_sg_id)
);
CREATE INDEX IF NOT EXISTS idx_sub_elections_typecode ON sub_elections(sg_typecode);

-- =====================================================================
-- 3. 행정구역
-- =====================================================================
CREATE TABLE IF NOT EXISTS regions (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT    NOT NULL,
  level       SMALLINT NOT NULL CHECK (level BETWEEN 0 AND 3),
  parent_id   BIGINT REFERENCES regions(id) ON DELETE SET NULL,
  name        TEXT    NOT NULL,
  name_short  TEXT,
  valid_from  DATE,
  valid_to    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(code, valid_from)
);
CREATE INDEX IF NOT EXISTS idx_regions_parent ON regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_regions_level ON regions(level);

-- =====================================================================
-- 4. 선거구
-- =====================================================================
CREATE TABLE IF NOT EXISTS constituencies (
  id                BIGSERIAL PRIMARY KEY,
  sub_election_id   BIGINT NOT NULL REFERENCES sub_elections(id) ON DELETE CASCADE,
  nec_code          TEXT,
  name              TEXT    NOT NULL,
  region_id         BIGINT REFERENCES regions(id) ON DELETE SET NULL,
  seats             INTEGER NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sub_election_id, nec_code)
);

-- =====================================================================
-- 5. 정당
-- =====================================================================
CREATE TABLE IF NOT EXISTS parties (
  id                    BIGSERIAL PRIMARY KEY,
  nec_code              TEXT,
  name                  TEXT    NOT NULL,
  name_original         TEXT,
  color                 TEXT,
  founded_date          DATE,
  dissolved_date        DATE,
  successor_party_id    BIGINT REFERENCES parties(id) ON DELETE SET NULL,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(nec_code, name_original)
);
CREATE INDEX IF NOT EXISTS idx_parties_successor ON parties(successor_party_id);

-- =====================================================================
-- 6. 인물 (동일인 매칭 마스터)
-- =====================================================================
CREATE TABLE IF NOT EXISTS persons (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT    NOT NULL,
  name_hanja        TEXT,
  birth_date        DATE,
  gender            TEXT CHECK (gender IN ('M','F','?')),
  match_confidence  REAL    NOT NULL DEFAULT 1.0 CHECK (match_confidence BETWEEN 0 AND 1),
  merged_into_id    BIGINT REFERENCES persons(id) ON DELETE SET NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(name);
CREATE INDEX IF NOT EXISTS idx_persons_name_birth ON persons(name, birth_date);

-- =====================================================================
-- 7. 출마 이력
-- =====================================================================
CREATE TABLE IF NOT EXISTS candidacies (
  id                    BIGSERIAL PRIMARY KEY,
  person_id             BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  sub_election_id       BIGINT NOT NULL REFERENCES sub_elections(id) ON DELETE CASCADE,
  constituency_id       BIGINT REFERENCES constituencies(id) ON DELETE SET NULL,
  party_id              BIGINT REFERENCES parties(id) ON DELETE SET NULL,
  nec_candidate_id      TEXT,
  candidate_number      INTEGER,
  proportional_order    INTEGER,
  name_as_registered    TEXT,
  photo_url             TEXT,
  academic_background   TEXT,
  career                TEXT,
  is_elected            SMALLINT CHECK (is_elected IN (0,1)),
  vote_count            INTEGER,
  vote_pct              REAL,
  withdrew_at           DATE,
  withdrawal_reason     TEXT,
  source_url            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sub_election_id, nec_candidate_id)
);
CREATE INDEX IF NOT EXISTS idx_candidacies_person ON candidacies(person_id);
CREATE INDEX IF NOT EXISTS idx_candidacies_party ON candidacies(party_id);
CREATE INDEX IF NOT EXISTS idx_candidacies_constituency ON candidacies(constituency_id);

-- =====================================================================
-- 8. 공약
-- =====================================================================
CREATE TABLE IF NOT EXISTS pledges (
  id                    BIGSERIAL PRIMARY KEY,
  candidacy_id          BIGINT REFERENCES candidacies(id) ON DELETE CASCADE,
  party_id              BIGINT REFERENCES parties(id) ON DELETE CASCADE,
  sub_election_id       BIGINT REFERENCES sub_elections(id) ON DELETE CASCADE,
  source_type           TEXT    NOT NULL CHECK (source_type IN ('candidate','winner','party','top5','top10')),
  source_file_type      TEXT,
  order_index           INTEGER,
  title                 TEXT,
  summary               TEXT,
  content_raw           TEXT,
  category              TEXT,
  pdf_url               TEXT,
  pdf_path_local        TEXT,
  pdf_page_count        INTEGER,
  source_checksum       TEXT,
  source_url            TEXT,
  fetched_at            TIMESTAMPTZ,
  is_submitted          SMALLINT NOT NULL DEFAULT 1 CHECK (is_submitted IN (0,1)),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ( (candidacy_id IS NOT NULL) OR (party_id IS NOT NULL) )
);
CREATE INDEX IF NOT EXISTS idx_pledges_candidacy ON pledges(candidacy_id);
CREATE INDEX IF NOT EXISTS idx_pledges_party ON pledges(party_id);
CREATE INDEX IF NOT EXISTS idx_pledges_sub_election ON pledges(sub_election_id);
CREATE INDEX IF NOT EXISTS idx_pledges_checksum ON pledges(source_checksum);

-- =====================================================================
-- 9. 개별 공약 항목
-- =====================================================================
CREATE TABLE IF NOT EXISTS pledge_items (
  id                BIGSERIAL PRIMARY KEY,
  pledge_id         BIGINT NOT NULL REFERENCES pledges(id) ON DELETE CASCADE,
  order_index       INTEGER,
  title             TEXT    NOT NULL,
  description       TEXT,
  category          TEXT,
  ai_summary        TEXT,
  ai_category       TEXT,
  ai_tags           TEXT,
  ai_generated_at   TIMESTAMPTZ,
  content_hash      TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pledge_items_pledge ON pledge_items(pledge_id);
CREATE INDEX IF NOT EXISTS idx_pledge_items_category ON pledge_items(ai_category);

-- =====================================================================
-- 10. 용어 풀이
-- =====================================================================
CREATE TABLE IF NOT EXISTS terms (
  id          BIGSERIAL PRIMARY KEY,
  term        TEXT    NOT NULL UNIQUE,
  definition  TEXT    NOT NULL,
  source      TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS term_occurrences (
  id                BIGSERIAL PRIMARY KEY,
  pledge_item_id    BIGINT NOT NULL REFERENCES pledge_items(id) ON DELETE CASCADE,
  term_id           BIGINT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  UNIQUE(pledge_item_id, term_id)
);

-- =====================================================================
-- 11. 공약 이력 비교
-- =====================================================================
CREATE TABLE IF NOT EXISTS pledge_comparisons (
  id                        BIGSERIAL PRIMARY KEY,
  person_id                 BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  earlier_pledge_item_id    BIGINT REFERENCES pledge_items(id) ON DELETE SET NULL,
  later_pledge_item_id      BIGINT REFERENCES pledge_items(id) ON DELETE SET NULL,
  diff_type                 TEXT NOT NULL CHECK (diff_type IN ('continued','changed','dropped','new')),
  ai_summary                TEXT,
  ai_generated_at           TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comparisons_person ON pledge_comparisons(person_id);

-- =====================================================================
-- 12. 투표소 (사전투표소 + 선거일투표소)
--    2026 선거 "내 투표소 찾기" UX용. 과거 선거 아카이브에도 선택적 적재.
-- =====================================================================
CREATE TABLE IF NOT EXISTS polling_places (
  id            BIGSERIAL PRIMARY KEY,
  election_id   BIGINT NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  sd_name       TEXT NOT NULL,
  wiw_name      TEXT NOT NULL,
  emd_name      TEXT,
  name          TEXT NOT NULL,               -- evPsName / psName
  place_name    TEXT,                         -- 건물명
  addr          TEXT NOT NULL,
  floor         TEXT,
  is_advance    SMALLINT NOT NULL CHECK (is_advance IN (0,1)), -- 1=사전, 0=선거일
  place_order   INTEGER,                      -- evOrder (사전투표소)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(election_id, sd_name, wiw_name, name, is_advance)
);
CREATE INDEX IF NOT EXISTS idx_polling_places_election ON polling_places(election_id);
CREATE INDEX IF NOT EXISTS idx_polling_places_region ON polling_places(sd_name, wiw_name);

-- =====================================================================
-- 13. 크롤링 작업 이력
-- =====================================================================
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id              BIGSERIAL PRIMARY KEY,
  source          TEXT    NOT NULL,
  endpoint        TEXT    NOT NULL,
  params          JSONB,
  status          TEXT    NOT NULL CHECK (status IN ('pending','running','success','error')) DEFAULT 'pending',
  items_fetched   INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_source ON crawl_jobs(source);

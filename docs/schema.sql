-- promise999 스키마 v0.1
-- 타겟: SQLite 3.35+ / PostgreSQL 14+ 호환
-- 적용: sqlite3 data/db/promise999.sqlite < docs/schema.sql

PRAGMA foreign_keys = ON;

-- =====================================================================
-- 1. 선거
-- =====================================================================
CREATE TABLE IF NOT EXISTS elections (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  sg_id           TEXT    NOT NULL UNIQUE,                -- 선관위 sgId
  name            TEXT    NOT NULL,
  election_date   DATE    NOT NULL,
  kind            TEXT    NOT NULL CHECK (kind IN ('PRESIDENT','ASSEMBLY','LOCAL','BYELECTION','EDUCATION','OTHER')),
  is_byelection   INTEGER NOT NULL DEFAULT 0 CHECK (is_byelection IN (0,1)),
  source_url      TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_elections_date ON elections(election_date);

-- =====================================================================
-- 2. 하위 선거 (지방선거의 세부 7~8종 등)
-- =====================================================================
CREATE TABLE IF NOT EXISTS sub_elections (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_election_id  INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  sub_sg_id           TEXT    NOT NULL,
  sg_typecode         INTEGER NOT NULL CHECK (sg_typecode BETWEEN 1 AND 11),
  sg_type_name        TEXT    NOT NULL,
  name                TEXT    NOT NULL,
  is_proportional     INTEGER NOT NULL DEFAULT 0 CHECK (is_proportional IN (0,1)),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_election_id, sub_sg_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_elections_typecode ON sub_elections(sg_typecode);

-- =====================================================================
-- 3. 행정구역
-- =====================================================================
CREATE TABLE IF NOT EXISTS regions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT    NOT NULL,
  level       INTEGER NOT NULL CHECK (level BETWEEN 0 AND 3),   -- 0=전국, 1=시도, 2=시군구, 3=읍면동
  parent_id   INTEGER REFERENCES regions(id) ON DELETE SET NULL,
  name        TEXT    NOT NULL,
  name_short  TEXT,
  valid_from  DATE,
  valid_to    DATE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(code, valid_from)
);

CREATE INDEX IF NOT EXISTS idx_regions_parent ON regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_regions_level ON regions(level);

-- =====================================================================
-- 4. 선거구 (선거별로 달라질 수 있음)
-- =====================================================================
CREATE TABLE IF NOT EXISTS constituencies (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  sub_election_id   INTEGER NOT NULL REFERENCES sub_elections(id) ON DELETE CASCADE,
  nec_code          TEXT,                     -- 선관위 선거구 식별자 (wiwid, sggid 등)
  name              TEXT    NOT NULL,
  region_id         INTEGER REFERENCES regions(id) ON DELETE SET NULL,
  seats             INTEGER NOT NULL DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sub_election_id, nec_code)
);

-- =====================================================================
-- 5. 정당
-- =====================================================================
CREATE TABLE IF NOT EXISTS parties (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  nec_code              TEXT,                -- jdid
  name                  TEXT    NOT NULL,    -- 현재 통칭
  name_original         TEXT,                -- 당시 정식 명칭
  color                 TEXT,
  founded_date          DATE,
  dissolved_date        DATE,
  successor_party_id    INTEGER REFERENCES parties(id) ON DELETE SET NULL,
  notes                 TEXT,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(nec_code, name_original)
);

CREATE INDEX IF NOT EXISTS idx_parties_successor ON parties(successor_party_id);

-- =====================================================================
-- 6. 인물 (동일인 매칭 마스터)
-- =====================================================================
CREATE TABLE IF NOT EXISTS persons (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT    NOT NULL,
  name_hanja        TEXT,
  birth_date        DATE,                     -- 동일인 매칭의 핵심
  gender            TEXT CHECK (gender IN ('M','F','?')),
  match_confidence  REAL    NOT NULL DEFAULT 1.0 CHECK (match_confidence BETWEEN 0 AND 1),
  merged_into_id    INTEGER REFERENCES persons(id) ON DELETE SET NULL,
  notes             TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(name);
CREATE INDEX IF NOT EXISTS idx_persons_name_birth ON persons(name, birth_date);

-- =====================================================================
-- 7. 출마 이력
-- =====================================================================
CREATE TABLE IF NOT EXISTS candidacies (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id             INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  sub_election_id       INTEGER NOT NULL REFERENCES sub_elections(id) ON DELETE CASCADE,
  constituency_id       INTEGER REFERENCES constituencies(id) ON DELETE SET NULL,
  party_id              INTEGER REFERENCES parties(id) ON DELETE SET NULL,
  nec_candidate_id      TEXT,                  -- huboId
  candidate_number      INTEGER,               -- 기호
  proportional_order    INTEGER,               -- 비례 순번
  name_as_registered    TEXT,
  photo_url             TEXT,
  academic_background   TEXT,                  -- hbjhakruk
  career                TEXT,                  -- hbjjikup 확장
  is_elected            INTEGER CHECK (is_elected IN (0,1) OR is_elected IS NULL),
  vote_count            INTEGER,
  vote_pct              REAL,
  withdrew_at           DATE,
  withdrawal_reason     TEXT,
  source_url            TEXT,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sub_election_id, nec_candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_candidacies_person ON candidacies(person_id);
CREATE INDEX IF NOT EXISTS idx_candidacies_party ON candidacies(party_id);
CREATE INDEX IF NOT EXISTS idx_candidacies_constituency ON candidacies(constituency_id);

-- =====================================================================
-- 8. 공약 (파일 단위)
-- =====================================================================
CREATE TABLE IF NOT EXISTS pledges (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  candidacy_id          INTEGER REFERENCES candidacies(id) ON DELETE CASCADE,
  party_id              INTEGER REFERENCES parties(id) ON DELETE CASCADE,
  sub_election_id       INTEGER REFERENCES sub_elections(id) ON DELETE CASCADE,
  source_type           TEXT    NOT NULL CHECK (source_type IN ('candidate','winner','party','top5','top10')),
  source_file_type      TEXT,                  -- 선거공약서/선거공보/전단형선거공보/책자형선거공보/정당정책/5대공약/10대공약
  order_index           INTEGER,
  title                 TEXT,
  summary               TEXT,
  content_raw           TEXT,
  category              TEXT,
  pdf_url               TEXT,
  pdf_path_local        TEXT,
  pdf_page_count        INTEGER,
  source_checksum       TEXT,                  -- SHA-256
  source_url            TEXT,
  fetched_at            TIMESTAMP,
  is_submitted          INTEGER NOT NULL DEFAULT 1 CHECK (is_submitted IN (0,1)),
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- candidate 또는 party 중 최소 하나는 있어야 함
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
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  pledge_id         INTEGER NOT NULL REFERENCES pledges(id) ON DELETE CASCADE,
  order_index       INTEGER,
  title             TEXT    NOT NULL,
  description       TEXT,
  category          TEXT,
  ai_summary        TEXT,
  ai_category       TEXT,
  ai_tags           TEXT,
  ai_generated_at   TIMESTAMP,
  content_hash      TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pledge_items_pledge ON pledge_items(pledge_id);
CREATE INDEX IF NOT EXISTS idx_pledge_items_category ON pledge_items(ai_category);

-- =====================================================================
-- 10. 용어 풀이
-- =====================================================================
CREATE TABLE IF NOT EXISTS terms (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  term        TEXT    NOT NULL UNIQUE,
  definition  TEXT    NOT NULL,
  source      TEXT,                          -- '위키피디아', 'Claude생성' 등
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS term_occurrences (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  pledge_item_id    INTEGER NOT NULL REFERENCES pledge_items(id) ON DELETE CASCADE,
  term_id           INTEGER NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  UNIQUE(pledge_item_id, term_id)
);

-- =====================================================================
-- 11. 공약 이력 비교
-- =====================================================================
CREATE TABLE IF NOT EXISTS pledge_comparisons (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id                 INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  earlier_pledge_item_id    INTEGER REFERENCES pledge_items(id) ON DELETE SET NULL,
  later_pledge_item_id      INTEGER REFERENCES pledge_items(id) ON DELETE SET NULL,
  diff_type                 TEXT NOT NULL CHECK (diff_type IN ('continued','changed','dropped','new')),
  ai_summary                TEXT,
  ai_generated_at           TIMESTAMP,
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comparisons_person ON pledge_comparisons(person_id);

-- =====================================================================
-- 12. 크롤링 작업 이력
-- =====================================================================
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  source          TEXT    NOT NULL,           -- 'policy.nec.go.kr' 등
  endpoint        TEXT    NOT NULL,
  params          TEXT,                        -- JSON
  status          TEXT    NOT NULL CHECK (status IN ('pending','running','success','error')) DEFAULT 'pending',
  items_fetched   INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,
  started_at      TIMESTAMP,
  finished_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_source ON crawl_jobs(source);

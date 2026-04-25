/**
 * Neon DB에서 election / candidate / pledge 를 읽어오는 서버-사이드 쿼리 함수들.
 *
 * 반환 타입은 v0 프론트가 이미 쓰는 `Election` / `CandidateDetail` 모양과 호환되도록
 * 정규화한 뒤 돌려준다.
 */
import { sql } from "@/lib/db"
import type { Election, BallotType, Candidate } from "@/lib/election-data"
import type { CandidateDetail, Pledge, CandidacyHistory, CandidateStatus } from "@/lib/candidate-data"

// 투표용지 번호 ①②③④⑤⑥⑦⑧ (sg_typecode → 투표용지 번호)
// 지선(제8회) 기준 순서
const BALLOT_NUMBER_BY_TYPECODE: Record<number, string> = {
  3: "①",   // 시·도지사
  10: "②",  // 교육감
  8: "③",   // 광역의원 비례
  4: "④",   // 광역의원 지역구
  5: "⑤",   // 기초단체장
  6: "⑥",   // 기초의원 지역구
  9: "⑦",   // 기초의원 비례
  11: "⑧",  // 교육의원 (제주만)
}

const BALLOT_LABEL_BY_TYPECODE: Record<number, string> = {
  1: "대통령",
  2: "국회의원",
  3: "시·도지사",
  4: "광역의원",
  5: "시·군·구청장",
  6: "기초의원",
  7: "비례대표 국회의원",
  8: "광역의원 비례대표",
  9: "기초의원 비례대표",
  10: "교육감",
  11: "교육의원",
}

type ElectionRow = {
  id: number
  sg_id: string
  name: string
  election_date: Date | string
  kind: string
}

type SubElectionRow = {
  id: number
  sub_sg_id: string
  sg_typecode: number
  sg_type_name: string
  name: string
  is_proportional: number
}

type CandidacyRow = {
  id: number
  nec_candidate_id: string | null
  candidate_number: number | null
  is_elected: number | null
  vote_count: number | null
  vote_pct: number | null
  withdrew_at: Date | string | null
  name: string
  party: string
  pledge_count: number
}

function mapStatus(row: CandidacyRow): CandidateStatus {
  if (row.withdrew_at) return "withdrew"
  if (row.is_elected === 1) return "elected"
  if (row.is_elected === 0) return "defeated"
  return "running"
}

/**
 * sg_id(10자리) 기반 선거 전체 로드.
 * - elections / sub_elections / candidacies / parties / persons 조인
 * - 각 ballot 카드에 채워 넣을 데이터 포함
 */
export async function getElectionBySgId(sgId: string): Promise<Election | null> {
  const elections = (await sql`
    SELECT id, sg_id, name, election_date::text, kind
    FROM elections
    WHERE sg_id = ${sgId}
    LIMIT 1
  `) as ElectionRow[]
  if (elections.length === 0) return null
  const election = elections[0]

  const subs = (await sql`
    SELECT id, sub_sg_id, sg_typecode, sg_type_name, name, is_proportional
    FROM sub_elections
    WHERE parent_election_id = ${election.id}
    ORDER BY sg_typecode ASC
  `) as SubElectionRow[]

  // 각 sub_election의 후보자 적재
  const ballots: BallotType[] = []
  for (const sub of subs) {
    const rows = (await sql`
      SELECT
        c.id,
        c.nec_candidate_id,
        c.candidate_number,
        c.is_elected,
        c.vote_count,
        c.vote_pct,
        c.withdrew_at::text AS withdrew_at,
        p.name AS name,
        COALESCE(pt.name, '무소속') AS party,
        (SELECT COUNT(*) FROM pledges pl WHERE pl.candidacy_id = c.id)::int AS pledge_count
      FROM candidacies c
      JOIN persons p ON p.id = c.person_id
      LEFT JOIN parties pt ON pt.id = c.party_id
      WHERE c.sub_election_id = ${sub.id}
      ORDER BY COALESCE(c.candidate_number, 999) ASC
    `) as CandidacyRow[]

    const candidates: Candidate[] = rows.map((r) => ({
      id: String(r.id),
      number: r.candidate_number ?? 0,
      name: r.name,
      party: r.party,
      status: mapStatus(r),
      pledgeCount: r.pledge_count ?? 0,
    }))

    ballots.push({
      id: sub.sub_sg_id,
      number: BALLOT_NUMBER_BY_TYPECODE[sub.sg_typecode] ?? "",
      label: BALLOT_LABEL_BY_TYPECODE[sub.sg_typecode] ?? sub.sg_type_name,
      candidates,
    })
  }

  // 총 후보자 수 — ballots 모두 합
  const totalCandidates = ballots.reduce((n, b) => n + b.candidates.length, 0)

  return {
    id: election.sg_id,
    title: election.name,
    date: formatKoreanDate(election.election_date),
    voterCount: "—", // 투·개표 API로 추후 보강
    candidateCount: totalCandidates > 0 ? `${totalCandidates.toLocaleString()}명` : "—",
    ballots,
  }
}

function formatKoreanDate(d: Date | string): string {
  const iso = typeof d === "string" ? d : d.toISOString().slice(0, 10)
  const [y, m, day] = iso.slice(0, 10).split("-")
  return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`
}

/**
 * candidacies.id 로 후보자 상세 + 공약 + 이력 모두 로드.
 */
export async function getCandidateById(id: string): Promise<CandidateDetail | null> {
  const numId = Number(id)
  if (!Number.isFinite(numId)) return null

  const rows = (await sql`
    SELECT
      c.id,
      c.candidate_number AS giho,
      c.is_elected,
      c.vote_count,
      c.vote_pct,
      c.withdrew_at::text AS withdrew_at,
      c.academic_background,
      c.career,
      c.source_url,
      p.id AS person_id,
      p.name,
      p.name_hanja,
      p.birth_date::text AS birth_date,
      COALESCE(pt.name, '무소속') AS party,
      se.sg_type_name,
      se.sub_sg_id,
      e.name AS election_name,
      e.sg_id AS election_sg_id
    FROM candidacies c
    JOIN persons p ON p.id = c.person_id
    LEFT JOIN parties pt ON pt.id = c.party_id
    JOIN sub_elections se ON se.id = c.sub_election_id
    JOIN elections e ON e.id = se.parent_election_id
    WHERE c.id = ${numId}
    LIMIT 1
  `) as any[]

  if (rows.length === 0) return null
  const r = rows[0]

  // 공약 항목 로드 (pledges → pledge_items)
  const pledgeRows = (await sql`
    SELECT
      pi.id,
      pi.order_index,
      pi.title,
      pi.description,
      pi.category,
      pi.ai_category,
      pl.source_file_type
    FROM pledge_items pi
    JOIN pledges pl ON pl.id = pi.pledge_id
    WHERE pl.candidacy_id = ${numId}
    ORDER BY pi.order_index ASC, pi.id ASC
  `) as any[]

  const keyPledges: Pledge[] = pledgeRows.map((p) => ({
    id: String(p.id),
    order: p.order_index ?? 0,
    title: p.title,
    summary: firstLines(p.description, 3),
    category: p.category ?? p.ai_category ?? "기타",
    fullText: p.description,
  }))

  // 분야별 그룹핑 (상세 공약)
  const detailedPledges: Record<string, Pledge[]> = {}
  for (const kp of keyPledges) {
    const key = kp.category || "기타"
    if (!detailedPledges[key]) detailedPledges[key] = []
    detailedPledges[key].push(kp)
  }

  // 동일 인물의 이력 조회
  const historyRows = (await sql`
    SELECT
      c2.id,
      c2.is_elected,
      c2.withdrew_at::text AS withdrew_at,
      e2.name AS election_name,
      e2.election_date::text AS election_date,
      se2.sg_type_name,
      COALESCE(pt2.name, '무소속') AS party
    FROM candidacies c2
    JOIN sub_elections se2 ON se2.id = c2.sub_election_id
    JOIN elections e2 ON e2.id = se2.parent_election_id
    LEFT JOIN parties pt2 ON pt2.id = c2.party_id
    WHERE c2.person_id = ${r.person_id}
    ORDER BY e2.election_date DESC
  `) as any[]

  const history: CandidacyHistory[] = historyRows.map((h) => ({
    id: String(h.id),
    year: new Date(h.election_date).getFullYear(),
    electionName: h.election_name,
    party: h.party,
    district: h.sg_type_name,
    result: h.withdrew_at
      ? "withdrew"
      : h.is_elected === 1
        ? "elected"
        : "defeated",
  }))

  return {
    id: String(r.id),
    name: r.name,
    electionName: r.election_name,
    position: `${r.sg_type_name}`,
    number: r.giho ?? 0,
    party: r.party,
    status: r.withdrew_at
      ? "withdrew"
      : r.is_elected === 1
        ? "elected"
        : r.is_elected === 0
          ? "defeated"
          : "running",
    withdrawDate: r.withdrew_at ?? undefined,
    birthDate: formatKoreanDate(r.birth_date ?? ""),
    education: r.academic_background ?? "—",
    occupation: r.career ?? "—",
    necUrl: r.source_url ?? "https://policy.nec.go.kr",
    keyPledges,
    detailedPledges,
    history,
    pledgeChanges: {}, // Phase 2: AI 기반 변화 비교
  }
}

/**
 * 최신 적재된 공약 목록 — 랜딩 "최근 추가된 공약" 섹션용.
 */
export async function getRecentPledgeItems(limit = 8): Promise<
  {
    id: string
    electionName: string
    candidateName: string
    party: string
    firstLine: string
    addedAt: string
  }[]
> {
  const rows = (await sql`
    SELECT
      pi.id,
      pi.title,
      pi.description,
      pi.created_at::text AS created_at,
      p.name AS candidate_name,
      COALESCE(pt.name, '무소속') AS party,
      e.name AS election_name
    FROM pledge_items pi
    JOIN pledges pl ON pl.id = pi.pledge_id
    JOIN candidacies c ON c.id = pl.candidacy_id
    JOIN persons p ON p.id = c.person_id
    LEFT JOIN parties pt ON pt.id = c.party_id
    JOIN sub_elections se ON se.id = c.sub_election_id
    JOIN elections e ON e.id = se.parent_election_id
    ORDER BY pi.created_at DESC
    LIMIT ${limit}
  `) as any[]

  return rows.map((r) => ({
    id: String(r.id),
    electionName: r.election_name,
    candidateName: r.candidate_name,
    party: r.party,
    firstLine: firstLines(r.title ?? r.description ?? "", 1),
    addedAt: r.created_at,
  }))
}

function firstLines(text: string | null | undefined, n: number): string {
  if (!text) return ""
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.slice(0, n).join(" ")
}

/**
 * 전체 선거 목록 (최신순).
 */
export async function listElections(): Promise<
  { sg_id: string; name: string; election_date: string; kind: string; sub_count: number; candidate_count: number }[]
> {
  const rows = (await sql`
    SELECT
      e.sg_id,
      e.name,
      e.election_date::text AS election_date,
      e.kind,
      (SELECT COUNT(*) FROM sub_elections se WHERE se.parent_election_id = e.id)::int AS sub_count,
      (SELECT COUNT(*) FROM candidacies c
         JOIN sub_elections se2 ON se2.id = c.sub_election_id
         WHERE se2.parent_election_id = e.id)::int AS candidate_count
    FROM elections e
    ORDER BY e.election_date DESC
  `) as any[]
  return rows as any
}

/**
 * 후보자 목록 (이름/정당 검색 가능). 기본: 최근 추가된 50명.
 */
export async function listCandidacies(opts: {
  q?: string
  limit?: number
} = {}): Promise<
  {
    id: number
    name: string
    birth_date: string | null
    party: string
    election_name: string
    election_sg_id: string
    sub_type_name: string
    is_elected: number | null
    vote_pct: number | null
    pledge_count: number
  }[]
> {
  const q = (opts.q ?? "").trim()
  const limit = Math.min(opts.limit ?? 50, 200)
  const like = `%${q}%`

  const rows = q
    ? ((await sql`
        SELECT
          c.id,
          p.name,
          p.birth_date::text AS birth_date,
          COALESCE(pt.name, '무소속') AS party,
          e.name AS election_name,
          e.sg_id AS election_sg_id,
          se.sg_type_name AS sub_type_name,
          c.is_elected,
          c.vote_pct,
          (SELECT COUNT(*) FROM pledges pl WHERE pl.candidacy_id = c.id)::int AS pledge_count
        FROM candidacies c
        JOIN persons p ON p.id = c.person_id
        LEFT JOIN parties pt ON pt.id = c.party_id
        JOIN sub_elections se ON se.id = c.sub_election_id
        JOIN elections e ON e.id = se.parent_election_id
        WHERE p.name ILIKE ${like} OR pt.name ILIKE ${like}
        ORDER BY c.id DESC
        LIMIT ${limit}
      `) as any[])
    : ((await sql`
        SELECT
          c.id,
          p.name,
          p.birth_date::text AS birth_date,
          COALESCE(pt.name, '무소속') AS party,
          e.name AS election_name,
          e.sg_id AS election_sg_id,
          se.sg_type_name AS sub_type_name,
          c.is_elected,
          c.vote_pct,
          (SELECT COUNT(*) FROM pledges pl WHERE pl.candidacy_id = c.id)::int AS pledge_count
        FROM candidacies c
        JOIN persons p ON p.id = c.person_id
        LEFT JOIN parties pt ON pt.id = c.party_id
        JOIN sub_elections se ON se.id = c.sub_election_id
        JOIN elections e ON e.id = se.parent_election_id
        ORDER BY c.id DESC
        LIMIT ${limit}
      `) as any[])

  return rows as any
}

/**
 * TrustBar 통계용 카운트.
 */
export async function getArchiveCounts(): Promise<{
  elections: number
  candidacies: number
  pledges: number
  pledge_items: number
}> {
  const rows = (await sql`
    SELECT
      (SELECT COUNT(*) FROM elections)::int AS elections,
      (SELECT COUNT(*) FROM candidacies)::int AS candidacies,
      (SELECT COUNT(*) FROM pledges)::int AS pledges,
      (SELECT COUNT(*) FROM pledge_items)::int AS pledge_items
  `) as any[]
  return rows[0]
}

/**
 * 가장 가까운 미래 선거. 메인페이지 D-Day 배너용.
 * 오늘 이후(또는 당일)의 가장 가까운 election 1건. 없으면 null.
 */
export async function getNextElection(): Promise<{
  sg_id: string
  name: string
  election_date: string
  kind: string
} | null> {
  const rows = (await sql`
    SELECT sg_id, name, election_date::text AS election_date, kind
      FROM elections
     WHERE election_date >= CURRENT_DATE
     ORDER BY election_date ASC
     LIMIT 1
  `) as { sg_id: string; name: string; election_date: string; kind: string }[]
  return rows[0] ?? null
}

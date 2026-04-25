import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ipFromHeaders, makeVoterHash } from "@/lib/likes"

export const runtime = "nodejs"

const KINDS = [
  "candidacy", "pledge", "pledge_item", "election", "sub_election", "general",
] as const
const CATEGORIES = [
  "factual", "typo", "translation", "outdated", "source", "feature", "other",
] as const

/** POST /api/corrections  body: { target_kind, target_id?, category, body, source_url?, contact_email? } */
export async function POST(req: Request) {
  let payload: any
  try { payload = await req.json() } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const { target_kind, target_id, category, body, source_url, contact_email } = payload ?? {}

  if (!KINDS.includes(target_kind)) {
    return NextResponse.json({ error: "invalid target_kind" }, { status: 400 })
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 })
  }
  const tid = target_kind === "general" ? null
            : (Number.isInteger(target_id) && target_id > 0 ? target_id : null)
  if (target_kind !== "general" && tid === null) {
    return NextResponse.json({ error: "target_id required" }, { status: 400 })
  }
  if (typeof body !== "string" || body.trim().length < 10 || body.length > 4000) {
    return NextResponse.json({ error: "body length 10-4000" }, { status: 400 })
  }
  if (source_url && (typeof source_url !== "string" || source_url.length > 500
      || !/^https?:\/\//i.test(source_url))) {
    return NextResponse.json({ error: "source_url must be http(s):// and ≤500 chars" }, { status: 400 })
  }
  if (contact_email && (typeof contact_email !== "string"
      || contact_email.length > 200
      || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact_email))) {
    return NextResponse.json({ error: "invalid contact_email" }, { status: 400 })
  }

  const ip = ipFromHeaders(req.headers)
  const reporter = makeVoterHash(ip)

  // 어뷰즈 방지: 동일 IP가 분당 3건 초과 시 차단
  const rate = (await sql`
    SELECT COUNT(*)::int AS n FROM corrections
     WHERE reporter_hash = ${reporter}
       AND created_at > NOW() - INTERVAL '60 seconds'
  `) as { n: number }[]
  if ((rate[0]?.n ?? 0) >= 3) {
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요 (분당 3건 제한)." }, { status: 429 })
  }

  const inserted = (await sql`
    INSERT INTO corrections(
      target_kind, target_id, category, body,
      source_url, contact_email, reporter_hash
    ) VALUES (
      ${target_kind}, ${tid}, ${category}, ${body.trim()},
      ${source_url || null}, ${contact_email || null}, ${reporter}
    ) RETURNING id, created_at::text
  `) as { id: number; created_at: string }[]

  return NextResponse.json({ ok: true, id: inserted[0]?.id }, { status: 201 })
}

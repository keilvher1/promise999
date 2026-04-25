import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ipFromHeaders, makeVoterHash } from "@/lib/likes"

export const runtime = "nodejs"

/**
 * GET  /api/pledges/like?pledge_id=…   또는 ?pledge_item_id=…
 *   → { liked: boolean, likes_count: number }
 *
 * POST /api/pledges/like  body: { pledge_id?|pledge_item_id? }
 *   같은 IP가 다시 호출하면 토글 (취소). UNIQUE 제약으로 1IP 1표 보장.
 *   → { liked: boolean, likes_count: number }
 */

function pickTarget(searchParams: URLSearchParams) {
  const pid = searchParams.get("pledge_id")
  const iid = searchParams.get("pledge_item_id")
  return parseTarget(pid, iid)
}

function parseTarget(pid: string | number | null | undefined, iid: string | number | null | undefined) {
  const pidN = pid !== null && pid !== undefined && pid !== "" ? Number(pid) : null
  const iidN = iid !== null && iid !== undefined && iid !== "" ? Number(iid) : null
  const onPledge = pidN !== null && Number.isInteger(pidN) && pidN > 0
  const onItem = iidN !== null && Number.isInteger(iidN) && iidN > 0
  if (onPledge === onItem) return { error: "exactly one of pledge_id|pledge_item_id required" as const }
  return { onPledge, onItem, pid: pidN, iid: iidN }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const t = pickTarget(url.searchParams)
  if ("error" in t) return NextResponse.json({ error: t.error }, { status: 400 })

  const ip = ipFromHeaders(req.headers)
  const voter = makeVoterHash(ip)

  if (t.onPledge) {
    const liked = (await sql`
      SELECT 1 FROM pledge_likes WHERE voter_hash = ${voter} AND pledge_id = ${t.pid}
    `) as any[]
    const cnt = (await sql`SELECT likes_count FROM pledges WHERE id = ${t.pid}`) as any[]
    return NextResponse.json({ liked: liked.length > 0, likes_count: cnt[0]?.likes_count ?? 0 })
  } else {
    const liked = (await sql`
      SELECT 1 FROM pledge_likes WHERE voter_hash = ${voter} AND pledge_item_id = ${t.iid}
    `) as any[]
    const cnt = (await sql`SELECT likes_count FROM pledge_items WHERE id = ${t.iid}`) as any[]
    return NextResponse.json({ liked: liked.length > 0, likes_count: cnt[0]?.likes_count ?? 0 })
  }
}

export async function POST(req: Request) {
  let payload: any
  try { payload = await req.json() } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  const t = parseTarget(payload?.pledge_id, payload?.pledge_item_id)
  if ("error" in t) return NextResponse.json({ error: t.error }, { status: 400 })

  const ip = ipFromHeaders(req.headers)
  const voter = makeVoterHash(ip)

  if (t.onPledge) {
    const exists = (await sql`
      SELECT id FROM pledge_likes WHERE voter_hash = ${voter} AND pledge_id = ${t.pid}
    `) as { id: number }[]
    if (exists.length) {
      // 토글: 좋아요 취소
      await sql`DELETE FROM pledge_likes WHERE id = ${exists[0].id}`
      const r = (await sql`
        UPDATE pledges SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = ${t.pid} RETURNING likes_count
      `) as any[]
      return NextResponse.json({ liked: false, likes_count: r[0]?.likes_count ?? 0 })
    }
    try {
      await sql`INSERT INTO pledge_likes(pledge_id, voter_hash) VALUES (${t.pid}, ${voter})`
    } catch (e: any) {
      if (String(e?.message ?? "").includes("pledge_likes_voter_hash")) {
        return NextResponse.json({ error: "이미 좋아요를 누르셨습니다." }, { status: 409 })
      }
      throw e
    }
    const r = (await sql`
      UPDATE pledges SET likes_count = likes_count + 1
      WHERE id = ${t.pid} RETURNING likes_count
    `) as any[]
    return NextResponse.json({ liked: true, likes_count: r[0]?.likes_count ?? 0 })
  } else {
    const exists = (await sql`
      SELECT id FROM pledge_likes WHERE voter_hash = ${voter} AND pledge_item_id = ${t.iid}
    `) as { id: number }[]
    if (exists.length) {
      await sql`DELETE FROM pledge_likes WHERE id = ${exists[0].id}`
      const r = (await sql`
        UPDATE pledge_items SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = ${t.iid} RETURNING likes_count
      `) as any[]
      return NextResponse.json({ liked: false, likes_count: r[0]?.likes_count ?? 0 })
    }
    try {
      await sql`INSERT INTO pledge_likes(pledge_item_id, voter_hash) VALUES (${t.iid}, ${voter})`
    } catch (e: any) {
      if (String(e?.message ?? "").includes("pledge_likes_voter_hash")) {
        return NextResponse.json({ error: "이미 좋아요를 누르셨습니다." }, { status: 409 })
      }
      throw e
    }
    const r = (await sql`
      UPDATE pledge_items SET likes_count = likes_count + 1
      WHERE id = ${t.iid} RETURNING likes_count
    `) as any[]
    return NextResponse.json({ liked: true, likes_count: r[0]?.likes_count ?? 0 })
  }
}

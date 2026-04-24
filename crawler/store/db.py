"""Neon(PostgreSQL) 접속 헬퍼.

로컬 파일럿이든 운영이든 동일한 connection pool 사용.
민감정보는 .env의 DATABASE_URL로만 전달.
"""
from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Any, Iterable

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv

# .env 자동 로드 (프로젝트 루트의 .env)
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(_ROOT, ".env"))


def get_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL 미설정 — 프로젝트 루트 .env에 Neon connection string을 넣으세요.")
    return url


@contextmanager
def connect(autocommit: bool = False):
    """Context manager that yields a psycopg connection with dict rows."""
    with psycopg.connect(get_url(), autocommit=autocommit, row_factory=dict_row) as con:
        yield con


def upsert_returning_id(
    con: psycopg.Connection,
    table: str,
    values: dict[str, Any],
    conflict_cols: Iterable[str],
    update_cols: Iterable[str] | None = None,
) -> int:
    """INSERT ... ON CONFLICT DO UPDATE RETURNING id 헬퍼.

    conflict_cols가 발생하면 update_cols만 갱신. update_cols=None이면 DO NOTHING.
    id가 없더라도 SELECT로 되찾아 반환.
    """
    cols = list(values.keys())
    placeholders = ", ".join([f"%({c})s" for c in cols])
    conflict_str = ", ".join(conflict_cols)

    if update_cols:
        set_clause = ", ".join([f"{c} = EXCLUDED.{c}" for c in update_cols])
        sql = (
            f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders}) "
            f"ON CONFLICT ({conflict_str}) DO UPDATE SET {set_clause} "
            f"RETURNING id"
        )
    else:
        sql = (
            f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders}) "
            f"ON CONFLICT ({conflict_str}) DO NOTHING "
            f"RETURNING id"
        )

    with con.cursor() as cur:
        cur.execute(sql, values)
        row = cur.fetchone()
        if row is not None:
            return row["id"]

        # DO NOTHING으로 id가 반환되지 않은 경우: SELECT로 되찾기
        where = " AND ".join([f"{c} = %({c})s" for c in conflict_cols])
        cur.execute(f"SELECT id FROM {table} WHERE {where}", values)
        row = cur.fetchone()
        if row is None:
            raise RuntimeError(f"upsert 후 id 조회 실패: {table} conflict={dict((c, values[c]) for c in conflict_cols)}")
        return row["id"]


def count_all(con: psycopg.Connection) -> dict[str, int]:
    """테이블별 row 개수 스냅샷 — 파일럿 검증용."""
    tables = [
        "elections", "sub_elections", "regions", "constituencies",
        "parties", "persons", "candidacies", "pledges", "pledge_items",
        "terms", "term_occurrences", "pledge_comparisons", "crawl_jobs",
    ]
    out = {}
    with con.cursor() as cur:
        for t in tables:
            cur.execute(f"SELECT COUNT(*) AS n FROM {t}")
            out[t] = cur.fetchone()["n"]
    return out

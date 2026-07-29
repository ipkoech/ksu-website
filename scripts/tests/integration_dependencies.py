#!/usr/bin/env python3
"""Minimal real PostgreSQL/Redis connectivity gate for CI service containers."""

import asyncio
import os

import asyncpg
from redis.asyncio import Redis


async def main() -> None:
    connection = await asyncpg.connect(os.environ["DATABASE_URL"])
    try:
        assert await connection.fetchval("SELECT 1") == 1
        await connection.execute("CREATE TABLE IF NOT EXISTS ci_hardening_probe (id integer primary key)")
        await connection.execute("INSERT INTO ci_hardening_probe (id) VALUES (1) ON CONFLICT DO NOTHING")
        assert await connection.fetchval("SELECT count(*) FROM ci_hardening_probe") == 1
    finally:
        await connection.close()

    redis = Redis.from_url(os.environ["REDIS_URL"])
    try:
        await redis.set("ci:hardening:probe", "ok", ex=30)
        assert await redis.get("ci:hardening:probe") == b"ok"
        assert await redis.ttl("ci:hardening:probe") > 0
    finally:
        await redis.aclose()


if __name__ == "__main__":
    asyncio.run(main())

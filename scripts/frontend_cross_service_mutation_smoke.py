"""Verify authenticated mutations through the local API gateway.

This is an explicitly opt-in, loopback-only smoke. It creates uniquely named
Research, Library, and HERI records, verifies the update is readable through
the owning service, and removes every record in a ``finally`` block. It never
accepts a non-loopback gateway, and it never prints cookies or response bodies.

Example::

    $env:KSU_CROSS_SERVICE_SMOKE_EMAIL = "super.admin@ksu.dev.com"
    $env:KSU_CROSS_SERVICE_SMOKE_PASSWORD = "..."
    python scripts/frontend_cross_service_mutation_smoke.py --allow-local-mutations
"""

from __future__ import annotations

import argparse
import ipaddress
import os
from urllib.parse import urlparse
import uuid

import requests


DEFAULT_GATEWAY = "http://127.0.0.1:8080"


def _loopback_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("gateway URL must include an http(s) scheme and hostname")
    try:
        is_loopback = ipaddress.ip_address(parsed.hostname).is_loopback
    except ValueError:
        is_loopback = parsed.hostname.lower() == "localhost"
    if not is_loopback:
        raise ValueError("mutation smoke refuses non-loopback gateways")
    return value.rstrip("/")


def _request(session: requests.Session, method: str, url: str, *, expected: int, label: str, **kwargs):
    response = session.request(method, url, timeout=25, **kwargs)
    if response.status_code != expected:
        raise RuntimeError(f"{label}: received HTTP {response.status_code}, expected {expected}")
    if not response.content:
        return None
    try:
        return response.json()
    except ValueError as exc:
        raise RuntimeError(f"{label}: expected a JSON response") from exc


def _id(payload: dict, label: str) -> str:
    value = payload.get("data", {}).get("id") if isinstance(payload.get("data"), dict) else None
    if not value:
        raise RuntimeError(f"{label}: response did not contain data.id")
    return str(value)


def run(gateway: str, email: str, password: str) -> None:
    session = requests.Session()
    _request(
        session,
        "POST",
        f"{gateway}/api/v1/auth/login",
        expected=200,
        label="login",
        json={"email": email, "password": password},
    )

    suffix = uuid.uuid4().hex[:12]
    research_id: str | None = None
    library_id: str | None = None
    heri_id: str | None = None
    try:
        research_key = f"frontend-cross-service-create-{suffix}"
        research_payload = {
            "title": f"Frontend mutation smoke {suffix}",
            "slug": f"frontend-mutation-smoke-{suffix}",
            # The local super-admin fixture has the farm workspace. This is
            # also a valid discriminator for a caller with global oversight.
            "project_type": "action",
            "summary": "Disposable local mutation smoke record.",
            "is_public": False,
        }
        created = _request(
            session,
            "POST",
            f"{gateway}/api/v1/projects",
            expected=201,
            label="Research create",
            headers={"Idempotency-Key": research_key},
            json=research_payload,
        )
        research_id = _id(created or {}, "Research create")
        replayed = _request(
            session,
            "POST",
            f"{gateway}/api/v1/projects",
            expected=201,
            label="Research idempotency replay",
            headers={"Idempotency-Key": research_key},
            json=research_payload,
        )
        if _id(replayed or {}, "Research idempotency replay") != research_id:
            raise RuntimeError("Research idempotency replay returned a different record")
        updated_title = f"Frontend mutation smoke updated {suffix}"
        updated = _request(
            session,
            "PATCH",
            f"{gateway}/api/v1/projects/id/{research_id}",
            expected=200,
            label="Research update",
            headers={"Idempotency-Key": f"frontend-cross-service-update-{suffix}"},
            json={"title": updated_title, "summary": "Updated disposable local smoke record."},
        )
        if (updated or {}).get("data", {}).get("title") != updated_title:
            raise RuntimeError("Research update response did not contain the new title")
        detail = _request(
            session,
            "GET",
            f"{gateway}/api/v1/projects/{research_payload['slug']}/detail",
            expected=200,
            label="Research detail read",
        )
        record = (detail or {}).get("data", {}).get("record", {})
        if record.get("title") != updated_title:
            raise RuntimeError("Research detail read did not contain the persisted title")

        library_payload = {
            "name": f"Frontend mutation branch {suffix}",
            "slug": f"frontend-mutation-branch-{suffix}",
            "library_type": "branch",
            "description": "Disposable local mutation smoke record.",
            "is_active": True,
            "is_public": False,
        }
        created = _request(
            session,
            "POST",
            f"{gateway}/api/v1/library/branches/",
            expected=200,
            label="Library create",
            json=library_payload,
        )
        library_id = _id(created or {}, "Library create")
        updated_name = f"Frontend mutation branch updated {suffix}"
        _request(
            session,
            "PATCH",
            f"{gateway}/api/v1/library/branches/{library_id}",
            expected=200,
            label="Library update",
            json={"name": updated_name},
        )
        library = _request(
            session,
            "GET",
            f"{gateway}/api/v1/library/branches/{library_id}",
            expected=200,
            label="Library read",
        )
        if (library or {}).get("data", {}).get("name") != updated_name:
            raise RuntimeError("Library read did not contain the persisted name")

        heri_payload = {
            "slug": f"frontend-mutation-news-{suffix}",
            "title": f"Frontend mutation news {suffix}",
            "excerpt": "Disposable local mutation smoke record.",
            "body": "Disposable local mutation smoke record.",
        }
        created = _request(
            session,
            "POST",
            f"{gateway}/api/v1/heri/admin/news",
            expected=201,
            label="HERI create",
            json=heri_payload,
        )
        heri_id = str((created or {}).get("id") or "")
        if not heri_id:
            raise RuntimeError("HERI create: response did not contain id")
        heri_updated_title = f"Frontend mutation news updated {suffix}"
        _request(
            session,
            "PATCH",
            f"{gateway}/api/v1/heri/admin/news/{heri_id}",
            expected=200,
            label="HERI update",
            json={"title": heri_updated_title},
        )
        heri = _request(
            session,
            "GET",
            f"{gateway}/api/v1/heri/admin/news/{heri_id}",
            expected=200,
            label="HERI read",
        )
        if (heri or {}).get("title") != heri_updated_title:
            raise RuntimeError("HERI read did not contain the persisted title")

        print("cross-service mutation smoke: passed (Research, Library, HERI)")
    finally:
        # Cleanup uses fresh command keys so a failed update cannot be replayed
        # as a successful delete. Cleanup failures are surfaced when no earlier
        # assertion is already failing.
        if research_id:
            _request(
                session,
                "DELETE",
                f"{gateway}/api/v1/projects/id/{research_id}",
                expected=200,
                label="Research cleanup",
                headers={"Idempotency-Key": f"frontend-cross-service-delete-{suffix}"},
            )
        if library_id:
            _request(
                session,
                "DELETE",
                f"{gateway}/api/v1/library/branches/{library_id}",
                expected=204,
                label="Library cleanup",
            )
        if heri_id:
            _request(
                session,
                "DELETE",
                f"{gateway}/api/v1/heri/admin/news/{heri_id}",
                expected=204,
                label="HERI cleanup",
            )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--gateway-url", default=os.getenv("KSU_CROSS_SERVICE_SMOKE_GATEWAY", DEFAULT_GATEWAY))
    parser.add_argument("--email", default=os.getenv("KSU_CROSS_SERVICE_SMOKE_EMAIL"))
    parser.add_argument("--password", default=os.getenv("KSU_CROSS_SERVICE_SMOKE_PASSWORD"))
    parser.add_argument("--allow-local-mutations", action="store_true", help="confirm disposable loopback writes")
    args = parser.parse_args()
    if not args.allow_local_mutations:
        parser.error("pass --allow-local-mutations to confirm disposable local writes")
    if not args.email or not args.password:
        parser.error("KSU_CROSS_SERVICE_SMOKE_EMAIL and KSU_CROSS_SERVICE_SMOKE_PASSWORD are required")
    try:
        run(_loopback_url(args.gateway_url), args.email, args.password)
    except (requests.RequestException, RuntimeError, ValueError) as exc:
        print(f"cross-service mutation smoke: failed ({exc})")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

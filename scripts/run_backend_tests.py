#!/usr/bin/env python3
"""Run backend suites in isolated processes because services share ``app``.

``--parallel`` overlaps independent service subprocesses, while ``--max-workers``
keeps shared PostgreSQL/Redis test resources bounded.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import os
import subprocess
import sys
from dataclasses import dataclass

from ci_environment import REPO, SCHEMA_OF, service_environment


@dataclass(frozen=True)
class ServiceResult:
    service: str
    returncode: int
    stdout: str
    stderr: str


def _run_service(service: str) -> ServiceResult:
    directory = REPO / "services" / service
    if not (directory / "tests").is_dir():
        return ServiceResult(service, 0, f"{service}: no test suite yet\n", "")
    environment = service_environment(service) if service in SCHEMA_OF else dict(os.environ)
    environment["PYTHONPATH"] = str(directory)
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "tests", "-q"],
        cwd=directory,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    return ServiceResult(service, result.returncode, result.stdout, result.stderr)


def _print_result(result: ServiceResult) -> None:
    print(f"Testing {result.service}", flush=True)
    if result.stdout:
        print(result.stdout, end="", flush=True)
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr, flush=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--parallel",
        action="store_true",
        help="run service subprocesses concurrently with the bounded worker pool",
    )
    parser.add_argument(
        "--max-workers",
        type=int,
        default=2,
        help="maximum concurrent service subprocesses when --parallel is set (default: 2)",
    )
    parser.add_argument("services", nargs="*", choices=["common", "contracts", *SCHEMA_OF])
    args = parser.parse_args()
    services = args.services or ["common", "contracts", *SCHEMA_OF]
    if args.max_workers < 1:
        parser.error("--max-workers must be positive")

    if args.parallel and len(services) > 1:
        worker_count = min(args.max_workers, len(services))
        with concurrent.futures.ThreadPoolExecutor(max_workers=worker_count) as executor:
            results = list(executor.map(_run_service, services))
    else:
        results = [_run_service(service) for service in services]

    for result in results:
        _print_result(result)
    return int(any(result.returncode != 0 for result in results))


if __name__ == "__main__":
    raise SystemExit(main())

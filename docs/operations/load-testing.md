# Load testing

The repository currently has no executed load-test baseline. Before production traffic changes, add a k6/Locust scenario for public reads, authentication, search/filter, admin, media metadata, rate-limited routes, and background-job submission. Record RPS, p50/p95/p99, errors, DB connections, Redis usage, CPU/memory, and worker queue depth.

Initial budgets are assumptions pending staging measurement: public reads p95 ≤500 ms, authentication p95 ≤750 ms, error rate <1%, no pool exhaustion, and no unbounded memory growth. A baseline must be captured from a representative staging deployment before claiming compliance.

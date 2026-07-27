# Production networking

The production path is `edge`/`research-edge` (host-bound public entry point) → gateway → internal service names on the `ksu` bridge network. Main, Research, Library, PostgreSQL, Redis, Celery, and production frontend runtimes do not publish host ports. `expose` is used only as internal documentation.

Developer host ports are isolated in `docker-compose.dev.yml` and must not be included in VM or production commands. Verify with:

```bash
POSTGRES_PASSWORD=ci-only-not-a-production-secret docker compose -f docker-compose.yml -f docker-compose.vm.yml config
python scripts/audit_compose_ports.py docker-compose.yml docker-compose.vm.yml
```

The host firewall and Nginx/TLS configuration remain deployment responsibilities. Run an authenticated staging `nmap` scan after deployment and confirm only the intended edge/TLS ports are reachable.

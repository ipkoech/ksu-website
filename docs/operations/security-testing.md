# Security testing

CI covers secret scanning, migration source checks, Compose port topology, Dockerfile root inspection, and image vulnerability scanning. Staging release gates must add dependency audits, Bandit, npm audit, OWASP ZAP baseline, authenticated API authorization tests, TLS/header/cookie/CORS checks, upload/SSRF/XSS/injection tests, and host port scans.

High or critical findings block release until fixed or explicitly risk-accepted by the owner. Results must include tool version, target commit, scope, finding severity, remediation, and retest evidence.

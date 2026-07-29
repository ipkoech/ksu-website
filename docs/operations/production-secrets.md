# Production secrets

Start from `.env.production.example`, but generate every secret with a password manager or cryptographically secure generator. Store secrets in the VM secret store or CI environment; never commit populated `.env` files, print values, or pass them as image build arguments.

`scripts/validate_production_env.py` fails outside development/test when required values are absent, placeholders, short signing keys, wildcard CORS, debug mode, or insecure production URL schemes are found. Deployment validates each service file before Compose starts. Errors identify only variable names and never values.

Required categories are database and Redis URLs/credentials, JWT and internal API keys, CORS origins, SMTP credentials, error tracking DSN, backup destination/encryption settings, and any enabled integration credentials. Use `rediss://` and TLS database/provider endpoints where supported.

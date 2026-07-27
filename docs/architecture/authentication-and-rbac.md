# Authentication and RBAC contract

`services/common/ksu_common/auth.py`, `security.py`, `rbac.py`, `roles.py`, and `audit.py` are the shared authentication/authorization implementation. Services may add domain-specific permission names, but token decoding, claim normalization, role-derived scopes, wildcard behavior, FastAPI dependencies, and audit context must remain in `ksu_common`.

The contract is: expired or invalid JWTs are rejected; inactive users are rejected by the service user resolver; explicit `permissions`/`scopes` and role scopes are evaluated by the same wildcard matcher; scoped record checks are applied by each service policy; and audit context is derived from the authenticated token rather than request-provided identity. Existing Main, Research, and Library scoped-auth tests are the compatibility suite and must remain green.

When changing this contract, add tests in `services/common/tests` and service compatibility tests. Do not introduce a service-local JWT decoder or bypass scope checks for internal routes.

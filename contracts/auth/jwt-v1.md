# KSU authentication token contract v1

Status: active

The Main API is the temporary identity owner until the dedicated authentication
service is extracted. It is the only process permitted to receive the private
signing key. All other APIs and every worker receive public verification material
only.

## Wire format

- Compact JWT signed with `RS256`.
- Protected header: `alg=RS256`, `typ=JWT`, and a non-empty `kid`.
- Required claims: `iss`, `aud`, `sub`, `jti`, `type`, `iat`, `nbf`, and `exp`.
- `iss` is the configured KSU identity issuer.
- `aud` is the configured KSU platform audience.
- `type` is one of `access`, `refresh`, or `socket`.
- Access tokens may carry `roles`, `permissions`, `scopes`, and `scope_grants`.

Verifiers must pin the algorithm, issuer, audience, key id, and expected token
type. A refresh or socket token is never valid as a bearer access token.

## Discovery

`GET /api/v1/auth/jwks` returns the active public RSA key as a JWKS document.
Private RSA parameters (`d`, `p`, `q`, `dp`, `dq`, and `qi`) must never appear.

The endpoint is public because the key can verify signatures but cannot create
them. Consumers should cache the response by `kid`; loss of this endpoint must
not cause an already configured internal service to stop verifying tokens.

## Process capabilities

| Process | Private key | Public key | Capability |
| --- | --- | --- | --- |
| Main API | yes | yes | issue and verify |
| Main workers and beat | no | yes | verify only |
| Research API/workers | no | yes | verify only |
| Library API/workers | no | yes | verify only |
| HERI Africa API/workers | no | yes | verify only |

`JWT_SIGNING_ENABLED` is an additional fail-closed control. Signing helpers raise
when it is false or when the private key is absent.

## Rotation

Version 1 accepts one active `kid` per internal verifier. Planned rotation is a
coordinated deployment: generate a new pair, update every verifier's public key
and `kid`, update the signer last, and invalidate existing sessions. Emergency
rotation follows the same sequence and begins by disabling sign-in.

Overlapping old/new keys is intentionally recorded as follow-up work before
zero-logout rotation can be claimed. It requires a verifier key ring and JWKS
publication of both public keys; copying the private key to consumers is never an
acceptable shortcut.

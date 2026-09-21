# Frontend architecture standard

This is the target standard for the ongoing migration. Adoption and verification are tracked by the route inventory and automated checks; this document does not assert that every existing route already complies.

See [`ROUTE-DATA-INVENTORY.md`](./ROUTE-DATA-INVENTORY.md) for representative route ownership, endpoint audience, cache policy, client display boundaries and verification evidence.

## Ownership and data flow

For routes with a frontend server runtime:

1. The server route composes the page and its loading/error boundaries.
2. A server-only domain loader reads validated URL parameters and calls existing backend v1 endpoints through the shared transport.
3. The loader validates/normalizes the response and produces minimal, serializable display data.
4. Focused client feature components receive that data as props, display it immediately, and own browser interactions.

Keep noninteractive layout and composition on the server. Do not add `use client` to a whole route merely because a child requires browser state. Generic shared UI receives props and callbacks; it does not choose endpoints, permissions or domain query keys.

The API transport owns base URL resolution, request deadlines/cancellation, compatible response decoding, normalized errors and bounded retry policies. Public server GETs carry the shared `ksu-public-content` cache tag; owning apps expose an authenticated revalidation route so Admin mutations can invalidate that tag after backend confirmation. Domain loaders own endpoint selection, projections, query parameters and domain validation. Shared auth owns identity/session coordination. Applications own workflows and cache invalidation for their domain data.

## Server and browser separation

- Server loaders must not be importable into client bundles. Server transport entry points must not require browser globals or browser session refresh.
- Server API URLs come from server configuration and must resolve from the frontend process/container. Browser URLs must resolve from the user's browser. Keep internal URLs out of client props and bundles.
- Any authenticated server request receives its required credentials/service context from that incoming request, never from mutable module-level state. Forward only approved headers/cookies to trusted backend destinations.
- Do not expose tokens, raw responses, transport objects, functions or unnecessary private fields in serialized props. Use safe display data and sanitized errors.
- Session refresh must run where updated cookies can be returned to the browser. Forwarding credentials to an upstream server does not automatically forward its `Set-Cookie` response back to the user.

## Hydration and interaction

The server-fetched initial result is the first displayed result. A mount effect must not be its sole loading mechanism on a server-rendered route. Where React Query is already appropriate, hydrate/seed the same key with a deliberate freshness policy so hydration does not immediately duplicate the request.

Assign one owner to each data source. URL navigation may request fresh server data; deliberate interactive client queries may handle browser-driven changes. Preserve URL search, filters, sorting, pagination and field selection in either approach. Avoid competing server props and client caches with different keys or freshness rules.

Mutations retain the supported transport and existing v1 contracts. Pending UI prevents duplicate submissions while preserving unsaved edits. Report success only after backend confirmation, then invalidate/refresh the affected server and client data. Generic dialogs may provide a safe retry message for otherwise unhandled rejections; domain callbacks retain specific validation, toast and success/closing behavior.

## Cache policy

For every migrated loader, document its cache key, audience, freshness interval and invalidation trigger. Public data may be cached where its freshness requirements permit. Authenticated data must be isolated by request/user/service/permission context and must never enter a shared public cache.

Distinguish missing content, denied access, expired sessions and upstream failure. Do not cache an outage's empty fallback as a successful result. Logout, account changes and permission/service changes must clear or invalidate affected private data. Backend invalidation does not prove frontend cache invalidation; verify both, including relevant replica behavior.

When a public page intentionally renders a recoverable fallback after an upstream failure, its server loader must opt that request out of the public cache (for example with `unstable_noStore`) while allowing successful responses to use their declared revalidation interval.

Library's anonymous catalog, search, guide, policy, service, specialist, electronic-resource and updates pages use a five-minute public revalidation interval; URL query parameters remain part of the request variation, while malformed or failed loader responses opt out of caching.

## Deployment exceptions

Admin's default production static export has no request-time frontend server. Preserve its existing optional standalone mode as well. Exported pages may contain build-time public data only where freshness permits. Live/authenticated Admin data continues through the supported browser transport or an already deployed separate integration; never embed user data in exported assets.

Interactive assistant streams, uploads, browser-only workflows and deliberate background refresh can use client requests. Record their reasons in the route inventory. An exception for one flow is not permission to move all initial public data loading into the browser.

## Required route evidence

Record the following for each migrated route or bounded shared loader:

| Field | Evidence required |
| --- | --- |
| Route and deployment | Direct URL, deep links, base path, query parameters and supported build mode |
| Data path | Loader, endpoint/method, v1 response adapter, client display component |
| Credentials | Public/private audience, request context and permission/service handling |
| Cache | Key, freshness, invalidation, failure behavior and private-data isolation |
| Hydration | Initial data in rendered output, no accidental duplicate browser request |
| Interactions | Search/page/sort, form validation, pending/error/success, mutation refresh |
| Verification | Automated results, real test-backend/server logs, browser network observations and screenshots |

Source inventory and mocked tests are useful evidence but do not establish real backend connectivity, authorization or freshness. Record unavailable environments/credentials and unverified checks explicitly. Keep production data and deployment out of migration verification.


## Implemented API entry points

- `@ksu/api-client/server`: server-only domain adapters for anonymous public requests and `createServerApiClient(service, { headers })` for a fresh private request context. Its domain adapters resolve the `react-server` runtime and cannot refresh browser sessions.
- `@ksu/api-client/browser`: browser transport and cookie-session helpers. Compatibility domain imports retain browser behavior through the default package runtime condition.
- `@ksu/api-client/media`: pure public media URL normalization; safe for shared display helpers without importing transport, query hooks or auth coordination.
- `@ksu/api-client/revalidation-route`: server-only authenticated route handlers for public-cache invalidation in server-runtime apps. It requires a content-management permission and never accepts backend credentials from the browser.

Use public environment configuration for any URL sent to the browser. Server-only origins are exclusively for backend transport. The Next boundary probe verifies Server Components, route handlers, server-produced client display HTML and rejection from a client module. It does not replace application integration tests.

Every `data-server-data-display` marker in application source must be declared inside a Client Component. The local source verifier enforces this with `scripts/check-display-marker-boundaries.mjs`; the route audit separately requires a reachable marker for each data-bearing server route.

Cross-application Next rewrites must not proxy one application's RSC payload through another application's client runtime. HERI's standalone base path is verified independently; composed Web/HERI deployments require a reverse-proxy or navigation strategy that preserves the owning application's RSC and asset origin.

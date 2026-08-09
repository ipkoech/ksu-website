# KSU outbound webhook contract v1

Status: active

Webhook delivery is asynchronous and at least once. A domain write commits its
versioned event to the Main outbox first; request handling never waits for a
subscriber. Consumers must deduplicate using `X-KSU-Event-Id`.

## Request

- Method: `POST`
- Content type: `application/json`
- Body: the canonical compact JSON encoding of the domain-event envelope
- `Idempotency-Key`: event UUID
- `X-KSU-Webhook-Id`: subscription UUID
- `X-KSU-Event-Id`: event UUID
- `X-KSU-Webhook-Timestamp`: Unix seconds
- `X-KSU-Webhook-Signature`: `v1=<lowercase hex HMAC-SHA256>`

The signed bytes are:

```text
<timestamp>.<exact HTTP request body>
```

The key is the signing secret shown once when the webhook is created. Receivers
must compare signatures in constant time and reject timestamps outside five
minutes before processing the event. Keep the event ID after successful handling
so retries do not repeat side effects.

## Event envelope

```json
{
  "actor_id": "uuid-or-null",
  "data": {},
  "id": "event-uuid",
  "occurred_at": "RFC3339 timestamp",
  "resource": {"id": "resource-uuid", "type": "resource-type"},
  "scope": {"id": "scope-uuid-or-null", "type": "scope-type"},
  "type": "event.name",
  "version": 1
}
```

Subscriptions list exact event names or `*`. Consumers must reject unsupported
event versions rather than guessing their meaning.

## Delivery policy

- Only public HTTP(S) targets are accepted; credentials in URLs, loopback,
  private, link-local, and internal hostnames are rejected.
- Redirects are not followed.
- Each attempt has a ten-second default deadline and a 64 KiB response limit.
- Network failures, timeouts, HTTP 408/425/429, and HTTP 5xx responses retry with
  bounded exponential backoff, up to eight attempts.
- Other HTTP 4xx responses dead-letter immediately.
- Connection pooling and a per-subscription circuit breaker isolate failing
  destinations.
- Every outcome is stored in `webhook_deliveries`; administrators can inspect
  attempts and explicitly replay a delivery.

Webhook bodies must not contain credentials or private data that the named event
contract does not authorize for external distribution.

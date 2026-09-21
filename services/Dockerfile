# Parameterized backend image for Main, Research, Library and HERI Africa.
# Build with --build-arg SERVICE=<main|research|library|heri_africa>.
ARG PYTHON_IMAGE=python@sha256:57cd7c3a7a273101a6485ba99423ee568157882804b1124b4dd04266317710de
ARG SERVICE
ARG SERVICE_PORT=8000

FROM ${PYTHON_IMAGE} AS builder

ARG SERVICE
WORKDIR /build

RUN case "${SERVICE}" in main|research|library|heri_africa) ;; *) echo "Unsupported SERVICE: ${SERVICE}" >&2; exit 2 ;; esac
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY common /common
COPY contracts /contracts
COPY ${SERVICE} /build/${SERVICE}
RUN pip wheel --no-cache-dir --wheel-dir /wheels /common /contracts /build/${SERVICE}

FROM ${PYTHON_IMAGE}

ARG SERVICE
ARG SERVICE_PORT=8000
WORKDIR /app
ENV SERVICE_PORT=${SERVICE_PORT}

RUN case "${SERVICE}" in main|research|library|heri_africa) ;; *) echo "Unsupported SERVICE: ${SERVICE}" >&2; exit 2 ;; esac
RUN apt-get update && apt-get install -y --no-install-recommends bash curl libpq5 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY ${SERVICE}/ .
RUN chmod +x scripts/*.sh 2>/dev/null || true

RUN groupadd --system --gid 10001 ksu \
  && useradd --system --uid 10001 --gid 10001 --home-dir /app --shell /usr/sbin/nologin ksu \
  && mkdir -p /app/logs /app/uploads /app/exports \
  && chown -R ksu:ksu /app

USER ksu

EXPOSE ${SERVICE_PORT}

CMD ["sh", "-c", "exec uvicorn wsgi:app --host 0.0.0.0 --port ${SERVICE_PORT} --proxy-headers --forwarded-allow-ips 172.31.0.2"]

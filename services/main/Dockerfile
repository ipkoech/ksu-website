FROM python@sha256:57cd7c3a7a273101a6485ba99423ee568157882804b1124b4dd04266317710de AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY common /common
COPY contracts /contracts
COPY main /build/main
RUN pip wheel --no-cache-dir --wheel-dir /wheels /common /contracts /build/main

FROM python@sha256:57cd7c3a7a273101a6485ba99423ee568157882804b1124b4dd04266317710de

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends bash curl libpq5 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
COPY main/ .
RUN chmod +x scripts/*.sh

RUN groupadd --system --gid 10001 ksu \
  && useradd --system --uid 10001 --gid 10001 --home-dir /app --shell /usr/sbin/nologin ksu \
  && mkdir -p /app/uploads /app/logs \
  && chown -R ksu:ksu /app

USER ksu

EXPOSE 8000

CMD ["uvicorn", "wsgi:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "172.31.0.2"]

FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends bash curl gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY common /common
RUN pip install --no-cache-dir -e /common

COPY research/ .
RUN pip install --no-cache-dir -e . \
  && groupadd --system --gid 10001 ksu \
  && useradd --system --uid 10001 --gid 10001 --home-dir /app --shell /usr/sbin/nologin ksu \
  && mkdir -p /app/logs /app/exports \
  && chown -R ksu:ksu /app

USER ksu

EXPOSE 8001

CMD ["uvicorn", "wsgi:app", "--host", "0.0.0.0", "--port", "8001", "--proxy-headers", "--forwarded-allow-ips", "*"]

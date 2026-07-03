FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends bash curl gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY common /common
RUN pip install --no-cache-dir -e /common

COPY main/ .
RUN pip install --no-cache-dir -e . && chmod +x scripts/*.sh

RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["uvicorn", "wsgi:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]

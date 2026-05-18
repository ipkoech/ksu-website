FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY ../common /common
RUN pip install --no-cache-dir -e /common

COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

COPY . .

EXPOSE 8002

CMD ["uvicorn", "wsgi:app", "--host", "0.0.0.0", "--port", "8002"]

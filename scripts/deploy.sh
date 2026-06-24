#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/deploy.sh local [options]
  scripts/deploy.sh vm --host HOST --env dev|staging|production [options]
  scripts/deploy.sh vm-backup --host HOST --env dev|staging|production [options]
  scripts/deploy.sh cloud --env dev|staging|production --project PROJECT_ID [options]

Local options:
  --remote HOST        Deploy by SSH on HOST from the same repository path.
  --branch BRANCH      Branch to deploy on the remote host. Defaults to current branch.
  --no-gateway         Skip the nginx gateway.
  --skip-frontend      Skip pnpm install/build.
  --skip-build         Skip Docker image rebuild.
  --pull               Run git pull before deploying. Default for --remote.

VM options:
  --host HOST          SSH host, for example ubuntu@203.0.113.10. Required.
  --env ENV            Deployment environment: dev, staging, or production. Required.
  --branch BRANCH      Branch to deploy. Defaults to dev.
  --repo-url URL       Git repository URL. Defaults to the local origin URL.
  --path PATH          Repository path on the VM. Defaults to this local repo path.
  --project-name NAME  Docker Compose project name. Defaults to ksu-ENV.
  --public-host HOST   Public website host or IP. Required for VM deploy.
  --api-host HOST      API host. Required for VM deploy.
  --research-host HOST Research frontend host. Required for VM deploy.
  --https             Install host Nginx/Certbot and issue HTTPS certificates.
  --cert-email EMAIL  Let's Encrypt email. Required with --https.
  --bootstrap          Install Docker packages on an Ubuntu/Debian VM before deploy.
  --no-pull            Do not fetch/pull before deploying.
  --no-backup          Skip the pre-deploy database backup.
  --backup-dir DIR     Backup directory on the VM. Defaults to PATH/backups/ENV.
  --no-gateway         Skip the nginx gateway.
  --skip-frontend      Skip pnpm install/build.
  --skip-build         Skip Docker image rebuild.
  --dry-run            Print the SSH command without executing it.

Cloud options:
  --env ENV            Deployment environment: dev, staging, or production. Required.
  --project PROJECT    GCP project ID. Defaults to GCP_PROJECT if set.
  --region REGION      GCP region. Defaults to GCP_REGION or us-central1.
  --repo REPO          Artifact Registry repository. Defaults to ksu.
  --image-tag TAG      Image tag. Defaults to current git short SHA.
  --service-prefix P   Cloud Run service prefix. Defaults to ksu.
  --allow-unauth       Allow public access to deployed HTTP services. Default.
  --no-allow-unauth    Require authenticated access to deployed HTTP services.
  --include-workers    Deploy Celery worker services. Off by default to control cost.
  --skip-frontends     Deploy backend services only.
  --run-migrations     Run Alembic migrations for main, research, and library.
  --skip-build         Reuse images that already exist in Artifact Registry.
  --dry-run            Print the gcloud/docker commands without executing them.

Examples:
  scripts/deploy.sh local
  scripts/deploy.sh local --skip-frontend
  scripts/deploy.sh vm --host ubuntu@VM_IP --env dev --branch dev --path /srv/ksu
  scripts/deploy.sh vm --host ubuntu@VM_IP --env dev --path /srv/ksu --bootstrap
  scripts/deploy.sh vm --host ubuntu@VM_IP --env dev --path /srv/ksu --bootstrap --https --cert-email ops@example.edu --public-host public.example.edu --api-host api.example.edu --research-host research.example.edu
  scripts/deploy.sh vm-backup --host ubuntu@VM_IP --env production
  scripts/deploy.sh cloud --env dev --project my-gcp-project
  scripts/deploy.sh cloud --env staging --project my-gcp-project --image-tag abc1234 --skip-build
  scripts/deploy.sh cloud --env production --project my-gcp-project --image-tag abc1234 --skip-build --run-migrations

Free-trial guidance:
  Start with only the dev environment, keep Cloud Run min instances at zero, and do not
  deploy workers until background jobs are actually needed. Cloud SQL and Memorystore
  can consume the $300 credit quickly if left running for three full environments.
USAGE
}

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT}" ]]; then
  echo "error: run this inside a git repository" >&2
  exit 1
fi

run_cmd() {
  if [[ "${DRY_RUN:-0}" -eq 1 ]]; then
    printf '+'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

require_cmd() {
  local name="$1"
  if ! command -v "${name}" >/dev/null 2>&1; then
    echo "error: ${name} is required but was not found on PATH" >&2
    exit 1
  fi
}

current_git_sha() {
  git -C "${ROOT}" rev-parse --short=12 HEAD
}

validate_env_name() {
  case "$1" in
    dev|staging|production) ;;
    *)
      echo "error: --env must be one of: dev, staging, production" >&2
      exit 1
      ;;
  esac
}

shell_quote() {
  printf '%q' "$1"
}

deploy_local() {
  local remote_host=""
  local branch
  branch="$(git -C "${ROOT}" branch --show-current)"
  local with_gateway=1
  local skip_frontend=0
  local skip_build=0
  local pull=0

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --remote)
        remote_host="${2:-}"
        pull=1
        shift 2
        ;;
      --branch)
        branch="${2:-}"
        shift 2
        ;;
      --with-gateway)
        with_gateway=1
        shift
        ;;
      --no-gateway)
        with_gateway=0
        shift
        ;;
      --skip-frontend)
        skip_frontend=1
        shift
        ;;
      --skip-build)
        skip_build=1
        shift
        ;;
      --pull)
        pull=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "error: unknown local option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
  done

  if [[ -n "${remote_host}" ]]; then
    if [[ -z "${branch}" ]]; then
      echo "error: cannot determine current branch; pass --branch" >&2
      exit 1
    fi

    local remote_cmd
    remote_cmd="cd $(printf '%q' "${ROOT}") && scripts/deploy.sh local --branch $(printf '%q' "${branch}") --pull"
    [[ "${with_gateway}" -eq 0 ]] && remote_cmd+=" --no-gateway"
    [[ "${skip_frontend}" -eq 1 ]] && remote_cmd+=" --skip-frontend"
    [[ "${skip_build}" -eq 1 ]] && remote_cmd+=" --skip-build"

    ssh "${remote_host}" "${remote_cmd}"
    return
  fi

  cd "${ROOT}"
  require_cmd docker

  if ! docker compose version >/dev/null 2>&1; then
    echo "error: docker compose is not available" >&2
    exit 1
  fi

  if [[ "${pull}" -eq 1 ]]; then
    if [[ -z "${branch}" ]]; then
      echo "error: branch is required when pulling" >&2
      exit 1
    fi
    git fetch origin "${branch}"
    git checkout "${branch}"
    git pull --ff-only origin "${branch}"
  fi

  if [[ "${skip_frontend}" -eq 0 && -f frontend/package.json ]]; then
    require_cmd pnpm
    echo "Installing frontend dependencies..."
    (cd frontend && pnpm install --frozen-lockfile)
    echo "Building frontend apps/packages..."
    (cd frontend && pnpm build)
  fi

  local services=(postgres redis main research library celery-main celery-library)
  if [[ "${with_gateway}" -eq 1 ]]; then
    services+=(gateway)
  fi

  local compose_args=(up -d --remove-orphans)
  if [[ "${skip_build}" -eq 0 ]]; then
    compose_args+=(--build)
  fi
  compose_args+=("${services[@]}")

  echo "Starting Docker Compose services: ${services[*]}"
  docker compose "${compose_args[@]}"
  echo
  docker compose ps "${services[@]}"
}

vm_remote_script() {
  local mode="$1"
  local env_name="$2"
  local branch="$3"
  local repo_url="$4"
  local repo_path="$5"
  local project_name="$6"
  local public_host="$7"
  local api_host="$8"
  local research_host="$9"
  local bootstrap="${10}"
  local pull="${11}"
  local backup="${12}"
  local backup_dir="${13}"
  local with_gateway="${14}"
  local skip_frontend="${15}"
  local skip_build="${16}"
  local enable_https="${17}"
  local cert_email="${18}"

  cat <<REMOTE
set -euo pipefail

ENV_NAME=$(shell_quote "${env_name}")
BRANCH=$(shell_quote "${branch}")
REPO_URL=$(shell_quote "${repo_url}")
REPO_PATH=$(shell_quote "${repo_path}")
PROJECT_NAME=$(shell_quote "${project_name}")
PUBLIC_HOST=$(shell_quote "${public_host}")
API_HOST=$(shell_quote "${api_host}")
RESEARCH_HOST=$(shell_quote "${research_host}")
BOOTSTRAP=$(shell_quote "${bootstrap}")
PULL=$(shell_quote "${pull}")
BACKUP=$(shell_quote "${backup}")
BACKUP_DIR=$(shell_quote "${backup_dir}")
WITH_GATEWAY=$(shell_quote "${with_gateway}")
SKIP_FRONTEND=$(shell_quote "${skip_frontend}")
SKIP_BUILD=$(shell_quote "${skip_build}")
ENABLE_HTTPS=$(shell_quote "${enable_https}")
CERT_EMAIL=$(shell_quote "${cert_email}")
MODE=$(shell_quote "${mode}")

if [[ "\${BOOTSTRAP}" -eq 1 ]]; then
  if ! command -v git >/dev/null 2>&1; then
    echo "Installing Git..."
    sudo apt-get update
    sudo apt-get install -y git
  fi
  if ! command -v docker >/dev/null 2>&1; then
    echo "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose-plugin
    sudo systemctl enable --now docker
  fi
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "error: docker is not installed on the VM; rerun with --bootstrap or install Docker first" >&2
  exit 1
fi

DOCKER=(docker)
if ! docker ps >/dev/null 2>&1; then
  if sudo -n docker ps >/dev/null 2>&1; then
    DOCKER=(sudo docker)
  else
    echo "error: current SSH user cannot access Docker; add the user to the docker group or allow passwordless sudo for docker" >&2
    exit 1
  fi
fi

if ! "\${DOCKER[@]}" compose version >/dev/null 2>&1; then
  echo "error: docker compose plugin is not available on the VM" >&2
  exit 1
fi

if [[ ! -d "\${REPO_PATH}/.git" ]]; then
  if [[ -z "\${REPO_URL}" ]]; then
    echo "error: repository not found at \${REPO_PATH} and no --repo-url was provided" >&2
    exit 1
  fi
  echo "Cloning \${REPO_URL} into \${REPO_PATH}..."
  mkdir -p "\$(dirname "\${REPO_PATH}")"
  git clone --branch "\${BRANCH}" "\${REPO_URL}" "\${REPO_PATH}"
fi

cd "\${REPO_PATH}"

if [[ "\${PULL}" -eq 1 ]]; then
  if [[ -z "\${BRANCH}" ]]; then
    echo "error: branch is required when pulling" >&2
    exit 1
  fi
  git fetch origin "\${BRANCH}"
  git checkout "\${BRANCH}"
  git pull --ff-only origin "\${BRANCH}"
fi

APP_SCHEME="http"
EDGE_HTTP_PORT="80"
if [[ "\${ENABLE_HTTPS}" -eq 1 ]]; then
  APP_SCHEME="https"
  EDGE_HTTP_PORT="127.0.0.1:8080"
fi
PUBLIC_URL="\${APP_SCHEME}://\${PUBLIC_HOST}"
API_SERVER_NAME="\${API_HOST}"
if [[ "\${API_HOST}" = "\${PUBLIC_HOST}" ]]; then
  API_SERVER_NAME="api.invalid.local"
  API_URL="\${PUBLIC_URL}"
else
  API_URL="\${APP_SCHEME}://\${API_HOST}"
fi
RESEARCH_SERVER_NAME="\${RESEARCH_HOST}"
if [[ "\${RESEARCH_HOST}" = "\${PUBLIC_HOST}" ]]; then
  RESEARCH_SERVER_NAME="research.invalid.local"
fi
RESEARCH_URL="\${APP_SCHEME}://\${RESEARCH_HOST}"
LIBRARY_URL="\${PUBLIC_URL}/library"
ADMIN_URL="\${PUBLIC_URL}/admin"
COMPOSE_ENV_FILE=".deploy/\${ENV_NAME}.compose.env"

mkdir -p .deploy
if [[ -f .env ]]; then
  cat .env > "\${COMPOSE_ENV_FILE}"
else
  : > "\${COMPOSE_ENV_FILE}"
fi
cat >> "\${COMPOSE_ENV_FILE}" <<EOF
APP_ENV=\${ENV_NAME}
EDGE_HTTP_PORT=\${EDGE_HTTP_PORT}
PUBLIC_SERVER_NAME=\${PUBLIC_HOST}
API_SERVER_NAME=\${API_SERVER_NAME}
RESEARCH_SERVER_NAME=\${RESEARCH_SERVER_NAME}
NEXT_PUBLIC_API_URL=\${API_URL}/api/v1
NEXT_PUBLIC_MAIN_API_URL=\${API_URL}
NEXT_PUBLIC_RESEARCH_API_URL=\${API_URL}
NEXT_PUBLIC_LIBRARY_API_URL=\${API_URL}
NEXT_PUBLIC_PUBLIC_FRONTEND_URL=\${PUBLIC_URL}
NEXT_PUBLIC_RESEARCH_FRONTEND_URL=\${RESEARCH_URL}
NEXT_PUBLIC_LIBRARY_FRONTEND_URL=\${LIBRARY_URL}
NEXT_PUBLIC_APP_URL=\${ADMIN_URL}
EOF

missing_env=()
for env_file in services/main/.env services/research/.env services/library/.env; do
  if [[ ! -f "\${env_file}" ]]; then
    missing_env+=("\${env_file}")
  fi
done
if [[ "\${#missing_env[@]}" -gt 0 ]]; then
  echo "error: missing service env files on the VM:" >&2
  printf '  %s\n' "\${missing_env[@]}" >&2
  echo "Create them from the matching .env.example files before deploying." >&2
  exit 1
fi

compose_files=(-f docker-compose.yml -f docker-compose.vm.yml)
if [[ -f .deploy/docker-compose.external-data.yml ]]; then
  compose_files+=(-f .deploy/docker-compose.external-data.yml)
fi

backup_database() {
  mkdir -p "\${BACKUP_DIR}"
  local stamp
  stamp="\$(date -u +%Y%m%dT%H%M%SZ)"
  local output="\${BACKUP_DIR}/ksu-\${ENV_NAME}-\${stamp}.sql.gz"

  echo "Creating database backup: \${output}"
  if "\${DOCKER[@]}" compose --env-file "\${COMPOSE_ENV_FILE}" -p "\${PROJECT_NAME}" "\${compose_files[@]}" ps --status running postgres --format '{{.Service}}' | grep -qx postgres; then
    "\${DOCKER[@]}" compose --env-file "\${COMPOSE_ENV_FILE}" -p "\${PROJECT_NAME}" "\${compose_files[@]}" exec -T postgres pg_dump -U ksu -d ksu | gzip -9 > "\${output}"
  else
    echo "warning: postgres container is not running; skipping database backup" >&2
    return 0
  fi

  chmod 600 "\${output}"
  echo "Backup complete: \${output}"
}

if [[ "\${MODE}" = "backup" ]]; then
  backup_database
  exit 0
fi

if [[ "\${BACKUP}" -eq 1 ]]; then
  backup_database
fi

if [[ "\${SKIP_FRONTEND}" -eq 0 && -f frontend/package.json ]]; then
  echo "Frontend apps will be built by Docker Compose."
fi

services=(postgres redis main research library celery-main celery-library)
if [[ "\${WITH_GATEWAY}" -eq 1 ]]; then
  services+=(gateway)
fi
if [[ "\${SKIP_FRONTEND}" -eq 0 ]]; then
  services+=(web-prod admin-prod research-web-prod library-web-prod edge)
fi

compose_args=(up -d --remove-orphans)
if [[ "\${SKIP_BUILD}" -eq 0 ]]; then
  compose_args+=(--build)
fi
compose_args+=("\${services[@]}")

echo "Deploying Docker Compose project \${PROJECT_NAME}: \${services[*]}"
"\${DOCKER[@]}" compose --env-file "\${COMPOSE_ENV_FILE}" -p "\${PROJECT_NAME}" "\${compose_files[@]}" "\${compose_args[@]}"
echo
"\${DOCKER[@]}" compose --env-file "\${COMPOSE_ENV_FILE}" -p "\${PROJECT_NAME}" "\${compose_files[@]}" ps "\${services[@]}"

configure_https() {
  if [[ "\${ENABLE_HTTPS}" -ne 1 ]]; then
    return 0
  fi

  if [[ -z "\${CERT_EMAIL}" ]]; then
    echo "error: --cert-email is required with --https" >&2
    exit 1
  fi

  echo "Installing host Nginx and Certbot..."
  sudo apt-get update
  sudo apt-get install -y nginx certbot python3-certbot-nginx
  sudo systemctl enable --now nginx

  local site_name="ksu-\${ENV_NAME}"
  local site_available="/etc/nginx/sites-available/\${site_name}.conf"
  local site_enabled="/etc/nginx/sites-enabled/\${site_name}.conf"

  echo "Writing host Nginx reverse proxy: \${site_available}"
  sudo tee "\${site_available}" >/dev/null <<EOF
server {
    listen 80;
    server_name \${PUBLIC_HOST};

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name \${API_HOST};

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
}

server {
    listen 80;
    server_name \${RESEARCH_HOST};

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

  sudo ln -sf "\${site_available}" "\${site_enabled}"
  if [[ -e /etc/nginx/sites-enabled/default ]]; then
    sudo rm -f /etc/nginx/sites-enabled/default
  fi
  sudo nginx -t
  sudo systemctl reload nginx

  echo "Requesting Let's Encrypt certificates..."
  sudo certbot --nginx \
    --non-interactive \
    --agree-tos \
    --email "\${CERT_EMAIL}" \
    --redirect \
    --keep-until-expiring \
    -d "\${PUBLIC_HOST}" \
    -d "\${API_HOST}" \
    -d "\${RESEARCH_HOST}"

  sudo systemctl reload nginx
  echo "HTTPS configured for \${PUBLIC_HOST}, \${API_HOST}, and \${RESEARCH_HOST}."
}

configure_https
REMOTE
}

deploy_vm() {
  local mode="$1"
  shift

  local host=""
  local env_name=""
  local branch="dev"
  local repo_url
  repo_url="$(git -C "${ROOT}" remote get-url origin 2>/dev/null || true)"
  local repo_path="${ROOT}"
  local project_name=""
  local public_host=""
  local api_host=""
  local research_host=""
  local enable_https=0
  local cert_email=""
  local bootstrap=0
  local pull=1
  local backup=1
  local backup_dir=""
  local with_gateway=1
  local skip_frontend=0
  local skip_build=0
  DRY_RUN=0

  if [[ "${mode}" = "backup" ]]; then
    pull=0
  fi

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --host)
        host="${2:-}"
        shift 2
        ;;
      --env)
        env_name="${2:-}"
        shift 2
        ;;
      --branch)
        branch="${2:-}"
        shift 2
        ;;
      --repo-url)
        repo_url="${2:-}"
        shift 2
        ;;
      --path)
        repo_path="${2:-}"
        shift 2
        ;;
      --project-name)
        project_name="${2:-}"
        shift 2
        ;;
      --public-host)
        public_host="${2:-}"
        shift 2
        ;;
      --api-host)
        api_host="${2:-}"
        shift 2
        ;;
      --research-host)
        research_host="${2:-}"
        shift 2
        ;;
      --https)
        enable_https=1
        shift
        ;;
      --cert-email)
        cert_email="${2:-}"
        shift 2
        ;;
      --bootstrap)
        bootstrap=1
        shift
        ;;
      --no-pull)
        pull=0
        shift
        ;;
      --no-backup)
        backup=0
        shift
        ;;
      --backup-dir)
        backup_dir="${2:-}"
        shift 2
        ;;
      --with-gateway)
        with_gateway=1
        shift
        ;;
      --no-gateway)
        with_gateway=0
        shift
        ;;
      --skip-frontend)
        skip_frontend=1
        shift
        ;;
      --skip-build)
        skip_build=1
        shift
        ;;
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "error: unknown vm option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
  done

  if [[ -z "${host}" ]]; then
    echo "error: --host is required for vm deploy" >&2
    exit 1
  fi
  if [[ -z "${env_name}" ]]; then
    echo "error: --env is required for vm deploy" >&2
    exit 1
  fi
  validate_env_name "${env_name}"

  if [[ -z "${branch}" && "${pull}" -eq 1 ]]; then
    echo "error: cannot determine current branch; pass --branch or --no-pull" >&2
    exit 1
  fi

  if [[ "${enable_https}" -eq 1 && -z "${cert_email}" ]]; then
    echo "error: --cert-email is required when using --https" >&2
    exit 1
  fi

  if [[ -z "${project_name}" ]]; then
    project_name="ksu-${env_name}"
  fi

  if [[ -z "${public_host}" ]]; then
    echo "error: --public-host is required for VM deploy" >&2
    exit 1
  fi

  if [[ -z "${api_host}" ]]; then
    echo "error: --api-host is required for VM deploy" >&2
    exit 1
  fi

  if [[ -z "${research_host}" ]]; then
    echo "error: --research-host is required for VM deploy" >&2
    exit 1
  fi

  if [[ -z "${backup_dir}" ]]; then
    backup_dir="${repo_path}/backups/${env_name}"
  fi

  local remote
  if [[ "${mode}" = "backup" ]]; then
    backup=1
  fi
  remote="$(vm_remote_script "${mode}" "${env_name}" "${branch}" "${repo_url}" "${repo_path}" "${project_name}" "${public_host}" "${api_host}" "${research_host}" "${bootstrap}" "${pull}" "${backup}" "${backup_dir}" "${with_gateway}" "${skip_frontend}" "${skip_build}" "${enable_https}" "${cert_email}")"

  if [[ "${DRY_RUN}" -eq 1 ]]; then
    printf '+ ssh %q %q\n' "${host}" "${remote}"
  else
    ssh "${host}" "${remote}"
  fi
}

cloud_services() {
  cat <<'SERVICES'
main:services/main/Dockerfile:8000:main
research:services/research/Dockerfile:8001:research
library:services/library/Dockerfile:8002:library
SERVICES
}

cloud_worker_services() {
  cat <<'SERVICES'
main-worker:services/main/Dockerfile:./scripts/start-celery-worker.sh:main
library-worker:services/library/Dockerfile:./scripts/start-celery-worker.sh:library
SERVICES
}

cloud_frontend_services() {
  cat <<'SERVICES'
web:web:@ksu/web
admin:admin:@ksu/admin
research-web:research:@ksu/research
library-web:library:@ksu/library
SERVICES
}

validate_cloud_env() {
  validate_env_name "$1"
}

image_uri() {
  local project="$1"
  local region="$2"
  local repo="$3"
  local env="$4"
  local service="$5"
  local tag="$6"
  printf '%s-docker.pkg.dev/%s/%s/%s-%s:%s' "${region}" "${project}" "${repo}" "${env}" "${service}" "${tag}"
}

deploy_cloud() {
  local env_name=""
  local project="${GCP_PROJECT:-}"
  local region="${GCP_REGION:-us-central1}"
  local repo="${GCP_AR_REPOSITORY:-ksu}"
  local tag=""
  local prefix="ksu"
  local allow_unauth=1
  local include_workers=0
  local skip_frontends=0
  local run_migrations=0
  local skip_build=0
  DRY_RUN=0

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --env)
        env_name="${2:-}"
        shift 2
        ;;
      --project)
        project="${2:-}"
        shift 2
        ;;
      --region)
        region="${2:-}"
        shift 2
        ;;
      --repo)
        repo="${2:-}"
        shift 2
        ;;
      --image-tag)
        tag="${2:-}"
        shift 2
        ;;
      --service-prefix)
        prefix="${2:-}"
        shift 2
        ;;
      --allow-unauth)
        allow_unauth=1
        shift
        ;;
      --no-allow-unauth)
        allow_unauth=0
        shift
        ;;
      --include-workers)
        include_workers=1
        shift
        ;;
      --skip-frontends)
        skip_frontends=1
        shift
        ;;
      --run-migrations)
        run_migrations=1
        shift
        ;;
      --skip-build)
        skip_build=1
        shift
        ;;
      --dry-run)
        DRY_RUN=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "error: unknown cloud option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
  done

  if [[ -z "${env_name}" ]]; then
    echo "error: --env is required for cloud deploy" >&2
    exit 1
  fi
  validate_cloud_env "${env_name}"

  if [[ -z "${project}" ]]; then
    echo "error: --project is required, or set GCP_PROJECT" >&2
    exit 1
  fi

  if [[ -z "${tag}" ]]; then
    tag="$(current_git_sha)"
  fi

  if [[ "${DRY_RUN}" -eq 0 ]]; then
    require_cmd gcloud
    require_cmd docker
  fi

  cd "${ROOT}"

  echo "Cloud deployment target:"
  echo "  environment: ${env_name}"
  echo "  project:     ${project}"
  echo "  region:      ${region}"
  echo "  repository:  ${repo}"
  echo "  image tag:   ${tag}"
  echo

  echo "Checking required GCP services..."
  run_cmd gcloud services enable \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    secretmanager.googleapis.com \
    --project "${project}"

  if [[ "${skip_build}" -eq 0 ]]; then
    echo "Ensuring Artifact Registry repository exists..."
    if [[ "${DRY_RUN}" -eq 1 ]]; then
      run_cmd gcloud artifacts repositories describe "${repo}" --location "${region}" --project "${project}"
      run_cmd gcloud artifacts repositories create "${repo}" --repository-format docker --location "${region}" --project "${project}"
    elif ! gcloud artifacts repositories describe "${repo}" --location "${region}" --project "${project}" >/dev/null 2>&1; then
      gcloud artifacts repositories create "${repo}" \
        --repository-format docker \
        --location "${region}" \
        --project "${project}"
    fi

    run_cmd gcloud auth configure-docker "${region}-docker.pkg.dev" --quiet

    while IFS=: read -r service dockerfile _port _config_group; do
      local image
      image="$(image_uri "${project}" "${region}" "${repo}" "${env_name}" "${service}" "${tag}")"
      echo "Building ${service}: ${image}"
      run_cmd docker build -f "${dockerfile}" -t "${image}" services
      run_cmd docker push "${image}"
    done < <(cloud_services)

    if [[ "${include_workers}" -eq 1 ]]; then
      while IFS=: read -r service dockerfile _command _config_group; do
        local image
        image="$(image_uri "${project}" "${region}" "${repo}" "${env_name}" "${service}" "${tag}")"
        echo "Building ${service}: ${image}"
        run_cmd docker build -f "${dockerfile}" -t "${image}" services
        run_cmd docker push "${image}"
      done < <(cloud_worker_services)
    fi
  fi

  local auth_flag=--allow-unauthenticated
  if [[ "${allow_unauth}" -eq 0 ]]; then
    auth_flag=--no-allow-unauthenticated
  fi

  while IFS=: read -r service _dockerfile port config_group; do
    local image service_name env_prefix
    image="$(image_uri "${project}" "${region}" "${repo}" "${env_name}" "${service}" "${tag}")"
    service_name="${prefix}-${env_name}-${service}"
    env_prefix="$(printf '%s' "${env_name}" | tr '[:lower:]' '[:upper:]')"

    echo "Deploying Cloud Run service ${service_name}"
    run_cmd gcloud run deploy "${service_name}" \
      --image "${image}" \
      --project "${project}" \
      --region "${region}" \
      --platform managed \
      "${auth_flag}" \
      --port "${port}" \
      --cpu 1 \
      --memory 512Mi \
      --min-instances 0 \
      --max-instances 2 \
      --concurrency 80 \
      --timeout 300 \
      --set-env-vars "APP_ENV=${env_name},SERVICE_NAME=${config_group},LOG_FORMAT=json,LOG_DIR=/tmp/logs" \
      --set-secrets "DATABASE_URL=${env_prefix}_${config_group^^}_DATABASE_URL:latest,REDIS_URL=${env_prefix}_${config_group^^}_REDIS_URL:latest,JWT_SECRET_KEY=${env_prefix}_JWT_SECRET_KEY:latest,INTERNAL_API_KEY=${env_prefix}_INTERNAL_API_KEY:latest"
  done < <(cloud_services)

  local main_url=""
  local research_url=""
  local library_url=""

  if [[ "${DRY_RUN}" -eq 1 ]]; then
    main_url="https://${prefix}-${env_name}-main-${region}.a.run.app"
    research_url="https://${prefix}-${env_name}-research-${region}.a.run.app"
    library_url="https://${prefix}-${env_name}-library-${region}.a.run.app"
  else
    main_url="$(gcloud run services describe "${prefix}-${env_name}-main" --project "${project}" --region "${region}" --format 'value(status.url)')"
    research_url="$(gcloud run services describe "${prefix}-${env_name}-research" --project "${project}" --region "${region}" --format 'value(status.url)')"
    library_url="$(gcloud run services describe "${prefix}-${env_name}-library" --project "${project}" --region "${region}" --format 'value(status.url)')"
  fi

  if [[ "${skip_frontends}" -eq 0 ]]; then
    local public_frontend_url="${NEXT_PUBLIC_PUBLIC_FRONTEND_URL:-}"
    local research_frontend_url="${NEXT_PUBLIC_RESEARCH_FRONTEND_URL:-}"
    local library_frontend_url="${NEXT_PUBLIC_LIBRARY_FRONTEND_URL:-}"
    local admin_frontend_url="${NEXT_PUBLIC_APP_URL:-}"

    if [[ "${DRY_RUN}" -eq 1 ]]; then
      public_frontend_url="${public_frontend_url:-https://${prefix}-${env_name}-web-${region}.a.run.app}"
      admin_frontend_url="${admin_frontend_url:-https://${prefix}-${env_name}-admin-${region}.a.run.app}"
      research_frontend_url="${research_frontend_url:-https://${prefix}-${env_name}-research-web-${region}.a.run.app}"
      library_frontend_url="${library_frontend_url:-https://${prefix}-${env_name}-library-web-${region}.a.run.app}"
    fi

    if [[ "${skip_build}" -eq 0 ]]; then
      while IFS=: read -r service app_dir package_name; do
        local image
        image="$(image_uri "${project}" "${region}" "${repo}" "${env_name}" "${service}" "${tag}")"
        echo "Building frontend ${service}: ${image}"
        run_cmd docker build -f frontend/Dockerfile -t "${image}" \
          --build-arg "APP_DIR=${app_dir}" \
          --build-arg "PACKAGE_NAME=${package_name}" \
          --build-arg "NEXT_PUBLIC_API_URL=${main_url}/api/v1" \
          --build-arg "NEXT_PUBLIC_MAIN_API_URL=${main_url}" \
          --build-arg "NEXT_PUBLIC_RESEARCH_API_URL=${research_url}" \
          --build-arg "NEXT_PUBLIC_LIBRARY_API_URL=${library_url}" \
          --build-arg "NEXT_PUBLIC_PUBLIC_FRONTEND_URL=${public_frontend_url}" \
          --build-arg "NEXT_PUBLIC_RESEARCH_FRONTEND_URL=${research_frontend_url}" \
          --build-arg "NEXT_PUBLIC_LIBRARY_FRONTEND_URL=${library_frontend_url}" \
          --build-arg "NEXT_PUBLIC_APP_URL=${admin_frontend_url}" \
          frontend
        run_cmd docker push "${image}"
      done < <(cloud_frontend_services)
    fi

    while IFS=: read -r service _app_dir _package_name; do
      local image service_name
      image="$(image_uri "${project}" "${region}" "${repo}" "${env_name}" "${service}" "${tag}")"
      service_name="${prefix}-${env_name}-${service}"

      echo "Deploying frontend ${service_name}"
      run_cmd gcloud run deploy "${service_name}" \
        --image "${image}" \
        --project "${project}" \
        --region "${region}" \
        --platform managed \
        "${auth_flag}" \
        --port 3000 \
        --cpu 1 \
        --memory 512Mi \
        --min-instances 0 \
        --max-instances 2 \
        --concurrency 80 \
        --timeout 300 \
        --set-env-vars "APP_ENV=${env_name},NEXT_TELEMETRY_DISABLED=1,NEXT_PUBLIC_API_URL=${main_url}/api/v1,NEXT_PUBLIC_MAIN_API_URL=${main_url},NEXT_PUBLIC_RESEARCH_API_URL=${research_url},NEXT_PUBLIC_LIBRARY_API_URL=${library_url}"
    done < <(cloud_frontend_services)
  fi

  if [[ "${include_workers}" -eq 1 ]]; then
    while IFS=: read -r service _dockerfile command config_group; do
      local image service_name env_prefix
      image="$(image_uri "${project}" "${region}" "${repo}" "${env_name}" "${service}" "${tag}")"
      service_name="${prefix}-${env_name}-${service}"
      env_prefix="$(printf '%s' "${env_name}" | tr '[:lower:]' '[:upper:]')"

      echo "Deploying worker ${service_name}"
      run_cmd gcloud run deploy "${service_name}" \
        --image "${image}" \
        --project "${project}" \
        --region "${region}" \
        --platform managed \
        --no-allow-unauthenticated \
        --command "${command}" \
        --cpu 1 \
        --memory 512Mi \
        --min-instances 1 \
        --max-instances 1 \
        --concurrency 1 \
        --timeout 3600 \
        --set-env-vars "APP_ENV=${env_name},SERVICE_NAME=${config_group},LOG_FORMAT=json,LOG_DIR=/tmp/logs" \
        --set-secrets "DATABASE_URL=${env_prefix}_${config_group^^}_DATABASE_URL:latest,REDIS_URL=${env_prefix}_${config_group^^}_REDIS_URL:latest,CELERY_BROKER_URL=${env_prefix}_${config_group^^}_REDIS_URL:latest,CELERY_RESULT_BACKEND=${env_prefix}_${config_group^^}_REDIS_URL:latest,JWT_SECRET_KEY=${env_prefix}_JWT_SECRET_KEY:latest,INTERNAL_API_KEY=${env_prefix}_INTERNAL_API_KEY:latest"
    done < <(cloud_worker_services)
  fi

  if [[ "${run_migrations}" -eq 1 ]]; then
    while IFS=: read -r service _dockerfile _port _config_group; do
      local image job_name env_prefix
      image="$(image_uri "${project}" "${region}" "${repo}" "${env_name}" "${service}" "${tag}")"
      job_name="${prefix}-${env_name}-${service}-migrate"
      env_prefix="$(printf '%s' "${env_name}" | tr '[:lower:]' '[:upper:]')"

      echo "Running migrations for ${service}"
      if [[ "${DRY_RUN}" -eq 1 ]]; then
        run_cmd gcloud run jobs delete "${job_name}" --project "${project}" --region "${region}" --quiet
      elif gcloud run jobs describe "${job_name}" --project "${project}" --region "${region}" >/dev/null 2>&1; then
        gcloud run jobs delete "${job_name}" --project "${project}" --region "${region}" --quiet
      fi
      run_cmd gcloud run jobs create "${job_name}" \
        --image "${image}" \
        --project "${project}" \
        --region "${region}" \
        --command alembic \
        --args upgrade,head \
        --set-env-vars "APP_ENV=${env_name},LOG_FORMAT=json,LOG_DIR=/tmp/logs" \
        --set-secrets "DATABASE_URL=${env_prefix}_${service^^}_DATABASE_URL:latest"
      run_cmd gcloud run jobs execute "${job_name}" \
        --project "${project}" \
        --region "${region}" \
        --wait
    done < <(cloud_services)
  fi

  echo
  echo "Cloud deploy complete for ${env_name}."
  echo "Next promotion step: reuse --image-tag ${tag} with --skip-build for the next environment."
}

main() {
  local command="${1:-}"
  case "${command}" in
    "")
      deploy_local
      ;;
    local)
      shift
      deploy_local "$@"
      ;;
    vm)
      shift
      deploy_vm deploy "$@"
      ;;
    vm-backup)
      shift
      deploy_vm backup "$@"
      ;;
    cloud)
      shift
      deploy_cloud "$@"
      ;;
    -h|--help)
      usage
      ;;
    --*)
      deploy_local "$@"
      ;;
    *)
      echo "error: unknown command: ${command}" >&2
      usage >&2
      exit 1
      ;;
  esac
}

main "$@"

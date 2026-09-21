#!/bin/sh

# PostgreSQL calls this helper as: postgres-archive-wal.sh %p %f.
# The copy is written under a private temporary name and renamed atomically so
# a backup reader never consumes a partially archived WAL segment.
set -eu
umask 077

source_path=${1:?PostgreSQL WAL source path is required}
segment_name=${2:?PostgreSQL WAL segment name is required}
case "${segment_name}" in
  ""|*[!A-Za-z0-9._-]*)
    echo "error: invalid WAL segment name" >&2
    exit 1
    ;;
esac

pgdata=${PGDATA:-/var/lib/postgresql/data}
case "${source_path}" in
  /*) source=${source_path} ;;
  *) source=${pgdata}/${source_path} ;;
esac
if [ ! -f "${source}" ]; then
  echo "error: WAL source does not exist" >&2
  exit 1
fi

archive_dir=${POSTGRES_WAL_ARCHIVE_DIR:-/var/lib/postgresql/wal-archive}
mkdir -p "${archive_dir}"
temporary=$(mktemp "${archive_dir}/.${segment_name}.XXXXXX")
cleanup() {
  rm -f -- "${temporary}"
}
trap cleanup EXIT HUP INT TERM
cp -- "${source}" "${temporary}"
chmod 600 "${temporary}"
mv -f -- "${temporary}" "${archive_dir}/${segment_name}"
trap - EXIT HUP INT TERM

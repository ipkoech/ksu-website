-- Run once on first postgres container start.
-- Deprecated compatibility script. Compose now mounts
-- init-database-ownership.sh, which creates service roles, schemas, grants,
-- and object ownership. Keep this file only for older manual environments.

CREATE SCHEMA IF NOT EXISTS main;
CREATE SCHEMA IF NOT EXISTS research;
CREATE SCHEMA IF NOT EXISTS library;
CREATE SCHEMA IF NOT EXISTS heri;

GRANT ALL ON SCHEMA main     TO ksu;
GRANT ALL ON SCHEMA research TO ksu;
GRANT ALL ON SCHEMA library  TO ksu;

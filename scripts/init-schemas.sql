-- Run once on first postgres container start.
-- Creates the three service schemas inside the shared ksu database.

CREATE SCHEMA IF NOT EXISTS main;
CREATE SCHEMA IF NOT EXISTS research;
CREATE SCHEMA IF NOT EXISTS library;

GRANT ALL ON SCHEMA main     TO ksu;
GRANT ALL ON SCHEMA research TO ksu;
GRANT ALL ON SCHEMA library  TO ksu;

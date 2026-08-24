-- Migration: 0001_initial_schema
-- Created: 2026-08-24

-- Enable uuid-ossp extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────
-- Users
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- Photos
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  s3_key          TEXT NOT NULL,
  s3_key_sm       TEXT,
  s3_key_md       TEXT,
  filename        TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  file_size       BIGINT NOT NULL,
  width           INTEGER,
  height          INTEGER,
  taken_at        TIMESTAMPTZ,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'processing'
                    CHECK (status IN ('processing', 'ready', 'error')),
  camera_info     TEXT,
  gps_lat         DECIMAL(10, 8),
  gps_lng         DECIMAL(11, 8),
  gps_disclosed   BOOLEAN NOT NULL DEFAULT FALSE,
  duration_secs   INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS photos_user_taken_idx ON photos(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS photos_user_status_idx ON photos(user_id, status);

-- ──────────────────────────────────────────────
-- Albums
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS albums (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS albums_user_idx ON albums(user_id);

-- ──────────────────────────────────────────────
-- Album ↔ Photo (many-to-many)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS album_photos (
  album_id    UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  photo_id    UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (album_id, photo_id)
);

CREATE INDEX IF NOT EXISTS album_photos_photo_idx ON album_photos(photo_id);

-- ──────────────────────────────────────────────
-- Share links
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shares (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('photo', 'album')),
  target_id   UUID NOT NULL,
  expires_at  TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ,
  view_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shares_token_idx ON shares(token);
CREATE INDEX IF NOT EXISTS shares_user_idx ON shares(user_id);

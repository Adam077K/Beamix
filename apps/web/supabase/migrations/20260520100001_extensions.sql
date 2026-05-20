-- Migration: 20260520_01_extensions.sql
-- Purpose: Enable required PostgreSQL extensions for fresh Beamix v2 schema
-- Rollback: DROP EXTENSION IF EXISTS pg_trgm, "uuid-ossp", pgcrypto;

CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

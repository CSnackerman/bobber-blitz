SET
  statement_timeout = 0
;

SET
  lock_timeout = 0
;

SET
  idle_in_transaction_session_timeout = 0
;

SET
  client_encoding = 'UTF8'
;

SET
  standard_conforming_strings = on
;

SELECT
  pg_catalog.set_config ('search_path', '', false)
;

SET
  check_function_bodies = false
;

SET
  xmloption = content
;

SET
  client_min_messages = warning
;

SET
  row_security = off
;

CREATE EXTENSION IF NOT EXISTS "pgsodium"
WITH
  SCHEMA "pgsodium"
;

COMMENT ON SCHEMA "public" IS 'standard public schema'
;

CREATE EXTENSION IF NOT EXISTS "pg_graphql"
WITH
  SCHEMA "graphql"
;

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"
WITH
  SCHEMA "extensions"
;

CREATE EXTENSION IF NOT EXISTS "pgcrypto"
WITH
  SCHEMA "extensions"
;

CREATE EXTENSION IF NOT EXISTS "pgjwt"
WITH
  SCHEMA "extensions"
;

CREATE EXTENSION IF NOT EXISTS "supabase_vault"
WITH
  SCHEMA "vault"
;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
WITH
  SCHEMA "extensions"
;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres"
;

GRANT USAGE ON SCHEMA "public" TO "postgres"
;

GRANT USAGE ON SCHEMA "public" TO "anon"
;

GRANT USAGE ON SCHEMA "public" TO "authenticated"
;

GRANT USAGE ON SCHEMA "public" TO "service_role"
;

-- create utility functions

create or replace
function public.getRandInt(low bigint, high bigint)
returns bigint 
as $$
begin
    return floor(random() * (high + 1 - low) + low)::bigint;
end;
$$
language plpgsql;


create or replace
function public.getRandDouble(low double precision, high double precision)
returns double precision
as $$
begin
    return random() * (high - low) + low;
end;
$$
language plpgsql;
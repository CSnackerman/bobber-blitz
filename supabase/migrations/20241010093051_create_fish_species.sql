create table
  "public"."fish_species" (
    "id" smallint generated by default as identity not null,
    "name" character varying not null,
    "min_length_meters" double precision not null,
    "max_length_meters" double precision not null,
    "min_weight_kg" double precision not null,
    "max_weight_kg" double precision not null,
    "min_hp" integer not null,
    "max_hp" integer not null,
    "mag_chance" double precision not null,
    "power" double precision not null,
    "snap" double precision not null
  )
;

CREATE UNIQUE INDEX fish_species_pkey ON public.fish_species USING btree (id)
;

alter table "public"."fish_species"
add constraint "fish_species_pkey" PRIMARY KEY using index "fish_species_pkey"
;

grant delete on table "public"."fish_species" to "anon"
;

grant insert on table "public"."fish_species" to "anon"
;

grant references on table "public"."fish_species" to "anon"
;

grant
select
  on table "public"."fish_species" to "anon"
;

grant trigger on table "public"."fish_species" to "anon"
;

grant
truncate on table "public"."fish_species" to "anon"
;

grant
update on table "public"."fish_species" to "anon"
;

grant delete on table "public"."fish_species" to "authenticated"
;

grant insert on table "public"."fish_species" to "authenticated"
;

grant references on table "public"."fish_species" to "authenticated"
;

grant
select
  on table "public"."fish_species" to "authenticated"
;

grant trigger on table "public"."fish_species" to "authenticated"
;

grant
truncate on table "public"."fish_species" to "authenticated"
;

grant
update on table "public"."fish_species" to "authenticated"
;

grant delete on table "public"."fish_species" to "service_role"
;

grant insert on table "public"."fish_species" to "service_role"
;

grant references on table "public"."fish_species" to "service_role"
;

grant
select
  on table "public"."fish_species" to "service_role"
;

grant trigger on table "public"."fish_species" to "service_role"
;

grant
truncate on table "public"."fish_species" to "service_role"
;

grant
update on table "public"."fish_species" to "service_role"
;
set search_path to public;

create
or replace function spawn_fish (user_id uuid) returns fish_instance as $$
declare
    new_fish            fish_instance%rowtype;
    species_id          int2;
    species             fish_species%rowtype;
    length_m            double precision;
    weight_kg           double precision;
    hp                  integer;
begin
    set local search_path to public;

    -- select random species
    species_id = getRandInt(1, (select max(id) from fish_species))::int2;
    select * into species from fish_species where id = species_id;

    -- assign random properties within species params
    length_m = getRandDouble(species.min_length_meters, species.max_length_meters);
    weight_kg = getRandDouble(species.min_weight_kg, species.max_weight_kg);
    hp = getRandDouble(species.min_hp, species.max_hp);

    -- insert and return record
    insert into fish_instance (user_id, species_id, length_meters, weight_kg, hp)
    values (
        user_id,
        species_id,
        length_m,
        weight_kg,
        hp
    )
    returning * into new_fish;

    return new_fish;
end;
$$ language plpgsql
;
create table public.fish_instance (
  id bigserial primary key,
  user_id uuid references auth.users (id),
  species_id smallint references public.fish_species,
  length_meters double precision not null,
  weight_kg double precision not null,
  hp integer not null,
  hookedAt timestamptz default current_timestamp,
  caughtAt timestamptz default null,
  escaped boolean default false
);

create or replace 
function public.check_valid_fish_instance() 
returns trigger 
language plpgsql 
as $$
declare species record;
begin
  select * into species 
  from public.fish_species 
  where id = new.species_id;

  -- check length
  if new.length_meters < species.min_length_meters 
  or new.length_meters > species.max_length_meters 
  then
    raise exception 
      '% length must be between % and % meters', 
      species.name,
      species.min_length_meters, 
      species.max_length_meters;
  end if;

  -- check weight
  if new.weight_kg < species.min_weight_kg
  or new.weight_kg > species.max_weight_kg
  then
    raise exception
      '% weight must be between % and % kg',
      species.name,
      species.min_weight_kg,
      species.max_weight_kg;
  end if;

  -- check hp
  if new.hp < species.min_hp
  or new.hp > species.max_hp
  then
    raise exception
      '% hp must be between % and % kg',
      species.name,
      species.min_hp,
      species.max_hp;
  end if;

  return new;
end;
$$;

commit;

create trigger fish_instance_before_insert
before insert
on public.fish_instance
for each row
execute function public.check_valid_fish_instance();
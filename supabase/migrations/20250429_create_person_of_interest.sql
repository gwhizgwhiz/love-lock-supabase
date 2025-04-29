create table public.person_of_interest (
  id uuid not null default gen_random_uuid (),
  main_alias text not null,
  known_region text null,
  platforms text[] null,
  photo_reference_url text null,
  created_by uuid null,
  created_at timestamp with time zone null default now(),
  trust_score integer null default 0,
  manual_override_score integer null,
  trust_badge text null,
  is_shareable boolean null default false,
  slug text null,
  updated_at timestamp without time zone null default now(),
  is_deleted boolean null default false,
  constraint person_of_interest_pkey primary key (id),
  constraint person_of_interest_slug_key unique (slug),
  constraint poi_unique_user unique (created_by),
  constraint unique_slug unique (slug),
  constraint person_of_interest_created_by_fkey foreign KEY (created_by) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_poi_slug on public.person_of_interest using btree (slug) TABLESPACE pg_default;

create trigger trg_generate_poi_slug BEFORE INSERT
or
update on person_of_interest for EACH row
execute FUNCTION generate_poi_slug ();
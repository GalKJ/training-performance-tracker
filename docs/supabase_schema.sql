-- Training Performance Tracker v1 schema
-- Run this in your Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists lift_entries (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises(id) on delete cascade,
  weight_kg numeric(6,2) not null check (weight_kg > 0),
  reps int not null check (reps > 0),
  performed_at timestamptz not null,
  notes text,
  -- Total time for the entry, in seconds. Null when the entry was untimed.
  duration_seconds numeric(8,2) check (duration_seconds is null or duration_seconds > 0),
  -- Ordered split times, in seconds, e.g. [92.5, 88, 95].
  split_seconds jsonb,
  created_at timestamptz not null default now()
);

-- Existing databases: add the timing columns in place.
alter table lift_entries
  add column if not exists duration_seconds numeric(8,2),
  add column if not exists split_seconds jsonb;

create index if not exists idx_lift_entries_exercise_id on lift_entries(exercise_id);
create index if not exists idx_lift_entries_performed_at on lift_entries(performed_at desc);

create or replace view exercise_stats as
select
  e.id,
  e.name,
  max(le.weight_kg) as max_weight_kg,
  max(le.performed_at) as last_session_at,
  count(le.id) as total_entries
from exercises e
left join lift_entries le on le.exercise_id = e.id
group by e.id, e.name;

-- v1 is single-user/no-auth; keep RLS off until auth is introduced.
alter table exercises disable row level security;
alter table lift_entries disable row level security;

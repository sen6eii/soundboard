-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ── Tables ────────────────────────────────────────────────────────────────────

create table boards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  name         text not null,
  description  text default '',
  accent_color text default '#c8ff57',
  context      jsonb default '{"vibes": []}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table board_refs (
  id                uuid primary key default gen_random_uuid(),
  board_id          uuid references boards(id) on delete cascade not null,
  user_id           uuid references auth.users not null,
  type              text not null check (type in ('audio', 'link')),
  title             text not null,
  -- audio
  file_name         text,
  audio_storage_key text,
  duration          float,
  -- link
  url               text,
  platform          text,
  thumbnail_url     text,
  embed_id          text,
  -- common
  tags              text[] default '{}',
  note              text default '',
  color             text default '#c8ff57',
  annotations       jsonb default '[]',
  created_at        timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table boards enable row level security;
alter table board_refs enable row level security;

create policy "own boards"
  on boards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own refs"
  on board_refs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Storage RLS (run after creating the 'audio' bucket) ───────────────────────

create policy "upload own audio"
  on storage.objects for insert
  with check (bucket_id = 'audio' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "read own audio"
  on storage.objects for select
  using (bucket_id = 'audio' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "delete own audio"
  on storage.objects for delete
  using (bucket_id = 'audio' and auth.uid()::text = (storage.foldername(name))[1]);

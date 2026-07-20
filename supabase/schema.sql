create extension if not exists "pgcrypto";

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('douyin', 'video_account', 'youtube')),
  source_type text not null default 'manual' check (source_type in ('auto', 'manual')),
  url text not null,
  title text not null,
  author text,
  cover_url text,
  stats jsonb,
  content_note text,
  ai_summary jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  is_favorite boolean not null default false,
  submitted_by text,
  published_at timestamptz,
  collected_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists videos_collected_date_idx on videos (collected_date desc);
create index if not exists videos_platform_idx on videos (platform);
create unique index if not exists videos_url_unique_idx on videos (url);

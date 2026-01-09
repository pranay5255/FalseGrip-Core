-- FalseGrip core schema (Postgres)
-- This file is mounted into the Postgres container on first boot.

create extension if not exists pgcrypto;

create type coaching_style as enum ('supportive', 'strict', 'balanced');
create type diet_stance as enum ('vegetarian', 'vegan', 'non_veg', 'no_preference');
create type primary_goal as enum ('fat_loss', 'muscle_gain', 'performance', 'general_health');
create type chat_mode as enum ('qna', 'science', 'calories');
create type message_role as enum ('user', 'assistant', 'system');
create type attachment_kind as enum ('image');

create table coaches (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_configs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id),
  name text not null,
  description text,
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table client_config_versions (
  id uuid primary key default gen_random_uuid(),
  config_id uuid not null references client_configs(id),
  version int not null,
  coaching_style coaching_style not null,
  diet_stance diet_stance not null,
  primary_goal primary_goal not null,
  enabled_modes chat_mode[] not null default '{}',
  custom_instructions text,
  constraints jsonb not null default '{}'::jsonb,
  non_negotiables jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (config_id, version)
);

alter table client_configs
  add constraint client_configs_current_version_fk
  foreign key (current_version_id)
  references client_config_versions(id);

create table clients (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id),
  active_config_id uuid references client_configs(id),
  active_config_version_id uuid references client_config_versions(id),
  client_code text unique not null,
  name text,
  phone text,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_active_at timestamptz,
  deleted_at timestamptz
);

create table client_config_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  config_id uuid not null references client_configs(id),
  config_version_id uuid references client_config_versions(id),
  active_from timestamptz not null default now(),
  active_to timestamptz
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  config_id uuid not null references client_configs(id),
  config_version_id uuid references client_config_versions(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  message_count int not null default 0
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id),
  role message_role not null,
  mode chat_mode not null,
  content text not null,
  created_at timestamptz not null default now(),
  tokens_in int,
  tokens_out int,
  metadata jsonb not null default '{}'::jsonb
);

create table message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id),
  kind attachment_kind not null,
  url text,
  storage_key text,
  mime_type text,
  size_bytes int,
  width int,
  height int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references coaches(id),
  client_id uuid references clients(id),
  config_id uuid references client_configs(id),
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table analytics_daily (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references coaches(id),
  config_id uuid references client_configs(id),
  day date not null,
  message_count int not null default 0,
  unique_clients int not null default 0,
  mode_counts jsonb not null default '{}'::jsonb,
  unique (coach_id, config_id, day)
);

create index client_configs_coach_updated_idx on client_configs (coach_id, updated_at desc);
create index client_config_versions_config_idx on client_config_versions (config_id, version desc);
create index clients_coach_last_active_idx on clients (coach_id, last_active_at desc);
create index client_config_assignments_client_active_idx on client_config_assignments (client_id) where active_to is null;
create index conversations_client_started_idx on conversations (client_id, started_at desc);
create index messages_conversation_created_idx on messages (conversation_id, created_at desc);
create index analytics_events_client_created_idx on analytics_events (client_id, created_at desc);
create index message_attachments_message_idx on message_attachments (message_id);

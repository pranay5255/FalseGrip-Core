create table if not exists client_configs (
  client_id text primary key,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists client_configs_updated_at_idx
  on client_configs (updated_at desc);

-- Nexus 2.0: Supabase schema, tenant ownership, and RLS policies.
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- owner_id stores the Supabase auth user UUID as text for cross-database compatibility.

create table if not exists public.workspaces (
    id serial primary key,
    owner_id text not null unique,
    company_name varchar(255) not null,
    primary_product varchar(255),
    industry varchar(100),
    user_name varchar(255) not null default 'Executive User',
    user_role varchar(255) not null default 'CEO & Founder',
    authority_level varchar(50) not null default 'LEVEL_4_EXECUTIVE',
    cloud_docs_link varchar(500),
    company_structure text,
    database_extracted jsonb,
    last_synced_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.departments (
    id serial primary key,
    workspace_id integer references public.workspaces(id) on delete cascade,
    name varchar(100) not null,
    code varchar(50) not null,
    description varchar(500),
    agent_type varchar(50) not null,
    created_at timestamptz not null default now()
);

create table if not exists public.decision_audits (
    id varchar(100) primary key,
    owner_id text not null,
    product_id varchar(50) not null default 'P100',
    trigger_event varchar(255) not null,
    deficit_units integer not null default 0,
    total_cost double precision not null default 0,
    total_upfront_cash double precision not null default 0,
    mathematical_feasibility boolean not null default true,
    optimization_proof text,
    allocation_plan jsonb,
    reviewer_action varchar(50) not null default 'PENDING',
    reviewer_notes text,
    created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
    id varchar(100) primary key,
    owner_id text not null,
    session_id varchar(100) not null,
    role varchar(50) not null,
    content text not null,
    thinking text,
    model_used varchar(100),
    created_at timestamptz not null default now()
);

create index if not exists idx_workspaces_owner on public.workspaces(owner_id);
create index if not exists idx_departments_workspace on public.departments(workspace_id);
create index if not exists idx_decisions_owner on public.decision_audits(owner_id);
create index if not exists idx_chat_owner_session on public.chat_messages(owner_id, session_id);

alter table public.workspaces enable row level security;
alter table public.departments enable row level security;
alter table public.decision_audits enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "workspace_owner_select" on public.workspaces;
create policy "workspace_owner_select" on public.workspaces
    for select using (auth.uid()::text = owner_id);

drop policy if exists "workspace_owner_insert" on public.workspaces;
create policy "workspace_owner_insert" on public.workspaces
    for insert with check (auth.uid()::text = owner_id);

drop policy if exists "workspace_owner_update" on public.workspaces;
create policy "workspace_owner_update" on public.workspaces
    for update using (auth.uid()::text = owner_id)
    with check (auth.uid()::text = owner_id);

drop policy if exists "workspace_owner_delete" on public.workspaces;
create policy "workspace_owner_delete" on public.workspaces
    for delete using (auth.uid()::text = owner_id);

drop policy if exists "departments_owner_select" on public.departments;
create policy "departments_owner_select" on public.departments
    for select using (
        exists (
            select 1 from public.workspaces w
            where w.id = departments.workspace_id
              and w.owner_id = auth.uid()::text
        )
    );

drop policy if exists "departments_owner_insert" on public.departments;
create policy "departments_owner_insert" on public.departments
    for insert with check (
        exists (
            select 1 from public.workspaces w
            where w.id = departments.workspace_id
              and w.owner_id = auth.uid()::text
        )
    );

drop policy if exists "departments_owner_update" on public.departments;
create policy "departments_owner_update" on public.departments
    for update using (
        exists (
            select 1 from public.workspaces w
            where w.id = departments.workspace_id
              and w.owner_id = auth.uid()::text
        )
    )
    with check (
        exists (
            select 1 from public.workspaces w
            where w.id = departments.workspace_id
              and w.owner_id = auth.uid()::text
        )
    );

drop policy if exists "departments_owner_delete" on public.departments;
create policy "departments_owner_delete" on public.departments
    for delete using (
        exists (
            select 1 from public.workspaces w
            where w.id = departments.workspace_id
              and w.owner_id = auth.uid()::text
        )
    );

drop policy if exists "decision_owner_select" on public.decision_audits;
create policy "decision_owner_select" on public.decision_audits
    for select using (auth.uid()::text = owner_id);

drop policy if exists "decision_owner_insert" on public.decision_audits;
create policy "decision_owner_insert" on public.decision_audits
    for insert with check (auth.uid()::text = owner_id);

drop policy if exists "decision_owner_update" on public.decision_audits;
create policy "decision_owner_update" on public.decision_audits
    for update using (auth.uid()::text = owner_id)
    with check (auth.uid()::text = owner_id);

drop policy if exists "decision_owner_delete" on public.decision_audits;
create policy "decision_owner_delete" on public.decision_audits
    for delete using (auth.uid()::text = owner_id);

drop policy if exists "chat_owner_select" on public.chat_messages;
create policy "chat_owner_select" on public.chat_messages
    for select using (auth.uid()::text = owner_id);

drop policy if exists "chat_owner_insert" on public.chat_messages;
create policy "chat_owner_insert" on public.chat_messages
    for insert with check (auth.uid()::text = owner_id);

drop policy if exists "chat_owner_update" on public.chat_messages;
create policy "chat_owner_update" on public.chat_messages
    for update using (auth.uid()::text = owner_id)
    with check (auth.uid()::text = owner_id);

drop policy if exists "chat_owner_delete" on public.chat_messages;
create policy "chat_owner_delete" on public.chat_messages
    for delete using (auth.uid()::text = owner_id);

revoke all on public.workspaces from anon;
revoke all on public.departments from anon;
revoke all on public.decision_audits from anon;
revoke all on public.chat_messages from anon;

grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.departments to authenticated;
grant select, insert, update, delete on public.decision_audits to authenticated;
grant select, insert, update, delete on public.chat_messages to authenticated;
grant usage, select on sequence public.workspaces_id_seq to authenticated;
grant usage, select on sequence public.departments_id_seq to authenticated;

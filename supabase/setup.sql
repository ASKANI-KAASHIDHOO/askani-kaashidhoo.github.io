-- ASKANI KAASHIDHOO — database setup
-- Paste this whole file into Supabase → SQL Editor → New query, then click Run.
-- Before running, change the email on the last line to your admin email.

-- Records (dhauraa and dharus)
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('dhauraa', 'dharus')),
  title text not null,
  arabic text,
  date date not null,
  time text,
  place text,
  speaker text,
  topic text,
  participants integer check (participants >= 0),
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Who is allowed to add, edit and delete records.
-- Nobody can read or change this table from the website; manage it here in the SQL Editor.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Access rules
alter table public.records enable row level security;

grant select on public.records to anon, authenticated;
grant insert, update, delete on public.records to authenticated;

-- Everyone can read for now. To password-protect the site later, this is the policy to change.
drop policy if exists "Anyone can read records" on public.records;
create policy "Anyone can read records" on public.records
  for select using (true);

drop policy if exists "Admins can add records" on public.records;
create policy "Admins can add records" on public.records
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can edit records" on public.records;
create policy "Admins can edit records" on public.records
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete records" on public.records;
create policy "Admins can delete records" on public.records
  for delete to authenticated using (public.is_admin());

-- Keep updated_at current
create or replace function public.touch_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists records_updated_at on public.records;
create trigger records_updated_at
  before update on public.records
  for each row execute function public.touch_updated_at();

-- Admins: use the same email(s) you add under Authentication → Users.
-- To add more admins later, run another insert like this one.
insert into public.admins (email) values ('YOUR-EMAIL@example.com') on conflict do nothing;

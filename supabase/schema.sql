-- Run this in Supabase SQL Editor (Project -> SQL) as an admin.
-- Safe to run multiple times (idempotent-ish via existence checks where possible).

-- 1) Enums
create type public.user_role as enum ('student','mentor');
create type public.session_status as enum ('pending','upcoming','completed','cancelled');
create type public.request_status as enum ('pending','accepted','declined');

-- 2) Profiles (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  country text,
  bio text,
  profile_image_url text,
  role public.user_role not null default 'student',
  is_admin boolean not null default false,
  is_active boolean not null default true,
  deactivated_reason text,
  created_at timestamptz not null default now()
);

-- 3) Mentor details
create table if not exists public.mentor_skills (
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  skill text not null,
  created_at timestamptz not null default now(),
  primary key (mentor_id, skill)
);

create table if not exists public.mentor_languages (
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  language text not null,
  created_at timestamptz not null default now(),
  primary key (mentor_id, language)
);

create table if not exists public.mentor_availability (
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  primary key (mentor_id, day_of_week, start_time, end_time)
);

-- 4) Sessions and requests
create table if not exists public.session_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  time time not null,
  topic text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists session_requests_mentor_idx on public.session_requests (mentor_id, status, date, time);
create index if not exists session_requests_student_idx on public.session_requests (student_id, status, date, time);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  time time not null,
  status public.session_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists sessions_student_idx on public.sessions (student_id, status, date, time);
create index if not exists sessions_mentor_idx on public.sessions (mentor_id, status, date, time);

-- 5) Chats and messages
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (mentor_id, student_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_chat_idx on public.messages (chat_id, created_at desc);

-- 6) Trigger to update chats on message insert
create or replace function public.fn_update_chat_on_message() returns trigger as $$
begin
  update public.chats
  set last_message = new.text,
      last_message_at = new.created_at
  where id = new.chat_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_chat_on_message on public.messages;
create trigger trg_update_chat_on_message
after insert on public.messages
for each row execute function public.fn_update_chat_on_message();

-- 7) RLS enable
alter table public.profiles enable row level security;
alter table public.mentor_skills enable row level security;
alter table public.mentor_languages enable row level security;
alter table public.mentor_availability enable row level security;
alter table public.session_requests enable row level security;
alter table public.sessions enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- 8) Policies
-- Profiles
drop policy if exists "Public read mentor profiles" on public.profiles;
create policy "Public read mentor profiles" on public.profiles
for select
using (true);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
for select to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update to authenticated
using (auth.uid() = id) with check (auth.uid() = id);

-- Admin full access on profiles
drop policy if exists "Admin full access profiles" on public.profiles;
create policy "Admin full access profiles" on public.profiles
for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Mentor skills/languages/availability: public select, mentor owner write
drop policy if exists "Public select mentor_skills" on public.mentor_skills;
create policy "Public select mentor_skills" on public.mentor_skills for select using (true);
drop policy if exists "Mentor owns mentor_skills" on public.mentor_skills;
create policy "Mentor owns mentor_skills" on public.mentor_skills for all to authenticated using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

drop policy if exists "Admin full access mentor_skills" on public.mentor_skills;
create policy "Admin full access mentor_skills" on public.mentor_skills for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "Public select mentor_languages" on public.mentor_languages;
create policy "Public select mentor_languages" on public.mentor_languages for select using (true);
drop policy if exists "Mentor owns mentor_languages" on public.mentor_languages;
create policy "Mentor owns mentor_languages" on public.mentor_languages for all to authenticated using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

drop policy if exists "Admin full access mentor_languages" on public.mentor_languages;
create policy "Admin full access mentor_languages" on public.mentor_languages for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "Public select mentor_availability" on public.mentor_availability;
create policy "Public select mentor_availability" on public.mentor_availability for select using (true);
drop policy if exists "Mentor owns mentor_availability" on public.mentor_availability;
create policy "Mentor owns mentor_availability" on public.mentor_availability for all to authenticated using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

drop policy if exists "Admin full access mentor_availability" on public.mentor_availability;
create policy "Admin full access mentor_availability" on public.mentor_availability for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- Session requests
drop policy if exists "Student can create requests" on public.session_requests;
create policy "Student can create requests" on public.session_requests
for insert to authenticated
with check (auth.uid() = student_id);

drop policy if exists "Participants can select requests" on public.session_requests;
create policy "Participants can select requests" on public.session_requests
for select to authenticated
using (auth.uid() = student_id or auth.uid() = mentor_id);

drop policy if exists "Admin full access session_requests" on public.session_requests;
create policy "Admin full access session_requests" on public.session_requests for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

drop policy if exists "Mentor can update own requests" on public.session_requests;
create policy "Mentor can update own requests" on public.session_requests
for update to authenticated
using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);

-- Sessions
drop policy if exists "Participants can insert sessions" on public.sessions;
create policy "Participants can insert sessions" on public.sessions
for insert to authenticated
with check (auth.uid() = student_id or auth.uid() = mentor_id);

drop policy if exists "Participants can select sessions" on public.sessions;
create policy "Participants can select sessions" on public.sessions
for select to authenticated
using (auth.uid() = student_id or auth.uid() = mentor_id);

drop policy if exists "Participants can update sessions" on public.sessions;
create policy "Participants can update sessions" on public.sessions
for update to authenticated
using (auth.uid() = student_id or auth.uid() = mentor_id)
with check (auth.uid() = student_id or auth.uid() = mentor_id);

drop policy if exists "Admin full access sessions" on public.sessions;
create policy "Admin full access sessions" on public.sessions for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- Chats
drop policy if exists "Participants can upsert chats" on public.chats;
create policy "Participants can upsert chats" on public.chats
for insert to authenticated
with check (auth.uid() = mentor_id or auth.uid() = student_id);

drop policy if exists "Participants can select chats" on public.chats;
create policy "Participants can select chats" on public.chats
for select to authenticated
using (auth.uid() = mentor_id or auth.uid() = student_id);

drop policy if exists "Admin full access chats" on public.chats;
create policy "Admin full access chats" on public.chats for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- Messages
drop policy if exists "Participants can insert messages" on public.messages;
create policy "Participants can insert messages" on public.messages
for insert to authenticated
with check (exists (
  select 1 from public.chats c where c.id = chat_id and (c.mentor_id = auth.uid() or c.student_id = auth.uid())
));

drop policy if exists "Participants can select messages" on public.messages;
create policy "Participants can select messages" on public.messages
for select to authenticated
using (exists (
  select 1 from public.chats c where c.id = chat_id and (c.mentor_id = auth.uid() or c.student_id = auth.uid())
));

drop policy if exists "Admin full access messages" on public.messages;
create policy "Admin full access messages" on public.messages for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

-- 9) Optional: view to simplify mentor listing with arrays
create or replace view public.view_mentors as
select p.id,
       p.name,
       p.country,
       p.bio,
       p.profile_image_url,
       array(select ms.skill from public.mentor_skills ms where ms.mentor_id = p.id order by ms.skill) as skills,
       array(select ml.language from public.mentor_languages ml where ml.mentor_id = p.id order by ml.language) as languages
from public.profiles p
where p.role = 'mentor' and p.is_active = true;

-- 10) Helpful indexes for mentor discovery
create index if not exists idx_profiles_role_country on public.profiles (role, country);
create index if not exists idx_mentor_skills_skill on public.mentor_skills using gin ((skill));

-- 11) Notes
-- - Enable Realtime for: messages, chats, session_requests, sessions via Dashboard > Database > Replication.
-- - Create a public Storage bucket named `profiles` and restrict writes to user-owned paths.



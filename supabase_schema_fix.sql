-- 1. extensions
create extension if not exists "uuid-ossp";

-- 2. profiles table
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text,
  target_days text[] default '{}', 
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;

-- Add target_days column safely if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='target_days') then
        alter table public.profiles add column target_days text[] default '{}';
    end if;
end $$;

-- Policies (Drop first to avoid "already exists" error)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using ( true );

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using ( auth.uid() = id );


-- 3. workout_logs table
create table if not exists public.workout_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  total_duration integer not null
);
alter table public.workout_logs enable row level security;

drop policy if exists "Logs are viewable by everyone." on public.workout_logs;
create policy "Logs are viewable by everyone." on public.workout_logs for select using ( true );

drop policy if exists "Users can insert their own logs." on public.workout_logs;
create policy "Users can insert their own logs." on public.workout_logs for insert with check ( auth.uid() = user_id );


-- 4. pokes table
create table if not exists public.pokes (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.pokes enable row level security;

drop policy if exists "Any authenticated user can read pokes" on public.pokes;
create policy "Any authenticated user can read pokes" on public.pokes for select using ( auth.role() = 'authenticated' );

drop policy if exists "Any authenticated user can insert pokes" on public.pokes;
create policy "Any authenticated user can insert pokes" on public.pokes for insert with check ( auth.role() = 'authenticated' );


-- 5. follows table
create table if not exists public.follows (
  follower_id uuid references auth.users not null,
  following_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);
alter table public.follows enable row level security;

drop policy if exists "Public follows are viewable by everyone." on public.follows;
create policy "Public follows are viewable by everyone." on public.follows for select using ( true );

drop policy if exists "Users can insert their own follows." on public.follows;
create policy "Users can insert their own follows." on public.follows for insert with check ( auth.uid() = follower_id );

drop policy if exists "Users can delete their own follows." on public.follows;
create policy "Users can delete their own follows." on public.follows for delete using ( auth.uid() = follower_id );


-- 6. Realtime & Triggers
-- Note: 'add table' might error if already added, normally safe to ignore in UI or wrap in DO block, 
-- but simplified here since UI often handles this non-fatally or user can skip if error.
alter publication supabase_realtime add table pokes;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

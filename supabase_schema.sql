-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- WORKOUT LOGS
create table public.workout_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  total_duration integer not null -- in seconds
);

alter table public.workout_logs enable row level security;

create policy "Logs are viewable by everyone."
  on public.workout_logs for select
  using ( true );

create policy "Users can insert their own logs."
  on public.workout_logs for insert
  with check ( auth.uid() = user_id );

-- POKES (Social Interactions)
create table public.pokes (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.pokes enable row level security;

create policy "Any authenticated user can read pokes"
  on public.pokes for select
  using ( auth.role() = 'authenticated' );

create policy "Any authenticated user can insert pokes"
  on public.pokes for insert
  with check ( auth.role() = 'authenticated' );

-- Set up Realtime for pokes
alter publication supabase_realtime add table pokes;

-- Follows table for friend relationships
create table follows (
  follower_id uuid references auth.users not null,
  following_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- RLS Policies
alter table follows enable row level security;

create policy "Public follows are viewable by everyone."
  on follows for select
  using ( true );

create policy "Users can insert their own follows."
  on follows for insert
  with check ( auth.uid() = follower_id );

create policy "Users can delete their own follows."
  on follows for delete
  using ( auth.uid() = follower_id );

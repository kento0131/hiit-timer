-- Add push_subscription column to profiles
alter table public.profiles 
add column if not exists push_subscription jsonb;

-- Policy to allow users to update their own subscription
create policy "Users can update their own push subscription"
on public.profiles
for update
using ( auth.uid() = id )
with check ( auth.uid() = id );

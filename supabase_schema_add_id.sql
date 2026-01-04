-- Add custom_id column to profiles table
-- This ID will be used for searching friends (e.g. @kento_001)

alter table profiles 
add column if not exists custom_id text;

-- Add unique constraint to ensure no two users have the same ID
alter table profiles 
add constraint profiles_custom_id_key unique (custom_id);

-- Optional: Create an index for faster searching
create index if not exists profiles_custom_id_idx on profiles (custom_id);

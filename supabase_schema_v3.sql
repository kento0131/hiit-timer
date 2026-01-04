-- Add target_days column to profiles table
alter table profiles 
add column if not exists target_days text[] default '{}';

-- Example of how data will be stored: ['Mon', 'Wed', 'Fri']

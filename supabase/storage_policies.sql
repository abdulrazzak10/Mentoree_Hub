-- Storage policies for `profiles` bucket
-- Run in Supabase SQL editor after creating the `profiles` bucket

-- Allow public read (if bucket is set to public, select is already allowed). Keeping explicit select for clarity.
drop policy if exists "Public read profiles bucket" on storage.objects;
create policy "Public read profiles bucket" on storage.objects
for select using (bucket_id = 'profiles');

-- Allow authenticated users to upload only to their own folder: <user_id>/...
drop policy if exists "Users can insert into own folder in profiles" on storage.objects;
create policy "Users can insert into own folder in profiles" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profiles'
  and name like (auth.uid()::text || '/%')
);

-- Allow updates (used by upsert) only within own folder
drop policy if exists "Users can update own files in profiles" on storage.objects;
create policy "Users can update own files in profiles" on storage.objects
for update to authenticated
using (
  bucket_id = 'profiles'
  and name like (auth.uid()::text || '/%')
)
with check (
  bucket_id = 'profiles'
  and name like (auth.uid()::text || '/%')
);

-- Optional: allow users to delete their own files
drop policy if exists "Users can delete own files in profiles" on storage.objects;
create policy "Users can delete own files in profiles" on storage.objects
for delete to authenticated
using (
  bucket_id = 'profiles'
  and name like (auth.uid()::text || '/%')
);



create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('diego', 'paola')),
  name text not null,
  link text not null,
  image text not null,
  created_at timestamptz not null default now()
);

alter table wishlist_items enable row level security;

drop policy if exists "Anyone can read wishlist items" on wishlist_items;
create policy "Anyone can read wishlist items"
on wishlist_items for select
using (true);

drop policy if exists "Anyone can add wishlist items" on wishlist_items;
create policy "Anyone can add wishlist items"
on wishlist_items for insert
with check (true);

drop policy if exists "Anyone can delete wishlist items" on wishlist_items;
create policy "Anyone can delete wishlist items"
on wishlist_items for delete
using (true);

create table if not exists wishlist_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into wishlist_settings (key, value)
values ('active_theme', 'guava')
on conflict (key) do nothing;

alter table wishlist_settings enable row level security;

drop policy if exists "Anyone can read wishlist settings" on wishlist_settings;
create policy "Anyone can read wishlist settings"
on wishlist_settings for select
using (true);

drop policy if exists "Anyone can update wishlist settings" on wishlist_settings;
create policy "Anyone can update wishlist settings"
on wishlist_settings for update
using (true)
with check (true);

drop policy if exists "Anyone can add wishlist settings" on wishlist_settings;
create policy "Anyone can add wishlist settings"
on wishlist_settings for insert
with check (true);

do $$
begin
  alter publication supabase_realtime add table wishlist_items;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table wishlist_settings;
exception
  when duplicate_object then null;
end $$;

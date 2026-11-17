-- Saved articles: per-user snapshot of a conversion result, owner-only access.
create table public.saved_articles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  author text not null default '',
  site text not null default '',
  url text not null,
  markdown text not null,
  saved_at timestamptz not null default now(),
  primary key (id),
  -- One saved article per user and source URL; re-saving overwrites it.
  unique (user_id, url)
);

create index saved_articles_user_saved_at_idx
  on public.saved_articles (user_id, saved_at desc);

alter table public.saved_articles enable row level security;

grant select, insert, update on public.saved_articles to authenticated;

create policy "saved_articles_select_own" on public.saved_articles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "saved_articles_insert_own" on public.saved_articles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "saved_articles_update_own" on public.saved_articles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

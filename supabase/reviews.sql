-- MEGURU: 取引レビュー用テーブル（Supabase SQL エディタで実行）
-- 実行後: Table Editor → messages が Realtime に載っているか確認（Database → Replication）

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  chat_id uuid not null references public.chats (id) on delete cascade,
  item_id uuid references public.items (id) on delete set null,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  reviewee_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  unique (chat_id, reviewer_id)
);

create index if not exists reviews_reviewee_id_idx on public.reviews (reviewee_id);

alter table public.reviews enable row level security;

create policy "reviews_select_authenticated"
  on public.reviews for select
  to authenticated
  using (true);

create policy "reviews_insert_as_reviewer"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = reviewer_id);

-- メッセージのリアルタイム未読バッジ用（未設定の場合）
-- alter publication supabase_realtime add table public.messages;

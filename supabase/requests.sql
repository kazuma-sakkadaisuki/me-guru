-- 欲しいものリクエスト（Supabase SQL Editor で実行、またはマイグレーションとして利用）
-- 既存の chats が item_id NOT NULL の場合は、下記の ALTER の後にチャット用 RLS を調整してください。

create table if not exists public.requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  category text not null,
  description text not null,
  area text not null,
  "希望価格" text,
  "希望時期" text,
  is_closed boolean not null default false,
  created_at timestamp with time zone default now()
);

-- 既存テーブル向け（新規 create には上記を含む）
alter table public.requests add column if not exists is_closed boolean not null default false;

alter table public.requests enable row level security;

drop policy if exists "全員が参照できる" on public.requests;
create policy "全員が参照できる" on public.requests for select using (true);

drop policy if exists "自分のリクエストを作成" on public.requests;
create policy "自分のリクエストを作成" on public.requests for insert with check (auth.uid() = user_id);

drop policy if exists "自分のリクエストを削除" on public.requests;
create policy "自分のリクエストを削除" on public.requests for delete using (auth.uid() = user_id);

drop policy if exists "自分のリクエストを更新" on public.requests;
create policy "自分のリクエストを更新" on public.requests
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- リクエスト経由のチャット: item_id を NULL 許可 + request_id を追加
alter table public.chats add column if not exists request_id uuid references public.requests(id) on delete cascade;

alter table public.chats alter column item_id drop not null;

alter table public.chats drop constraint if exists chats_item_or_request;
alter table public.chats add constraint chats_item_or_request check (
  (item_id is not null and request_id is null)
  or (item_id is null and request_id is not null)
);

-- チャット INSERT 例（既存ポリシーと競合する場合は調整）
-- 購入希望者(buyer)が、リクエスト投稿者(seller)宛てにスレッドを作る想定
drop policy if exists "リクエスト経由チャットを作成" on public.chats;
create policy "リクエスト経由チャットを作成" on public.chats for insert
with check (
  auth.uid() = buyer_id
  and request_id is not null
  and item_id is null
  and exists (
    select 1 from public.requests r
    where r.id = request_id and r.user_id = seller_id
  )
);

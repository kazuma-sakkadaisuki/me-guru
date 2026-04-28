-- 求む掲示板：取引完了で is_closed を立てる
alter table public.requests add column if not exists is_closed boolean not null default false;

drop policy if exists "自分のリクエストを更新" on public.requests;
create policy "自分のリクエストを更新" on public.requests
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

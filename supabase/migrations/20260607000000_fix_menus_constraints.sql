-- menus.name に UNIQUE 制約を追加（onConflict("name") の動作に必須）
alter table public.menus add constraint menus_name_unique unique (name);

-- RLS 修正: 認証ユーザーは全メニューを参照可
-- （サジェスト除外クエリで created_by=null のシステムメニューも参照が必要）
drop policy if exists "共有メニューは全認証ユーザーが参照可" on public.menus;
create policy "認証ユーザーは全メニューを参照可"
  on public.menus for select
  using (auth.uid() is not null);

-- RLS 修正: 認証ユーザーはメニューを作成可
-- （created_by=null のシステムメニューを API ルートから作成するため条件を緩和）
drop policy if exists "認証ユーザーはメニューを作成可" on public.menus;
create policy "認証ユーザーはメニューを作成可"
  on public.menus for insert
  with check (auth.uid() is not null);

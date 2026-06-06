-- =============================================
-- なんでもよくない - 初期スキーマ
-- =============================================

-- ユーザー（Supabase Auth と連携）
create table public.users (
  id               uuid        primary key references auth.users(id) on delete cascade,
  email            text        not null,
  display_name     text,
  tone_preference  text        not null default 'polite'
                                check (tone_preference in ('polite', 'casual', 'emoji')),
  exclude_days     int         not null default 7,
  created_at       timestamptz not null default now()
);

-- パートナー情報
create table public.partners (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  name             text        not null,
  likes            text,
  dislikes         text,
  cooking_tendency text,
  created_at       timestamptz not null default now()
);

-- メニューマスタ
create table public.menus (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  category   text        not null
               check (category in ('和食', '洋食', '中華', '麺', '丼', 'その他')),
  is_shared  boolean     not null default false,
  created_by uuid        references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 提案セッション
create table public.suggestion_sessions (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  suggested_at     date        not null,
  generated_message text,
  selected_menu_id uuid        references public.menus(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- 提案メニュー明細
create table public.suggestion_items (
  id          uuid    primary key default gen_random_uuid(),
  session_id  uuid    not null references public.suggestion_sessions(id) on delete cascade,
  menu_id     uuid    not null references public.menus(id) on delete cascade,
  order_index int     not null
);

-- 実食記録
create table public.meal_logs (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users(id) on delete cascade,
  session_id uuid        references public.suggestion_sessions(id) on delete set null,
  menu_id    uuid        not null references public.menus(id) on delete cascade,
  cooked_by  text        not null
               check (cooked_by in ('self', 'partner', 'takeout', 'restaurant')),
  memo       text,
  eaten_at   date        not null,
  created_at timestamptz not null default now()
);

-- =============================================
-- インデックス
-- =============================================

create index idx_partners_user_id         on public.partners(user_id);
create index idx_menus_is_shared          on public.menus(is_shared);
create index idx_menus_created_by         on public.menus(created_by);
create index idx_suggestion_sessions_user on public.suggestion_sessions(user_id, suggested_at);
create index idx_suggestion_items_session on public.suggestion_items(session_id);
create index idx_meal_logs_user_eaten     on public.meal_logs(user_id, eaten_at);

-- =============================================
-- RLS 有効化
-- =============================================

alter table public.users              enable row level security;
alter table public.partners           enable row level security;
alter table public.menus              enable row level security;
alter table public.suggestion_sessions enable row level security;
alter table public.suggestion_items   enable row level security;
alter table public.meal_logs          enable row level security;

-- =============================================
-- RLS ポリシー: users
-- =============================================

create policy "自分自身のユーザー情報のみ参照可"
  on public.users for select
  using (id = auth.uid());

create policy "自分自身のユーザー情報のみ更新可"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- 新規ユーザーはトリガー経由で挿入するため、insert ポリシーは service role のみ
-- （auth.users への登録時に自動挿入される）

-- =============================================
-- RLS ポリシー: partners
-- =============================================

create policy "自分のパートナー情報のみ参照可"
  on public.partners for select
  using (user_id = auth.uid());

create policy "自分のパートナー情報のみ挿入可"
  on public.partners for insert
  with check (user_id = auth.uid());

create policy "自分のパートナー情報のみ更新可"
  on public.partners for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "自分のパートナー情報のみ削除可"
  on public.partners for delete
  using (user_id = auth.uid());

-- =============================================
-- RLS ポリシー: menus
-- =============================================

-- 共有メニューは全認証ユーザーが参照可
create policy "共有メニューは全認証ユーザーが参照可"
  on public.menus for select
  using (is_shared = true or created_by = auth.uid());

create policy "認証ユーザーはメニューを作成可"
  on public.menus for insert
  with check (created_by = auth.uid());

create policy "作成者のみメニューを更新可"
  on public.menus for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "作成者のみメニューを削除可"
  on public.menus for delete
  using (created_by = auth.uid());

-- =============================================
-- RLS ポリシー: suggestion_sessions
-- =============================================

create policy "自分の提案セッションのみ参照可"
  on public.suggestion_sessions for select
  using (user_id = auth.uid());

create policy "自分の提案セッションのみ作成可"
  on public.suggestion_sessions for insert
  with check (user_id = auth.uid());

create policy "自分の提案セッションのみ更新可"
  on public.suggestion_sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "自分の提案セッションのみ削除可"
  on public.suggestion_sessions for delete
  using (user_id = auth.uid());

-- =============================================
-- RLS ポリシー: suggestion_items
-- =============================================

-- セッションの所有者のみアクセス可（JOINで確認）
create policy "自分のセッションの提案明細のみ参照可"
  on public.suggestion_items for select
  using (
    exists (
      select 1 from public.suggestion_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "自分のセッションの提案明細のみ作成可"
  on public.suggestion_items for insert
  with check (
    exists (
      select 1 from public.suggestion_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "自分のセッションの提案明細のみ削除可"
  on public.suggestion_items for delete
  using (
    exists (
      select 1 from public.suggestion_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- =============================================
-- RLS ポリシー: meal_logs
-- =============================================

create policy "自分の実食記録のみ参照可"
  on public.meal_logs for select
  using (user_id = auth.uid());

create policy "自分の実食記録のみ作成可"
  on public.meal_logs for insert
  with check (user_id = auth.uid());

create policy "自分の実食記録のみ更新可"
  on public.meal_logs for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "自分の実食記録のみ削除可"
  on public.meal_logs for delete
  using (user_id = auth.uid());

-- =============================================
-- トリガー: 新規ユーザー登録時に public.users を自動挿入
-- =============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- 関数: 直近N日のメニューIDを取得（提案除外用）
-- =============================================

create or replace function public.get_recent_menus(p_user_id uuid, p_days int)
returns table(menu_id uuid)
language sql
stable
security definer set search_path = public
as $$
  -- 提案済みメニュー
  select si.menu_id
  from public.suggestion_items si
  join public.suggestion_sessions ss on ss.id = si.session_id
  where ss.user_id = p_user_id
    and ss.suggested_at >= current_date - p_days

  union

  -- 実食済みメニュー
  select ml.menu_id
  from public.meal_logs ml
  where ml.user_id = p_user_id
    and ml.eaten_at >= current_date - p_days;
$$;

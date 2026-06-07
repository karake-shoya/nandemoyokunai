-- RLS SELECT ポリシーを最小権限に修正
-- 「auth.uid() is not null」は他ユーザーの非公開メニューまで見えてしまうため修正
-- 参照可能な対象: 共有メニュー / 自分が作成したメニュー / システムメニュー（created_by IS NULL）
drop policy if exists "認証ユーザーは全メニューを参照可" on public.menus;
create policy "認証ユーザーは参照可能なメニューのみ参照可"
  on public.menus for select
  using (
    is_shared = true
    or created_by = auth.uid()
    or created_by is null
  );

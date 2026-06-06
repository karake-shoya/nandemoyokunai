# なんでもよくない - CLAUDE.md

## プロジェクト概要

パートナーからの「今日の晩ごはん何がいい？」という質問に対して、
気の利いた返答と晩ごはんの提案をサポートするWebアプリ。

- **サービス名**: なんでもよくない
- **ドメイン**: nandemoyokunai.com（予定）
- **リポジトリ名**: nandemoyokunai
- **ターゲット**: パートナーから夕食を聞かれる側（返答に困っている人）

---

## 技術スタック

```
フロントエンド : Next.js 14 (App Router) + TypeScript
スタイル       : Tailwind CSS
認証 + DB      : Supabase (Auth / PostgreSQL / RLS)
ホスティング   : Cloudflare Pages
APIルート      : Next.js Route Handler（@opennextjs/cloudflare使用）
AI生成         : Claude API（メニュー提案・返答文章生成）
メール通知     : Resend
初期データ     : 楽天レシピAPI（初回種まきスクリプトのみ）
```

---

## ディレクトリ構成

```
nandemoyokunai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (app)/
│   │   ├── home/             # ホーム画面
│   │   ├── proposal/         # 提案結果画面
│   │   ├── record/           # 実食記録画面
│   │   ├── history/          # 食事履歴一覧
│   │   ├── ranking/          # 週次人気ランキング
│   │   └── settings/         # 設定
│   └── api/
│       ├── suggest/          # AI提案生成
│       └── ranking/          # ランキング集計
├── components/
├── lib/
│   ├── supabase/
│   └── claude/
├── scripts/
│   └── seed-menus.ts         # 楽天APIからの初期データ投入
└── CLAUDE.md
```

---

## DB設計

```sql
-- ユーザー（Supabase Authと連携）
users
  - id                uuid  PK
  - email             text
  - display_name      text
  - tone_preference   text   -- 'polite' | 'casual' | 'emoji'
  - exclude_days      int    -- 重複除外日数（デフォルト7）
  - created_at        timestamp

-- パートナー情報
partners
  - id                uuid  PK
  - user_id           uuid  FK -> users
  - name              text
  - likes             text
  - dislikes          text
  - cooking_tendency  text
  - created_at        timestamp

-- メニューマスタ
menus
  - id                uuid  PK
  - name              text
  - category          text   -- '和食' | '洋食' | '中華' | '麺' | '丼' など
  - is_shared         boolean -- true = 人気ランキング集計対象
  - created_by        uuid  FK -> users（NULLはシステム）
  - created_at        timestamp

-- 提案セッション
suggestion_sessions
  - id                uuid  PK
  - user_id           uuid  FK -> users
  - suggested_at      date
  - generated_message text   -- AIが生成した返答文章
  - selected_menu_id  uuid  FK -> menus
  - created_at        timestamp

-- 提案メニュー明細
suggestion_items
  - id                uuid  PK
  - session_id        uuid  FK -> suggestion_sessions
  - menu_id           uuid  FK -> menus
  - order_index       int

-- 実食記録
meal_logs
  - id                uuid  PK
  - user_id           uuid  FK -> users
  - session_id        uuid  FK -> suggestion_sessions（NULLは提案なし記録）
  - menu_id           uuid  FK -> menus
  - cooked_by         text   -- 'self' | 'partner' | 'takeout' | 'restaurant'
  - memo              text
  - eaten_at          date
  - created_at        timestamp
```

---

## コア機能

### 1. 提案生成（AI）

- 直近N日（ユーザー設定、デフォルト7日）に提案・実食したメニューを除外
- パートナーの好み・NGを考慮
- Claude APIでメニュー候補3〜5件 + 返答文章3パターンを生成
- トーン：気遣い重視 / 積極的 / 相手に委ねる

```typescript
// 重複除外クエリイメージ
const excluded = await supabase.rpc('get_recent_menus', {
  p_user_id: userId,
  p_days: excludeDays
})
// suggestion_items + meal_logs の両方から除外
```

### 2. 実食記録

- 提案通り or 別メニューを選択
- 別メニューの場合：提案メニューは除外対象から外れる（次回提案に影響）
- 誰が作ったか・メモを記録
- 提案→記録の導線を自然につなぐ（提案後にポップアップ）

### 3. 週次人気ランキング

- is_shared=true のメニューのみ集計
- 週単位で suggestion_items を集計
- ユーザー固有のメニューはプライバシー保護のため除外

### 4. 通知（Phase 1: メール）

- 毎日17時：「今日の晩ごはん、もう決まりましたか？」リマインダー
- 翌朝9時：「昨日の食事を記録しませんか？」フォローアップ
- Resend + Supabase cron（pg_cron）で実装

---

## 画面一覧

### コアフロー（MVP）
| 画面 | パス | 概要 |
|---|---|---|
| ホーム | /home | 提案起点・最近の食事・ランキング表示 |
| 提案結果 | /proposal | メニュー候補 + 返答文章3パターン |
| 実食記録 | /record | 提案通り or 別メニュー・誰が作ったか |

### サブ画面
| 画面 | パス | 概要 |
|---|---|---|
| ログイン | /login | Supabase Auth |
| 新規登録 | /register | メール認証 |
| オンボーディング | /onboarding | パートナー情報・好み・除外日数設定 |
| 食事履歴 | /history | 過去の記録一覧 |
| ランキング | /ranking | 週次人気メニュー |
| 設定 | /settings | プロフィール・通知・プラン管理 |

---

## マネタイズ

```
Free プラン
  - 提案：月20回まで
  - 実食記録：無制限
  - 週次ランキング閲覧

Pro プラン（月額課金）
  - 提案：無制限
  - 返答トーンのカスタマイズ
  - 詳細履歴分析
  - 通知時間のカスタマイズ
```

---

## フェーズ計画

### Phase 1（MVP）
- [ ] Supabase + Cloudflare Pages セットアップ
- [ ] 認証（ログイン・新規登録）
- [ ] オンボーディング（パートナー情報入力）
- [ ] 楽天APIから初期メニューデータ投入スクリプト
- [ ] 提案生成（Claude API）
- [ ] 実食記録
- [ ] メール通知（Resend）

### Phase 2
- [ ] 週次人気ランキング
- [ ] PWAプッシュ通知
- [ ] 重複除外日数のユーザー設定UI
- [ ] Pro プラン・Stripe課金

### Phase 3
- [ ] パートナー招待・両者利用
- [ ] カテゴリ別除外日数設定
- [ ] LINE通知オプション

---

## 開発ルール

- コンポーネントは `/components` に切り出す
- Supabase クライアントは `/lib/supabase/` に集約
- Claude API呼び出しは `/lib/claude/` に集約
- RLSを必ず設定し、他ユーザーのデータにアクセスできないようにする
- 環境変数は `.env.local` で管理（`.env.example` を必ずコミット）
- 型定義は Supabase の自動生成型を使う（`supabase gen types`）

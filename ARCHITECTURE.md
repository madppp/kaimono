# 買い物リストアプリ アーキテクチャ

> 作成日: 2026-04-07

---

## 概要

家族でスーパーへ行く際の買い物リストを管理するNext.jsアプリ。
リスト名をつけて買い物ごとに作成・共有でき、食材名・個数・カテゴリを管理できる。

---

## 技術スタック

| 項目 | 内容 | バージョン |
|---|---|---|
| フレームワーク | Next.js (App Router) | 16.2.2 |
| 言語 | TypeScript | 5.x |
| スタイル | Tailwind CSS | v4 |
| デザイン | Material Design 3（M3 Expressive 参考） | - |
| アイコン | Material Symbols Outlined (Google Fonts CDN) | - |
| フォント | Roboto (Google Fonts / next/font) | - |
| ORM | Prisma | 6.19.3 |
| DB（本番） | Turso (libSQL / SQLite互換 クラウド) | - |
| DB（開発） | SQLite ローカルファイル (`prisma/dev.db`) | - |
| ホスティング | Vercel（無料プラン） | - |

---

## ディレクトリ構成

```
/
├── app/
│   ├── layout.tsx                  # ルートレイアウト（フォント・アイコン読み込み）
│   ├── globals.css                 # グローバルCSS（Tailwind + アニメーション定義）
│   ├── page.tsx                    # トップページ（Server Component / DB取得）
│   ├── HomeClient.tsx              # トップUI（リスト一覧・作成・削除）
│   └── list/[id]/
│       ├── page.tsx                # リスト詳細ページ（Server Component / DB取得）
│       └── ListPageClient.tsx      # リスト詳細UI（アイテム管理全般）
│
├── app/api/
│   ├── lists/
│   │   ├── route.ts                # GET: リスト一覧 / POST: リスト作成
│   │   └── [id]/
│   │       ├── route.ts            # GET: リスト詳細 / DELETE: リスト削除
│   │       └── items/
│   │           └── route.ts        # POST: アイテム追加
│   └── items/
│       └── [itemId]/
│           └── route.ts            # PATCH: アイテム更新 / DELETE: アイテム削除
│
├── components/
│   ├── AddItemForm.tsx             # アイテム追加フォーム（ボトムシート形式）
│   ├── ShoppingItemRow.tsx         # アイテム1行（チェック・編集・削除）
│   ├── CategoryPicker.tsx          # カテゴリ選択（M3 Filter Chips + 自由入力）
│   ├── ProgressBar.tsx             # 進捗バー（購入済み/総数）
│   └── Icon.tsx                    # Material Symbols ラッパーコンポーネント
│
├── lib/
│   ├── db.ts                       # Prismaクライアント初期化（Turso/SQLite 切り替え）
│   ├── categories.ts               # カテゴリプリセット定数
│   └── theme.ts                    # M3カラートークン定数
│
├── prisma/
│   └── schema.prisma               # DBスキーマ定義
│
├── .env.local                      # 環境変数（Git管理外）
├── SHOPPING_LIST_SPEC.md           # 元の仕様書
└── ARCHITECTURE.md                 # 本ドキュメント
```

---

## データモデル

```prisma
model ShoppingList {
  id        String         @id @default(cuid())
  name      String
  createdAt DateTime       @default(now())
  items     ShoppingItem[]
}

model ShoppingItem {
  id        String       @id @default(cuid())
  listId    String
  name      String
  quantity  Int          @default(1)
  category  String       @default("その他")
  checked   Boolean      @default(false)
  createdAt DateTime     @default(now())
  list      ShoppingList @relation(fields: [listId], references: [id], onDelete: Cascade)
}
```

- リストIDは `cuid()` で生成（推測困難なURL = 家族間の共有URLとして機能）
- リスト削除時はアイテムも `onDelete: Cascade` で連鎖削除

---

## APIルート一覧

| メソッド | パス | 処理 |
|---|---|---|
| GET | `/api/lists` | リスト一覧取得（アイテム数含む） |
| POST | `/api/lists` | 新規リスト作成 |
| GET | `/api/lists/[id]` | リスト詳細取得（アイテム含む） |
| DELETE | `/api/lists/[id]` | リスト削除（アイテム連鎖削除） |
| POST | `/api/lists/[id]/items` | アイテム追加 |
| PATCH | `/api/items/[itemId]` | アイテム更新（名前・個数・カテゴリ・チェック状態） |
| DELETE | `/api/items/[itemId]` | アイテム削除 |

---

## データフロー

```
ブラウザ（React）
    ↕ fetch（楽観的UI更新）
API Routes（Next.js Route Handlers）
    ↕ Prisma ORM
Turso DB（本番）/ SQLite（開発）
```

- ページ初期表示: Server Component が直接 Prisma でDB取得 → Client Component に渡す
- 操作時: Client Component が `fetch` → API Route → Prisma → DB
- 楽観的更新: API完了を待たずUIを先に更新し、バックグラウンドでDB同期

---

## 画面構成

### トップページ（`/`）
- アプリタイトル・説明
- 新規リスト作成フォーム（名前入力 → 作成ボタン）
- これまでのリスト一覧（タップで遷移・削除機能付き）

### リスト詳細ページ（`/list/[id]`）
- Top App Bar（戻るボタン・テキストコピー・URL共有）
- 進捗バー（チェック済み / 総アイテム数）
- カテゴリ別アイテム一覧
  - チェックボックス（購入済みで打ち消し線 + グレーアウト）
  - 編集ボタン（インライン編集フォーム展開）
  - 削除ボタン（確認バー表示）
- 購入済みアイテムセクション（下部に分離）
- FAB「追加する」→ ボトムシートでフォーム表示
- お買い物完了メッセージ（全チェック時）
- Snackbar（操作フィードバック）

---

## デザインシステム（lib/theme.ts）

Material Design 3 のグリーン系カラーパレットを TypeScript 定数として定義。
CSS変数の代わりに直接参照する方式（Tailwind v4との互換性のため）。

```
Primary:           #386A20  （メインアクション・チェック済み）
Primary Container: #B8F397  （FAB・作成カード背景）
Secondary:         #55624C  （セカンダリ要素）
Error:             #BA1A1A  （削除・エラー）
Surface:           #FDFDF5  （カード背景）
Background:        #F4F6EE  （ページ背景）
```

---

## カテゴリ定数（lib/categories.ts）

| ラベル | アイコン（Material Symbols） | 絵文字（テキストコピー用） |
|---|---|---|
| やさい | `eco` | 🥦 |
| 肉 | `lunch_dining` | 🥩 |
| 魚 | `set_meal` | 🐟 |
| パン・穀物 | `bakery_dining` | 🍞 |
| 日用品 | `cleaning_services` | 🧴 |
| その他 | `category` | 📦 |

---

## 環境変数

| 変数名 | 用途 | 設定場所 |
|---|---|---|
| `TURSO_DATABASE_URL` | Turso DB接続URL | `.env.local` / Vercel |
| `TURSO_AUTH_TOKEN` | Turso 認証トークン | `.env.local` / Vercel |

環境変数が未設定の場合、自動的にローカルSQLite（`prisma/dev.db`）にフォールバック。

---

## デプロイ構成

```
GitHub (madppp/kaimono)
    ↓ push で自動デプロイ
Vercel
    ↓ Prisma generate + Next.js build
本番環境
    ↓ API Route 実行時
Turso DB (aws-ap-northeast-1)
```

---

## 既知の制約・今後の拡張候補

| 項目 | 現状 | 拡張案 |
|---|---|---|
| 認証 | なし（URLを知っていれば誰でもアクセス可） | next-auth でGoogle/GitHubログイン追加 |
| ユーザー管理 | なし | User テーブル追加・リストにuserId紐付け |
| リアルタイム同期 | なし（リロードで最新化） | Vercel KV + Server-Sent Events |
| オフライン対応 | なし | PWA化・Service Worker |
| デザイン準拠 | M3参考実装（公式ライブラリ未使用） | `@material/web` 導入で完全準拠 |


# 家族用スーパー買い物リストアプリ 仕様書

## プロジェクト概要

家族でスーパーへ行く際の買い物リストを管理するNext.jsアプリ。
リスト名をつけて買い物ごとに作成・共有でき、食材名・個数・カテゴリを管理できる。

---

## 技術スタック

- フレームワーク: Next.js 14（App Router）
- DB: Turso（libSQL / SQLite互換）+ Prisma ORM
- スタイル: Tailwind CSS（Apple HIG準拠デザイン）
- ホスティング: Vercel（無料）

---

## デザイン原則（Apple HIG）

- フォント: システムフォント（-apple-system, SF Pro）
- カラー: iOS標準カラー（blue #007AFF, red #FF3B30, green #34C759, gray #8E8E93）
- コンポーネント: iOS風リスト・モーダル・アラート
- タッチターゲット: 最小44px
- 角丸: 10〜16px
- アニメーション: 控えめ（0.2s ease）
- 初めてでも迷わないシンプルなUI

---

## 画面構成

```
/                  → トップ：リスト名入力 → 新規作成
/list/[id]         → 買い物リスト画面（アイテム追加・一覧・削除）
```

---

## 画面詳細

### 1. トップ画面（/）

**表示内容:**
- アプリタイトル（例：「🛒 買い物リスト」）
- リスト名入力フィールド（例：「今週の買い物」）
- 「リストをつくる」ボタン

**動作:**
1. リスト名を入力して「リストをつくる」ボタンをタップ
2. APIでリストを作成し、`/list/[id]` に遷移
3. リスト名が空の場合はバリデーションエラー表示

---

### 2. 買い物リスト画面（/list/[id]）

#### ヘッダー
- リスト名を表示
- 「共有」ボタン（URLをコピー）

#### アイテム追加フォーム（画面上部に常時表示）

| フィールド | 種別 | 詳細 |
|---|---|---|
| 食材名 | テキスト入力 | 必須 |
| 個数 | 数値入力 | 必須、最小1、デフォルト1 |
| カテゴリ | 選択 + 自由入力 | 後述 |

**カテゴリ仕様:**
- プリセットボタン（タップで選択）:
  - `🥦 やさい`
  - `🥩 肉`
  - `🐟 魚`
  - `🍞 パン・穀物`
  - `🧴 日用品`
  - `📦 その他`
- 自由入力テキストフィールドも用意（プリセット以外のカテゴリを入力可能）
- プリセット選択中は対応ボタンをハイライト表示
- 自由入力に文字を入力するとプリセット選択が解除される

**「追加する」ボタン:**
- タップでアイテムをリストに追加
- 追加後、食材名・個数をリセット（カテゴリは直前の値を保持）

#### アイテム一覧（カテゴリ別グループ表示）

- カテゴリごとにセクション分け
- 各アイテムに以下を表示:
  - チェックボックス（購入済みマーク）
  - 食材名
  - 個数（例：`× 2`）
  - カテゴリ名
  - 削除ボタン（赤い ✕ アイコン）

**チェック機能:**
- チェック済みアイテムはテキストに打ち消し線 + グレーアウト
- チェック済みアイテムはリスト下部に移動

**削除確認:**
- 削除ボタンタップ → iOS風アラート「削除しますか？」→ 確認後に削除

#### 進捗表示（ヘッダー下）
- `3 / 8 完了` のような表示
- プログレスバー（緑）

---

## DBスキーマ（Prisma）

```prisma
model ShoppingList {
  id        String         @id @default(cuid())
  name      String
  createdAt DateTime       @default(now())
  items     ShoppingItem[]
}

model ShoppingItem {
  id         String       @id @default(cuid())
  listId     String
  name       String
  quantity   Int          @default(1)
  category   String       @default("その他")
  checked    Boolean      @default(false)
  createdAt  DateTime     @default(now())
  list       ShoppingList @relation(fields: [listId], references: [id], onDelete: Cascade)
}
```

---

## APIルート

### リスト操作

| メソッド | パス | 処理 |
|---|---|---|
| POST | `/api/lists` | 新規リスト作成 |
| GET | `/api/lists/[id]` | リスト取得（アイテム含む） |

**POST `/api/lists` リクエスト:**
```json
{ "name": "今週の買い物" }
```

**POST `/api/lists` レスポンス:**
```json
{ "id": "clxxx...", "name": "今週の買い物", "createdAt": "..." }
```

**GET `/api/lists/[id]` レスポンス:**
```json
{
  "id": "clxxx...",
  "name": "今週の買い物",
  "items": [
    {
      "id": "clyyy...",
      "name": "にんじん",
      "quantity": 3,
      "category": "やさい",
      "checked": false,
      "createdAt": "..."
    }
  ]
}
```

### アイテム操作

| メソッド | パス | 処理 |
|---|---|---|
| POST | `/api/lists/[id]/items` | アイテム追加 |
| PATCH | `/api/items/[itemId]` | チェック状態 or 個数の更新 |
| DELETE | `/api/items/[itemId]` | アイテム削除 |

**POST `/api/lists/[id]/items` リクエスト:**
```json
{
  "name": "にんじん",
  "quantity": 3,
  "category": "やさい"
}
```

**PATCH `/api/items/[itemId]` リクエスト（チェック更新）:**
```json
{ "checked": true }
```

---

## ディレクトリ構成

```
app/
  page.tsx                      # トップ画面
  list/
    [id]/
      page.tsx                  # 買い物リスト画面
  api/
    lists/
      route.ts                  # POST /api/lists
      [id]/
        route.ts                # GET /api/lists/[id]
        items/
          route.ts              # POST /api/lists/[id]/items
    items/
      [itemId]/
        route.ts                # PATCH, DELETE /api/items/[itemId]

components/
  AddItemForm.tsx               # アイテム追加フォーム
  ShoppingItemRow.tsx           # アイテム1行（チェック・削除）
  CategoryPicker.tsx            # カテゴリ選択UI
  ProgressBar.tsx               # 進捗バー

lib/
  db.ts                         # Prisma クライアント
  categories.ts                 # カテゴリ定数定義

prisma/
  schema.prisma
```

---

## カテゴリ定数（`lib/categories.ts`）

```ts
export const PRESET_CATEGORIES = [
  { label: "やさい",    emoji: "🥦", value: "やさい" },
  { label: "肉",       emoji: "🥩", value: "肉" },
  { label: "魚",       emoji: "🐟", value: "魚" },
  { label: "パン・穀物", emoji: "🍞", value: "パン・穀物" },
  { label: "日用品",   emoji: "🧴", value: "日用品" },
  { label: "その他",   emoji: "📦", value: "その他" },
] as const;
```

---

## 環境変数

```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

---

## 注意事項

- 個数は整数（1以上）で扱う
- カテゴリは文字列で自由に保存（プリセット値に限定しない）
- リストIDはcuidを使用（推測困難なURL ＝ 家族間で共有するURLとして機能）
- エラー時はiOS風のアラート表示
- DBの `onDelete: Cascade` でリスト削除時にアイテムも連鎖削除
- モバイルファースト（スマホで快適に使えること優先）

---

## UXの補足

- 画面を開いた瞬間に食材名入力フィールドへ自動フォーカス（モバイルでは除く）
- アイテム追加後は食材名フィールドにフォーカスを戻す
- リストが空のとき「まだアイテムがありません。追加してみましょう！」と表示
- 全アイテムがチェック済みになったら「お買い物完了！🎉」メッセージを表示

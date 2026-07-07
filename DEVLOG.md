# 買い物リストアプリ 開発日記

> 開発期間: 2026年4月
> 使用AI: Claude Sonnet 4.6 (Claude Code)

---

## このアプリについて

家族でスーパーへ行くときの買い物リストを管理するWebアプリ。
リスト名をつけて作成・共有でき、食材名・個数・カテゴリを管理できる。

**最終的な技術スタック**
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + Material Design 3
- Prisma + Turso (クラウドSQLite)
- Vercel でホスティング

---

## フェーズ1：仕様書を渡して一気に実装

### やったこと
`SHOPPING_LIST_SPEC.md` という仕様書を渡し、アプリ全体を一括生成。

生成されたもの：
- Next.js プロジェクト一式
- Prisma スキーマ（ShoppingList / ShoppingItem）
- API Routes（リスト・アイテムのCRUD）
- 全画面のUI（トップ・リスト詳細）
- コンポーネント群（AddItemForm, ShoppingItemRow, CategoryPicker, ProgressBar）

### 発生した問題
**Tailwind CSS が当たっていない**

原因：Tailwind v4 では `@tailwind base/components/utilities` の記法が廃止されており、`@import "tailwindcss"` に変更する必要があった。create-next-app が v4 を入れたのに、仕様書ベースで v3 の書き方で生成してしまった。

```css
/* ❌ v3の書き方（生成されたコード）*/
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ v4の書き方（修正後）*/
@import "tailwindcss";
```

### 反省点
仕様書に「Tailwind CSS」とだけ書いてあり、バージョンを明示していなかった。インストール済みの実際のバージョン（v4）を確認せずに生成したのが原因。

---

## フェーズ2：機能の追加要望

### ユーザーからの指示
> 「編集機能がない。削除ができない。カテゴリ一覧に戻れない。テキストコピー機能がない。」

4つの問題が一度に報告された。

### やったこと

**① 編集機能**
`ShoppingItemRow` に ✏️ ボタンを追加。タップするとインライン編集フォームが展開し、食材名・個数・カテゴリを変更できるように。PATCH APIも `name` / `category` フィールドに対応していなかったため追加。

**② 削除UXの改善**
元の実装は「2回タップ確認方式」（1回目でボタンが「確認」に変わる）だったが、ユーザーには伝わりにくかった。赤い確認バーが行の下に展開する方式に変更。

**③ トップへ戻るボタン**
ヘッダーに `← 戻る` リンクを追加。

**④ テキストコピー**
ヘッダーの 📋 ボタンで、未購入アイテムをカテゴリ別に整形してクリップボードへコピーする機能を追加。

```
【今週の買い物】

🥦 やさい
・にんじん　× 3
・ブロッコリー　× 1

🥩 肉
・鶏もも　× 2
```

### 反省点
削除の2回タップ方式は「確認ダイアログ」の代替として実装したが、モバイルでは直感的でなかった。最初から確認バー方式にすべきだった。

---

## フェーズ3：トップページにリスト一覧を追加

### ユーザーからの指示
> 「戻った時に作成したリスト一覧が表示されないので修正してください。」

### やったこと
トップページを Server Component + Client Component に分割。

- `app/page.tsx`（Server Component）: DBからリスト一覧を取得
- `app/HomeClient.tsx`（Client Component）: UI・インタラクション管理
- `GET /api/lists` を新規追加（アイテム数も含む）
- `force-dynamic` でキャッシュを無効化し、常に最新状態を表示

### 反省点
これは最初の実装時に含めるべき基本機能だった。仕様書に「これまでのリスト一覧」の記載がなかったが、戻ったときの体験として当然必要なUXだった。

---

## フェーズ4：デザインをApple HIG → Material Design 3に変更

### ユーザーからの指示
> 「これって本当にマテリアルデザインのガイドライン通りですか？」
> （仕様書にはApple HIGと書いてあったが、M3 Expressiveへの変更を希望）

### やったこと
デザイン全体をM3 Expressiveベースに刷新。

**変更点**

| 項目 | Apple HIG（旧） | M3 Expressive（新） |
|---|---|---|
| カラー | iOS Blue/Green/Red | グリーン系トーナルカラー |
| フォント | SF Pro / -apple-system | Roboto |
| アイテム追加 | 常時表示フォーム | FAB → ボトムシート |
| ボタン | 角丸矩形 | Filledボタン・ピル型 |
| カテゴリ選択 | タグボタン | M3 Filter Chips |
| フィードバック | 画面内バナー | Snackbar |
| アニメーション | 0.2s ease | スプリング系 cubic-bezier |

**カラートークン（グリーン系）**
```
Primary:           #386A20
Primary Container: #B8F397
Secondary:         #55624C
Error:             #BA1A1A
Surface:           #FDFDF5
Background:        #F4F6EE
```

### 注記
M3の「公式準拠」ではなく「参考実装」。
- アイコン（Material Symbols）は公式フォントを使用 ✅
- カラートークンの命名はM3仕様に準拠 ✅
- コンポーネントは `@material/web` を使わず自前CSS実装 ⚠️
- カラー値は公式カラーツールではなく手動設定 ⚠️

---

## フェーズ5：CSSカラーが反映されないバグ

### ユーザーからの指示
> 「CSSがすこしおかしそうです。入力と一覧がどうかしています。」
> 「まだ色の変化がないので、修正されていないみたいです。」

### 問題の特定
2段階で問題が発覚した。

**問題1：flex と block の競合**
```tsx
// ❌ displayが競合
className="md-ripple flex items-center gap-4 rounded-2xl block"

// ✅ inline styleで統一
style={{ display: "flex", alignItems: "center", gap: 16 }}
```

**問題2：CSS変数がinline styleで解決されない**
```tsx
// ❌ Tailwind v4の処理タイミングとNext.jsのSSRで変数が解決されないケースがある
style={{ border: `2px solid var(--md-primary)` }}

// ✅ TypeScript定数を直接参照
style={{ border: `2px solid ${t.primary}` }}  // t.primary = "#386A20"
```

### 解決策
CSS変数（`var(--md-xxx)`）の依存を完全に排除。`lib/theme.ts` にカラー定数をTypeScriptとして定義し、全コンポーネントから直接参照する方式に変更。

```ts
// lib/theme.ts
export const t = {
  primary: "#386A20",
  onPrimary: "#FFFFFF",
  // ...
} as const;
```

**フォーカス状態のボーダー色変化**も `onFocus` でのDOM直接操作から `useState(focused)` によるReact管理に変更。

```tsx
// ❌ DOM直接操作（不安定）
onFocus={(e) => { e.target.style.borderColor = "var(--md-primary)"; }}

// ✅ React stateで管理
const [focused, setFocused] = useState(false);
// border: `2px solid ${focused ? t.primary : t.outlineVariant}`
```

### 反省点
Tailwind v4 + Next.js の環境でCSS変数がinline styleに乗らないケースは、最初から想定して設計すべきだった。デザイントークンはTypeScript定数として持つ方がSSR環境では安全。

---

## フェーズ6：Material Symbolsアイコン + リスト削除機能

### ユーザーからの指示
> 「サイト内で使うアイコンは絵文字じゃなくてマテリアルデザインのアイコンで表現できますか？野菜とかないですかね？」
> 「買い物リストの削除機能が欲しいです。」

### やったこと

**Material Symbols の導入**

Google Fonts CDN経由でMaterial Symbols Outlinedを追加。

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
```

`components/Icon.tsx` ラッパーを作成し、name・size・fill・colorを props で制御。

**カテゴリアイコン対応表**

| カテゴリ | アイコン名 | 絵文字（テキストコピー用に保持） |
|---|---|---|
| やさい | `eco` | 🥦 |
| 肉 | `lunch_dining` | 🥩 |
| 魚 | `set_meal` | 🐟 |
| パン・穀物 | `bakery_dining` | 🍞 |
| 日用品 | `cleaning_services` | 🧴 |
| その他 | `category` | 📦 |

テキストコピー機能では絵文字の方が読みやすいため、カテゴリデータに `icon`（アイコン名）と `emoji` の両方を保持する設計にした。

**リスト削除**
- `DELETE /api/lists/[id]` を新規追加
- ゴミ箱アイコンをタップ → 確認バーが展開 → 削除実行

---

## フェーズ7：Vercelへのデプロイ

### ユーザーからの指示
> 「netで使えるようにしたいです。」

### やったこと（自動化した部分）
1. Turso CLI インストール（`curl -sSfL https://get.tur.so/install.sh | bash`）
2. Turso ログイン（`turso auth login`）
3. DB作成（`turso db create kaimono`）
4. テーブル作成（`turso db shell` でSQL実行）
5. `.env.local` に接続情報を保存
6. GitHub リポジトリ作成・プッシュ

### ユーザーが手動でやった部分
- Vercel ダッシュボードでGitHubリポジトリを接続
- 環境変数（`TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`）を設定
- Deploy ボタンをクリック

### 発生したトラブル

**① ビルドエラー：`prisma generate` が実行されない**
```json
// ❌ 修正前
"build": "next build"

// ✅ 修正後
"build": "prisma generate && next build"
```

**② `PrismaLibSQL` → `PrismaLibSql` の命名ミス**
```ts
// ❌ 存在しないエクスポート名
import { PrismaLibSQL } from "@prisma/adapter-libsql";

// ✅ 正しい名前
import { PrismaLibSql } from "@prisma/adapter-libsql";
```

**③ `PrismaLibSql` のコンストラクタの使い方が間違い**
```ts
// ❌ Clientインスタンスを渡していた
const client = createClient({ url, authToken });
const adapter = new PrismaLibSql(client);

// ✅ Config オブジェクトを直接渡す
const adapter = new PrismaLibSql({ url, authToken });
```

**④ Vercel CLI が日本語ディレクトリ名でエラー**
`/Users/pablo/workspace/かいもの` というパスでVercel CLIが誤動作。CLIでのデプロイを断念し、GitHubからVercelダッシュボード経由でデプロイする方法に切り替えた。

**⑤ デプロイ後に「This page couldn't load」エラー**
Vercelの環境変数が未設定だったためTursoに接続できなかった。ダッシュボードで変数を設定し解決。

**⑥ Googleログインが求められる**
Vercelのプレビュー保護機能が有効だったため。本番URL（`xxx.vercel.app`）へアクセスすることで解決。

---

## フェーズ8：買い物中の使い勝手を強化

### ユーザーからの指示
> 「オートスリープにならない機能をつけたい。野菜の名前っぽかったら自動で野菜のカテゴリになる機能が欲しい。もっと使いやすくなるアイデアがあったら取り入れて欲しい。」

### やったこと

**① 画面スリープ防止（Wake Lock）**
Screen Wake Lock API を使う `lib/useWakeLock.ts` フックを作成。リスト詳細ページにトグルチップを追加（対応端末のみ表示）。
- 設定は localStorage に保存し、次にリストを開いたとき自動で有効化
- タブ切り替えでOSにロックを解放されても、復帰時に自動再取得
- iOS Safari では自動復元がユーザー操作なしだと拒否されることがあるため、その状態でのタップは「ONにする（再取得）」として扱う

**② カテゴリ自動判定**
`lib/autoCategory.ts` に食材名→カテゴリの辞書（約200語）を実装。野菜だけでなく肉・魚・パン・穀物・日用品も判定する。
- NFKC正規化＋カタカナ→ひらがな変換で表記ゆれを吸収（にんじん/ニンジン/人参）
- 最長キーワード優先で「フライパン→日用品」「スイカ→いか誤判定なし」などの衝突を回避
- 手動でカテゴリを選んだあとは自動判定で上書きしない

**③ その他の改善**
- 全チェック完了カードに「もう一度このリストを使う」ボタン（定番リストの再利用）
- PWA対応：`app/manifest.ts`＋アイコン生成で、スマホのホーム画面に追加可能に
- 追加フォームに「〇〇を追加しました」のインラインフィードバック

### 学び
辞書ベースの分類は部分一致だと「スイカ→いか（魚）」「バニラ→にら（やさい）」のような誤爆が起きる。長いキーワードを優先するソート＋遮断用エントリ（null）で対処した。

---

## 全体の反省点まとめ

### ユーザーの指示が曖昧だったケース
| 場面 | 曖昧だった点 |
|---|---|
| 初期仕様 | デザインが「Apple HIG」と書いてあったが途中でM3に変更 |
| 削除機能 | 「削除ができない」＝UXが分かりにくい、という意味だった |
| 「色の変化がない」 | フォーカス時のボーダー色変化のことだったが、CSS全体の問題と特定するまで時間がかかった |

### AI（Claude）側のミス
| 場面 | ミスの内容 |
|---|---|
| 初期実装 | Tailwind v4のインストールを確認せずv3の記法で生成 |
| リスト一覧 | 戻った時の一覧表示を最初から実装しなかった |
| CSS変数 | Tailwind v4 + SSR環境でのCSS変数の動作を楽観視した |
| Prismaアダプター | ライブラリのAPI仕様を事前確認せずに実装し、命名・使い方の両方でミス |
| Vercel CLI | 日本語ディレクトリ名の問題を事前に予測できなかった |

---

## 最終的なリポジトリ

**GitHub**: https://github.com/madppp/kaimono
**本番URL**: Vercel にデプロイ済み

**コミット履歴**
1. `Initial commit from Create Next App`
2. `家族用買い物リストアプリ（Next.js 14 + Turso + M3 Expressive）`
3. `fix: Turso adapter修正・Vercelビルド対応`
4. `docs: アーキテクチャドキュメント追加`
5. `chore: 不要なドキュメント削除`

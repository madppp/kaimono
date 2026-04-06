"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { t } from "@/lib/theme";
import Icon from "@/components/Icon";

interface ShoppingList {
  id: string;
  name: string;
  createdAt: Date | string;
  _count: { items: number };
}

export default function HomeClient({ initialLists }: { initialLists: ShoppingList[] }) {
  const router = useRouter();
  const [listName, setListName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [lists, setLists] = useState(initialLists);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!listName.trim()) { setError("リスト名を入力してください"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listName.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLists((prev) => [{ ...data, _count: { items: 0 } }, ...prev]);
      router.push(`/list/${data.id}`);
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  const handleDeleteList = async (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
    await fetch(`/api/lists/${id}`, { method: "DELETE" });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const borderColor = error ? t.error : focused ? t.primary : t.outlineVariant;

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 32, backgroundColor: t.background }}>
      {/* Header */}
      <div style={{ padding: "56px 16px 24px", backgroundColor: t.surfaceContainer }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Icon name="shopping_cart" size={36} color={t.primary} fill />
          <h1 style={{ fontSize: 32, fontWeight: 700, color: t.onSurface }}>買い物リスト</h1>
        </div>
        <p style={{ fontSize: 14, color: t.onSurfaceVariant }}>家族みんなで共有できる買い物リスト</p>
      </div>

      <div style={{ padding: "0 16px", maxWidth: 512, margin: "24px auto 0" }}>
        {/* 新規作成カード */}
        <div style={{ backgroundColor: t.primaryContainer, borderRadius: 24, padding: 20, boxShadow: t.elevation1, marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: t.onPrimaryContainer, marginBottom: 12 }}>新しいリストを作成</p>
          <input
            type="text"
            value={listName}
            onChange={(e) => { setListName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="例：今週の買い物"
            autoFocus
            style={{
              display: "block", width: "100%", boxSizing: "border-box",
              borderRadius: 12, padding: "12px 16px", fontSize: 16,
              outline: "none", backgroundColor: t.surfaceContainerLowest,
              color: t.onSurface, border: `2px solid ${borderColor}`,
              transition: "border-color 150ms",
            }}
          />
          {error && <p style={{ marginTop: 6, fontSize: 13, color: t.error }}>{error}</p>}
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              display: "block", width: "100%", marginTop: 12,
              backgroundColor: loading ? t.outlineVariant : t.primary,
              color: t.onPrimary, fontWeight: 600, borderRadius: 9999,
              padding: "13px 0", fontSize: 16, minHeight: 48, border: "none",
              cursor: loading ? "not-allowed" : "pointer", transition: "background-color 150ms",
            }}
          >
            {loading ? "作成中..." : "リストをつくる"}
          </button>
        </div>

        {/* リスト一覧 */}
        {lists.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: t.onSurfaceVariant, letterSpacing: "0.08em", marginBottom: 10, paddingLeft: 4 }}>
              これまでのリスト
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lists.map((list) => (
                <div key={list.id}>
                  {/* リスト行 */}
                  <div style={{ display: "flex", alignItems: "center", borderRadius: deletingId === list.id ? "16px 16px 0 0" : 16, backgroundColor: t.surface, boxShadow: t.elevation1, overflow: "hidden" }}>
                    <Link
                      href={`/list/${list.id}`}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", flex: 1, minWidth: 0, textDecoration: "none", color: "inherit" }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, backgroundColor: t.secondaryContainer, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="shopping_bag" size={22} color={t.onSecondaryContainer} fill />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 500, fontSize: 16, color: t.onSurface, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {list.name}
                        </p>
                        <p style={{ fontSize: 13, color: t.onSurfaceVariant, marginTop: 2 }}>
                          {list._count.items}品目 · {formatDate(list.createdAt)}
                        </p>
                      </div>
                    </Link>
                    {/* 削除ボタン */}
                    <button
                      onClick={() => setDeletingId(deletingId === list.id ? null : list.id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: deletingId === list.id ? t.error : t.onSurfaceVariant }}
                    >
                      <Icon name="delete" size={20} />
                    </button>
                  </div>
                  {/* 削除確認バー */}
                  {deletingId === list.id && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", backgroundColor: t.errorContainer, borderRadius: "0 0 16px 16px", borderTop: `1px solid ${t.outlineVariant}` }}>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: t.onErrorContainer }}>削除しますか？</span>
                      <button
                        onClick={() => setDeletingId(null)}
                        style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, color: t.primary, background: "none", border: "none", minHeight: 40, cursor: "pointer" }}
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, backgroundColor: t.error, color: t.onError, border: "none", minHeight: 40, cursor: "pointer" }}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

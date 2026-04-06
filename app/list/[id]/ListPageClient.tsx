"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import AddItemForm from "@/components/AddItemForm";
import ShoppingItemRow from "@/components/ShoppingItemRow";
import ProgressBar from "@/components/ProgressBar";
import { PRESET_CATEGORIES } from "@/lib/categories";
import { t } from "@/lib/theme";
import Icon from "@/components/Icon";

interface ShoppingItem {
  id: string; name: string; quantity: number;
  category: string; checked: boolean; createdAt: string | Date;
}
interface ShoppingList { id: string; name: string; items: ShoppingItem[]; }

export default function ListPageClient({ initialList }: { initialList: ShoppingList }) {
  const [items, setItems] = useState<ShoppingItem[]>(
    initialList.items.map((i) => ({ ...i, createdAt: typeof i.createdAt === "string" ? i.createdAt : i.createdAt.toISOString() }))
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [snackbar, setSnackbar] = useState("");

  const showSnackbar = (msg: string) => { setSnackbar(msg); setTimeout(() => setSnackbar(""), 3000); };

  const checkedCount = items.filter((i) => i.checked).length;
  const total = items.length;
  const allDone = total > 0 && checkedCount === total;

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); showSnackbar("URLをコピーしました"); }
    catch { showSnackbar("コピーに失敗しました"); }
  };

  const handleCopyText = async () => {
    const unchecked = items.filter((i) => !i.checked);
    if (!unchecked.length) { showSnackbar("未購入のアイテムがありません"); return; }
    const groups: Record<string, ShoppingItem[]> = {};
    unchecked.forEach((i) => { if (!groups[i.category]) groups[i.category] = []; groups[i.category].push(i); });
    const emoji = (c: string) => PRESET_CATEGORIES.find((p) => p.value === c)?.emoji ?? "📦";
    const lines = [`【${initialList.name}】`];
    Object.entries(groups).forEach(([cat, its]) => { lines.push(`\n${emoji(cat)} ${cat}`); its.forEach((i) => lines.push(`・${i.name}　× ${i.quantity}`)); });
    try { await navigator.clipboard.writeText(lines.join("\n")); showSnackbar("リストをテキストコピーしました"); }
    catch { showSnackbar("コピーに失敗しました"); }
  };

  const handleItemAdded = (item: ShoppingItem) => setItems((prev) => [...prev, item]);

  const handleToggle = useCallback(async (itemId: string, checked: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, checked } : i)));
    await fetch(`/api/items/${itemId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checked }) });
  }, []);

  const handleDelete = useCallback(async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await fetch(`/api/items/${itemId}`, { method: "DELETE" });
  }, []);

  const handleEdit = useCallback(async (itemId: string, name: string, quantity: number, category: string) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, name, quantity, category } : i)));
    await fetch(`/api/items/${itemId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, quantity, category }) });
  }, []);

  const groupByCategory = (items: ShoppingItem[]) => {
    const g: Record<string, ShoppingItem[]> = {};
    items.forEach((i) => { if (!g[i.category]) g[i.category] = []; g[i.category].push(i); });
    return g;
  };

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const uncheckedGroups = groupByCategory(unchecked);
  const checkedGroups = groupByCategory(checked);

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 112, backgroundColor: t.background }}>

      {/* Top App Bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: t.surfaceContainer }}>
        <div style={{ maxWidth: 512, margin: "0 auto", padding: "0 4px", height: 64, display: "flex", alignItems: "center", gap: 4 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 9999, color: t.onSurface, textDecoration: "none", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 style={{ flex: 1, fontSize: 20, fontWeight: 600, color: t.onSurface, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {initialList.name}
          </h1>
          <button onClick={handleCopyText}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 9999, color: t.onSurfaceVariant, background: "none", border: "none", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button onClick={handleShare}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 9999, color: t.onSurfaceVariant, background: "none", border: "none", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 512, margin: "0 auto", padding: "16px 16px 0" }}>
        {total > 0 && <div style={{ marginBottom: 12 }}><ProgressBar checked={checkedCount} total={total} /></div>}

        {/* 完了メッセージ */}
        {allDone && (
          <div style={{ borderRadius: 24, padding: "24px 16px", textAlign: "center", backgroundColor: t.primaryContainer, color: t.onPrimaryContainer, marginBottom: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <p style={{ fontWeight: 600, fontSize: 18 }}>お買い物完了！</p>
            <p style={{ fontSize: 14, marginTop: 4, opacity: 0.75 }}>全部そろいましたね</p>
          </div>
        )}

        {/* 空状態 */}
        {total === 0 && (
          <div style={{ borderRadius: 24, padding: 40, textAlign: "center", backgroundColor: t.surfaceContainer }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <p style={{ fontWeight: 500, fontSize: 16, color: t.onSurface }}>まだアイテムがありません</p>
            <p style={{ fontSize: 14, marginTop: 4, color: t.onSurfaceVariant }}>右下のボタンから追加してみましょう！</p>
          </div>
        )}

        {/* 未チェックグループ */}
        {Object.entries(uncheckedGroups).map(([category, catItems]) => (
          <div key={category} style={{ borderRadius: 16, overflow: "hidden", backgroundColor: t.surface, boxShadow: t.elevation1, marginBottom: 10 }}>
            <div style={{ padding: "8px 16px", backgroundColor: t.surfaceContainerHigh, borderBottom: `1px solid ${t.outlineVariant}` }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.onSurfaceVariant, letterSpacing: "0.08em" }}>
                {(() => { const cat = PRESET_CATEGORIES.find((c) => c.value === category); return cat ? <><Icon name={cat.icon} size={14} />{" "}</> : null; })()}{category}
              </span>
            </div>
            {catItems.map((item, idx) => (
              <ShoppingItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} isLast={idx === catItems.length - 1} />
            ))}
          </div>
        ))}

        {/* チェック済み */}
        {checked.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: t.onSurfaceVariant, letterSpacing: "0.08em", paddingLeft: 4, marginBottom: 8 }}>購入済み</p>
            {Object.entries(checkedGroups).map(([category, catItems]) => (
              <div key={category} style={{ borderRadius: 16, overflow: "hidden", backgroundColor: t.surfaceContainerLow, marginBottom: 8 }}>
                <div style={{ padding: "8px 16px", backgroundColor: t.surfaceContainerHigh, borderBottom: `1px solid ${t.outlineVariant}` }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.onSurfaceVariant, letterSpacing: "0.08em" }}>
                    {(() => { const cat = PRESET_CATEGORIES.find((c) => c.value === category); return cat ? <><Icon name={cat.icon} size={14} />{" "}</> : null; })()}{category}
                  </span>
                </div>
                {catItems.map((item, idx) => (
                  <ShoppingItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} isLast={idx === catItems.length - 1} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fab"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 30,
          display: "flex", alignItems: "center", gap: 10,
          borderRadius: 16, padding: "0 20px", height: 56, border: "none",
          backgroundColor: t.primaryContainer, color: t.onPrimaryContainer,
          fontWeight: 600, fontSize: 15, cursor: "pointer",
          boxShadow: t.elevation3,
        }}
      >
        <Icon name="add" size={22} color={t.onPrimaryContainer} />
        追加する
      </button>

      <AddItemForm listId={initialList.id} open={sheetOpen} onClose={() => setSheetOpen(false)} onItemAdded={handleItemAdded} />

      {/* Snackbar */}
      {snackbar && (
        <div style={{
          position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", zIndex: 60,
          padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500,
          backgroundColor: t.onSurface, color: t.surface,
          boxShadow: t.elevation3, whiteSpace: "nowrap",
        }}>
          {snackbar}
        </div>
      )}
    </div>
  );
}

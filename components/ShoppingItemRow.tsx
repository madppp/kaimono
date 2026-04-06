"use client";

import { useState } from "react";
import { PRESET_CATEGORIES } from "@/lib/categories";
import { t } from "@/lib/theme";
import Icon from "./Icon";

interface ShoppingItem {
  id: string; name: string; quantity: number; category: string; checked: boolean;
}
interface Props {
  item: ShoppingItem;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string, quantity: number, category: string) => void;
  isLast: boolean;
}

export default function ShoppingItemRow({ item, onToggle, onDelete, onEdit, isLast }: Props) {
  const [mode, setMode] = useState<"view" | "edit" | "deleteConfirm">("view");
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editCategory, setEditCategory] = useState(item.category);
  const [editCustom, setEditCustom] = useState(
    PRESET_CATEGORIES.some((c) => c.value === item.category) ? "" : item.category
  );
  const [nameFocused, setNameFocused] = useState(false);

  const openEdit = () => {
    setEditName(item.name); setEditQuantity(item.quantity); setEditCategory(item.category);
    setEditCustom(PRESET_CATEGORIES.some((c) => c.value === item.category) ? "" : item.category);
    setMode("edit");
  };
  const handleSave = () => {
    if (!editName.trim()) return;
    onEdit(item.id, editName.trim(), editQuantity, editCategory);
    setMode("view");
  };
  const handleCategoryPreset = (v: string) => { setEditCustom(""); setEditCategory(v); };
  const handleCustomCategory = (v: string) => { setEditCustom(v); setEditCategory(v || "その他"); };

  if (mode === "edit") {
    return (
      <div style={{ padding: 16, backgroundColor: t.surfaceContainerLow }}>
        {/* 食材名 */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: t.onSurfaceVariant, marginBottom: 4 }}>食材名</label>
          <input
            type="text" value={editName} autoFocus
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            style={{
              display: "block", width: "100%", boxSizing: "border-box",
              borderRadius: 12, padding: "10px 14px", fontSize: 16, outline: "none",
              backgroundColor: t.surface, color: t.onSurface,
              border: `2px solid ${nameFocused ? t.primary : t.outlineVariant}`,
              transition: "border-color 150ms",
            }}
          />
        </div>
        {/* 個数 */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: t.onSurfaceVariant, marginBottom: 4 }}>個数</label>
          <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${t.outlineVariant}`, borderRadius: 9999, overflow: "hidden" }}>
            <button onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
              style={{ padding: "6px 14px", fontSize: 18, fontWeight: 700, color: t.primary, minWidth: 44, minHeight: 44, background: "none", border: "none", cursor: "pointer" }}>−</button>
            <span style={{ fontSize: 16, fontWeight: 600, color: t.onSurface, minWidth: 32, textAlign: "center" }}>{editQuantity}</span>
            <button onClick={() => setEditQuantity(editQuantity + 1)}
              style={{ padding: "6px 14px", fontSize: 18, fontWeight: 700, color: t.primary, minWidth: 44, minHeight: 44, background: "none", border: "none", cursor: "pointer" }}>＋</button>
          </div>
        </div>
        {/* カテゴリ */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: t.onSurfaceVariant, marginBottom: 6 }}>カテゴリ</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {PRESET_CATEGORIES.map((cat) => {
              const selected = editCategory === cat.value && !editCustom;
              return (
                <button key={cat.value} type="button" onClick={() => handleCategoryPreset(cat.value)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px 6px 8px", borderRadius: 9999, fontSize: 13, fontWeight: 500, minHeight: 32, cursor: "pointer", backgroundColor: selected ? t.secondaryContainer : "transparent", color: selected ? t.onSecondaryContainer : t.onSurfaceVariant, border: `1px solid ${selected ? "transparent" : t.outlineVariant}`, transition: "all 150ms" }}>
                  {selected ? <Icon name="check" size={14} /> : <Icon name={cat.icon} size={14} />}
                  {cat.label}
                </button>
              );
            })}
          </div>
          <input type="text" value={editCustom} onChange={(e) => handleCustomCategory(e.target.value)}
            placeholder="または自由入力..."
            style={{ display: "block", width: "100%", boxSizing: "border-box", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", backgroundColor: t.surface, color: t.onSurface, border: `1px solid ${t.outlineVariant}` }}
          />
        </div>
        {/* ボタン */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMode("view")}
            style={{ flex: 1, borderRadius: 9999, padding: "10px 0", fontSize: 14, fontWeight: 500, minHeight: 40, border: `1px solid ${t.outline}`, color: t.primary, backgroundColor: "transparent", cursor: "pointer" }}>
            キャンセル
          </button>
          <button onClick={handleSave}
            style={{ flex: 1, borderRadius: 9999, padding: "10px 0", fontSize: 14, fontWeight: 500, minHeight: 40, border: "none", backgroundColor: t.primary, color: t.onPrimary, cursor: "pointer" }}>
            保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 6px 10px 4px", gap: 2, backgroundColor: t.surface }}>
        {/* Checkbox */}
        <button onClick={() => onToggle(item.id, !item.checked)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: item.checked ? t.primary : "transparent", border: `2px solid ${item.checked ? t.primary : t.outline}`, transition: "all 150ms" }}>
            {item.checked && <Icon name="check" size={14} color="#fff" fill />}
          </div>
        </button>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0, padding: "0 4px" }}>
          <span style={{ fontSize: 15, color: item.checked ? t.onSurfaceVariant : t.onSurface, textDecoration: item.checked ? "line-through" : "none" }}>
            {item.name}
          </span>
          <span style={{ fontSize: 13, marginLeft: 6, color: t.onSurfaceVariant }}>× {item.quantity}</span>
        </div>
        {/* Edit */}
        <button onClick={openEdit}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, borderRadius: 9999, color: t.onSurfaceVariant, background: "none", border: "none", cursor: "pointer" }}>
          <Icon name="edit" size={18} />
        </button>
        {/* Delete */}
        <button onClick={() => setMode("deleteConfirm")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, borderRadius: 9999, color: t.error, background: "none", border: "none", cursor: "pointer" }}>
          <Icon name="delete" size={18} />
        </button>
      </div>
      {/* Delete confirm */}
      {mode === "deleteConfirm" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", backgroundColor: t.errorContainer, borderTop: `1px solid ${t.outlineVariant}` }}>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: t.onErrorContainer }}>削除しますか？</span>
          <button onClick={() => setMode("view")}
            style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, color: t.primary, background: "none", border: "none", minHeight: 40, cursor: "pointer" }}>
            キャンセル
          </button>
          <button onClick={() => onDelete(item.id)}
            style={{ padding: "8px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, backgroundColor: t.error, color: t.onError, border: "none", minHeight: 40, cursor: "pointer" }}>
            削除
          </button>
        </div>
      )}
      {!isLast && mode === "view" && (
        <div style={{ marginLeft: 52, height: 1, backgroundColor: t.outlineVariant }} />
      )}
    </>
  );
}

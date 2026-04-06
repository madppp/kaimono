"use client";

import { useState, useRef, useEffect } from "react";
import CategoryPicker from "./CategoryPicker";
import { t } from "@/lib/theme";

interface ShoppingItem {
  id: string; name: string; quantity: number;
  category: string; checked: boolean; createdAt: string;
}

interface Props {
  listId: string; open: boolean;
  onClose: () => void; onItemAdded: (item: ShoppingItem) => void;
}

export default function AddItemForm({ listId, open, onClose, onItemAdded }: Props) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("その他");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => nameRef.current?.focus(), 100);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) { setError("食材名を入力してください"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), quantity, category }),
      });
      if (!res.ok) throw new Error();
      const item = await res.json();
      onItemAdded(item);
      setName("");
      setQuantity(1);
      nameRef.current?.focus();
    } catch {
      setError("追加に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const nameBorder = error ? t.error : nameFocused ? t.primary : t.outlineVariant;

  return (
    <>
      {/* Backdrop */}
      <div
        className="sheet-backdrop"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(0,0,0,0.45)" }}
      />
      {/* Sheet */}
      <div
        className="sheet-content"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          borderRadius: "24px 24px 0 0", backgroundColor: t.surfaceContainerLow,
          maxHeight: "90dvh", overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 32, height: 4, borderRadius: 9999, backgroundColor: t.outlineVariant }} />
        </div>

        <div style={{ padding: "8px 20px 48px" }}>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: t.onSurface }}>アイテムを追加</h2>
            <button
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 9999, color: t.onSurfaceVariant, background: "none", border: "none", cursor: "pointer" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* 食材名 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: t.onSurfaceVariant, marginBottom: 6 }}>食材名</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="例：にんじん"
              style={{
                display: "block", width: "100%", boxSizing: "border-box",
                borderRadius: 12, padding: "12px 16px", fontSize: 16, outline: "none",
                backgroundColor: t.surface, color: t.onSurface,
                border: `2px solid ${nameBorder}`, transition: "border-color 150ms",
              }}
            />
            {error && <p style={{ marginTop: 4, fontSize: 12, color: t.error }}>{error}</p>}
          </div>

          {/* 個数 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: t.onSurfaceVariant, marginBottom: 6 }}>個数</label>
            <div style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${t.outlineVariant}`, borderRadius: 9999, overflow: "hidden" }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: "8px 16px", fontSize: 20, fontWeight: 700, color: t.primary, minWidth: 48, minHeight: 48, background: "none", border: "none", cursor: "pointer" }}>−</button>
              <span style={{ fontSize: 18, fontWeight: 600, color: t.onSurface, minWidth: 40, textAlign: "center" }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                style={{ padding: "8px 16px", fontSize: 20, fontWeight: 700, color: t.primary, minWidth: 48, minHeight: 48, background: "none", border: "none", cursor: "pointer" }}>＋</button>
            </div>
          </div>

          {/* カテゴリ */}
          <div style={{ marginBottom: 24 }}>
            <CategoryPicker value={category} onChange={setCategory} />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: "block", width: "100%",
              backgroundColor: loading ? t.outlineVariant : t.primary,
              color: t.onPrimary, fontWeight: 600, borderRadius: 9999,
              padding: "14px 0", fontSize: 16, minHeight: 52, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "追加中..." : "追加する"}
          </button>
        </div>
      </div>
    </>
  );
}

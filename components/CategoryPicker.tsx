"use client";

import { useState } from "react";
import { PRESET_CATEGORIES } from "@/lib/categories";
import { t } from "@/lib/theme";
import Icon from "./Icon";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryPicker({ value, onChange }: Props) {
  const [customInput, setCustomInput] = useState(
    PRESET_CATEGORIES.some((c) => c.value === value) ? "" : value
  );
  const [focused, setFocused] = useState(false);

  const handlePreset = (v: string) => { setCustomInput(""); onChange(v); };
  const handleCustom = (v: string) => { setCustomInput(v); onChange(v || "その他"); };

  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: t.onSurfaceVariant, marginBottom: 8 }}>カテゴリ</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {PRESET_CATEGORIES.map((cat) => {
          const selected = value === cat.value && !customInput;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handlePreset(cat.value)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px 6px 10px", borderRadius: 9999,
                fontSize: 13, fontWeight: 500, minHeight: 36, cursor: "pointer",
                backgroundColor: selected ? t.secondaryContainer : "transparent",
                color: selected ? t.onSecondaryContainer : t.onSurfaceVariant,
                border: `1px solid ${selected ? "transparent" : t.outlineVariant}`,
                transition: "all 150ms",
              }}
            >
              {selected
                ? <Icon name="check" size={16} color={t.onSecondaryContainer} />
                : <Icon name={cat.icon} size={16} />}
              {cat.label}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={customInput}
        onChange={(e) => handleCustom(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="または自由入力..."
        style={{
          display: "block", width: "100%", boxSizing: "border-box",
          borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none",
          backgroundColor: t.surface, color: t.onSurface,
          border: `1px solid ${focused ? t.primary : t.outlineVariant}`,
          transition: "border-color 150ms",
        }}
      />
    </div>
  );
}

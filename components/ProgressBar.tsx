import { t } from "@/lib/theme";

interface Props { checked: number; total: number; }

export default function ProgressBar({ checked, total }: Props) {
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
  return (
    <div style={{ padding: "12px 16px", borderRadius: 16, backgroundColor: t.surfaceContainer }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: t.onSurfaceVariant }}>進捗</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.primary }}>{checked} / {total} 完了</span>
      </div>
      <div style={{ height: 4, borderRadius: 9999, backgroundColor: t.surfaceContainerHigh, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 9999, backgroundColor: t.primary, width: `${percent}%`, transition: "width 500ms ease" }} />
      </div>
    </div>
  );
}

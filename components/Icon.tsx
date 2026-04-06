interface Props {
  name: string;
  size?: number;
  fill?: boolean;
  color?: string;
}

export default function Icon({ name, size = 24, fill = false, color }: Props) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        color: color ?? "inherit",
      }}
    >
      {name}
    </span>
  );
}

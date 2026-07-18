/** SVGs del diseño de Stan, como componentes reutilizables. Heredan color
 *  vía currentColor salvo que se pase `stroke`. */

type IconProps = {
  width?: number;
  height?: number;
  strokeWidth?: number;
  stroke?: string;
  style?: React.CSSProperties;
  className?: string;
};

export function ArrowRight({ width = 70, height = 12, strokeWidth = 1.5, stroke = "currentColor", style }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 70 12" fill="none" style={{ flex: "none", ...style }}>
      <path d="M0 6H66M66 6L60 1M66 6L60 11" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function ArrowLeft({ width = 70, height = 12, strokeWidth = 1.5, stroke = "currentColor", style }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 70 12" fill="none" style={{ flex: "none", ...style }}>
      <path d="M70 6H4M4 6L10 1M4 6L10 11" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function ChevronDown({ width = 26, height = 16, strokeWidth = 1.6, stroke = "currentColor", style }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 26 16" fill="none" style={style}>
      <path d="M1 1L13 13L25 1" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function PlayCircle({ width = 24, height = 24, strokeWidth = 1.5, stroke = "currentColor", style }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} style={style}>
      <circle cx="12" cy="12" r="10" />
      <path d="M10 8l6 4-6 4V8z" fill={stroke} stroke="none" />
    </svg>
  );
}

export function Close({ width = 24, height = 24, strokeWidth = 1.8, stroke = "currentColor", style }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} style={style}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

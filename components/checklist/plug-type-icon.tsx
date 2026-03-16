"use client";

/**
 * Small SVG illustrations of electrical socket types.
 * Each icon shows the socket face (what you see on the wall).
 * ViewBox: 32×32. Used inline in checklist items for power adapter entries.
 */

interface SocketSvgProps {
  className?: string;
  width?: number;
  height?: number;
}

// ── Individual socket drawings ────────────────────────────────────────────────

// Type A — US/Japan: two flat vertical slots
function SocketA({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type A socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      <rect x="10" y="10" width="4" height="11" rx="1.5" fill="#52525b" />
      <rect x="18" y="10" width="4" height="11" rx="1.5" fill="#52525b" />
    </svg>
  );
}

// Type C — Europlug / Type E / Type F: two round holes
function SocketC({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type C/E/F socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      <circle cx="11" cy="16" r="3.5" fill="#52525b" />
      <circle cx="21" cy="16" r="3.5" fill="#52525b" />
    </svg>
  );
}

// Type G — British Standard: distinctive "face" with 3 rectangular slots
function SocketG({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type G socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      {/* Earth (top-center, horizontal) */}
      <rect x="12" y="7" width="8" height="4" rx="1.5" fill="#52525b" />
      {/* Left live */}
      <rect x="4" y="19" width="9" height="4" rx="1.5" fill="#52525b" />
      {/* Right neutral */}
      <rect x="19" y="19" width="9" height="4" rx="1.5" fill="#52525b" />
    </svg>
  );
}

// Type H — Israeli: three round holes in a Y / inverted-V shape
function SocketH({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type H socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      {/* Top centre */}
      <circle cx="16" cy="9" r="3" fill="#52525b" />
      {/* Bottom left */}
      <circle cx="9" cy="23" r="3" fill="#52525b" />
      {/* Bottom right */}
      <circle cx="23" cy="23" r="3" fill="#52525b" />
    </svg>
  );
}

// Type I — Australian/NZ/Argentina: two diagonal flat slots in a V, optional ground below
function SocketI({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type I socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      {/* Left pin, angled inward (~-30°) */}
      <rect
        x="9" y="9" width="4" height="11" rx="1.5" fill="#52525b"
        transform="rotate(-20 11 14.5)"
      />
      {/* Right pin, mirrored (+20°) */}
      <rect
        x="19" y="9" width="4" height="11" rx="1.5" fill="#52525b"
        transform="rotate(20 21 14.5)"
      />
      {/* Ground below */}
      <rect x="14" y="24" width="4" height="5" rx="1.5" fill="#52525b" />
    </svg>
  );
}

// Type J — Swiss: two round holes + one centred below
function SocketJ({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type J socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      <circle cx="11" cy="13" r="3" fill="#52525b" />
      <circle cx="21" cy="13" r="3" fill="#52525b" />
      <circle cx="16" cy="23" r="3" fill="#52525b" />
    </svg>
  );
}

// Type K — Danish: two round holes + U-shaped ground below
function SocketK({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type K socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      <circle cx="11" cy="13" r="3" fill="#52525b" />
      <circle cx="21" cy="13" r="3" fill="#52525b" />
      {/* U-shaped ground */}
      <path d="M11 26 Q16 20 21 26" stroke="#52525b" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Type L — Italian: three round holes in a horizontal row
function SocketL({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type L socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      <circle cx="8"  cy="16" r="3" fill="#52525b" />
      <circle cx="16" cy="16" r="3" fill="#52525b" />
      <circle cx="24" cy="16" r="3" fill="#52525b" />
    </svg>
  );
}

// Type D / Type M — India / South Africa: three large round holes in a triangle
function SocketDM({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type D/M socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      <circle cx="16" cy="9"  r="3.5" fill="#52525b" />
      <circle cx="9"  cy="23" r="3.5" fill="#52525b" />
      <circle cx="23" cy="23" r="3.5" fill="#52525b" />
    </svg>
  );
}

// Type N — Brazilian: two round + smaller round ground (similar to J but shifted)
function SocketN({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Type N socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      <circle cx="12" cy="13" r="3" fill="#52525b" />
      <circle cx="22" cy="13" r="3" fill="#52525b" />
      <circle cx="17" cy="23" r="2.5" fill="#52525b" />
    </svg>
  );
}

// Generic fallback
function SocketGeneric({ className, width, height }: SocketSvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} width={width} height={height} aria-label="Socket">
      <rect x="1" y="1" width="30" height="30" rx="5" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="1" />
      <circle cx="16" cy="14" r="3.5" fill="#52525b" />
      <circle cx="10" cy="23" r="3.5" fill="#52525b" />
      <circle cx="22" cy="23" r="3.5" fill="#52525b" />
    </svg>
  );
}

// ── Plug type names for labels ────────────────────────────────────────────────

export const PLUG_TYPE_NAMES: Record<string, string> = {
  A: "Type A (US/Japan)",
  B: "Type B (US/Canada)",
  C: "Type C (Europlug)",
  D: "Type D (India)",
  E: "Type E (France)",
  F: "Type F (Schuko/Europe)",
  G: "Type G (UK/HK/SG)",
  H: "Type H (Israel)",
  I: "Type I (AU/NZ/AR)",
  J: "Type J (Switzerland)",
  K: "Type K (Denmark)",
  L: "Type L (Italy)",
  M: "Type M (South Africa)",
  N: "Type N (Brazil)",
};

// ── Public API ────────────────────────────────────────────────────────────────

interface PlugTypeIconProps {
  /** IEC plug type letter, e.g. "G" */
  type: string;
  /** Size in pixels (square). Defaults to 32. */
  size?: number;
}

export function PlugTypeIcon({ type, size = 32 }: PlugTypeIconProps) {
  const props = { className: "rounded", width: size, height: size };

  switch (type.toUpperCase()) {
    case "A":
    case "B":
      return <SocketA {...props} />;
    case "C":
    case "E":
    case "F":
      return <SocketC {...props} />;
    case "G":
      return <SocketG {...props} />;
    case "H":
      return <SocketH {...props} />;
    case "I":
      return <SocketI {...props} />;
    case "J":
      return <SocketJ {...props} />;
    case "K":
      return <SocketK {...props} />;
    case "L":
      return <SocketL {...props} />;
    case "D":
    case "M":
      return <SocketDM {...props} />;
    case "N":
      return <SocketN {...props} />;
    default:
      return <SocketGeneric {...props} />;
  }
}

/**
 * Extracts plug type letters from a power adapter item text.
 * e.g. "Power adapter (Type G)" → ["G"]
 *      "Power adapter (Type C / Type F)" → ["C", "F"]
 */
export function extractPlugTypes(text: string): string[] {
  const matches = [...text.matchAll(/Type\s+([A-N])/gi)];
  // Deduplicate while preserving order
  const seen = new Set<string>();
  return matches
    .map((m) => m[1].toUpperCase())
    .filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
}

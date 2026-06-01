import React from 'react';

/**
 * SportIcon – clean SVG vector icons for each sport.
 * Uses currentColor so they inherit any text-* class.
 *
 * Props:
 *   sport   – string key (see ICONS below)
 *   size    – pixel size (default 24)
 *   className – extra Tailwind classes
 */

const base = (children) => (extra) =>
  <svg width={extra.size} height={extra.size} viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" className={extra.className}
    aria-label={extra.label}>
    {children}
  </svg>;

const ICONS = {
  /* ── Football / Soccer ─────────────────────────── */
  Football: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      {/* top pentagon */}
      <polygon points="12,2.5 9.2,7.5 11,11 13,11 14.8,7.5" fill="currentColor" opacity="0.9"/>
      {/* left pentagon */}
      <polygon points="3,9.5 6.5,8 9,11 7.5,14.5 3.5,13.5" fill="currentColor" opacity="0.7"/>
      {/* right pentagon */}
      <polygon points="21,9.5 17.5,8 15,11 16.5,14.5 20.5,13.5" fill="currentColor" opacity="0.7"/>
      {/* bottom pentagon */}
      <polygon points="12,21.5 9.2,16.5 11,13 13,13 14.8,16.5" fill="currentColor" opacity="0.8"/>
      <polygon points="4.5,15.5 7.5,14.5 9,17.5 7,20 4,18.5" fill="currentColor" opacity="0.5"/>
      <polygon points="19.5,15.5 16.5,14.5 15,17.5 17,20 20,18.5" fill="currentColor" opacity="0.5"/>
    </svg>
  ),

  /* ── Badminton ─────────────────────────────────── */
  Badminton: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Racket head */}
      <ellipse cx="9.5" cy="9.5" rx="7" ry="8" stroke="currentColor" strokeWidth="1.5"/>
      {/* String cross */}
      <line x1="9.5" y1="1.5" x2="9.5" y2="17.5" stroke="currentColor" strokeWidth="0.8"/>
      <line x1="2.5" y1="9.5" x2="16.5" y2="9.5" stroke="currentColor" strokeWidth="0.8"/>
      <line x1="4.5" y1="4.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
      <line x1="14.5" y1="4.5" x2="4.5" y2="14.5" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
      {/* Handle */}
      <line x1="14.5" y1="16.5" x2="22" y2="23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Shuttlecock (top-left) */}
      <circle cx="3.5" cy="3.5" r="1.2" stroke="currentColor" strokeWidth="1"/>
      <path d="M3.5 2.3 L3.5 0.5 M4.5 3 L6 2.2 M3 4.4 L2 5.8" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round"/>
    </svg>
  ),

  /* ── Table Tennis ──────────────────────────────── */
  'Table Tennis': ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Paddle head */}
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
      {/* Rubber dividing line */}
      <line x1="3.5" y1="7" x2="16.5" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
      {/* Handle */}
      <path d="M16.5 16 L22 21.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      {/* Ball */}
      <circle cx="21" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M19 4 Q21 6 23 4" stroke="currentColor" strokeWidth="0.8"/>
    </svg>
  ),

  /* ── Bowling ───────────────────────────────────── */
  Bowling: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Ball */}
      <circle cx="12" cy="13" r="9.5" stroke="currentColor" strokeWidth="1.5"/>
      {/* Finger holes */}
      <circle cx="9.5" cy="10" r="1.8" fill="currentColor"/>
      <circle cx="13.5" cy="8.5" r="1.8" fill="currentColor"/>
      <circle cx="15.5" cy="12.5" r="1.8" fill="currentColor"/>
      {/* Pin silhouette above */}
      <path d="M12 2 C10.5 2 9.5 2.8 9.5 4 C9.5 4.8 10 5.2 10 5.2 L9 6 L9 6.5 L15 6.5 L15 6 L14 5.2 C14 5.2 14.5 4.8 14.5 4 C14.5 2.8 13.5 2 12 2Z" fill="currentColor" opacity="0.5"/>
    </svg>
  ),

  /* ── Cricket ───────────────────────────────────── */
  Cricket: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Bat blade */}
      <path d="M14 2 L16 2 L17 14 L13 14 L14 2Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15"/>
      <line x1="14" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="16" y1="2" x2="17" y2="14" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="14" y1="2" x2="16" y2="2" stroke="currentColor" strokeWidth="1.2"/>
      {/* Bat handle */}
      <path d="M13 14 L14.5 22 L15.5 22 L17 14 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.4"/>
      {/* Ball */}
      <circle cx="6" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 4.5 Q8.5 8 6 11.5" stroke="currentColor" strokeWidth="0.9" fill="none"/>
      <path d="M4.5 4.5 Q2 8 4.5 11.5" stroke="currentColor" strokeWidth="0.9" fill="none"/>
    </svg>
  ),

  /* ── Basketball ────────────────────────────────── */
  Basketball: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      {/* Seam curves */}
      <path d="M12 2 C8 5 8 19 12 22" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M12 2 C16 5 16 19 12 22" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),

  /* ── Pickleball ────────────────────────────────── */
  Pickleball: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Paddle head with holes */}
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="7.5" cy="8" r="1" fill="currentColor" opacity="0.8"/>
      <circle cx="11.5" cy="7" r="1" fill="currentColor" opacity="0.8"/>
      <circle cx="13" cy="11" r="1" fill="currentColor" opacity="0.8"/>
      <circle cx="9" cy="13" r="1" fill="currentColor" opacity="0.8"/>
      <circle cx="7" cy="12" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="11" cy="12" r="1" fill="currentColor" opacity="0.6"/>
      <circle cx="9.5" cy="8.5" r="1" fill="currentColor" opacity="0.6"/>
      {/* Handle */}
      <path d="M16.5 16 L22 21.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),

  /* ── Gaming ────────────────────────────────────── */
  Gaming: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Controller body */}
      <path d="M6 9.5 Q2 9.5 2 13.5 L3 17.5 Q4 21 7.5 21 L9.5 18.5 L14.5 18.5 L16.5 21 Q20 21 21 17.5 L22 13.5 Q22 9.5 18 9.5 L16.5 7.5 L7.5 7.5 Z"
        stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      {/* D-pad */}
      <line x1="8" y1="12" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="6" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Face buttons */}
      <circle cx="16" cy="12" r="1" fill="currentColor"/>
      <circle cx="18.5" cy="14" r="1" fill="currentColor"/>
      <circle cx="13.5" cy="14" r="1" fill="currentColor"/>
      <circle cx="16" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),

  /* ── Foosball ──────────────────────────────────── */
  Foosball: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Table outline */}
      <rect x="2" y="4" width="20" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      {/* Rods */}
      <line x1="7" y1="4" x2="7" y2="20" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="17" y1="4" x2="17" y2="20" stroke="currentColor" strokeWidth="1.2"/>
      {/* Player figures */}
      <circle cx="7" cy="10" r="2.2" fill="currentColor"/>
      <circle cx="12" cy="14" r="2.2" fill="currentColor"/>
      <circle cx="17" cy="10" r="2.2" fill="currentColor"/>
      {/* Ball */}
      <circle cx="12" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),

  /* ── Pool / Billiards ──────────────────────────── */
  Pool: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      {/* Cue */}
      <line x1="4" y1="7" x2="9.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Balls */}
      <circle cx="11" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="15" cy="10" r="2" fill="currentColor" opacity="0.8"/>
      <circle cx="15.5" cy="14.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="12" r="1" fill="currentColor" opacity="0.4"/>
    </svg>
  ),

  /* ── Generic fallback ──────────────────────────── */
  Default: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.4"/>
      <path d="M12 2 L12 22 M2 12 L22 12" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    </svg>
  ),
};

export default function SportIcon({ sport, size = 24, className = '' }) {
  const Icon = ICONS[sport] || ICONS.Default;
  return <Icon size={size} className={className} />;
}

/* Named export of the icon map for external use */
export { ICONS };

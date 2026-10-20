import { useId } from "react";

/** Benchsale Dan logo: "BD" monogram with a gold underline. */
export function Logo({ size = 36 }: { size?: number }) {
  // Unique gradient id per copy: a hidden copy (e.g. the phone top bar on desktop) must not own the
  // gradient the visible one points at.
  const gradient = `bd-logo-g-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Benchsale Dan logo" style={{ flex: "0 0 auto" }}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f4e79" />
          <stop offset="1" stopColor="#2e86c1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${gradient})`} />
      <text x="32" y="42" textAnchor="middle" fontFamily="Segoe UI, Arial, Helvetica, sans-serif" fontSize="27" fontWeight="800" fill="#ffffff" letterSpacing="-1">BD</text>
      <rect x="16" y="49" width="32" height="4" rx="2" fill="#ffd43b" />
    </svg>
  );
}

export function BrandName({ tagline = true }: { tagline?: boolean }) {
  return (
    <span className="brandname">
      <Logo />
      <span>
        <span className="brandtitle">Benchsale Dan</span>
        {tagline && <small>Resumes · Dice Apply</small>}
      </span>
    </span>
  );
}

export function Credit() {
  return <div className="credit">Developed by <strong>Danish Ali Raza</strong></div>;
}

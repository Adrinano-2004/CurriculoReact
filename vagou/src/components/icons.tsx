import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...p }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...p,
  };
}

export const I = {
  home: (p: P) => (
    <svg {...base(p)}><path d="M3 11 12 4l9 7v9H3z" /><path d="M9.5 20v-5h5v5" /></svg>
  ),
  car: (p: P) => (
    <svg {...base(p)}><path d="M5 16V11l2-5h10l2 5v5" /><rect x="3" y="11" width="18" height="6" rx="2" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></svg>
  ),
  wallet: (p: P) => (
    <svg {...base(p)}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M16 14.5h2" /></svg>
  ),
  users: (p: P) => (
    <svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0M17 5a3 3 0 0 1 0 6M21 20a5 5 0 0 0-3-4.6" /></svg>
  ),
  drop: (p: P) => (
    <svg {...base(p)}><path d="M12 3c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C7 9.5 9 7 12 3z" /></svg>
  ),
  report: (p: P) => (
    <svg {...base(p)}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></svg>
  ),
  chart: (p: P) => (
    <svg {...base(p)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
  ),
  gear: (p: P) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
  ),
  search: (p: P) => (
    <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
  ),
  plus: (p: P) => (
    <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
  ),
  x: (p: P) => (
    <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
  ),
  check: (p: P) => (
    <svg {...base(p)}><path d="m5 12 5 5 9-10" /></svg>
  ),
  lock: (p: P) => (
    <svg {...base(p)}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
  ),
  wifiOff: (p: P) => (
    <svg {...base(p)}><path d="M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01M2 2l20 20" /></svg>
  ),
  backup: (p: P) => (
    <svg {...base(p)}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
  ),
  bolt: (p: P) => (
    <svg {...base(p)}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
  ),
  phone: (p: P) => (
    <svg {...base(p)}><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>
  ),
  shield: (p: P) => (
    <svg {...base(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
  qr: (p: P) => (
    <svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></svg>
  ),
  chat: (p: P) => (
    <svg {...base(p)}><path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z" /></svg>
  ),
  printer: (p: P) => (
    <svg {...base(p)}><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></svg>
  ),
  arrowUpRight: (p: P) => (
    <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>
  ),
  arrowLeft: (p: P) => (
    <svg {...base(p)}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
  ),
  logout: (p: P) => (
    <svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
  ),
  download: (p: P) => (
    <svg {...base(p)}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
  ),
  upload: (p: P) => (
    <svg {...base(p)}><path d="M12 21V9M7 14l5-5 5 5M5 3h14" /></svg>
  ),
  edit: (p: P) => (
    <svg {...base(p)}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>
  ),
  trash: (p: P) => (
    <svg {...base(p)}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
  ),
  clock: (p: P) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  star: (p: P) => (
    <svg {...base(p)}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>
  ),
  alert: (p: P) => (
    <svg {...base(p)}><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17h.01" /></svg>
  ),
  tag: (p: P) => (
    <svg {...base(p)}><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.5" /></svg>
  ),
  menu: (p: P) => (
    <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
  ),
  sidebar: (p: P) => (
    <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></svg>
  ),
};

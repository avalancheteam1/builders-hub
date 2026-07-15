"use client";

import React, { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/* Sheet backdrop — triangular lattice, cursor spotlight, cell blips   */
/* ------------------------------------------------------------------ */

// Lattice geometry: rows H apart, triangle side S. Everything — lines,
// spotlight, and blip triangles — derives from these two numbers inside one
// SVG coordinate space, so alignment is exact by construction. (CSS gradient
// phases are viewport-center-anchored and can never be phase-locked.)
const TRI_H = 48;
const TRI_S = TRI_H / Math.sin(Math.PI / 3); // ≈ 55.426

// Blips: (n, row, up?, red?, delay). n indexes triangles along the row;
// vertices come from the same lattice function as the grid lines.
const BLIPS: [number, number, boolean, boolean, number][] = [
  [3, 2, true, true, 0],
  [14, 5, false, true, 1.0],
  [7, 8, true, false, 2.1],
  [20, 3, false, true, 3.2],
  [11, 10, true, true, 4.1],
  [24, 7, false, false, 5.2],
  [5, 6, false, true, 6.3],
  [17, 9, true, true, 7.1],
  [26, 12, true, false, 8.2],
];

function rowOffset(row: number) {
  return row % 2 === 0 ? 0 : TRI_S / 2;
}

function blipPoints(n: number, row: number, up: boolean): string {
  if (up) {
    const ax = rowOffset(row) + n * TRI_S;
    const ay = row * TRI_H;
    return `${ax},${ay} ${ax - TRI_S / 2},${ay + TRI_H} ${ax + TRI_S / 2},${ay + TRI_H}`;
  }
  const ax = rowOffset(row + 1) + n * TRI_S;
  const ay = (row + 1) * TRI_H;
  return `${ax},${ay} ${ax - TRI_S / 2},${ay - TRI_H} ${ax + TRI_S / 2},${ay - TRI_H}`;
}

function LatticePattern({ id, className }: { id: string; className: string }) {
  // One tile = S wide × 2H tall: two horizontals + one diagonal per family.
  return (
    <pattern id={id} width={TRI_S} height={TRI_H * 2} patternUnits="userSpaceOnUse">
      <g className={className} strokeWidth={1}>
        <line x1={0} y1={0.5} x2={TRI_S} y2={0.5} />
        <line x1={0} y1={TRI_H + 0.5} x2={TRI_S} y2={TRI_H + 0.5} />
        <line x1={0} y1={0} x2={TRI_S} y2={TRI_H * 2} />
        <line x1={0} y1={TRI_H * 2} x2={TRI_S} y2={0} />
      </g>
    </pattern>
  );
}

export default function SheetBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let mx = -9999;
    let my = -9999;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.setProperty("--mx", `${mx}px`);
          el.style.setProperty("--my", `${my}px`);
          raf = 0;
        });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const mask =
    "radial-gradient(280px circle at var(--mx) var(--my), black 0%, transparent 72%)";

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ "--mx": "-9999px", "--my": "-9999px" } as React.CSSProperties}
    >
      <style>{`
        @keyframes v2-blip { 0%, 76%, 100% { opacity: 0; } 84%, 94% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .v2-blip { animation: none !important; } }
      `}</style>

      {/* base lattice + blips share one SVG coordinate space */}
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <LatticePattern
            id="v2-tri-base"
            className="stroke-[rgba(24,24,27,0.045)] dark:stroke-[rgba(250,250,250,0.05)]"
          />
        </defs>
        <rect width="100%" height="100%" fill="url(#v2-tri-base)" />
        {BLIPS.map(([n, row, up, red, delay], i) => (
          <polygon
            key={i}
            className="v2-blip"
            points={blipPoints(n, row, up)}
            style={{
              fill: red ? "rgba(232,65,66,0.12)" : "rgba(127,127,135,0.09)",
              animation: `v2-blip 9s linear ${delay}s infinite`,
              opacity: 0,
            }}
          />
        ))}
      </svg>

      {/* cursor spotlight: brighter lattice revealed around the mouse */}
      <div
        className="absolute inset-0"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      >
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <LatticePattern
              id="v2-tri-bright"
              className="stroke-[rgba(24,24,27,0.16)] dark:stroke-[rgba(250,250,250,0.18)]"
            />
          </defs>
          <rect width="100%" height="100%" fill="url(#v2-tri-bright)" />
        </svg>
      </div>
    </div>
  );
}

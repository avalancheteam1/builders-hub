"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
  AnimatePresence,
  motion,
  MotionValue,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GlobeData } from "@/components/landing/globe";
import BuiltOnMarquee from "@/components/landing-v2/BuiltOnMarquee";
import l1ChainsData from "@/constants/l1-chains.json";

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

function SheetBackdrop() {
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

/* ------------------------------------------------------------------ */
/* Ledger strip — live figures set like a settlement ledger            */
/* ------------------------------------------------------------------ */

function LedgerFigure({ value, animateIn }: { value: number; animateIn: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(animateIn ? 0 : value);

  useEffect(() => {
    if (!animateIn) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, animateIn]);

  return (
    <span ref={ref} className="font-mono text-2xl md:text-[1.75rem] tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
      {display.toLocaleString("en-US")}
    </span>
  );
}

function LedgerCell({
  label,
  children,
  live = false,
}: {
  label: string;
  children: React.ReactNode;
  live?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-5 py-4 md:px-6">
      <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
        {live && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E84142] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E84142]" />
          </span>
        )}
        {label}
      </span>
      {children}
    </div>
  );
}

function LedgerStrip({
  globeData,
  l1Count,
  animateIn,
}: {
  globeData: GlobeData;
  l1Count: number | null;
  animateIn: boolean;
}) {
  const agg = globeData?.metrics?.aggregated;
  // The 24h ICM aggregate is often a single-digit number that reads as an
  // error; the 30-day flow sum is the honest-but-legible window.
  const icmTotal30d = (globeData?.icmFlows || []).reduce(
    (sum, f) => sum + (f.messageCount || 0),
    0,
  );

  return (
    // chrome (border/background) is owned by the parent board
    <div className="w-full">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-5 divide-x divide-zinc-200 dark:divide-zinc-800">
        <LedgerCell label="TRANSACTIONS · 24H" live>
          {agg ? <LedgerFigure value={agg.totalTxCount} animateIn={animateIn} /> : <LedgerDash />}
        </LedgerCell>
        <LedgerCell label="CROSS-CHAIN MSGS · 30D">
          {icmTotal30d > 0 ? <LedgerFigure value={icmTotal30d} animateIn={animateIn} /> : <LedgerDash />}
        </LedgerCell>
        <LedgerCell label="ACTIVE L1S">
          {l1Count !== null ? <LedgerFigure value={l1Count} animateIn={animateIn} /> : <LedgerDash />}
        </LedgerCell>
        <LedgerCell label="VALIDATORS">
          {agg ? <LedgerFigure value={agg.totalValidators} animateIn={animateIn} /> : <LedgerDash />}
        </LedgerCell>
        <LedgerCell label="TIME TO FINALITY">
          <span className="font-mono text-2xl md:text-[1.75rem] tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            &lt;1s
          </span>
        </LedgerCell>
      </div>
    </div>
  );
}

function LedgerDash() {
  return <span className="font-mono text-2xl text-zinc-300 dark:text-zinc-700">—</span>;
}

/* ------------------------------------------------------------------ */
/* Chapter 1 — statement hero with the live network                    */
/* ------------------------------------------------------------------ */


const HERO_NOUNS = ["network", "stablecoin", "business", "fund", "exchange", "marketplace"];

function ChapterOne() {
  const reducedMotion = useReducedMotion();

  const [nounIndex, setNounIndex] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => {
      setNounIndex((i) => (i + 1) % HERO_NOUNS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [reducedMotion]);
  // modulo at read time: guards stale state (e.g. Fast Refresh keeping an
  // index from a longer, older version of the array)
  const noun = HERO_NOUNS[nounIndex % HERO_NOUNS.length] ?? HERO_NOUNS[0];
  const article = /^[aeiou]/.test(noun) ? "an" : "a";

  // width-smoothed slot: measure the incoming word and transition the slot's
  // width so the line glides instead of snapping as words change length
  const measureRef = useRef<HTMLSpanElement>(null);
  const [nounWidth, setNounWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const measure = () => setNounWidth(measureRef.current?.offsetWidth ?? null);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [noun]);

  // top-to-bottom load sequence: each block rises in after the one above it
  const rise = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    // In-flow navbar (~3.5rem) sits above; subtract it so the section is one viewport
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
        <motion.h1
          className="text-[2.75rem] font-extralight leading-[1.06] tracking-[-0.03em] text-zinc-900 dark:text-zinc-50 md:text-[4.75rem] xl:text-[6rem]"
          {...rise(0.05)}
        >
          Launch {article}{" "}
          <span
            className="relative inline-block overflow-hidden align-bottom"
            style={{
              width: nounWidth ?? undefined,
              transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={noun}
                className="inline-block whitespace-nowrap"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                exit={{ y: "-105%" }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {noun}
              </motion.span>
            </AnimatePresence>
            <span ref={measureRef} aria-hidden className="invisible absolute left-0 top-0 whitespace-nowrap">
              {noun}
            </span>
          </span>
          <span className="text-[#E84142] motion-safe:animate-[pulse_3s_ease-in-out_infinite]">.</span>
        </motion.h1>


        <motion.div className="mt-12 flex flex-col items-center gap-6" {...rise(0.3)}>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <Link
            href="/console"
            className="group inline-flex items-center gap-3 bg-zinc-900 px-6 py-3.5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Launch an L1
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/docs/quick-start"
            className="inline-flex items-center gap-3 border border-zinc-300 bg-white px-6 py-3.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-400"
          >
            Deploy on C-Chain
          </Link>
          </div>
          <Link
            href="/docs/avalanche-l1s"
            className="font-mono text-[11px] tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            READ THE ARCHITECTURE →
          </Link>
        </motion.div>
      </div>

      {/* proof band at the fold: the ecosystem tape is part of the hero */}
      <motion.div {...rise(0.45)}>
        <BuiltOnMarquee embedded />
      </motion.div>
    </section>
  );
}

function TokenStack({ srcs }: { srcs: string[] }) {
  return (
    <span className="flex -space-x-1.5">
      {srcs.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          className="h-5 w-5 rounded-full bg-white object-contain p-px ring-2 ring-white dark:ring-zinc-950"
          loading="lazy"
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 2 — stats: the ledger docks to the top, more data reveals   */
/* ------------------------------------------------------------------ */

// Glacier serves a generic AvaCloud placeholder when a chain has no brand
// asset — fall back to the curated list, else a mono monogram in the sheet's
// hairline style.
// local marks for chains Glacier only has placeholders for
const LOCAL_CHAIN_LOGOS: Record<string, string> = {
  "dinari financial network": "/logos/partners/dinari.png",
};

function resolveChainLogo(chain: { chainId?: string; chainName: string; chainLogoURI?: string }) {
  const GENERIC = "AvaCloud-512x512";
  const local = LOCAL_CHAIN_LOGOS[chain.chainName.toLowerCase()];
  if (local) return local;
  if (chain.chainLogoURI && !chain.chainLogoURI.includes(GENERIC)) return chain.chainLogoURI;
  const curated = (l1ChainsData as any[]).find(
    (c) => c.chainId === chain.chainId || c.chainName?.toLowerCase() === chain.chainName.toLowerCase(),
  );
  if (curated?.chainLogoURI && !curated.chainLogoURI.includes(GENERIC)) return curated.chainLogoURI;
  return null;
}

function resolveChainStatsHref(chain: { chainId?: string; chainName: string }): string | null {
  if (chain.chainId === "43114" || chain.chainName.toLowerCase().includes("c-chain")) {
    return "/stats/l1/c-chain";
  }
  const curated = (l1ChainsData as any[]).find(
    (c) => c.chainId === chain.chainId || c.chainName?.toLowerCase() === chain.chainName.toLowerCase(),
  );
  return curated?.slug ? `/stats/l1/${curated.slug}` : null;
}

function ChainMark({ chain }: { chain: { chainId?: string; chainName: string; chainLogoURI?: string } }) {
  const logo = resolveChainLogo(chain);
  if (logo) {
    return <img src={logo} alt="" className="h-5 w-5 rounded-full object-contain" loading="lazy" />;
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 font-mono text-[9px] text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
      {chain.chainName.charAt(0).toUpperCase()}
    </span>
  );
}

function TopChainRow({
  progress,
  index,
  chain,
  staticMode,
}: {
  progress: MotionValue<number>;
  index: number;
  chain: {
    chainId?: string;
    chainName: string;
    chainLogoURI?: string;
    txCount: number;
    tps: number;
    validatorCount: number | string;
  };
  staticMode: boolean;
}) {
  const start = 0.46 + index * 0.08;
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  const x = useTransform(progress, [start, start + 0.12], [-14, 0]);

  const href = resolveChainStatsHref(chain);
  const cells = (
    <>
      <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
        {String(index + 1).padStart(2, "0")}
      </span>
      <ChainMark chain={chain} />
      <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {chain.chainName}
      </span>
      <span className="text-right font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
        {chain.txCount.toLocaleString("en-US")}
      </span>
      <span className="text-right font-mono text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
        {typeof chain.validatorCount === "number" ? chain.validatorCount : "—"}
      </span>
    </>
  );
  const rowClass =
    "grid grid-cols-[2rem_1.5rem_1fr_8rem_6rem] items-center gap-4 py-3.5";

  return (
    <motion.div
      className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800"
      style={staticMode ? undefined : { opacity, x }}
    >
      {href ? (
        <Link
          href={href}
          className={`${rowClass} transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900`}
        >
          {cells}
        </Link>
      ) : (
        <div className={rowClass}>{cells}</div>
      )}
    </motion.div>
  );
}

function StatsChapter({
  globeData,
  l1Count,
  primaryStakeAvax,
  primaryStakeUsd,
  avaxUsdPrice,
  supplyStakedPct,
  defi,
  reducedMotion,
}: {
  globeData: GlobeData;
  l1Count: number | null;
  primaryStakeAvax: number | null;
  primaryStakeUsd: number | null;
  avaxUsdPrice: number | null;
  supplyStakedPct: number | null;
  defi: { tvlUsd: number | null; stablesUsd: number | null; dexVolume24hUsd: number | null };
  reducedMotion: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  // Approach: board rises in while the section scrolls toward the pin.
  const { scrollYProgress: approach } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });
  // Pin: page freezes and the board populates as you scroll through.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const agg = globeData?.metrics?.aggregated;
  // curated exclusions for the marketing surface (unbranded / low-tier)
  const EXCLUDED_CHAINS = ["andromeda"];
  const topChains = (globeData?.metrics?.chains || [])
    .filter((c) => !EXCLUDED_CHAINS.includes(c.chainName.toLowerCase()))
    .sort((a, b) => (b.txCount || 0) - (a.txCount || 0))
    .slice(0, 5);

  const boardOpacity = useTransform(approach, [0.35, 0.9], [0, 1]);
  const boardY = useTransform(approach, [0.35, 0.9], [64, 0]);
  const figuresOpacity = useTransform(scrollYProgress, [0.08, 0.32], [0, 1]);
  const figuresY = useTransform(scrollYProgress, [0.08, 0.32], [24, 0]);
  const capitalOpacity = useTransform(scrollYProgress, [0.22, 0.42], [0, 1]);
  const capitalY = useTransform(scrollYProgress, [0.22, 0.42], [20, 0]);
  const tableLabelOpacity = useTransform(scrollYProgress, [0.38, 0.52], [0, 1]);

  const staticMode = reducedMotion;

  return (
    // One panel: ledger, figures, and table are rows of the same board —
    // shared background, hairline dividers, no floating blocks.
    <section ref={sectionRef} className="relative mt-16 h-[200vh] lg:mt-24">
      <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col justify-center overflow-hidden">
      <motion.div
        className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80"
        style={staticMode ? undefined : { opacity: boardOpacity, y: boardY }}
      >
        <LedgerStrip globeData={globeData} l1Count={l1Count} animateIn={!reducedMotion} />

        {/* key stat: stake, with a compact side column */}
        <motion.div
          className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-[5fr_3fr] md:divide-x md:divide-zinc-200 dark:md:divide-zinc-800"
          style={staticMode ? undefined : { opacity: figuresOpacity, y: figuresY }}
        >
          <div className="flex flex-col justify-center gap-3 px-5 py-10 md:px-6">
            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              STAKE SECURING THE NETWORK
            </span>
            <span className="font-mono text-5xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-6xl xl:text-7xl">
              {primaryStakeUsd !== null
                ? `$${primaryStakeUsd.toLocaleString("en-US")}`
                : primaryStakeAvax !== null
                  ? `${primaryStakeAvax.toLocaleString("en-US")} AVAX`
                  : "—"}
            </span>
            {primaryStakeUsd !== null && primaryStakeAvax !== null && (
              <span className="font-mono text-[11px] tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                {primaryStakeAvax.toLocaleString("en-US")} AVAX
                {supplyStakedPct !== null && ` · ${supplyStakedPct.toFixed(1)}% OF CIRCULATING SUPPLY`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 divide-y divide-zinc-200 dark:divide-zinc-800">
            <div className="flex flex-col gap-1.5 px-5 py-5 md:px-6">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                ACTIVE ADDRESSES · 24H
              </span>
              <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                {agg ? agg.totalActiveAddresses.toLocaleString("en-US") : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 px-5 py-5 md:px-6">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                AVAX · USD
              </span>
              <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                {avaxUsdPrice !== null ? `$${avaxUsdPrice.toFixed(2)}` : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 px-5 py-5 md:px-6">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                AVG STAKE PER VALIDATOR
              </span>
              <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                {primaryStakeAvax !== null && agg && agg.totalValidators > 0
                  ? `${Math.round(primaryStakeAvax / agg.totalValidators).toLocaleString("en-US")} AVAX`
                  : "—"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* on-chain capital */}
        <motion.div
          className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-3 md:divide-x md:divide-zinc-200 dark:md:divide-zinc-800"
          style={staticMode ? undefined : { opacity: capitalOpacity, y: capitalY }}
        >
          <div className="flex flex-col gap-1.5 px-5 py-6 md:px-6">
            <span className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                STABLECOINS ON-CHAIN
              </span>
              <TokenStack srcs={["/logos/tokens/usdc.png", "/logos/tokens/usdt.png", "/logos/tokens/eurc.png", "/logos/tokens/jpyc.png", "/logos/tokens/xsgd.png"]} />
            </span>
            <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[1.75rem]">
              {defi.stablesUsd !== null ? `$${defi.stablesUsd.toLocaleString("en-US")}` : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 px-5 py-6 md:px-6">
            <span className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                DEFI TVL
              </span>
              <TokenStack srcs={["/logos/tokens/aave.png", "/logos/tokens/benqi.png", "/logos/tokens/gmx.png"]} />
            </span>
            <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[1.75rem]">
              {defi.tvlUsd !== null ? `$${defi.tvlUsd.toLocaleString("en-US")}` : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 px-5 py-6 md:px-6">
            <span className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                DEX VOLUME · 24H
              </span>
              <TokenStack srcs={["/logos/tokens/uniswap.png", "/logos/tokens/lfj.png", "/logos/tokens/pharaoh.png"]} />
            </span>
            <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[1.75rem]">
              {defi.dexVolume24hUsd !== null ? `$${defi.dexVolume24hUsd.toLocaleString("en-US")}` : "—"}
            </span>
          </div>
        </motion.div>

        {/* most active chains */}
        <div className="mx-auto w-full max-w-7xl px-5 py-10 md:px-6">
          <motion.div
            className="grid grid-cols-[2rem_1.5rem_1fr_8rem_6rem] gap-4 border-b border-zinc-300 pb-2 dark:border-zinc-700"
            style={staticMode ? undefined : { opacity: tableLabelOpacity }}
          >
            <span />
            <span />
            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
              MOST ACTIVE · 24H
            </span>
            <span className="text-right font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              TRANSACTIONS
            </span>
            <span className="text-right font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              VALIDATORS
            </span>
          </motion.div>
          {topChains.map((chain, i) => (
            <TopChainRow
              key={chain.chainName + i}
              progress={scrollYProgress}
              index={i}
              chain={chain}
              staticMode={staticMode}
            />
          ))}
        </div>

        {/* board footer: the full instrument lives at /stats */}
        <Link
          href="/stats/overview"
          className="group flex items-center justify-between bg-zinc-900 py-5 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:hover:bg-zinc-300"
        >
          <span className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 md:px-6">
            <span className="text-sm font-medium text-zinc-50 dark:text-zinc-900">
              Explore all network stats
            </span>
            <ArrowRight className="h-4 w-4 text-zinc-50 transition-transform group-hover:translate-x-1 dark:text-zinc-900" />
          </span>
        </Link>
      </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 2 — pinned assembly of a sovereign L1                       */
/* ------------------------------------------------------------------ */

const PLAYBOOKS = [
  {
    key: "public",
    title: "Public",
    body: "Anyone can validate; anyone can transact. Consensus secured by an open validator set and a liquid token.",
    caption: "VALIDATORS: OPEN SET · ACCESS: PERMISSIONLESS",
  },
  {
    key: "permissioned",
    title: "Permissioned",
    body: "Named operators run consensus; the application stays open. Accountability at the validator layer, reach at the user layer.",
    caption: "VALIDATORS: KNOWN OPERATORS · ACCESS: PUBLIC",
  },
  {
    key: "private",
    title: "Private",
    body: "Participation, data, and access end at the network\u2019s edge. To anyone outside, the chain doesn\u2019t exist.",
    caption: "VALIDATORS: PRIVATE SET · ACCESS: PARTICIPANTS ONLY",
  },
] as const;

type PlaybookKey = (typeof PLAYBOOKS)[number]["key"];

function ArchitectureDiagram({ mode }: { mode: PlaybookKey }) {
  const SIZE = 480;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RING = 118;
  const BOUNDARY = 172;
  const OUTER = 216;

  const ring = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { x: CX + RING * Math.cos(a), y: CY + RING * Math.sin(a) };
  });
  const outer = Array.from({ length: 4 }, (_, i) => {
    const a = ((i + 0.5) / 4) * Math.PI * 2 - Math.PI / 2;
    return {
      a,
      x: CX + OUTER * Math.cos(a),
      y: CY + OUTER * Math.sin(a),
      bx: CX + (BOUNDARY + 2) * Math.cos(a),
      by: CY + (BOUNDARY + 2) * Math.sin(a),
      rx: CX + (RING + 14) * Math.cos(a),
      ry: CY + (RING + 14) * Math.sin(a),
    };
  });

  const showExternal = mode !== "private";
  const filled = mode !== "public";

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[460px] select-none"
      role="img"
      aria-label={`${mode} L1 architecture`}
    >
      {/* external actors: joiners (public) or gated users (permissioned) */}
      <g
        className="transition-opacity duration-500"
        style={{ opacity: showExternal ? 1 : 0 }}
      >
        {outer.map((pt, i) => (
          <g key={i}>
            <line
              x1={pt.x}
              y1={pt.y}
              x2={mode === "permissioned" ? pt.bx : pt.rx}
              y2={mode === "permissioned" ? pt.by : pt.ry}
              strokeDasharray="2 5"
              strokeWidth={1}
              className="stroke-zinc-400 transition-all duration-500 dark:stroke-zinc-500"
            />
            <circle cx={pt.x} cy={pt.y} r={4} className="fill-zinc-400 dark:fill-zinc-500" />
          </g>
        ))}
      </g>

      {/* boundary: absent → dashed → sealed */}
      <circle
        cx={CX}
        cy={CY}
        r={BOUNDARY}
        fill="none"
        strokeWidth={1.5}
        strokeDasharray={mode === "permissioned" ? "5 7" : "none"}
        className="stroke-zinc-900 transition-all duration-500 dark:stroke-zinc-100"
        style={{ opacity: mode === "public" ? 0 : 1 }}
      />
      <circle
        cx={CX}
        cy={CY}
        r={BOUNDARY + 7}
        fill="none"
        strokeWidth={1}
        className="stroke-zinc-900 transition-opacity duration-500 dark:stroke-zinc-100"
        style={{ opacity: mode === "private" ? 0.5 : 0 }}
      />

      {/* validator ring */}
      {ring.map((pt, i) => (
        <g key={i}>
          <line
            x1={CX}
            y1={CY}
            x2={pt.x}
            y2={pt.y}
            strokeWidth={1}
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
          <circle
            cx={pt.x}
            cy={pt.y}
            r={9}
            strokeWidth={1.25}
            className={`transition-all duration-500 ${
              filled
                ? "fill-zinc-700 stroke-zinc-700 dark:fill-zinc-300 dark:stroke-zinc-300"
                : "fill-white stroke-zinc-500 dark:fill-zinc-950 dark:stroke-zinc-400"
            }`}
          />
          <circle
            cx={pt.x}
            cy={pt.y}
            r={2.5}
            className={`transition-all duration-500 ${
              filled ? "fill-white dark:fill-zinc-950" : "fill-zinc-500 dark:fill-zinc-400"
            }`}
          />
        </g>
      ))}

      {/* core */}
      <circle
        cx={CX}
        cy={CY}
        r={30}
        strokeWidth={1.5}
        className="fill-white stroke-zinc-900 dark:fill-zinc-950 dark:stroke-zinc-100"
      />
      <circle cx={CX} cy={CY} r={5} fill="#E84142">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <text
        x={CX}
        y={CY + 52}
        textAnchor="middle"
        fontSize={10}
        letterSpacing={2}
        className="fill-zinc-500 font-mono dark:fill-zinc-400"
      >
        YOUR L1
      </text>
    </svg>
  );
}

function PlaybookSelector({
  mode,
  onSelect,
}: {
  mode: PlaybookKey;
  onSelect: (key: PlaybookKey) => void;
}) {
  return (
    <div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {PLAYBOOKS.map((pb) => {
        const isActive = pb.key === mode;
        return (
          <button
            key={pb.key}
            type="button"
            onClick={() => onSelect(pb.key)}
            aria-pressed={isActive}
            className={`relative block w-full py-7 pl-6 pr-4 text-left transition-opacity duration-300 ${
              isActive ? "" : "opacity-40 hover:opacity-70"
            }`}
          >
            <span
              className={`absolute bottom-0 left-0 top-0 w-px transition-colors duration-300 ${
                isActive ? "bg-[#E84142]" : "bg-transparent"
              }`}
            />
            <span className="text-xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50 md:text-2xl">
              {pb.title}
            </span>
            <span className="mt-2 block max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {pb.body}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlaybooksChapter({ reducedMotion }: { reducedMotion: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [band, setBand] = useState(0);
  const bandRef = useRef(0);
  const [override, setOverride] = useState<PlaybookKey | null>(null);

  // Pin: scroll walks the three playbooks in order; a click overrides until
  // the next band boundary is crossed.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: approach } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });
  const enterOpacity = useTransform(approach, [0.45, 0.95], [0, 1]);
  const enterY = useTransform(approach, [0.45, 0.95], [48, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const b = v < 0.34 ? 0 : v < 0.67 ? 1 : 2;
    if (b !== bandRef.current) {
      bandRef.current = b;
      setBand(b);
      setOverride(null);
    }
  });

  const mode = override ?? PLAYBOOKS[band].key;
  const active = PLAYBOOKS.find((pb) => pb.key === mode)!;

  const body = (
    <div className="mx-auto w-full max-w-7xl px-5 md:px-6">
      <div className="mb-12 flex items-baseline gap-4">
        <p className="shrink-0 font-mono text-[11px] tracking-[0.22em] text-zinc-900 dark:text-zinc-100">
          SOVEREIGN L1S · CHOOSE YOUR PLAYBOOK
        </p>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-2">
        <PlaybookSelector mode={mode} onSelect={setOverride} />
        <div className="hidden flex-col items-center gap-5 lg:flex">
          <ArchitectureDiagram mode={mode} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={active.caption}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400"
            >
              {active.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  if (reducedMotion) {
    return <section className="bg-white py-24 lg:py-32 dark:bg-zinc-950">{body}</section>;
  }

  return (
    <section ref={sectionRef} className="relative h-[260vh]">
      <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] items-center overflow-hidden bg-white dark:bg-zinc-950">
        <motion.div className="w-full" style={{ opacity: enterOpacity, y: enterY }}>
          {body}
        </motion.div>
      </div>
    </section>
  );
}

function FinaleRow({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group grid grid-cols-[1fr_auto] items-center gap-6 py-7 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
    >
      <span>
        <span className="block text-lg font-medium text-zinc-900 dark:text-zinc-50 md:text-xl">
          {title}
        </span>
        <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-zinc-50" />
    </Link>
  );
}

function FinaleChapter({ reducedMotion }: { reducedMotion: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "start 0.4"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.7], [40, 0]);

  return (
    <section ref={sectionRef} className="py-28 lg:py-36">
      <motion.div
        className="mx-auto w-full max-w-7xl px-5 md:px-6"
        style={reducedMotion ? undefined : { opacity, y }}
      >
        <h2 className="text-[2.75rem] font-extralight leading-none tracking-[-0.03em] text-zinc-900 dark:text-zinc-50 md:text-[4.25rem] xl:text-[5.5rem]">
          Launch yours
          <span className="text-[#E84142] motion-safe:animate-[pulse_3s_ease-in-out_infinite]">.</span>
        </h2>

        <div className="mt-14 divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          <FinaleRow
            href="/console"
            title="Launch an L1 in the Console"
            description="From configuration to mainnet validators, in one guided session."
          />
          <FinaleRow
            href="/docs/avalanche-l1s"
            title="Read the architecture"
            description="How sovereign L1s, the primary network, and interchain messaging fit together."
          />
          <FinaleRow
            href="/stats/overview"
            title="Explore the live network"
            description="Every chain, validator, and message — observed on-chain."
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function StoryHome({
  globeData,
  l1Count,
  primaryStakeAvax,
  primaryStakeUsd,
  avaxUsdPrice,
  supplyStakedPct,
  defi,
}: {
  globeData: GlobeData;
  l1Count: number | null;
  primaryStakeAvax: number | null;
  primaryStakeUsd: number | null;
  avaxUsdPrice: number | null;
  supplyStakedPct: number | null;
  defi: { tvlUsd: number | null; stablesUsd: number | null; dexVolume24hUsd: number | null };
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.main
      className="relative bg-white dark:bg-zinc-950"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <SheetBackdrop />
      <div className="relative">
        <ChapterOne />
        <StatsChapter globeData={globeData} l1Count={l1Count} primaryStakeAvax={primaryStakeAvax} primaryStakeUsd={primaryStakeUsd} avaxUsdPrice={avaxUsdPrice} supplyStakedPct={supplyStakedPct} defi={defi} reducedMotion={!!reducedMotion} />
        <PlaybooksChapter reducedMotion={!!reducedMotion} />
        <FinaleChapter reducedMotion={!!reducedMotion} />
      </div>
    </motion.main>
  );
}

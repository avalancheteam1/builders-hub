"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
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
import L1Assembly from "@/components/landing-v2/L1Assembly";
import BuiltOnMarquee from "@/components/landing-v2/BuiltOnMarquee";
import l1ChainsData from "@/constants/l1-chains.json";

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
    // z-10 keeps the docked bar above transformed stages scrolling past
    <div className="relative z-10 w-full border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
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
            &lt;2s
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


function ChapterOne() {
  const reducedMotion = useReducedMotion();
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
          className="text-[3.5rem] font-extralight leading-[1.02] tracking-[-0.03em] text-zinc-900 dark:text-zinc-50 md:text-[6.5rem] xl:text-[8rem]"
          {...rise(0.05)}
        >
          Launch a network
          <span className="text-[#E84142] motion-safe:animate-[pulse_3s_ease-in-out_infinite]">.</span>
        </motion.h1>

        <motion.p
          className="mt-8 max-w-xl text-balance text-base leading-relaxed text-zinc-600 dark:text-zinc-400"
          {...rise(0.18)}
        >
          Every Avalanche L1 runs its own validators, its own gas token, its
          own compliance rules — final in under two seconds.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:gap-8"
          {...rise(0.3)}
        >
          <Link
            href="/console"
            className="group inline-flex items-center gap-3 bg-zinc-900 px-6 py-3.5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Launch an L1
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/docs/quick-start"
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

/* ------------------------------------------------------------------ */
/* Chapter 2 — stats: the ledger docks to the top, more data reveals   */
/* ------------------------------------------------------------------ */

// Glacier serves a generic AvaCloud placeholder when a chain has no brand
// asset — fall back to the curated list, else a mono monogram in the sheet's
// hairline style.
function resolveChainLogo(chain: { chainId?: string; chainName: string; chainLogoURI?: string }) {
  const GENERIC = "AvaCloud-512x512";
  if (chain.chainLogoURI && !chain.chainLogoURI.includes(GENERIC)) return chain.chainLogoURI;
  const curated = (l1ChainsData as any[]).find(
    (c) => c.chainId === chain.chainId || c.chainName?.toLowerCase() === chain.chainName.toLowerCase(),
  );
  if (curated?.chainLogoURI && !curated.chainLogoURI.includes(GENERIC)) return curated.chainLogoURI;
  return null;
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
  const start = 0.42 + index * 0.09;
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  const x = useTransform(progress, [start, start + 0.12], [-14, 0]);

  return (
    <motion.div
      className="grid grid-cols-[2rem_1.5rem_1fr_8rem_6rem_6rem] items-center gap-4 border-b border-zinc-200 py-3.5 dark:border-zinc-800"
      style={staticMode ? undefined : { opacity, x }}
    >
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
        {(chain.tps || 0).toFixed(1)}
      </span>
      <span className="text-right font-mono text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
        {typeof chain.validatorCount === "number" ? chain.validatorCount : "—"}
      </span>
    </motion.div>
  );
}

function StatsChapter({
  globeData,
  l1Count,
  primaryStakeAvax,
  reducedMotion,
}: {
  globeData: GlobeData;
  l1Count: number | null;
  primaryStakeAvax: number | null;
  reducedMotion: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  // Progress 0→1 as the section rises into view — reveals scrub with the
  // scroll (reversible), but the layout stays dense: no pin, no runway.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "start 0.2"],
  });

  const agg = globeData?.metrics?.aggregated;
  const topChains = (globeData?.metrics?.chains || [])
    .slice()
    .sort((a, b) => (b.txCount || 0) - (a.txCount || 0))
    .slice(0, 5);

  const figuresOpacity = useTransform(scrollYProgress, [0.05, 0.32], [0, 1]);
  const figuresY = useTransform(scrollYProgress, [0.05, 0.32], [24, 0]);
  const tableLabelOpacity = useTransform(scrollYProgress, [0.28, 0.45], [0, 1]);

  const staticMode = reducedMotion;

  return (
    // One complete board: ledger row on top, figures and table directly
    // beneath. Reveals are scroll-linked; layout is not.
    <section ref={sectionRef} className="mt-16 lg:mt-24">
      <LedgerStrip globeData={globeData} l1Count={l1Count} animateIn={!reducedMotion} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-5 py-16 md:px-6 lg:py-20">
        {/* secondary figures */}
        <motion.div
          className="grid grid-cols-1 gap-px border-y border-zinc-200 md:grid-cols-2 md:divide-x md:divide-zinc-200 dark:border-zinc-800 dark:md:divide-zinc-800"
          style={staticMode ? undefined : { opacity: figuresOpacity, y: figuresY }}
        >
          <div className="flex flex-col gap-2 px-6 py-8">
            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              ACTIVE ADDRESSES · 24H
            </span>
            <span className="font-mono text-4xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
              {agg ? agg.totalActiveAddresses.toLocaleString("en-US") : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-2 px-6 py-8">
            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              STAKE SECURING THE NETWORK
            </span>
            <span className="font-mono text-4xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
              {primaryStakeAvax !== null ? (
                <>
                  {primaryStakeAvax.toLocaleString("en-US")}
                  <span className="ml-2 text-lg text-zinc-500 dark:text-zinc-400">AVAX</span>
                </>
              ) : (
                "—"
              )}
            </span>
          </div>
        </motion.div>

        {/* most active chains */}
        <div>
          <motion.div
            className="mb-2 grid grid-cols-[2rem_1.5rem_1fr_8rem_6rem_6rem] gap-4 border-b border-zinc-900 pb-2 dark:border-zinc-100"
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
              TPS
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
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 2 — pinned assembly of a sovereign L1                       */
/* ------------------------------------------------------------------ */

const BEATS = [
  {
    number: "01",
    title: "Dedicated blockspace",
    body: "Your application gets its own chain. No shared gas market, no congestion from someone else's launch.",
  },
  {
    number: "02",
    title: "Your validator set",
    body: "Decide who runs the network — institutional operators, your own infrastructure, or managed nodes.",
  },
  {
    number: "03",
    title: "Your rules",
    body: "Custom gas token, full EVM compatibility, permissioning enforced by the protocol. Public, permissioned, or fully private.",
  },
];

function ChapterTwo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeBeat, setActiveBeat] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActiveBeat(v < 0.36 ? 0 : v < 0.68 ? 1 : 2);
  });

  // Entrance half of the hero handoff: the drawing settles from oversized to
  // rest scale as the section pins, picking up where the collapsed cluster left.
  const stageScale = useTransform(scrollYProgress, [0, 0.14], [1.85, 1]);
  const stageOpacity = useTransform(scrollYProgress, [0, 0.06], [0, 1]);

  return (
    <section ref={sectionRef} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 md:px-6 lg:grid-cols-2">
          {/* Copy rail */}
          <div className="relative pl-8">
            {/* progress rule */}
            <div className="absolute left-0 top-0 h-full w-px bg-zinc-200 dark:bg-zinc-800">
              <motion.div
                className="h-full w-px origin-top bg-[#E84142]"
                style={{ scaleY: scrollYProgress }}
              />
            </div>

            <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              SOVEREIGN L1S
            </p>

            <div className="mt-8 flex flex-col gap-8 lg:gap-10">
              {BEATS.map((beat, i) => {
                const active = i === activeBeat;
                return (
                  <div
                    key={beat.number}
                    className="transition-opacity duration-500"
                    style={{ opacity: active ? 1 : 0.3 }}
                  >
                    <span
                      className="font-mono text-[11px] tracking-[0.18em]"
                      style={{ color: active ? "#E84142" : undefined }}
                    >
                      {beat.number}
                    </span>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50 md:text-3xl">
                      {beat.title}
                    </h2>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">
                      {beat.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage */}
          <div className="hidden lg:block">
            <motion.div style={{ scale: stageScale, opacity: stageOpacity }}>
              <L1Assembly progress={scrollYProgress} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Reduced-motion fallback: same content, no pinning, final-state diagram */
function ChapterTwoStatic() {
  const { scrollYProgress } = useScroll();
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-24 md:px-6 lg:grid-cols-2">
      <div className="flex flex-col gap-10 border-l border-zinc-200 pl-8 dark:border-zinc-800">
        <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
          SOVEREIGN L1S
        </p>
        {BEATS.map((beat) => (
          <div key={beat.number}>
            <span className="font-mono text-[11px] tracking-[0.18em] text-[#E84142]">{beat.number}</span>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50 md:text-3xl">
              {beat.title}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">
              {beat.body}
            </p>
          </div>
        ))}
      </div>
      <div>
        <L1Assembly progress={scrollYProgress} staticMode />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function StoryHome({
  globeData,
  l1Count,
  primaryStakeAvax,
}: {
  globeData: GlobeData;
  l1Count: number | null;
  primaryStakeAvax: number | null;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.main
      className="relative bg-white dark:bg-zinc-950"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Drafting-sheet grid: two hairline gradients, one per axis. Sits
          behind everything; the ledger and rules land on its lines. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] [background-size:56px_56px] dark:[background-image:linear-gradient(to_right,rgba(250,250,250,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,250,250,0.05)_1px,transparent_1px)]"
      />
      <div className="relative">
        <ChapterOne />
        <StatsChapter globeData={globeData} l1Count={l1Count} primaryStakeAvax={primaryStakeAvax} reducedMotion={!!reducedMotion} />
        {reducedMotion ? <ChapterTwoStatic /> : <ChapterTwo />}
      </div>
    </motion.main>
  );
}

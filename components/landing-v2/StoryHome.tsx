"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GlobeData } from "@/components/landing/globe";
import { AvalancheLogo } from "@/components/navigation/avalanche-logo";
import BuiltOnMarquee from "@/components/landing-v2/BuiltOnMarquee";
import SheetBackdrop from "@/components/landing-v2/SheetBackdrop";
import PillarsChapter from "@/components/landing-v2/PillarsChapter";
import l1ChainsData from "@/constants/l1-chains.json";
import { ROTATE_MS, SCRUB_SPRING } from "@/components/landing-v2/scrub";
import { track } from "@/components/landing-v2/track";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Arrival cascade for snap sections: the board rises as one, then its rows
// stagger in. Everything plays on entry — no reveal is gated behind scroll.
const BOARD_VARIANTS = {
  hidden: { opacity: 0, y: 48 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT, staggerChildren: 0.12, delayChildren: 0.1 },
  },
};
const ROW_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};
const TABLE_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT, staggerChildren: 0.07, delayChildren: 0.1 },
  },
};
const CHAIN_ROW_VARIANTS = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

/* ------------------------------------------------------------------ */
/* Ledger strip — live figures set like a settlement ledger            */
/* ------------------------------------------------------------------ */

const DAY_SECONDS = 86_400;

// Extrapolated live counter for FLOW metrics (transactions, messages,
// volume): the figure climbs at the average rate the aggregate implies,
// then re-anchors when fresh data arrives. Levels (validators, stake)
// must never use this — a ticking level would be fiction.
// Re-anchoring never steps the visible figure backwards unless the
// measurement window clearly rolled (new value well below what's shown).
function useExtrapolatedCount(value: number, periodSeconds?: number): number {
  const [display, setDisplay] = useState(value);
  const shownRef = useRef(value);

  useEffect(() => {
    shownRef.current =
      value < shownRef.current * 0.95 ? value : Math.max(shownRef.current, value);
    setDisplay(Math.floor(shownRef.current));
    if (!periodSeconds || value <= 0) return;
    const rate = value / periodSeconds;
    const timer = setInterval(() => {
      shownRef.current += rate * 0.25;
      setDisplay(Math.floor(shownRef.current));
    }, 250);
    return () => clearInterval(timer);
  }, [value, periodSeconds]);

  return display;
}

function LedgerFigure({
  value,
  animateIn,
  tickPeriod,
}: {
  value: number;
  animateIn: boolean;
  /** seconds the aggregate covers; set only for flow metrics that should tick */
  tickPeriod?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(animateIn ? 0 : value);
  // live refreshes count from the last shown figure, not from zero again
  const shownRef = useRef(0);
  const settledRef = useRef(!animateIn);

  useEffect(() => {
    if (!animateIn) {
      shownRef.current = Math.max(shownRef.current, value);
      setDisplay(Math.round(shownRef.current));
      return;
    }
    if (!inView) return;
    const from = shownRef.current;
    const to = value < from * 0.95 ? value : Math.max(value, from);
    const controls = animate(from, to, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        shownRef.current = v;
        setDisplay(Math.round(v));
      },
      onComplete: () => {
        settledRef.current = true;
      },
    });
    return () => controls.stop();
  }, [inView, value, animateIn]);

  // after the entrance settles, flow metrics keep climbing in real time
  useEffect(() => {
    if (!tickPeriod || value <= 0) return;
    const rate = value / tickPeriod;
    const timer = setInterval(() => {
      if (!settledRef.current) return;
      shownRef.current += rate * 0.25;
      setDisplay(Math.floor(shownRef.current));
    }, 250);
    return () => clearInterval(timer);
  }, [value, tickPeriod]);

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
  href,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  live?: boolean;
  href?: string;
  className?: string;
}) {
  const cellClass = `flex flex-col gap-1.5 px-5 py-5 md:px-6 ${className}`;
  const content = (
    <>
      <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400 lg:whitespace-nowrap">
        {live && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
        )}
        {label}
      </span>
      {children}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className={`${cellClass} transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900`}
      >
        {content}
      </Link>
    );
  }
  return <div className={cellClass}>{content}</div>;
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
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-5 divide-x divide-zinc-200 dark:divide-zinc-800">
        <LedgerCell label="TRANSACTIONS · 24H" live href="/stats/network-metrics">
          {agg ? (
            <LedgerFigure value={agg.totalTxCount} animateIn={animateIn} tickPeriod={DAY_SECONDS} />
          ) : (
            <LedgerDash />
          )}
        </LedgerCell>
        <LedgerCell label="CROSS-CHAIN MSGS · 30D" href="/stats/interchain-messaging">
          {icmTotal30d > 0 ? (
            <LedgerFigure value={icmTotal30d} animateIn={animateIn} tickPeriod={30 * DAY_SECONDS} />
          ) : (
            <LedgerDash />
          )}
        </LedgerCell>
        <LedgerCell label="ACTIVE L1S" href="/stats/chain-list">
          {l1Count !== null ? <LedgerFigure value={l1Count} animateIn={animateIn} /> : <LedgerDash />}
        </LedgerCell>
        <LedgerCell label="VALIDATORS" href="/stats/validators">
          {agg ? <LedgerFigure value={agg.totalValidators} animateIn={animateIn} /> : <LedgerDash />}
        </LedgerCell>
        <LedgerCell label="TIME TO FINALITY" href="/docs/primary-network/avalanche-consensus" className="col-span-2 lg:col-span-1">
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


const HERO_NOUNS = ["network", "stablecoin", "game", "agent", "business", "fund", "exchange", "marketplace"];

function ChapterOne() {
  const reducedMotion = useReducedMotion();

  // Exit dim: the hero hands off by fading as it scrolls away, so the rising
  // stats board is the only thing asking for attention. Opacity only — a y
  // parallax here could collide with the board entering below the fold.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: exit } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smoothExit = useSpring(exit, SCRUB_SPRING);
  const exitOpacity = useTransform(smoothExit, [0.35, 0.85], [1, 0]);

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
    <section ref={sectionRef} data-chapter="hero" className="v2-snap-section relative flex min-h-[calc(100vh-3.5rem)] flex-col">
      <motion.div
        className="flex flex-1 flex-col"
        style={reducedMotion ? undefined : { opacity: exitOpacity }}
      >
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
        <motion.h1
          className="v2-display text-[2.5rem] text-zinc-900 dark:text-zinc-50 md:text-[4rem] xl:text-[5rem]"
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
          <span className="text-[#E6212F] motion-safe:animate-[pulse_3s_ease-in-out_infinite]">.</span>
        </motion.h1>


        <motion.div className="mt-12 flex flex-col items-center gap-6" {...rise(0.3)}>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <Link
            href="/console"
            onClick={() => track("home_cta_clicked", { section: "hero", label: "Launch an L1", href: "/console" })}
            className="group inline-flex items-center gap-3 rounded-lg bg-[#E6212F] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#B20F2A]"
          >
            Launch an L1
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/docs/quick-start"
            onClick={() => track("home_cta_clicked", { section: "hero", label: "Deploy on C-Chain", href: "/docs/quick-start" })}
            className="inline-flex items-center gap-3 rounded-lg border border-zinc-300 bg-white px-7 py-4 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-400"
          >
            Deploy on C-Chain
          </Link>
          </div>
          <Link
            href="/docs/avalanche-l1s"
            onClick={() => track("home_cta_clicked", { section: "hero", label: "Read the architecture", href: "/docs/avalanche-l1s" })}
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
/* Chapter 2 — proof: one dominant figure and its quiet receipts       */
/* ------------------------------------------------------------------ */

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
  const staticMode = reducedMotion;
  // DEX volume is a flow, so it ticks like the transaction counters
  const liveDexVolume = useExtrapolatedCount(defi.dexVolume24hUsd ?? 0, DAY_SECONDS);

  return (
    // One panel: ledger, figures, and table are rows of the same board.
    // The whole board loads when the section snaps into view — rows cascade
    // in; nothing is gated behind further scrolling.
    <section data-chapter="stats" className="v2-snap-section relative flex flex-col justify-center py-16 lg:min-h-[calc(100vh-3.5rem)] lg:py-0">
      <motion.div
        className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80"
        variants={BOARD_VARIANTS}
        initial={staticMode ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        <motion.div variants={ROW_VARIANTS}>
          <LedgerStrip globeData={globeData} l1Count={l1Count} animateIn={!reducedMotion} />
        </motion.div>

        {/* key stat: the economic security institutions underwrite */}
        <motion.div className="mx-auto w-full max-w-7xl" variants={ROW_VARIANTS}>
          <Link
            href="/stats/validators"
            className="flex flex-col justify-center gap-4 px-5 py-14 transition-colors hover:bg-zinc-100 md:px-6 dark:hover:bg-zinc-900 lg:py-16"
          >
            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              STAKE SECURING THE NETWORK
            </span>
            <span className="font-mono text-4xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl md:text-6xl xl:text-8xl">
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
          </Link>
        </motion.div>

        {/* on-chain capital */}
        <motion.div
          className="mx-auto grid w-full max-w-7xl grid-cols-1 divide-y divide-zinc-200 dark:divide-zinc-800 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:divide-zinc-200 dark:lg:divide-zinc-800"
          variants={ROW_VARIANTS}
        >
          <Link
            href="/stats/dapps"
            className="flex flex-col gap-1.5 px-5 py-6 transition-colors hover:bg-zinc-100 md:px-6 dark:hover:bg-zinc-900"
          >
            <span className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                STABLECOINS ON-CHAIN
              </span>
              <TokenStack srcs={["/logos/tokens/usdc.png", "/logos/tokens/usdt.png", "/logos/tokens/eurc.png", "/logos/tokens/jpyc.png", "/logos/tokens/xsgd.png"]} />
            </span>
            <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[1.75rem]">
              {defi.stablesUsd !== null ? `$${defi.stablesUsd.toLocaleString("en-US")}` : "—"}
            </span>
          </Link>
          <Link
            href="/stats/dapps"
            className="flex flex-col gap-1.5 px-5 py-6 transition-colors hover:bg-zinc-100 md:px-6 dark:hover:bg-zinc-900"
          >
            <span className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                DEFI TVL
              </span>
              <TokenStack srcs={["/logos/tokens/aave.png", "/logos/tokens/benqi.png", "/logos/tokens/gmx.png"]} />
            </span>
            <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[1.75rem]">
              {defi.tvlUsd !== null ? `$${defi.tvlUsd.toLocaleString("en-US")}` : "—"}
            </span>
          </Link>
          <Link
            href="/stats/dapps"
            className="flex flex-col gap-1.5 px-5 py-6 transition-colors hover:bg-zinc-100 md:px-6 dark:hover:bg-zinc-900"
          >
            <span className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                DEX VOLUME · 24H
              </span>
              <TokenStack srcs={["/logos/tokens/uniswap.png", "/logos/tokens/lfj.png", "/logos/tokens/pharaoh.png"]} />
            </span>
            <span className="font-mono text-2xl tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 md:text-[1.75rem]">
              {liveDexVolume > 0 ? `$${liveDexVolume.toLocaleString("en-US")}` : "—"}
            </span>
          </Link>
        </motion.div>

        {/* board footer: the full instrument lives at /stats */}
        <motion.div variants={ROW_VARIANTS}>
          <Link
            href="/stats/overview"
            onClick={() => track("home_cta_clicked", { section: "stats", label: "Explore all network stats", href: "/stats/overview" })}
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
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 3 — the offering: one network, two ways to build            */
/* ------------------------------------------------------------------ */

const OFFERINGS = [
  {
    mark: "avax" as const,
    eyebrow: "C-CHAIN",
    title: "Deploy on the C-Chain",
    body: "One public, permissionless EVM chain shared with hundreds of live applications: deep stablecoin liquidity, institutional custody, and every major wallet and data integration already in place.",
    cta: { text: "Deploy on C-Chain", href: "/docs/primary-network" },
    secondary: { text: "BROWSE INTEGRATIONS", href: "/integrations" },
  },
  {
    mark: "yours" as const,
    eyebrow: "SOVEREIGN L1",
    title: "Launch your own L1",
    body: "Your own chain, validated by operators you choose: custom virtual machine, gas token, fee rules, and permissioning. Optionally connected to the C-Chain and every other L1 through native Interchain Messaging.",
    cta: { text: "Launch an L1", href: "/console" },
    secondary: { text: "READ THE ARCHITECTURE", href: "/docs/avalanche-l1s" },
  },
];

function OfferingChapter({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section data-chapter="offering" className="v2-snap-section relative flex flex-col justify-center py-24 lg:min-h-[calc(100vh-3.5rem)] lg:py-0">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-6">
        <motion.h2
          className="v2-display text-3xl text-zinc-900 dark:text-zinc-50 md:text-5xl xl:text-6xl"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          One network. Two ways to build
          <span className="text-[#E6212F]">.</span>
        </motion.h2>

        <motion.div
          className="relative mt-12 grid grid-cols-1 divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80"
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.12, ease: EASE_OUT }}
        >
          {/* the wire: both chains hang off one network. Node centers sit at
              25% and 75% of the board, so the wire spans the middle half. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[calc(25%+28px)] right-[calc(25%+28px)] top-[68px] hidden lg:block"
          >
            <div className="h-px w-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="v2-wire-dot absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-[#E6212F]" />
            <span className="absolute left-1/2 top-3 -translate-x-1/2 font-mono text-[9px] tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              INTERCHAIN MESSAGING
            </span>
          </div>
          {/* the choice: one or the other */}
          <span className="absolute left-1/2 top-[55%] z-10 hidden -translate-x-1/2 -translate-y-1/2 border border-zinc-200 bg-white px-2.5 py-1.5 font-mono text-[10px] tracking-[0.18em] text-zinc-500 lg:block dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            OR
          </span>

          {OFFERINGS.map((offering) => (
            <div
              key={offering.eyebrow}
              className="flex flex-col items-center px-5 pb-10 pt-12 text-center md:px-8 lg:pb-12"
            >
              {/* the known chain wears the mark; yours is still to be drawn */}
              {offering.mark === "avax" ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6212F]">
                  {/* the mark's paths carry hardcoded red fills; force them white on the disc */}
                  <AvalancheLogo className="size-6 [&_path]:fill-white" />
                </span>
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-400 dark:border-zinc-500">
                  <span className="font-mono text-base text-zinc-500 dark:text-zinc-400">?</span>
                </span>
              )}
              <span className="mt-4 font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                {offering.eyebrow}
              </span>
              <h3 className="mt-4 text-2xl font-light tracking-[-0.02em] text-zinc-900 dark:text-zinc-50 md:text-3xl">
                {offering.title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-base">
                {offering.body}
              </p>
              <div className="mt-auto flex flex-col items-center gap-5 pt-9 sm:flex-row sm:gap-7">
                <Link
                  href={offering.cta.href}
                  onClick={() => track("home_cta_clicked", { section: "offering", path: offering.eyebrow, label: offering.cta.text, href: offering.cta.href })}
                  className="group inline-flex items-center gap-3 rounded-lg bg-[#E6212F] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#B20F2A]"
                >
                  {offering.cta.text}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href={offering.secondary.href}
                  onClick={() => track("home_cta_clicked", { section: "offering", path: offering.eyebrow, label: offering.secondary.text, href: offering.secondary.href })}
                  className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                >
                  {offering.secondary.text}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Already live — the closing evidence, one screen before the CTA      */
/* ------------------------------------------------------------------ */

// Glacier serves a generic AvaCloud placeholder when a chain has no brand
// asset; fall back to the curated list, else a mono monogram in the sheet's
// hairline style.
const LOCAL_CHAIN_LOGOS: Record<string, string> = {
  "dinari financial network": "/logos/partners/dinari.png",
  kite: "/logos/partners/kite-ai.svg",
};

// Glacier registry names aren't always the brand names
const DISPLAY_NAMES: Record<string, string> = {
  kite: "Kite AI",
};

// Showcase pins: chains the shared Metrics API doesn't rank fairly but that
// carry the story. Kite AI's figure is injected from its dedicated metrics
// source (see getKiteTxCount in the page).
const FEATURED_CHAINS: { name: string }[] = [
  { name: "kite" },
  { name: "dinari financial network" },
];

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
  index,
  chain,
  staticMode,
}: {
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
  // chains without a curated slug still land somewhere real: the full chain list
  const href = resolveChainStatsHref(chain) ?? "/stats/chain-list";
  const liveTxCount = useExtrapolatedCount(chain.txCount, DAY_SECONDS);
  const rowClass =
    "grid grid-cols-[2rem_1.5rem_1fr_6rem] items-center gap-4 py-3.5 sm:grid-cols-[2rem_1.5rem_1fr_8rem_6rem]";

  return (
    <motion.div
      className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800"
      variants={staticMode ? undefined : CHAIN_ROW_VARIANTS}
    >
      <Link
        href={href}
        onClick={() => track("home_chain_clicked", { chain: chain.chainName, href })}
        className={`${rowClass} transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900`}
      >
        <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ChainMark chain={chain} />
        <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {DISPLAY_NAMES[chain.chainName.toLowerCase()] ?? chain.chainName}
        </span>
        <span className="text-right font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
          {liveTxCount > 0 ? liveTxCount.toLocaleString("en-US") : "—"}
        </span>
        <span className="hidden text-right font-mono text-sm tabular-nums text-zinc-500 sm:block dark:text-zinc-400">
          {typeof chain.validatorCount === "number" ? chain.validatorCount : "—"}
        </span>
      </Link>
    </motion.div>
  );
}

function LiveChainsChapter({
  globeData,
  kiteTxCount,
  reducedMotion,
}: {
  globeData: GlobeData;
  kiteTxCount: number | null;
  reducedMotion: boolean;
}) {
  // curated exclusions for the marketing surface (unbranded / low-tier / staging)
  const EXCLUDED_CHAINS = ["andromeda", "defi kingdoms", "kitestaging2"];
  const byActivity = (globeData?.metrics?.chains || [])
    .filter((c) => !EXCLUDED_CHAINS.includes(c.chainName.toLowerCase()))
    .sort((a, b) => (b.txCount || 0) - (a.txCount || 0));

  const featured = FEATURED_CHAINS.map((f) => {
    const chain = byActivity.find((c) => c.chainName.toLowerCase() === f.name);
    if (!chain) return null;
    // Kite AI's real figure comes from its dedicated metrics source
    if (f.name === "kite" && kiteTxCount !== null) return { ...chain, txCount: kiteTxCount };
    return chain;
  })
    .filter(Boolean)
    .sort((a, b) => (b!.txCount || 0) - (a!.txCount || 0)) as (typeof byActivity)[number][];
  // organic activity leaders on top, showcase pins in the closing rows
  const organic = byActivity
    .filter((c) => !featured.some((f) => f.chainName === c.chainName))
    .slice(0, 6 - featured.length);
  const rows = [...organic, ...featured];

  return (
    <section data-chapter="live-chains" className="v2-snap-section relative flex flex-col justify-center py-24 lg:min-h-[calc(100vh-3.5rem)] lg:py-0">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-6">
        <motion.h2
          className="v2-display text-3xl text-zinc-900 dark:text-zinc-50 md:text-5xl xl:text-6xl"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          Already live
          <span className="text-[#E6212F]">.</span>
        </motion.h2>

        <motion.div
          className="mt-12 border-y border-zinc-200 bg-white/80 px-5 py-4 backdrop-blur-sm md:px-6 dark:border-zinc-800 dark:bg-zinc-950/80"
          variants={TABLE_VARIANTS}
          initial={reducedMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-[2rem_1.5rem_1fr_6rem] gap-4 border-b border-zinc-300 pb-2 sm:grid-cols-[2rem_1.5rem_1fr_8rem_6rem] dark:border-zinc-700">
            <span />
            <span />
            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
              MOST ACTIVE · 24H
            </span>
            <span className="text-right font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              TRANSACTIONS
            </span>
            <span className="hidden text-right font-mono text-[10px] tracking-[0.18em] text-zinc-500 sm:block dark:text-zinc-400">
              VALIDATORS
            </span>
          </div>
          {rows.map((chain, i) => (
            <TopChainRow key={chain.chainName + i} index={i} chain={chain} staticMode={reducedMotion} />
          ))}
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3"
          initial={reducedMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/stats/chain-list"
            onClick={() => track("home_cta_clicked", { section: "live-chains", label: "All chains", href: "/stats/chain-list" })}
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            ALL CHAINS
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/stats/overview"
            onClick={() => track("home_cta_clicked", { section: "live-chains", label: "All network stats", href: "/stats/overview" })}
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            ALL NETWORK STATS
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 6 — pinned assembly of a sovereign L1                       */
/* ------------------------------------------------------------------ */

const PLAYBOOKS = [
  {
    key: "public",
    title: "Public",
    body: "Anyone can validate; anyone can transact. Build on the shared C-Chain, or run an open L1 of your own.",
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
      <circle cx={CX} cy={CY} r={5} fill="#E6212F">
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
        YOUR CHAIN
      </text>
    </svg>
  );
}

function PlaybookSelector({
  mode,
  onSelect,
  progressKey,
  animate,
}: {
  mode: PlaybookKey;
  onSelect: (key: PlaybookKey) => void;
  progressKey: string;
  animate: boolean;
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
            {/* active edge-rule fills over the rotation interval */}
            {isActive &&
              (animate ? (
                <span
                  key={progressKey}
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-px origin-top bg-[#E6212F]"
                  style={{ animation: `v2-fill-y ${ROTATE_MS}ms linear forwards`, transform: "scaleY(0)" }}
                />
              ) : (
                <span aria-hidden className="absolute left-0 top-0 h-full w-px bg-[#E6212F]" />
              ))}
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
  const inView = useInView(sectionRef, { amount: 0.5 });
  const [modeIdx, setModeIdx] = useState(0);
  // bumping restarts the rotation timer so a click always buys a full interval
  const [cycle, setCycle] = useState(0);

  // The section is complete on arrival; the stage walks the three playbooks
  // on its own while in view. Scrolling only ever moves between sections.
  useEffect(() => {
    if (reducedMotion || !inView) return;
    const timer = setInterval(() => setModeIdx((i) => (i + 1) % PLAYBOOKS.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, inView, cycle]);

  const select = (key: PlaybookKey) => {
    track("home_playbook_selected", { playbook: key });
    setCycle((c) => c + 1);
    setModeIdx(PLAYBOOKS.findIndex((pb) => pb.key === key));
  };

  const mode = PLAYBOOKS[modeIdx].key;
  const active = PLAYBOOKS[modeIdx];

  const body = (
    <div className="mx-auto w-full max-w-7xl px-5 md:px-6">
      <h2 className="v2-display text-3xl text-zinc-900 dark:text-zinc-50 md:text-5xl xl:text-6xl">
        Open, permissioned, or invisible
        <span className="text-[#E6212F]">.</span>
      </h2>

      <div className="mt-12 grid items-center gap-12 lg:grid-cols-2">
        <PlaybookSelector
          mode={mode}
          onSelect={select}
          progressKey={`${mode}-${cycle}`}
          animate={!reducedMotion && inView}
        />
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

        {/* sub-lg stage: same instrument, compact, below the selector so the
            rotating list visibly drives something */}
        <div className="flex flex-col items-center gap-4 lg:hidden">
          <ArchitectureDiagram mode={mode} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={active.caption}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="px-5 text-center font-mono text-[10px] leading-relaxed tracking-[0.18em] text-zinc-500 dark:text-zinc-400"
            >
              {active.caption}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      data-chapter="playbooks"
      className="v2-snap-section flex items-center border-y border-zinc-200 bg-white py-24 dark:border-zinc-800 dark:bg-zinc-950 lg:min-h-[calc(100vh-3.5rem)] lg:py-0"
    >
      <motion.div
        className="w-full"
        initial={reducedMotion ? false : { opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        {body}
      </motion.div>
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
      onClick={() => track("home_cta_clicked", { section: "finale", label: title, href })}
      className="group grid grid-cols-[1fr_auto] items-center gap-6 px-5 py-7 transition-colors hover:bg-zinc-100 md:px-6 dark:hover:bg-zinc-900"
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
  return (
    <section data-chapter="finale" className="v2-snap-section flex flex-col justify-center py-28 lg:min-h-[calc(100vh-3.5rem)] lg:py-0">
      <motion.div
        className="mx-auto w-full max-w-7xl px-5 md:px-6"
        initial={reducedMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        <h2 className="v2-display text-[2.5rem] text-zinc-900 dark:text-zinc-50 md:text-[4rem] xl:text-[5rem]">
          Launch yours
          <span className="text-[#E6212F] motion-safe:animate-[pulse_3s_ease-in-out_infinite]">.</span>
        </h2>

        <div className="mt-14 divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          <FinaleRow
            href="/docs/primary-network"
            title="Deploy on the C-Chain"
            description="Ship on the shared, permissionless EVM chain today."
          />
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
            description="Every chain, validator, and message, observed on-chain."
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function StoryHome({
  globeData,
  kiteTxCount,
  l1Count,
  primaryStakeAvax,
  primaryStakeUsd,
  avaxUsdPrice,
  supplyStakedPct,
  defi,
}: {
  globeData: GlobeData;
  kiteTxCount: number | null;
  l1Count: number | null;
  primaryStakeAvax: number | null;
  primaryStakeUsd: number | null;
  avaxUsdPrice: number | null;
  supplyStakedPct: number | null;
  defi: { tvlUsd: number | null; stablesUsd: number | null; dexVolume24hUsd: number | null };
}) {
  const reducedMotion = useReducedMotion();

  // Section snapping is a document-level property; scope it to this page by
  // tagging <html> while mounted (CSS lives in global.css under .v2-snap).
  useEffect(() => {
    document.documentElement.classList.add("v2-snap");
    return () => document.documentElement.classList.remove("v2-snap");
  }, []);

  // Live refresh: repoll the overview metrics so the board ticks while the
  // page is open. A zeroed aggregate means the API cache is still warming;
  // never let that replace real figures on screen.
  const [liveMetrics, setLiveMetrics] = useState(globeData?.metrics ?? null);
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/overview-stats?timeRange=day");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.aggregated?.totalTxCount > 0) setLiveMetrics(data);
      } catch {
        // keep showing the last good figures
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, []);
  const liveGlobeData = { ...globeData, metrics: liveMetrics ?? globeData?.metrics };

  // Funnel depth: fire once per chapter per pageload as it enters view.
  useEffect(() => {
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset.chapter;
          if (entry.isIntersecting && name && !seen.has(name)) {
            seen.add(name);
            track("home_section_viewed", { section: name });
          }
        }
      },
      { threshold: 0.4 },
    );
    document.querySelectorAll("[data-chapter]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
        <StatsChapter globeData={liveGlobeData} l1Count={l1Count} primaryStakeAvax={primaryStakeAvax} primaryStakeUsd={primaryStakeUsd} avaxUsdPrice={avaxUsdPrice} supplyStakedPct={supplyStakedPct} defi={defi} reducedMotion={!!reducedMotion} />
        <OfferingChapter reducedMotion={!!reducedMotion} />
        <PillarsChapter reducedMotion={!!reducedMotion} />
        <PlaybooksChapter reducedMotion={!!reducedMotion} />
        <LiveChainsChapter globeData={liveGlobeData} kiteTxCount={kiteTxCount} reducedMotion={!!reducedMotion} />
        <FinaleChapter reducedMotion={!!reducedMotion} />
      </div>
    </motion.main>
  );
}

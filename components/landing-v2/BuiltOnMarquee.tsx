"use client";

import React from "react";
import { BUILT_ON_CHAINS, BuiltOnChain } from "@/components/landing-v2/builtOnChains";

/**
 * "Built on Avalanche" showcase chapter: two full-bleed counter-scrolling
 * tape rows of deployments, kept in the sheet's hairline-table grammar
 * (continuous divided cells, not floating pills). Global `marquee` keyframes;
 * hover pauses a row, reduced-motion parks both.
 */

function TapeRow({
  chains,
  direction = "left",
  speed = 80,
}: {
  chains: BuiltOnChain[];
  direction?: "left" | "right";
  speed?: number;
}) {
  // 4 copies: the marquee keyframe translates -50%, so the loop period is two
  // copies — with ~9 chains per row, two copies must still exceed viewport
  // width or the tape shows a gap on wide screens
  const doubled = [...chains, ...chains, ...chains, ...chains];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-white to-transparent dark:from-zinc-950" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-white to-transparent dark:from-zinc-950" />

      <div
        className="flex w-max hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]"
        style={{
          animation: `${direction === "left" ? "marquee" : "marquee-reverse"} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((chain, i) => (
          <a
            key={`${chain.name}-${i}`}
            href={chain.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-3.5 border-r border-zinc-200 px-8 py-5 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            <img
              src={chain.image}
              alt=""
              className="h-7 w-7 rounded-full object-contain"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="whitespace-nowrap text-base font-medium text-zinc-800 dark:text-zinc-200">
              {chain.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function BuiltOnMarquee({ embedded = false }: { embedded?: boolean }) {
  if (embedded) {
    // hero fold band: no header, three tapes
    const rows: BuiltOnChain[][] = [[], [], []];
    BUILT_ON_CHAINS.forEach((chain, i) => rows[i % 3].push(chain));
    return (
      <div className="w-full divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80">
        <TapeRow chains={rows[0]} direction="left" speed={70} />
        <TapeRow chains={rows[1]} direction="right" speed={88} />
        <TapeRow chains={rows[2]} direction="left" speed={102} />
      </div>
    );
  }

  // standalone section: three interleaved rows with a labelled header
  const rows: BuiltOnChain[][] = [[], [], []];
  BUILT_ON_CHAINS.forEach((chain, i) => rows[i % 3].push(chain));

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto mb-12 flex max-w-7xl items-baseline gap-4 px-5 md:px-6">
        <p className="shrink-0 font-mono text-[11px] tracking-[0.22em] text-zinc-900 dark:text-zinc-100">
          BUILT ON AVALANCHE
        </p>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <a
          href="/stats/overview"
          className="shrink-0 font-mono text-[11px] tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          VIEW ALL →
        </a>
      </div>

      <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80">
        <TapeRow chains={rows[0]} direction="left" speed={70} />
        <TapeRow chains={rows[1]} direction="right" speed={88} />
        <TapeRow chains={rows[2]} direction="left" speed={102} />
      </div>
    </section>
  );
}

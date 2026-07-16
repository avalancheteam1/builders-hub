"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SheetBackdrop from "@/components/landing-v2/SheetBackdrop";
import PillarDiagram from "@/components/landing-v2/PillarDiagrams";
import PrivacyModelDiagram from "@/components/landing-v2/PrivacyModelDiagrams";
import { PILLARS, type Pillar } from "@/components/landing-v2/pillars";

/* ------------------------------------------------------------------ */
/* Solution splash page — one pillar, sold in the drafting-sheet voice */
/* ------------------------------------------------------------------ */

export default function PillarPage({ pillar }: { pillar: Pillar }) {
  const reducedMotion = useReducedMotion();
  const others = PILLARS.filter((p) => p.slug !== pillar.slug);

  const rise = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <main className="relative bg-white dark:bg-zinc-950">
      <SheetBackdrop />
      <div className="relative">
        <div className="mx-auto w-full max-w-7xl px-5 pt-14 md:px-6">
          <motion.div className="flex items-baseline gap-4" {...rise(0)}>
            <p className="shrink-0 font-mono text-[11px] tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              <Link
                href="/solutions"
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                SOLUTIONS
              </Link>{" "}
              · <span className="text-zinc-900 dark:text-zinc-100">{pillar.label}</span>
            </p>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </motion.div>

          {/* statement + proof ledger */}
          <div className="grid gap-12 py-14 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-20 lg:py-20">
            <motion.div {...rise(0.08)}>
              <h1 className="text-4xl font-extralight leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-zinc-50 md:text-6xl xl:text-[4.25rem]">
                {pillar.title}
                <span className="text-[#E84142]">.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-lg">
                {pillar.intro}
              </p>
              <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <Link
                  href="/console"
                  className="group inline-flex items-center gap-3 bg-zinc-900 px-6 py-3.5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  Launch in the Console
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href={pillar.resources[0].links[0].href}
                  className="font-mono text-[11px] tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  READ THE DOCS →
                </Link>
              </div>
            </motion.div>

            <motion.div className="flex items-center justify-center" {...rise(0.16)}>
              <PillarDiagram slug={pillar.slug} />
            </motion.div>
          </div>

          {/* capabilities */}
          <motion.div className="pb-20 lg:pb-28" {...rise(0.24)}>
            <div className="mb-10 flex items-baseline gap-4">
              <p className="shrink-0 font-mono text-[11px] tracking-[0.22em] text-zinc-900 dark:text-zinc-100">
                IN PRACTICE
              </p>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80">
              {pillar.capabilities.map((capability) => (
                <div
                  key={capability.title}
                  className="grid gap-2 px-5 py-8 md:grid-cols-[16rem_1fr] md:gap-10 md:px-6"
                >
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    {capability.title}
                  </h2>
                  <p className="max-w-3xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {capability.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* architecture models — the shapes the primitives compose into */}
          {pillar.models && pillar.models.length > 0 && (
            <motion.div className="pb-20 lg:pb-28" {...rise(0.27)}>
              <div className="mb-10 flex items-baseline gap-4">
                <p className="shrink-0 font-mono text-[11px] tracking-[0.22em] text-zinc-900 dark:text-zinc-100">
                  ARCHITECTURES
                </p>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80">
                {pillar.models.map((model) => (
                  <div
                    key={model.name}
                    className="grid gap-8 px-5 py-10 md:px-6 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-center lg:gap-14"
                  >
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                        {model.label}
                      </p>
                      <h3 className="mt-3 text-2xl font-light tracking-[-0.01em] text-zinc-900 dark:text-zinc-50">
                        {model.name}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{model.tagline}</p>
                      <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {model.description}
                      </p>
                      <p className="mt-5 font-mono text-[10px] tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                        BEST FOR
                      </p>
                      <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">{model.bestFor}</p>
                    </div>
                    {model.diagram && (
                      <div className="flex justify-center lg:justify-end">
                        <PrivacyModelDiagram id={model.diagram} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* use cases — problem, then the Avalanche shape that solves it */}
          {pillar.useCases && pillar.useCases.length > 0 && (
            <motion.div className="pb-20 lg:pb-28" {...rise(0.3)}>
              <div className="mb-10 flex items-baseline gap-4">
                <p className="shrink-0 font-mono text-[11px] tracking-[0.22em] text-zinc-900 dark:text-zinc-100">
                  USE CASES
                </p>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80">
                {pillar.useCases.map((useCase) => (
                  <div
                    key={useCase.title}
                    className="grid gap-4 px-5 py-8 md:grid-cols-[16rem_1fr] md:gap-10 md:px-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                        {useCase.title}
                      </h3>
                      <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                        {useCase.model}
                      </p>
                    </div>
                    <div className="max-w-3xl">
                      <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {useCase.problem}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#E84142]">
                          Avalanche ·{" "}
                        </span>
                        {useCase.solution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* resources */}
          <motion.div className="pb-20 lg:pb-28" {...rise(0.36)}>
            <div className="mb-10 flex items-baseline gap-4">
              <p className="shrink-0 font-mono text-[11px] tracking-[0.22em] text-zinc-900 dark:text-zinc-100">
                RESOURCES
              </p>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="grid grid-cols-1 divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80">
              {pillar.resources.map((group) => (
                <div key={group.heading} className="px-5 py-8 md:px-6">
                  <h3 className="mb-5 font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    {group.heading}
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                          {link.text}
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-500" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* the other three pillars */}
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 pb-16">
            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              ALSO ON AVALANCHE
            </span>
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/solutions/${other.slug}`}
                className="font-mono text-[11px] tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {other.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* full-bleed CTA bar, mirroring the stats-board footer */}
        <Link
          href="/console"
          className="group flex items-center justify-between bg-zinc-900 py-5 transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:hover:bg-zinc-300"
        >
          <span className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 md:px-6">
            <span className="text-sm font-medium text-zinc-50 dark:text-zinc-900">
              Launch yours in the Console
            </span>
            <ArrowRight className="h-4 w-4 text-zinc-50 transition-transform group-hover:translate-x-1 dark:text-zinc-900" />
          </span>
        </Link>
      </div>
    </main>
  );
}

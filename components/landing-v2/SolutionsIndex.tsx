"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SheetBackdrop from "@/components/landing-v2/SheetBackdrop";
import { PillarRows } from "@/components/landing-v2/PillarsChapter";

/* ------------------------------------------------------------------ */
/* /solutions — the four pillars, stated in one line                   */
/* ------------------------------------------------------------------ */

const PILLAR_WORDS = ["Performance", "Interoperability", "Privacy", "Compliance"];

export default function SolutionsIndex() {
  const reducedMotion = useReducedMotion();

  const rise = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <main className="relative overflow-x-clip bg-white dark:bg-zinc-950">
      <SheetBackdrop snowOnly />
      <div className="relative">
        <div className="mx-auto w-full max-w-7xl px-5 pt-14 md:px-6">
          <motion.div className="flex items-center gap-4" {...rise(0)}>
            <p className="shrink-0 font-mono text-[11px] tracking-[0.22em] text-zinc-900 dark:text-zinc-100">
              SOLUTIONS
            </p>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </motion.div>

          <motion.div className="py-16 lg:py-24" {...rise(0.08)}>
            {/* the four words are the headline; the red period closes the set.
                Fluid size: the full line is ~20.8em wide, so 4.66vw keeps it
                on one line at any viewport ≥ lg; below that it wraps at word
                boundaries (separator spaces live OUTSIDE the nowrap spans). */}
            <h1 className="v2-display text-[clamp(1.875rem,3.9vw,3rem)] text-zinc-900 dark:text-zinc-50">
              {PILLAR_WORDS.map((word, i) => (
                <Fragment key={word}>
                  <span className="whitespace-nowrap">
                    {word}
                    {i < PILLAR_WORDS.length - 1 ? (
                      <span className="text-zinc-300 dark:text-zinc-700">.</span>
                    ) : (
                      <span className="text-[#E6212F]">.</span>
                    )}
                  </span>
                  {i < PILLAR_WORDS.length - 1 ? " " : null}
                </Fragment>
              ))}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-lg">
              Four guarantees an institution can underwrite, each enforced by the
              protocol rather than promised by an operator.
            </p>
          </motion.div>

          <motion.div className="pb-24 lg:pb-32" {...rise(0.16)}>
            <PillarRows reducedMotion={!!reducedMotion} />
          </motion.div>
        </div>

        <Link
          href="/console"
          className="group relative flex items-center justify-between overflow-hidden bg-[#1F1F1F] py-5"
        >
          <span
            aria-hidden
            className="absolute inset-0 origin-left scale-x-0 bg-[#EBF0FA] transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
          <span className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 md:px-6">
            <span className="text-sm font-medium text-white transition-colors duration-300 group-hover:text-[#1F1F1F]">
              Launch yours in the Console
            </span>
            <ArrowRight className="h-4 w-4 text-[#E6212F]" />
          </span>
        </Link>
      </div>
    </main>
  );
}

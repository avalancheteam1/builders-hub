"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PILLARS } from "@/components/landing-v2/pillars";
import PillarDiagram from "@/components/landing-v2/PillarDiagrams";
import { ROTATE_MS } from "@/components/landing-v2/scrub";
import { track } from "@/components/landing-v2/track";

/* ------------------------------------------------------------------ */
/* Why Avalanche — one full-screen stage; the four guarantees rotate    */
/* ------------------------------------------------------------------ */

// Board-row listing of the pillars, used by the /solutions index (the
// homepage chapter below cycles them on one stage instead).
export function PillarRows({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80">
      {PILLARS.map((pillar, i) => (
        <motion.div
          key={pillar.slug}
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={`/solutions/${pillar.slug}`}
            className="group relative grid grid-cols-1 items-center gap-x-10 gap-y-3 px-5 py-9 transition-colors hover:bg-zinc-50 md:px-6 lg:grid-cols-[10rem_1fr_auto] dark:hover:bg-zinc-900/60"
          >
            <span className="absolute bottom-0 left-0 top-0 w-px bg-transparent transition-colors duration-300 group-hover:bg-[#E84142]" />
            <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              {pillar.label}
            </span>
            <span>
              <span className="block text-2xl font-light leading-snug tracking-[-0.02em] text-zinc-900 dark:text-zinc-50 md:text-[2rem]">
                {pillar.title}.
              </span>
              <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {pillar.tagline}
              </span>
            </span>
            <span className="flex items-center gap-6 justify-self-start lg:justify-self-end">
              <span className="hidden font-mono text-[10px] tracking-[0.18em] text-zinc-400 dark:text-zinc-500 xl:block">
                {pillar.proofs[0].label} · {pillar.proofs[0].value}
              </span>
              <ArrowRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-zinc-50" />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

type PillarSlug = (typeof PILLARS)[number]["slug"];

// Tab rail: bordered chips so the four guarantees read as controls, not
// captions. The active chip carries a red lattice triangle — the sheet's
// own glyph — plus a hairline that fills over the rotation interval, so
// the auto-advance (and the invitation to click ahead) is visible.
function PillarRail({
  activeSlug,
  onSelect,
  progressKey,
  animate,
}: {
  activeSlug: string;
  onSelect: (slug: PillarSlug) => void;
  progressKey: string;
  animate: boolean;
}) {
  return (
    <div role="tablist" className="flex flex-wrap items-center gap-2.5">
      {PILLARS.map((pillar) => {
        const isActive = pillar.slug === activeSlug;
        return (
          <button
            key={pillar.slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(pillar.slug)}
            className={`relative flex cursor-pointer items-center gap-2 overflow-hidden border px-4 py-2.5 transition-colors duration-300 ${
              isActive
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                : "border-zinc-200 hover:border-zinc-500 dark:border-zinc-800 dark:hover:border-zinc-400"
            }`}
          >
            {isActive && animate && (
              <span
                key={progressKey}
                aria-hidden
                className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#E84142]"
                style={{ animation: `v2-fill-x ${ROTATE_MS}ms linear forwards`, transform: "scaleX(0)" }}
              />
            )}
            <svg
              width="8"
              height="7"
              viewBox="0 0 8 7"
              aria-hidden
              className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
            >
              <polygon points="4,0 0,7 8,7" fill="#E84142" />
            </svg>
            <span
              className={`font-mono text-[10px] tracking-[0.18em] transition-colors duration-300 ${
                isActive
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {pillar.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function PillarsChapter({ reducedMotion }: { reducedMotion: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.5 });
  const [activeIdx, setActiveIdx] = useState(0);
  // bumping restarts the rotation timer so a click always buys a full interval
  const [cycle, setCycle] = useState(0);

  // The section is complete on arrival; the stage walks the four guarantees
  // on its own while in view. Scrolling only ever moves between sections.
  useEffect(() => {
    if (reducedMotion || !inView) return;
    const timer = setInterval(() => setActiveIdx((i) => (i + 1) % PILLARS.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, inView, cycle]);

  const select = (slug: PillarSlug) => {
    track("home_pillar_selected", { pillar: slug });
    setCycle((c) => c + 1);
    setActiveIdx(PILLARS.findIndex((p) => p.slug === slug));
  };

  const active = PILLARS[activeIdx];

  return (
    <section
      ref={sectionRef}
      data-chapter="pillars"
      className="v2-snap-section flex items-center border-y border-zinc-200 bg-white py-24 dark:border-zinc-800 dark:bg-zinc-950 lg:min-h-[calc(100vh-3.5rem)] lg:py-0"
    >
      <motion.div
        className="w-full"
        initial={reducedMotion ? false : { opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto w-full max-w-7xl px-5 md:px-6">
          <PillarRail
            activeSlug={active.slug}
            onSelect={select}
            progressKey={`${active.slug}-${cycle}`}
            animate={!reducedMotion && inView}
          />

          {/* one guarantee at a time: statement, tagline, and its instrument */}
          <div className="mt-12 lg:mt-16">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="grid items-center gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16"
              >
                <div>
                  <h3 className="text-4xl font-extralight leading-[1.08] tracking-[-0.03em] text-zinc-900 dark:text-zinc-50 md:text-5xl xl:text-6xl">
                    {active.title}
                    <span className="text-[#E84142]">.</span>
                  </h3>
                  <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {active.tagline}
                  </p>
                  <Link
                    href={`/solutions/${active.slug}`}
                    onClick={() => track("home_cta_clicked", { section: "pillars", label: `Explore ${active.slug}`, href: `/solutions/${active.slug}` })}
                    className="group mt-9 inline-flex items-center gap-3 bg-blue-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-500"
                  >
                    Explore {active.label.charAt(0) + active.label.slice(1).toLowerCase()}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="flex justify-center">
                  <PillarDiagram slug={active.slug} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

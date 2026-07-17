import type { UseCase } from "@/components/landing-v2/pillars";

/* ------------------------------------------------------------------ */
/* Use-case rows — the institutional patterns, in the spec-plate voice  */
/*                                                                      */
/* One row per pattern: the business framing and its architecture on    */
/* the left, the problem in the middle, the guarantees the shape buys    */
/* on a red-ruled plate at the right. Shared by the /solutions index     */
/* (the full set) and each subpage (the patterns that lean on it).       */
/* ------------------------------------------------------------------ */

export function UseCaseRows({ useCases }: { useCases: UseCase[] }) {
  return (
    <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/80 backdrop-blur-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950/80">
      {useCases.map((useCase) => (
        <div
          key={useCase.slug}
          className="grid gap-6 px-5 py-8 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-10 md:px-6 md:py-10 lg:grid-cols-[minmax(0,17rem)_1fr_minmax(0,15rem)]"
        >
          {/* the pattern: name over its architecture line */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              {useCase.label}
            </p>
            <h3 className="v2-display mt-3 text-xl text-zinc-900 dark:text-zinc-50 md:text-2xl">
              {useCase.title}
            </h3>
            <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
              {useCase.stack}
            </p>
          </div>

          {/* the problem, then the one-line business framing under it */}
          <div>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {useCase.summary}
            </p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
              {useCase.tagline}
            </p>
          </div>

          {/* the guarantees the architecture buys, as a red-ruled plate */}
          <dl className="border-l-2 border-[#E6212F] pl-6 lg:pl-6">
            {useCase.guarantees.map((g) => (
              <div
                key={g.label}
                className="flex items-baseline justify-between gap-4 border-t border-zinc-200 py-2 first:border-t-0 first:pt-0 dark:border-zinc-800"
              >
                <dt className="font-mono text-[10px] tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                  {g.label}
                </dt>
                <dd className="text-right font-mono text-[10px] tracking-[0.06em] text-zinc-900 dark:text-zinc-50">
                  {g.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

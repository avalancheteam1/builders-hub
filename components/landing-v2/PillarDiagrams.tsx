import React from "react";

/* ------------------------------------------------------------------ */
/* Pillar diagrams — one small animated instrument per guarantee        */
/*                                                                      */
/* Same drawing language as ArchitectureDiagram: hairline strokes,      */
/* zinc structure, red reserved for the thing that is alive (a pulsing  */
/* core, a message in flight). Animations are SMIL so they run without  */
/* JS and stay in sync with server-rendered markup; every coordinate is */
/* a pre-rounded literal (computed values hydrate differently).         */
/* ------------------------------------------------------------------ */

const MONO_LABEL = "fill-zinc-500 font-mono dark:fill-zinc-400";
const HAIRLINE = "stroke-zinc-300 dark:stroke-zinc-700";
const STRONG = "stroke-zinc-900 dark:stroke-zinc-100";
const NODE_FILL = "fill-zinc-700 dark:fill-zinc-300";

function svgProps(label: string) {
  return {
    viewBox: "0 0 480 360",
    className: "w-full max-w-[500px] select-none",
    role: "img" as const,
    "aria-label": label,
  };
}

/* Performance — a transaction leaves SUBMITTED, locks at FINAL. The    */
/* lock ring pulses once per pass: settlement is an event, not a curve. */
function PerformanceDiagram() {
  return (
    <svg {...svgProps("A transaction finalizing in under a second")}>
      {/* timeline */}
      <line x1={40} y1={180} x2={440} y2={180} strokeWidth={1} className={HAIRLINE} />
      {[90, 140, 190, 240, 290, 340].map((x) => (
        <line key={x} x1={x} y1={176} x2={x} y2={184} strokeWidth={1} className={HAIRLINE} />
      ))}

      {/* origin */}
      <circle cx={60} cy={180} r={5} strokeWidth={1.25} className={`fill-white stroke-zinc-500 dark:fill-zinc-950 dark:stroke-zinc-400`} />

      {/* finality lock */}
      <circle cx={420} cy={180} r={14} fill="none" strokeWidth={1.5} className={STRONG} />
      <circle cx={420} cy={180} r={5} fill="#E84142">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {/* arrivals land every 0.3s, so the lock breathes continuously */}
      <circle cx={420} cy={180} fill="none" strokeWidth={1} className={STRONG}>
        <animate attributeName="r" values="14;24" keyTimes="0;1" dur="0.9s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0" keyTimes="0;1" dur="0.9s" repeatCount="indefinite" />
      </circle>

      {/* not one transaction — a pipeline of them, each final in under a
          second. The evenly staggered stream is the throughput story. */}
      {[0, 0.3, 0.6, 0.9, 1.2, 1.5].map((delay) => (
        <circle key={delay} cy={180} r={3.5} fill="#E84142">
          <animate attributeName="cx" values="60;420" keyTimes="0;1" dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="1.8s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}

      <text x={60} y={214} textAnchor="middle" fontSize={10} letterSpacing={2} className={MONO_LABEL}>
        SUBMITTED
      </text>
      <text x={420} y={214} textAnchor="middle" fontSize={10} letterSpacing={2} className={MONO_LABEL}>
        FINAL · &lt;1S
      </text>
    </svg>
  );
}

/* A compact validator ring, reused by the interoperability diagram.    */
function MiniRing({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  // 6 nodes on R=52, offsets pre-rounded (52·sin60 = 45.03, 52·cos60 = 26)
  const offsets: [number, number][] = [
    [0, -52],
    [45.03, -26],
    [45.03, 26],
    [0, 52],
    [-45.03, 26],
    [-45.03, -26],
  ];
  return (
    <g>
      {offsets.map(([dx, dy], i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={cx + dx} y2={cy + dy} strokeWidth={1} className={HAIRLINE} />
          <circle cx={cx + dx} cy={cy + dy} r={6} className={NODE_FILL} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={16} strokeWidth={1.5} className={`fill-white ${STRONG} dark:fill-zinc-950`} />
      <circle cx={cx} cy={cy} r={4} fill="#E84142">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <text x={cx} y={cy + 86} textAnchor="middle" fontSize={10} letterSpacing={2} className={MONO_LABEL}>
        {label}
      </text>
    </g>
  );
}

/* Interoperability — two live chains pass messages both ways; the      */
/* message (red: data in flight) is the only thing that moves.          */
function InteropDiagram() {
  return (
    <svg {...svgProps("Two Avalanche chains exchanging native messages")}>
      {/* message lanes */}
      <path d="M172,172 C216,136 264,136 308,172" fill="none" strokeWidth={1} className={HAIRLINE} />
      <path d="M308,188 C264,224 216,224 172,188" fill="none" strokeWidth={1} className={HAIRLINE} />

      <MiniRing cx={120} cy={180} label="YOUR L1" />
      <MiniRing cx={360} cy={180} label="C-CHAIN" />

      {/* message A → B */}
      <circle r={4.5} fill="#E84142">
        <animateMotion
          path="M172,172 C216,136 264,136 308,172"
          calcMode="linear"
          keyPoints="0;1;1"
          keyTimes="0;0.35;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.05;0.35;0.45;1" dur="6s" repeatCount="indefinite" />
      </circle>
      {/* message B → A, offset half a cycle */}
      <circle r={4.5} fill="#E84142">
        <animateMotion
          path="M308,188 C264,224 216,224 172,188"
          calcMode="linear"
          keyPoints="0;0;1;1"
          keyTimes="0;0.5;0.85;1"
          dur="6s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.5;0.55;0.85;1" dur="6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* Privacy — a sealed chain; outside probes reach the boundary and die. */
function PrivacyDiagram() {
  // inner nodes on R=64 (64·sin60 = 55.43, 64·cos60 = 32)
  const inner: [number, number][] = [
    [0, -64],
    [55.43, -32],
    [55.43, 32],
    [0, 64],
    [-55.43, 32],
    [-55.43, -32],
  ];
  // observers at R=170 / probe tips at the boundary R=122, pre-rounded
  const probes: { ox: number; oy: number; bx: number; by: number; begin: string }[] = [
    { ox: 387.22, oy: 95, bx: 345.66, by: 119, begin: "0s" },
    { ox: 92.78, oy: 265, bx: 134.34, by: 241, begin: "2.3s" },
    { ox: 210.48, oy: 12.58, bx: 218.82, by: 59.85, begin: "4.6s" },
  ];
  return (
    <svg {...svgProps("A validator-only L1 invisible to outside observers")}>
      {/* the chain, alive inside its boundary */}
      {inner.map(([dx, dy], i) => (
        <g key={i}>
          <line x1={240} y1={180} x2={240 + dx} y2={180 + dy} strokeWidth={1} className={HAIRLINE} />
          <circle cx={240 + dx} cy={180 + dy} r={6} className={NODE_FILL} />
        </g>
      ))}
      <circle cx={240} cy={180} r={20} strokeWidth={1.5} className={`fill-white ${STRONG} dark:fill-zinc-950`} />
      <circle cx={240} cy={180} r={5} fill="#E84142">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* sealed double boundary */}
      <circle cx={240} cy={180} r={110} fill="none" strokeWidth={1.5} className={STRONG} />
      <circle cx={240} cy={180} r={118} fill="none" strokeWidth={1} opacity={0.5} className={STRONG} />

      {/* probes: appear, reach the boundary, find nothing, fade */}
      {probes.map((p, i) => (
        <g key={i} opacity={0}>
          <animate
            attributeName="opacity"
            values="0;1;1;0;0"
            keyTimes="0;0.1;0.45;0.6;1"
            dur="7s"
            begin={p.begin}
            repeatCount="indefinite"
          />
          <circle cx={p.ox} cy={p.oy} r={4} className="fill-zinc-400 dark:fill-zinc-500" />
          <line
            x1={p.ox}
            y1={p.oy}
            x2={p.bx}
            y2={p.by}
            strokeDasharray="2 5"
            strokeWidth={1}
            className="stroke-zinc-400 dark:stroke-zinc-500"
          />
        </g>
      ))}
    </svg>
  );
}

/* Compliance — one gate in the boundary: the allowlisted transaction   */
/* passes, the unknown one stops at the line.                           */
function ComplianceDiagram() {
  // 5 inner nodes on R=56 around (300,180), pre-rounded
  const inner: [number, number][] = [
    [300, 124],
    [353.26, 162.69],
    [332.92, 225.3],
    [267.08, 225.3],
    [246.74, 162.69],
  ];
  return (
    <svg {...svgProps("An allowlist gate admitting approved transactions only")}>
      {/* boundary with a gate notch on the left (arc from 166° to 194°) */}
      <path
        d="M193.27,206.61 A110,110 0 1 1 193.27,153.39"
        fill="none"
        strokeWidth={1.5}
        className={STRONG}
      />
      {/* gate posts */}
      <line x1={199.08} y1={205.16} x2={188.9} y2={208.06} strokeWidth={1.5} className={STRONG} />
      <line x1={199.08} y1={154.84} x2={188.9} y2={151.94} strokeWidth={1.5} className={STRONG} />

      {/* the permissioned chain inside */}
      {inner.map(([x, y], i) => (
        <g key={i}>
          <line x1={300} y1={180} x2={x} y2={y} strokeWidth={1} className={HAIRLINE} />
          <circle cx={x} cy={y} r={6} className={NODE_FILL} />
        </g>
      ))}
      <circle cx={300} cy={180} r={16} strokeWidth={1.5} className={`fill-white ${STRONG} dark:fill-zinc-950`} />
      <circle cx={300} cy={180} r={4} fill="#E84142">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* approach lane */}
      <line x1={40} y1={180} x2={185} y2={180} strokeDasharray="2 5" strokeWidth={1} className={HAIRLINE} />

      {/* allowlisted: passes the gate and joins the chain */}
      <circle cy={180} r={5} className={NODE_FILL}>
        <animate attributeName="cx" values="48;238;238;48" keyTimes="0;0.35;0.95;1" dur="6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;1;0;0;0" keyTimes="0;0.06;0.38;0.48;0.95;1" dur="6s" repeatCount="indefinite" />
      </circle>

      {/* unknown: stops at the boundary */}
      <circle cy={180} r={5} strokeWidth={1.25} fill="none" className="stroke-zinc-400 dark:stroke-zinc-500">
        <animate attributeName="cx" values="48;48;186;186;48" keyTimes="0;0.5;0.72;0.95;1" dur="6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.5;0.56;0.9;0.96;1" dur="6s" repeatCount="indefinite" />
      </circle>
      {/* the refusal mark */}
      <g opacity={0} className="stroke-zinc-500 dark:stroke-zinc-400">
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.72;0.78;0.9;1" dur="6s" repeatCount="indefinite" />
        <line x1={181} y1={169} x2={191} y2={159} strokeWidth={1.25} />
        <line x1={181} y1={159} x2={191} y2={169} strokeWidth={1.25} />
      </g>

      <text x={112} y={214} textAnchor="middle" fontSize={10} letterSpacing={2} className={MONO_LABEL}>
        ALLOWLIST
      </text>
    </svg>
  );
}

export default function PillarDiagram({ slug }: { slug: string }) {
  switch (slug) {
    case "performance":
      return <PerformanceDiagram />;
    case "interoperability":
      return <InteropDiagram />;
    case "privacy":
      return <PrivacyDiagram />;
    case "compliance":
      return <ComplianceDiagram />;
    default:
      return null;
  }
}

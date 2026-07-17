import React from "react";

/* ------------------------------------------------------------------ */
/* StakeGlobe — a rotating wireframe sphere behind the stake figure:   */
/* the validator set, distributed around the planet, with activity.    */
/*                                                                      */
/* Same drawing language as PillarDiagrams: hairline zinc strokes, red  */
/* only for what is alive. Pure SMIL, so it renders without JS and      */
/* stays hydration-safe.                                                */
/*                                                                      */
/* The 3D: orthographic projection, vertical spin axis, slight tilt.    */
/* - Latitude rings are static ellipses (they don't move under a       */
/*   vertical-axis rotation).                                           */
/* - Meridians are vertical ellipses whose rx samples |sin(φ + ωt)| —  */
/*   the projected width of a great circle as it turns.                 */
/* - Validators ride their latitude ring: translate animates through   */
/*   (0,+B) → (A,0) → (0,−B) → (−A,0), i.e. front → right limb → back  */
/*   → left limb, with sine easing; opacity/scale drop on the far side. */
/*   Negative `begin` values phase each validator around the sphere.    */
/* All share one 24s revolution, so the set rotates rigidly together.   */
/* ------------------------------------------------------------------ */

const CX = 450;
const CY = 160;
const R = 150;
const REV = "24s";
// quarter-phase sine easing: x(t)=A·sin(2πt) sampled at quarter turns
const SINE = "0.37 0 0.63 1;0.37 0 0.63 1;0.37 0 0.63 1;0.37 0 0.63 1";
const QUARTERS = "0;0.25;0.5;0.75;1";

// latitude rings: y = CY − 146·sinλ, rx = R·cosλ, ry = 0.22·rx (tilt)
const LATITUDES = [
  { cy: 57, rx: 106, ry: 23 }, // 45°N
  { cy: 122, rx: 145, ry: 32 }, // 15°N
  { cy: 160, rx: 150, ry: 33 }, // equator
  { cy: 210, rx: 141, ry: 31 }, // 20°S
  { cy: 263, rx: 106, ry: 23 }, // 45°S
];

// meridian projected widths |sin(φ0 + ωt)|·R at eighth-turns
const MERIDIANS = [
  "1;106;150;106;1;106;150;106;1", // φ0 = 0°
  "130;145;75;39;130;145;75;39;130", // φ0 = 60°
  "130;39;75;145;130;39;75;145;130", // φ0 = 120°
];
const EIGHTHS = "0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1";

// validators: one per {latitude ring, phase}. A/B are the ring's semi-axes
// (dots sit fractionally inside the surface); begin offsets spread the set
// in longitude; ping staggers the red activity so something is always live.
const VALIDATORS = [
  { y: 57, a: 100, b: 22, begin: "-2s", ping: "0s" },
  { y: 57, a: 100, b: 22, begin: "-14s", ping: "-3.4s" },
  { y: 122, a: 136, b: 30, begin: "-7s", ping: "-1.2s" },
  { y: 122, a: 136, b: 30, begin: "-19s", ping: "-5.1s" },
  { y: 160, a: 141, b: 31, begin: "-6s", ping: "-0.5s" },
  { y: 160, a: 141, b: 31, begin: "-18s", ping: "-2.9s" },
  { y: 210, a: 133, b: 29, begin: "-4s", ping: "-2.3s" },
  { y: 210, a: 133, b: 29, begin: "-16s", ping: "-4.2s" },
  { y: 263, a: 100, b: 22, begin: "-10s", ping: "-4.5s" },
  { y: 263, a: 100, b: 22, begin: "-21s", ping: "-1.8s" },
];

// consensus traffic: red dots lapping their latitude faster than the
// 24s revolution, so they visibly overtake the validator set
const MESSAGES = [
  { y: 160, a: 141, b: 31, dur: "8s", begin: "0s" },
  { y: 160, a: 141, b: 31, dur: "8s", begin: "-4s" },
  { y: 122, a: 136, b: 30, dur: "6.5s", begin: "-2s" },
];

function orbit(a: number, b: number) {
  return `0 ${b};${a} 0;0 ${-b};${-a} 0;0 ${b}`;
}

export default function StakeGlobe() {
  return (
    <div aria-hidden className="pointer-events-none hidden items-center justify-end md:mr-10 md:flex lg:mr-24 xl:mr-36">
      <svg
        viewBox="272 0 356 320"
        className="h-40 w-auto text-zinc-400 lg:h-48 dark:text-zinc-600"
      >
        {/* axial tilt: the whole projection leans like a desk globe. An
            orthographic sphere rotated in-plane is still a sphere, so every
            orbit and ring stays geometrically consistent under the tilt. */}
        <g transform={`rotate(18 ${CX} ${CY})`}>
        {/* limb */}
        <circle cx={CX} cy={CY} r={R} fill="none" strokeWidth={1.25} stroke="currentColor" />

        {/* latitude rings — static under a vertical-axis spin */}
        {LATITUDES.map((lat) => (
          <ellipse
            key={lat.cy}
            cx={CX}
            cy={lat.cy}
            rx={lat.rx}
            ry={lat.ry}
            fill="none"
            strokeWidth={1}
            opacity={0.55}
            stroke="currentColor"
          />
        ))}

        {/* the network's pulse, at the heart of the sphere */}
        <circle cx={CX} cy={CY} r={5} fill="#E6212F">
          <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* meridians — projected width breathes with the turn */}
        {MERIDIANS.map((values, i) => (
          <ellipse key={i} cx={CX} cy={CY} ry={R} fill="none" strokeWidth={1} opacity={0.5} stroke="currentColor">
            <animate
              attributeName="rx"
              values={values}
              keyTimes={EIGHTHS}
              dur={REV}
              repeatCount="indefinite"
            />
          </ellipse>
        ))}

        {/* the validator set, riding the surface */}
        {VALIDATORS.map((v, i) => (
          <g key={i}>
            {/* one group per validator: position comes from the shared
                revolution, depth from the synchronized opacity fade */}
            <g transform={`translate(${CX} ${v.y})`}>
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={orbit(v.a, v.b)}
                  keyTimes={QUARTERS}
                  calcMode="spline"
                  keySplines={SINE}
                  dur={REV}
                  begin={v.begin}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.9;0.5;0.25;0.5;0.9"
                  keyTimes={QUARTERS}
                  dur={REV}
                  begin={v.begin}
                  repeatCount="indefinite"
                />
                <circle r={4.5} className="fill-zinc-500 dark:fill-zinc-400" />
                {/* activity: the validator broadcasts as it travels */}
                <circle r={4.5} fill="none" strokeWidth={1.25} stroke="#E6212F">
                  <animate attributeName="r" values="4.5;18" dur="4.5s" begin={v.ping} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0" dur="4.5s" begin={v.ping} repeatCount="indefinite" />
                </circle>
              </g>
            </g>
          </g>
        ))}

        {MESSAGES.map((m, i) => (
          <g key={i} transform={`translate(${CX} ${m.y})`}>
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={orbit(m.a, m.b)}
                keyTimes={QUARTERS}
                calcMode="spline"
                keySplines={SINE}
                dur={m.dur}
                begin={m.begin}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0.5;0.2;0.5;1"
                keyTimes={QUARTERS}
                dur={m.dur}
                begin={m.begin}
                repeatCount="indefinite"
              />
              <circle r={3} fill="#E6212F" />
            </g>
          </g>
        ))}
        </g>
      </svg>
    </div>
  );
}

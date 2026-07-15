/**
 * Curated "Built on Avalanche" roster for the homepage tape.
 *
 * Two tiers: public institutional pilots/deployments (JPMorgan Kinexys
 * portfolio pilot, Citi FX under MAS Project Guardian, BlackRock BUIDL,
 * Franklin Templeton Benji, the Spruce/Vista cohort, California DMV titles,
 * Deloitte FEMA platform) and flagship brand deployments.
 *
 * NOTE: institution logos in /public/logos/partners are favicon-grade,
 * fetched from the companies' own sites for the prototype — before production, comms/legal must sign off on displaying
 * bank marks (a pilot is not an endorsement) and assets should move to
 * Contentful.
 */
export interface BuiltOnChain {
  name: string;
  image: string;
  link: string;
}

export const BUILT_ON_CHAINS: BuiltOnChain[] = [
  // Institutional pilots & deployments
  { name: "JPMorgan", image: "/logos/partners/jpmorgan.png", link: "https://www.jpmorgan.com/kinexys" },
  { name: "Citi", image: "/logos/partners/citi.png", link: "https://www.citigroup.com" },
  { name: "BlackRock", image: "/logos/partners/blackrock.png", link: "https://securitize.io/blackrock" },
  { name: "Franklin Templeton", image: "/logos/partners/franklin-templeton.png", link: "https://www.franklintempleton.com" },
  { name: "Apollo", image: "/logos/partners/apollo.png", link: "https://www.apollo.com" },
  { name: "WisdomTree", image: "/logos/partners/wisdomtree.png", link: "https://www.wisdomtree.com" },
  { name: "T. Rowe Price", image: "/logos/partners/t-rowe-price.png", link: "https://www.troweprice.com" },
  { name: "Wellington Management", image: "/logos/partners/wellington.png", link: "https://www.wellington.com" },
  { name: "Janus Henderson", image: "/logos/partners/janus-henderson.png", link: "https://www.janushenderson.com" },
  { name: "Republic", image: "/logos/partners/republic.png", link: "https://republic.com" },
  { name: "Deloitte", image: "/logos/partners/deloitte.png", link: "https://www.deloitte.com" },
  { name: "California DMV", image: "/logos/partners/california-dmv.png", link: "https://www.dmv.ca.gov" },
  { name: "Securitize", image: "/logos/partners/securitize.png", link: "https://securitize.io" },
  { name: "Intain", image: "/logos/partners/intain.png", link: "https://intainft.com" },
  { name: "Dinari", image: "/logos/partners/dinari.png", link: "https://dinari.com" },
  { name: "StraitsX", image: "https://images.ctfassets.net/gcj8jwzm6086/3jGGJxIwb3GjfSEJFXkpj9/2ea8ab14f7280153905a29bb91b59ccb/icon.png", link: "https://straitsx.com/" },

  // Flagship brand deployments
  { name: "Kite AI", image: "/logos/partners/kite-ai.svg", link: "https://gokite.ai" },
  { name: "FIFA", image: "https://images.ctfassets.net/gcj8jwzm6086/27QiWdtdwCaIeFbYhA47KG/5b4245767fc39d68b566f215e06c8f3a/FIFA_logo.png", link: "https://collect.fifa.com/" },
  { name: "MapleStory", image: "https://images.ctfassets.net/gcj8jwzm6086/Uu31h98BapTCwbhHGBtFu/6b72f8e30337e4387338c82fa0e1f246/MSU_symbol.png", link: "https://maplestoryuniverse.com/" },
  { name: "Gunzilla", image: "https://images.ctfassets.net/gcj8jwzm6086/3z2BVey3D1mak361p87Vu/ca7191fec2aa23dfa845da59d4544784/unnamed.png", link: "https://gunzillagames.com/" },
  { name: "Dexalot", image: "https://images.ctfassets.net/gcj8jwzm6086/6tKCXL3AqxfxSUzXLGfN6r/be31715b87bc30c0e4d3da01a3d24e9a/dexalot-subnet.png", link: "https://dexalot.com/" },
  { name: "UPTN", image: "https://images.ctfassets.net/gcj8jwzm6086/5jmuPVLmmUSDrfXxbIrWwo/4bdbe8d55b775b613156760205d19f9f/symbol_UPTN_-_js_won.png", link: "https://uptn.io/" },
  { name: "Lamina1", image: "https://images.ctfassets.net/gcj8jwzm6086/5KPky47nVRvtHKYV0rQy5X/e0d153df56fd1eac204f58ca5bc3e133/L1-YouTube-Avatar.png", link: "https://lamina1.com/" },
];

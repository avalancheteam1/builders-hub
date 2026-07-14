/**
 * Curated "Built on Avalanche" deployments for the homepage marquee.
 * Copied from the console dashboard's inline list (app/console/page.tssx keeps
 * it inside a component body, so it can't be imported). Watr omitted — its
 * only asset is a white wordmark that vanishes on light backgrounds.
 */
export interface BuiltOnChain {
  name: string;
  image: string;
  link: string;
}

export const BUILT_ON_CHAINS: BuiltOnChain[] = [
  // Gaming
  { name: "FIFA", image: "https://images.ctfassets.net/gcj8jwzm6086/27QiWdtdwCaIeFbYhA47KG/5b4245767fc39d68b566f215e06c8f3a/FIFA_logo.png", link: "https://collect.fifa.com/" },
  { name: "MapleStory", image: "https://images.ctfassets.net/gcj8jwzm6086/Uu31h98BapTCwbhHGBtFu/6b72f8e30337e4387338c82fa0e1f246/MSU_symbol.png", link: "https://maplestoryuniverse.com/" },
  { name: "Beam", image: "https://images.ctfassets.net/gcj8jwzm6086/2ZXZw0POSuXhwoGTiv2fzh/5b9d9e81acb434461da5addb1965f59d/chain-logo.png", link: "https://onbeam.com/" },
  { name: "DeFi Kingdoms", image: "https://images.ctfassets.net/gcj8jwzm6086/6ee8eu4VdSJNo93Rcw6hku/2c6c5691e8a7c3b68654e5a4f219b2a2/chain-logo.png", link: "https://defikingdoms.com/" },
  { name: "Gunzilla", image: "https://images.ctfassets.net/gcj8jwzm6086/3z2BVey3D1mak361p87Vu/ca7191fec2aa23dfa845da59d4544784/unnamed.png", link: "https://gunzillagames.com/" },
  { name: "PLAYA3ULL", image: "https://images.ctfassets.net/gcj8jwzm6086/27mn0a6a5DJeUxcJnZr7pb/8a28d743d65bf35dfbb2e63ba2af7f61/brandmark_-_square_-_Sam_Thompson.png", link: "https://playa3ull.games/" },
  { name: "Blitz", image: "https://images.ctfassets.net/gcj8jwzm6086/5ZhwQeXUwtVZPIRoWXhgrw/03d0ed1c133e59f69bcef52e27d1bdeb/image__2___2_.png", link: "https://blitz.gg/" },
  { name: "Shrapnel", image: "https://images.ctfassets.net/gcj8jwzm6086/3vru4toe9KAyUXpn5XQthq/714286de3f35ee92426853037e985f77/chain-logo.png", link: "https://shrapnel.com/" },
  { name: "PLYR", image: "https://images.ctfassets.net/gcj8jwzm6086/5K1xUbrhZPhSOEtsHoghux/b64edf007db24d8397613f7d9338260a/logomark_fullorange.svg", link: "https://plyr.network/" },
  { name: "Tiltyard", image: "https://images.ctfassets.net/gcj8jwzm6086/5iZkicfOvjuwJYQqqCQN4y/9bdb761652d929459610c8b2da862cd5/android-chrome-512x512.png", link: "https://tiltyard.gg/" },
  { name: "Artery", image: "https://images.ctfassets.net/gcj8jwzm6086/7plQHTCA1MePklfF2lDgaE/1f4d00bf534a1ae180b3ea1de76308c8/SLIR8rz7_400x400.jpg", link: "https://studioartery.com/" },
  { name: "Hatchyverse", image: "https://dashboard-assets.dappradar.com/document/8825/hatchyverse-project-games-8825-logo_aaafc4cafbea89ae57991f888d963abb.png", link: "https://hatchyverse.com/" },
  // DeFi & Finance
  { name: "Dexalot", image: "https://images.ctfassets.net/gcj8jwzm6086/6tKCXL3AqxfxSUzXLGfN6r/be31715b87bc30c0e4d3da01a3d24e9a/dexalot-subnet.png", link: "https://dexalot.com/" },
  { name: "StraitsX", image: "https://images.ctfassets.net/gcj8jwzm6086/3jGGJxIwb3GjfSEJFXkpj9/2ea8ab14f7280153905a29bb91b59ccb/icon.png", link: "https://straitsx.com/" },
  { name: "Blaze", image: "https://images.ctfassets.net/gcj8jwzm6086/6Whg7jeebEhQfwGAXEsGVh/ecbb11c6c54af7ff3766b58433580721/2025-04-10_16.28.46.jpg", link: "https://blaze.stream/" },
  // Infrastructure & Enterprise
  { name: "Lamina1", image: "https://images.ctfassets.net/gcj8jwzm6086/5KPky47nVRvtHKYV0rQy5X/e0d153df56fd1eac204f58ca5bc3e133/L1-YouTube-Avatar.png", link: "https://lamina1.com/" },
  { name: "UPTN", image: "https://images.ctfassets.net/gcj8jwzm6086/5jmuPVLmmUSDrfXxbIrWwo/4bdbe8d55b775b613156760205d19f9f/symbol_UPTN_-_js_won.png", link: "https://uptn.io/" },
  { name: "Innovo", image: "https://images.ctfassets.net/gcj8jwzm6086/5wd9o1kxI1nG0Kb2LrEooJ/9e14075a20dc67c4ba5ab0ca404192b8/1675173474597.png", link: "https://innovomarkets.com/" },
  { name: "Coqnet", image: "https://images.ctfassets.net/gcj8jwzm6086/1r0LuDAKrZv9jgKqaeEBN3/9a7efac3099b861366f9e776e6131617/Isotipo_coq.png", link: "https://coq.fi/" },
  { name: "Intersect", image: "https://images.ctfassets.net/gcj8jwzm6086/4mDZ5q3a5lxHJcBLTORuMr/b47935fa6007cb3430acabef7e13e9ca/explorer.png", link: "https://intersect.io/" },
  { name: "Hashfire", image: "https://images.ctfassets.net/gcj8jwzm6086/4TCWxdtzvtZ8iD4255nAgU/e4d12af0a594bcf38b53a27e6beb07a3/FlatIcon_Large_.png", link: "https://hashfire.xyz/" },
  { name: "Space", image: "https://images.ctfassets.net/gcj8jwzm6086/27oUMNb9hSTA7HfFRnqUtZ/2f80e6b277f4b4ee971675b5f73c06bf/Space_Symbol_256X256__v2.svg", link: "https://space.id/" },
  { name: "Numi", image: "https://images.ctfassets.net/gcj8jwzm6086/411JTIUnbER3rI5dpOR54Y/3c0a8e47d58818a66edd868d6a03a135/numine_main_icon.png", link: "https://numine.io/" },
  { name: "Feature", image: "https://images.ctfassets.net/gcj8jwzm6086/2hWSbxXPv2QTPCtCaEp7Kp/522b520e7e5073f7e7459f9bd581bafa/FTR_LOGO_-_FLAT_BLACK.png", link: "https://feature.io/" },
  { name: "Kali Chain", image: "https://images.ctfassets.net/gcj8jwzm6086/r9EB5XcOIS39mZlXrFAsO/9bb66b54f61d0566588056782865aed2/logoKalichain.png", link: "https://kalichain.com/" },
  { name: "Orange", image: "https://images.ctfassets.net/gcj8jwzm6086/4jmmb8oMQwW5My8YYcEmAx/ee1f1cef8766cc934e9190c5c1c7fa21/Orange_Logo_Mark_Slightly_Padded.png", link: "https://orangeweb3.com/" },
  { name: "Zeroone", image: "https://images.ctfassets.net/gcj8jwzm6086/1lOFyhAJ0JkDkAmpeCznxL/9729fd9e4e75009f38a0e2c564259ead/icon-512.png", link: "https://zeroone.art/" },
];

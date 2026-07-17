/**
 * The four enterprise pillars — single source of truth for the homepage
 * "Why Avalanche" chapter, the /solutions splash pages, and the nav menu.
 *
 * Copy is a working draft: every claim must stay verifiable against shipped
 * protocol behavior (pending a story pass with comms/Mike before production).
 */

export interface PillarLink {
  text: string;
  href: string;
}

export type PillarSlug =
  | "interoperability"
  | "performance"
  | "privacy"
  | "compliance";

export interface Pillar {
  slug: PillarSlug;
  /** mono eyebrow, e.g. "PERFORMANCE" */
  label: string;
  /** statement headline, stored without its trailing period */
  title: string;
  /** one-liner for the homepage row and nav card */
  tagline: string;
  /** panel headline in the brand pattern: steel lead lines, red punch line */
  display: { lead: string[]; punch: string };
  metaDescription: string;
  /** splash-page lead paragraph */
  intro: string;
  proofs: { label: string; value: string }[];
  capabilities: { title: string; body: string }[];
  resources: { heading: string; links: PillarLink[] }[];
  /**
   * Optional: architecture models — the shapes this pillar's primitives
   * compose into. Rendered as a section only when present.
   */
  models?: {
    /** mono index, e.g. "MODEL 01" */
    label: string;
    name: string;
    tagline: string;
    description: string;
    bestFor: string;
    /** id of the architecture diagram to render alongside this model */
    diagram?: string;
  }[];
}

/**
 * Institutional use cases — the spine of the /solutions story.
 *
 * These are architecture patterns, not marketing tiles: a business framing,
 * the Avalanche shape that implements it, and the guarantees that shape buys.
 * Each draws on one or more pillars, and every /solutions subpage surfaces the
 * use cases that lean on it.
 *
 * Hard rule: no named institutions or private engagements. Patterns only.
 */
export interface UseCase {
  slug: string;
  /** mono eyebrow, e.g. "TOKENIZED DEPOSITS" */
  label: string;
  /** statement headline, stored without its trailing period */
  title: string;
  /** the business framing, one line */
  tagline: string;
  /** the problem, in the institution's own terms */
  summary: string;
  /** the architecture, as a primitives line: "Partitioned ledger · ICM · ..." */
  stack: string;
  /** the guarantees this shape buys, as label/value spec rows */
  guarantees: { label: string; value: string }[];
  /** the pillars this pattern composes; the first is its primary home */
  pillars: PillarSlug[];
}

export const PILLARS: Pillar[] = [
  {
    slug: "interoperability",
    display: { lead: ["Chain to chain,", "natively,"], punch: "no intermediaries" },
    label: "INTEROPERABILITY",
    title: "Every chain speaks natively",
    tagline:
      "Native messaging between Avalanche chains, public or private, verified against validator sets on the P-Chain.",
    metaDescription:
      "Interchain Messaging is built into Avalanche: authenticated messages and token transfers between public, permissioned, and private chains, verified against P-Chain validator sets.",
    intro:
      "An Interchain Messaging (ICM) message carries an aggregate signature from the source chain's validators, verified against the P-Chain's validator registry. No committee, no custodian.",
    proofs: [
      { label: "MESSAGING", value: "PROTOCOL-NATIVE" },
      { label: "ATTESTATION", value: "SOURCE VALIDATOR SET" },
      { label: "VERIFICATION", value: "P-CHAIN REGISTRY" },
    ],
    capabilities: [
      {
        title: "Authenticated messaging",
        body: "Messages carry aggregate BLS signatures from the source validator set, verified at the destination against the validator registry on the P-Chain.",
      },
      {
        title: "Native token transfer",
        body: "Interchain Token Transfer (ICTT) moves tokens between L1s over ICM, with contracts you deploy and control.",
      },
      {
        title: "Permissionless relay",
        body: "Messages are carried by relayers anyone can run. The destination chain verifies the source validators' signatures, never the messenger.",
      },
    ],
    resources: [
      {
        heading: "DOCUMENTATION",
        links: [
          { text: "Interchain Messaging", href: "/docs/cross-chain" },
          { text: "ICM contracts", href: "/docs/cross-chain/icm-contracts" },
          { text: "Interchain Token Transfer", href: "/docs/cross-chain/interchain-token-transfer/overview" },
          { text: "Avalanche Warp Messaging", href: "/docs/cross-chain/avalanche-warp-messaging" },
        ],
      },
      {
        heading: "LEARN",
        links: [
          { text: "Interchain Messaging course", href: "/academy/avalanche-l1/interchain-messaging" },
          { text: "Build an ERC-20 bridge", href: "/academy/avalanche-l1/erc20-bridge" },
          { text: "Bridge a native token", href: "/academy/avalanche-l1/native-token-bridge" },
        ],
      },
      {
        heading: "TOOLING",
        links: [
          { text: "Set up ICM in the Console", href: "/console/icm/setup" },
          { text: "Set up a token bridge", href: "/console/ictt/setup" },
          { text: "Test a connection", href: "/console/icm/test-connection" },
          { text: "Avalanche SDK", href: "/docs/tooling/avalanche-sdk" },
        ],
      },
    ],
  },
  {
    slug: "performance",
    display: { lead: ["In milliseconds,", "irreversible,"], punch: "every time" },
    label: "PERFORMANCE",
    title: "Finality in milliseconds",
    tagline:
      "Sub-second finality on the shared C-Chain, and under 100 milliseconds on an L1 all your own.",
    metaDescription:
      "Avalanche finality is irreversible with no reorgs: under a second on the C-Chain, under 100 milliseconds on dedicated L1s.",
    intro:
      "Finality on Avalanche is irreversible: no reorgs, no settlement window. The shared C-Chain settles in under a second; a dedicated L1 can push it below 100 milliseconds.",
    proofs: [
      { label: "C-CHAIN FINALITY", value: "<1S" },
      { label: "DEDICATED L1 FINALITY", value: "<100MS" },
      { label: "CHAIN REORGS", value: "NONE, BY DESIGN" },
    ],
    capabilities: [
      {
        title: "Irreversible settlement",
        body: "Snowman consensus accepts each block exactly once. No confirmation counting, no reorg window, no clawback of settled value.",
      },
      {
        title: "Dedicated blockspace",
        body: "Each L1 has its own validators, gas token, and fee market. Someone else's busy application never touches your latency.",
      },
      {
        title: "Horizontal scale",
        body: "Capacity grows by adding L1s: each new chain brings its own validators and fee market instead of bidding for shared blockspace.",
      },
    ],
    resources: [
      {
        heading: "DOCUMENTATION",
        links: [
          { text: "Avalanche consensus", href: "/docs/primary-network/avalanche-consensus" },
          { text: "Streaming async execution", href: "/docs/primary-network/streaming-async-execution" },
          { text: "The Primary Network", href: "/docs/primary-network" },
          { text: "Customize your EVM", href: "/docs/avalanche-l1s/evm-configuration/customize-avalanche-l1" },
        ],
      },
      {
        heading: "LEARN",
        links: [
          { text: "Avalanche fundamentals", href: "/academy/avalanche-l1/avalanche-fundamentals" },
          { text: "Customizing the EVM", href: "/academy/avalanche-l1/customizing-evm" },
          { text: "Blockchain fundamentals", href: "/academy?path=blockchain" },
        ],
      },
      {
        heading: "TOOLING",
        links: [
          { text: "Create an L1 in the Console", href: "/console/create-l1" },
          { text: "Live network stats", href: "/stats/overview" },
          { text: "Avalanche SDK", href: "/docs/tooling/avalanche-sdk" },
        ],
      },
    ],
  },
  {
    slug: "privacy",
    display: { lead: ["Visible to you,", "invisible to"], punch: "everyone else" },
    label: "PRIVACY",
    title: "Visible to participants. Invisible to everyone else",
    tagline:
      "EncryptedERC keeps balances confidential on public chains, and validator-only L1s disappear entirely: to anyone outside, the chain doesn't exist.",
    metaDescription:
      "Validator-only Avalanche L1s keep chain data inside the network's edge, with operator-controlled data residency and encrypted token standards.",
    intro:
      "Run a validator-only L1 and the chain's data stops at the network's edge. Only nodes you admit can sync, query, or even see it.",
    proofs: [
      { label: "NETWORK ACCESS", value: "VALIDATOR-ONLY" },
      { label: "DATA RESIDENCY", value: "OPERATOR-CONTROLLED" },
      { label: "OUTSIDE VISIBILITY", value: "NONE" },
    ],
    capabilities: [
      {
        title: "Validator-only networks",
        body: "One configuration flag closes the chain. Only validators and the nodes they admit can connect, sync, or serve its data.",
      },
      {
        title: "Data residency",
        body: "Validators are machines you place: keep every copy of the ledger in a jurisdiction, a data center, or your own racks.",
      },
      {
        title: "EncryptedERC (eERC)",
        body: "An encrypted token standard: balances and amounts are unreadable on-chain, decryptable only by the owner and designated auditors.",
      },
    ],
    resources: [
      {
        heading: "DOCUMENTATION",
        links: [
          { text: "Avalanche L1s", href: "/docs/avalanche-l1s" },
          { text: "Validator-only configuration", href: "/docs/nodes/configure/avalanche-l1-configs" },
          { text: "EncryptedERC (eERC)", href: "/integrations/encrypted-erc" },
        ],
      },
      {
        heading: "LEARN",
        links: [
          { text: "Permissioned L1s", href: "/academy/avalanche-l1/permissioned-l1s" },
          { text: "Avalanche fundamentals", href: "/academy/avalanche-l1/avalanche-fundamentals" },
        ],
      },
      {
        heading: "TOOLING",
        links: [
          { text: "Deploy eERC in the Console", href: "/console/encrypted-erc/overview" },
          { text: "Create an L1 in the Console", href: "/console/create-l1" },
          { text: "Avalanche SDK", href: "/docs/tooling/avalanche-sdk" },
        ],
      },
    ],
    models: [
      {
        label: "MODEL 01",
        name: "Walled Garden",
        tagline: "Full control over who enters the perimeter",
        description:
          "You decide who participates. The network sits behind a permissioned perimeter: no outsider can query it, read its transactions, or join without approval. Inside, everything is visible to participants; outside, the network is invisible.",
        bestFor: "Closed consortia, single-institution tokenization, regulated market infrastructure.",
        diagram: "walled-garden",
      },
      {
        label: "MODEL 02",
        name: "Partitioned Ledger",
        tagline: "Each party holds only their own ledger",
        description:
          "Every counterparty pair runs its own isolated ledger, exchanging settlement proofs directly rather than on a shared global one. Non-parties see nothing: no amounts, no identities, no timing.",
        bestFor: "DVP settlement, inter-bank clearing, FX netting, bilateral repo.",
        diagram: "partitioned-ledger",
      },
      {
        label: "MODEL 03",
        name: "Encrypted Settlement",
        tagline: "Amounts encrypted on shared infrastructure",
        description:
          "Transactions run on shared infrastructure, so everyone keeps shared liquidity and interoperability, but amounts, counterparties, and logic stay encrypted. Settlement is verified without anyone reading the underlying values.",
        bestFor: "Tokenized assets, cross-institution liquidity pools, digital bonds.",
        diagram: "encrypted-settlement",
      },
    ],
  },
  {
    slug: "compliance",
    display: { lead: ["Your rules,", "enforced by"], punch: "the protocol" },
    label: "COMPLIANCE",
    title: "Policy enforced by the protocol",
    tagline:
      "Allowlist validators, deployers, and transactors at the chain level. The rules live in precompiles, not policy documents.",
    metaDescription:
      "Avalanche L1s enforce permissioning at the protocol level: allowlist precompiles for deployers and transactions, and permissioned validator sets.",
    intro:
      "On an Avalanche L1, permissioning is a protocol primitive: precompiles gate who deploys and who transacts, and the validator set itself can be permissioned. The rules are enforced by the chain and auditable on it, and the chain stays fully EVM-compatible.",
    proofs: [
      { label: "CONTRACT DEPLOYMENT", value: "ALLOWLIST PRECOMPILE" },
      { label: "TRANSACTION ACCESS", value: "ALLOWLIST PRECOMPILE" },
      { label: "VALIDATOR SET", value: "PERMISSIONED OPTION" },
    ],
    capabilities: [
      {
        title: "Deployer allowlists",
        body: "The ContractDeployerAllowList precompile restricts deployment to addresses you approve, enforced at execution rather than by convention.",
      },
      {
        title: "Transaction gating",
        body: "The TxAllowList precompile controls who can transact at all: approved wallets in, everyone else out.",
      },
      {
        title: "Permissioned validator set",
        body: "You decide which operators validate, your machines or named partners, and admit or remove them through the validator manager contract.",
      },
    ],
    resources: [
      {
        heading: "DOCUMENTATION",
        links: [
          { text: "Deployer allowlist", href: "/docs/avalanche-l1s/precompiles/deployer-allowlist" },
          { text: "Transaction allowlist", href: "/docs/avalanche-l1s/precompiles/transaction-allowlist" },
          { text: "AllowList interface", href: "/docs/avalanche-l1s/precompiles/allowlist-interface" },
          { text: "Native minter precompile", href: "/docs/avalanche-l1s/precompiles/native-minter" },
        ],
      },
      {
        heading: "LEARN",
        links: [
          { text: "Access restriction", href: "/academy/avalanche-l1/access-restriction" },
          { text: "Permissioned L1s", href: "/academy/avalanche-l1/permissioned-l1s" },
        ],
      },
      {
        heading: "TOOLING",
        links: [
          { text: "Deployer allowlist tool", href: "/console/l1-access-restrictions/deployer-allowlist" },
          { text: "Transactor allowlist tool", href: "/console/l1-access-restrictions/transactor-allowlist" },
          { text: "Create an L1 in the Console", href: "/console/create-l1" },
        ],
      },
    ],
  },
];

export const USE_CASES: UseCase[] = [
  {
    slug: "tokenized-deposits",
    label: "TOKENIZED DEPOSITS",
    title: "Commercial bank money, on-chain",
    tagline:
      "Every issuer's deposit is a distinct asset, settled between counterparties without a shared global ledger.",
    summary:
      "Institutions want to move commercial bank money on-chain, but a deposit at one bank is not the same instrument as a deposit at another, and a shared public ledger would expose balances and flows to competitors. Moving value between issuers has to reconcile two different liabilities without either side broadcasting its book.",
    stack: "Partitioned ledger · ICM burn-and-mint · Permissioned validators",
    guarantees: [
      { label: "ASSET MODEL", value: "PER-ISSUER" },
      { label: "CROSS-ISSUER", value: "BURN-AND-MINT" },
      { label: "VISIBILITY", value: "COUNTERPARTY-ONLY" },
    ],
    pillars: ["privacy", "interoperability", "compliance"],
  },
  {
    slug: "dvp-settlement",
    label: "DVP SETTLEMENT",
    title: "Delivery versus payment, atomically",
    tagline:
      "Securities and cash change hands in a single settlement, each leg visible only to its counterparties.",
    summary:
      "Two parties exchange an asset for payment and both need certainty that delivery and payment settle together or not at all. On a shared public chain that certainty comes at the cost of revealing positions to the market; off-chain it comes at the cost of settlement risk and reconciliation.",
    stack: "Partitioned ledger · Atomic settlement · Irreversible finality",
    guarantees: [
      { label: "SETTLEMENT", value: "ATOMIC DVP" },
      { label: "FINALITY", value: "IRREVERSIBLE" },
      { label: "VISIBILITY", value: "COUNTERPARTY-ONLY" },
    ],
    pillars: ["privacy", "performance"],
  },
  {
    slug: "cross-border-settlement",
    label: "CROSS-BORDER SETTLEMENT",
    title: "Stablecoin settlement across borders",
    tagline:
      "A permissioned business chain reaches public stablecoin liquidity with no custodial bridge in the settlement path.",
    summary:
      "A regulated business runs on its own chain but settles in stablecoins whose liquidity lives on the public C-Chain. Crossing that boundary usually means trusting a third-party bridge, which adds a new custodian and a new counterparty to every settlement.",
    stack: "Dedicated L1 · ICM · C-Chain liquidity",
    guarantees: [
      { label: "BRIDGING", value: "PROTOCOL-NATIVE" },
      { label: "CUSTODY RISK", value: "NONE IN PATH" },
      { label: "FINALITY", value: "SUB-SECOND" },
    ],
    pillars: ["interoperability", "performance"],
  },
  {
    slug: "structured-credit",
    label: "STRUCTURED CREDIT",
    title: "Securitization, end to end",
    tagline:
      "Origination, servicing, and tranching run as contracts on a permissioned chain, settling in stablecoins on the public network.",
    summary:
      "Asset-backed finance runs on per-loan terms, eligibility tests, and waterfall logic that today live across spreadsheets and servicer systems. Putting them on a shared public chain would expose borrower and portfolio data; keeping them off-chain forfeits the automation that makes the structure worth tokenizing.",
    stack: "Walled-garden L1 · On-chain waterfall · ICM settlement",
    guarantees: [
      { label: "WATERFALL", value: "ON-CHAIN" },
      { label: "PORTFOLIO DATA", value: "OPERATOR-CONTROLLED" },
      { label: "CASH SETTLEMENT", value: "STABLECOIN VIA ICM" },
    ],
    pillars: ["privacy", "interoperability", "compliance"],
  },
];

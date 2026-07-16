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

export interface Pillar {
  slug: string;
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
}

export const PILLARS: Pillar[] = [
  {
    slug: "interoperability",
    display: { lead: ["One network,", "every chain,"], punch: "no bridges" },
    label: "INTEROPERABILITY",
    title: "Every chain speaks natively",
    tagline:
      "Native messaging between every chain on the network: public, permissioned, or private. No third-party bridges.",
    metaDescription:
      "Interchain Messaging is built into Avalanche: authenticated messages and token transfers between public, permissioned, and private chains, with no third-party bridges.",
    intro:
      "Interchain Messaging (ICM) is built into the protocol, not bolted on. Any Avalanche chain can message any other, public, permissioned, or private, attested by the source chain's own validators. No bridge committee, no custodian.",
    proofs: [
      { label: "MESSAGING", value: "PROTOCOL-NATIVE" },
      { label: "ATTESTATION", value: "SOURCE VALIDATOR SET" },
      { label: "EXTERNAL BRIDGES", value: "NONE REQUIRED" },
    ],
    capabilities: [
      {
        title: "Authenticated messaging",
        body: "Messages carry aggregate BLS signatures from the source validator set, verified on-chain at the destination.",
      },
      {
        title: "Native token transfer",
        body: "Interchain Token Transfer (ICTT) moves tokens between L1s over ICM, with contracts you deploy and control.",
      },
      {
        title: "C-Chain reach",
        body: "Stablecoins, DeFi, and tokenized assets on the C-Chain are one message away.",
      },
    ],
    resources: [
      {
        heading: "DOCUMENTATION",
        links: [
          { text: "Interchain Messaging", href: "/docs/cross-chain" },
          { text: "ICM contracts", href: "/docs/cross-chain/icm-contracts" },
          { text: "Interchain Token Transfer", href: "/docs/cross-chain/interchain-token-transfer/overview" },
        ],
      },
      {
        heading: "LEARN",
        links: [
          { text: "Interchain Messaging course", href: "/academy/avalanche-l1/interchain-messaging" },
        ],
      },
      {
        heading: "TOOLING",
        links: [
          { text: "ICM setup", href: "/console/icm/setup" },
          { text: "ICTT setup", href: "/console/ictt/setup" },
        ],
      },
    ],
  },
  {
    slug: "performance",
    display: { lead: ["Under a second,", "irreversible,"], punch: "every time" },
    label: "PERFORMANCE",
    title: "Finality in under a second",
    tagline:
      "Transactions settle irreversibly in under a second, on the shared C-Chain or on blockspace all your own.",
    metaDescription:
      "Avalanche finalizes transactions in under a second with no reorgs, on dedicated per-L1 blockspace that scales horizontally.",
    intro:
      "Avalanche consensus finalizes transactions in under a second, irreversibly, with no reorgs and no settlement window. Every L1 runs on dedicated blockspace, so throughput scales by adding chains, not by competing for one.",
    proofs: [
      { label: "TIME TO FINALITY", value: "<1s" },
      { label: "CHAIN REORGS", value: "NONE, BY DESIGN" },
      { label: "BLOCKSPACE", value: "DEDICATED PER L1" },
    ],
    capabilities: [
      {
        title: "Irreversible settlement",
        body: "Finality is absolute. There is no confirmation-depth arithmetic and no window in which settled value can be clawed back.",
      },
      {
        title: "Dedicated blockspace",
        body: "Each L1 has its own validators, gas token, and fee market. Someone else's busy application never touches your latency.",
      },
      {
        title: "Horizontal scale",
        body: "The network scales by multiplying L1s, not by pushing a single chain to its limit.",
      },
    ],
    resources: [
      {
        heading: "DOCUMENTATION",
        links: [
          { text: "Avalanche consensus", href: "/docs/primary-network/avalanche-consensus" },
          { text: "The Primary Network", href: "/docs/primary-network" },
          { text: "Customize your EVM", href: "/docs/avalanche-l1s/evm-configuration/customize-avalanche-l1" },
        ],
      },
      {
        heading: "LEARN",
        links: [
          { text: "Blockchain fundamentals", href: "/academy?path=blockchain" },
          { text: "Avalanche fundamentals", href: "/academy/avalanche-l1/avalanche-fundamentals" },
        ],
      },
      {
        heading: "TOOLING",
        links: [
          { text: "Launch an L1 in the Console", href: "/console" },
          { text: "Live network stats", href: "/stats/overview" },
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
      "Run a validator-only L1 and the chain's data stops at the network's edge: only nodes you admit can sync, query, or even see it. On-chain, EncryptedERC (eERC) tokens keep balances and transfer amounts encrypted, readable only by the parties involved and the auditors you designate.",
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
        ],
      },
      {
        heading: "TOOLING",
        links: [
          { text: "Launch an L1 in the Console", href: "/console" },
          { text: "Avalanche CLI & SDKs", href: "/docs/tooling" },
        ],
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
        title: "Accountable validators",
        body: "Named, contracted operators or your own machines, with uptime, geography, and identity yours to require.",
      },
    ],
    resources: [
      {
        heading: "DOCUMENTATION",
        links: [
          { text: "Deployer allowlist", href: "/docs/avalanche-l1s/precompiles/deployer-allowlist" },
          { text: "Transaction allowlist", href: "/docs/avalanche-l1s/precompiles/transaction-allowlist" },
          { text: "AllowList interface", href: "/docs/avalanche-l1s/precompiles/allowlist-interface" },
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
          { text: "Launch an L1 in the Console", href: "/console" },
          { text: "Developer tooling", href: "/docs/tooling" },
        ],
      },
    ],
  },
];

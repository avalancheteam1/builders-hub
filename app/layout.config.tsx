import { type LinkItemType, type BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { AvalancheLogo } from '@/components/navigation/avalanche-logo';
import {
  Sprout,
  Logs,
  SendHorizontal,
  Computer,
  BriefcaseBusiness,
  Hexagon,
  Waypoints,
  HandCoins,
  Network,
  Database,
  Ticket,
  Earth,
  ArrowLeftRight,
  GraduationCap,
  BookOpen,
  Code,
  GitBranch,
  DraftingCompass,
  Gamepad2,
  Flame,
  Layers,
  Blocks,
  Search,
  Bell,
} from 'lucide-react';
import Image from 'next/image';
import { UserButtonWrapper } from '@/components/login/user-button/UserButtonWrapper';

export const ecosystemMenu: LinkItemType = {
  type: 'menu',
  text: 'Ecosystem',
  items: [
    {
      menu: {
        banner: (
          <div className='-mx-3 -mt-3'>
            <Image
              src={"https://qizat5l3bwvomkny.public.blob.vercel-storage.com/builders-hub/nav-banner/hackathons-banner-nyqtkzooc3tJ4qcLjfLJijXz6uJ6oH.png"}
              alt='Preview'
              width={900}
              height={400}
              className='rounded-t-lg object-cover w-full h-auto'
              style={{
                maskImage: 'linear-gradient(to bottom,white 60%,transparent)',
              }}
            />
          </div>
        ),
        className: 'md:row-span-2',
      },
      icon: <Ticket />,
      text: 'Hackathons & Events',
      description:
        'Hands-on learning and real building, from intensive hackathons to expert-led workshops and structured bootcamps.',
      url: '/events',
    },
    {
      icon: <Gamepad2 />,
      text: 'Avalanche Summit',
      description:
        "Avalanche's premier in-person gathering for builders, enterprise leaders, and ecosystem innovators. New York City, September 16–17.",
      url: 'https://www.avalanchesummit.com',
      menu: {
        className: 'lg:col-start-2 lg:row-start-1',
      },
    },
    {
      icon: <Earth />,
      text: 'Community Driven Events',
      description:
        'Check out and join the global meetups, workshops and events organized by Avalanche Team1.',
      url: 'https://lu.ma/Team1?utm_source=builder_hub',
      menu: {
        className: 'lg:col-start-2 lg:row-start-2',
      },
    },
    {
      icon: <HandCoins />,
      text: 'Grants & Funding',
      description:
        'Explore Retro9000, research grants, and the Blizzard Fund to fuel your project on Avalanche.',
      url: '/grants',
      menu: {
        className: 'lg:col-start-3 lg:row-start-1',
      },
    },
    {
      icon: <BriefcaseBusiness />,
      text: 'Ecosystem Careers',
      description:
        'Find your next role at leading projects and companies building on Avalanche.',
      url: '/ecosystem-careers',
      menu: {
        className: 'lg:col-start-3 lg:row-start-2',
      },
    },
  ],
};

export const explorerMenu: LinkItemType = {
  type: "menu",
  text: "Explorer",
  url: "/explorer",
  items: [
    {
      menu: {
        banner: (
          <div className='-mx-3 -mt-3'>
            <Image
              src="/builderhub-playground.png"
              alt='Playground Preview'
              width={500}
              height={140}
              className='rounded-t-lg object-cover'
              style={{
                maskImage: 'linear-gradient(to bottom,white 60%,transparent)',
              }}
            />
          </div>
        ),
        className: 'md:row-span-3 lg:col-span-1',
      },
      icon: <DraftingCompass />,
      text: "Playground",
      url: "/stats/playground",
      description:
      "Create and customize multiple charts with real-time chain metrics.",
    },
    {
      icon: <Search />,
      text: "Block Explorer",
      url: "/explorer",
      description:
      "Explore blocks, transactions, and addresses across Avalanche L1s.",
      menu: {
        className: 'lg:col-start-2 lg:row-start-1',
      },
    },
    {
      icon: <Logs />,
      text: "Avalanche L1 Stats",
      url: "/stats/overview",
      description:
      "View the latest metrics for all Avalanche L1s in the network.",
      menu: {
        className: 'lg:col-start-2 lg:row-start-2',
      },
    },
    {
      icon: <Network />,
      text: "C-Chain Stats",
      url: "/stats/l1/c-chain",
      description:
      "View the latest metrics for the Avalanche C-Chain.",
      menu: {
        className: 'lg:col-start-2 lg:row-start-3',
      },
    },
    {
      icon: <Hexagon />,
      text: "Primary Network Validators",
      url: "/stats/validators/c-chain",
      description:
      "View the latest metrics for the Avalanche Primary Network validators.",
      menu: {
        className: 'lg:col-start-3 lg:row-start-1',
      },
    },
    {
      icon: <Flame />,
      text: <span className="inline-flex items-center gap-2">AVAX Burners<span className="text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-1.5 py-0.5 rounded">New</span></span>,
      url: "/stats/dapps/treemap",
      description:
      "See which protocols are burning the most AVAX on the C-Chain.",
      menu: {
        className: 'lg:col-start-3 lg:row-start-2',
      },
    },
    {
      icon: <Bell />,
      text: "Validator Alerts",
      url: "/validator-alerts",
      description:
      "Get notified about the status and health of your validators.",
      menu: {
        className: 'lg:col-start-3 lg:row-start-3',
      },
    },
  ],
};

export const docsMenu: LinkItemType = {
  type: 'menu',
  text: 'Documentation',
  url: '/docs/primary-network',
  items: [
    {
      menu: {
        banner: (
          <div className='-mx-3 -mt-3'>
            <Image
               src="https://qizat5l3bwvomkny.public.blob.vercel-storage.com/builders-hub/course-banner/multi-chain-architecture-lFotxOCNkXx0jUw9EGIaxnfdyuTb9G.jpg"
               alt='Preview'
               width={900}
               height={400}
              className='rounded-t-lg object-cover  w-full h-auto'
              style={{
                maskImage: 'linear-gradient(to bottom,white 60%,transparent)',
              }}
            />
          </div>
        ),
        className: 'md:row-span-3',
      },
      icon: <Sprout />,
      text: 'Primary Network',
      description: 'Connect to Avalanche and start building dApps',
      url: '/docs/primary-network',
    },
    {
      icon: <Layers />,
      text: 'Avalanche L1s',
      description:
        'Learn how to launch and customize your own Avalanche L1 blockchain.',
      url: '/docs/avalanche-l1s',
      menu: {
        className: 'lg:col-start-2 lg:row-start-1',
      },
    },
    {
      icon: <Computer />,
      text: 'Nodes & Validators',
      description:
        "Learn about setting up, configuring and maintaining Avalanche nodes and validators.",
      url: '/docs/nodes',
      menu: {
        className: 'lg:col-start-2 lg:row-start-2',
      },
    },
    {
      icon: <Database />,
      text: 'Data APIs',
      description:
        'Explore the Data, Metrics, and Webhook APIs for the C-Chain, P-Chain, and X-Chain.',
      url: '/docs/api-reference/data-api',
      menu: {
        className: 'lg:col-start-2 lg:row-start-3',
      },
    },
    {
      icon: <Code />,
      text: 'Developer Tools',
      description:
        'Explore the Avalanche SDKs, CLI, and more.',
      url: '/docs/tooling',
      menu: {
        className: 'lg:col-start-3 lg:row-start-1',
      },
    },
    {
      icon: <Blocks />,
      text: 'Integrations',
      description:
        'Browse wallet SDKs, block explorers, indexers, data feeds, and more ecosystem integrations.',
      url: '/integrations',
      menu: {
        className: 'lg:col-start-3 lg:row-start-2',
      },
    },
    {
      icon: <GitBranch />,
      text: 'ACPs',
      description:
        "Explore Avalanche's Community Proposals (ACPs) for network improvements and best practices.",
      url: '/docs/acps',
      menu: {
        className: 'lg:col-start-3 lg:row-start-3',
      },
    },
  ],
};

export const academyMenu: LinkItemType = {
  type: 'menu',
  text: 'Academy',
  url: '/academy',
  items: [
    {
      menu: {
        banner: (
          <div className='-mx-3 -mt-3'>
            <Image
              src={"https://qizat5l3bwvomkny.public.blob.vercel-storage.com/builders-hub/course-banner/avalanche-fundamentals-skz9GZ84gSJ7MPvkSrbiNlnK5F7suB.jpg"}
              alt='Preview'
              width={900}
              height={400}
              className='rounded-t-lg object-cover w-full h-auto'
              style={{
                maskImage: 'linear-gradient(to bottom,white 60%,transparent)',
              }}
            />
          </div>
        ),
        className: 'md:row-span-2',
      },
      icon: <Sprout />,
      text: 'Avalanche L1 Academy',
      description:
        'Master blockchain development with comprehensive courses on Avalanche fundamentals, L1s, and advanced topics',
      url: '/academy?path=avalanche-l1',
    },
    {
      menu: {
        banner: (
          <div className='-mx-3 -mt-3'>
            <Image
              src="https://qizat5l3bwvomkny.public.blob.vercel-storage.com/builders-hub/course-banner/customizing-evm-DkMcINMgCwhkuHuumtAZtrPzROU74M.jpg"
              alt='Blockchain Academy'
              width={900}
              height={400}
              className='rounded-t-lg object-cover w-full h-auto'
              style={{
                maskImage: 'linear-gradient(to bottom,white 60%,transparent)',
              }}
            />
          </div>
        ),
        className: 'md:row-span-2 lg:col-start-2',
      },
      icon: <GraduationCap />,
      text: 'Blockchain Academy',
      description:
        'Build a rock-solid foundation in blockchain fundamentals, smart contracts, and privacy-preserving tech.',
      url: '/academy?path=blockchain',
    },
    {
      icon: <BriefcaseBusiness />,
      text: 'Entrepreneur Academy',
      description:
        'Transform from builder to founder with courses on business fundamentals, fundraising, and go-to-market strategies',
      url: '/academy?path=entrepreneur',
      menu: {
        className: 'lg:col-start-3 lg:row-start-1',
      },
    },
    {
      icon: <BookOpen />,
      text: 'Blog & Guides',
      description:
        'Read the latest articles, tutorials, and insights from the Avalanche ecosystem.',
      url: '/guides',
      menu: {
        className: 'lg:col-start-3 lg:row-start-2',
      },
    },
  ],
};

export const consoleMenu: LinkItemType = {
  type: 'menu',
  text: 'Console',
  url: '/console',
  items: [
    {
      menu: {
        banner: (
          <div className='-mx-3 -mt-3'>
            <Image
              src="https://qizat5l3bwvomkny.public.blob.vercel-storage.com/builder-console-megamenu"
              alt='Builder Console Preview'
              width={900}
              height={400}
              className='rounded-t-lg object-cover w-full h-auto'
              style={{
                maskImage: 'linear-gradient(to bottom,white 60%,transparent)',
              }}
            />
          </div>
        ),
        className: 'md:row-span-2 lg:col-span-1',
      },
      icon: <Waypoints />,
      text: 'Console',
      description: 'Manage your L1 with a highly granular set of tools.',
      url: '/console',
    },
    {
      icon: <SendHorizontal />,
      text: 'Interchain Messaging Tools',
      description:
        'Set up Interchain Messaging (ICM) for your L1.',
      url: '/console/icm/setup',
      menu: {
        className: 'lg:col-start-2 lg:row-start-1',
      },
    },
    {
      icon: <ArrowLeftRight />,
      text: 'Interchain Token Transfer Tools',
      description:
        'Set up cross-L1 bridges using the Interchain Token Transfer protocol.',
      url: '/console/ictt/setup',
      menu: {
        className: 'lg:col-start-2 lg:row-start-2',
      },
    },
    {
      icon: <HandCoins />,
      text: 'Testnet Faucet',
      description:
        'Claim Fuji AVAX tokens from the testnet faucet to test your dApps.',
      url: '/console/primary-network/faucet',
      menu: {
        className: 'lg:col-start-3 lg:row-start-1',
      },
    }
  ],
};

export const userMenu: LinkItemType = {
  type: 'custom',
  children: <UserButtonWrapper />,
  secondary: true,
};

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <AvalancheLogo className="size-7" fill="currentColor" />
        <span style={{ fontSize: "large", marginTop: "4px" }}>Builder Hub</span>
      </div>
    ),
  },
  links: [
    academyMenu,
    docsMenu,
    consoleMenu,
    explorerMenu,
    ecosystemMenu,
    userMenu
  ],
};

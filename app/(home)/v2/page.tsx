import type { Metadata } from 'next';
import StoryHome from '@/components/landing-v2/StoryHome';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://build.avax.network';

export const metadata: Metadata = {
  title: 'Avalanche Builder Hub',
  description:
    'Sovereign L1 networks with sub-2s finality, native interoperability, and protocol-level compliance controls.',
};

async function getGlobeData() {
  try {
    const [metricsRes, icmRes] = await Promise.all([
      fetch(`${BASE_URL}/api/overview-stats?timeRange=day`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${BASE_URL}/api/icm-flow?days=30`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const [metrics, icmData] = await Promise.all([
      metricsRes.ok ? metricsRes.json() : null,
      icmRes.ok ? icmRes.json() : null,
    ]);

    return {
      metrics,
      icmFlows: icmData?.flows || [],
    };
  } catch (error) {
    console.error('Failed to fetch globe data:', error);
    return { metrics: null, icmFlows: [] };
  }
}

const PRIMARY_NETWORK_ID = '11111111111111111111111111111111LpoYY';

// P-Chain-derived figures: L1 count (subnets flagged isL1 in the registry —
// the Glacier activity aggregate undercounts at ~27) and the AVAX staked on
// the primary network (economic security, the number institutions evaluate).
async function getPChainStats(): Promise<{
  l1Count: number | null;
  primaryStakeAvax: number | null;
}> {
  try {
    const res = await fetch(`${BASE_URL}/api/validator-stats?network=mainnet`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { l1Count: null, primaryStakeAvax: null };
    const subnets: { id: string; isL1?: boolean; totalStakeString?: string }[] = await res.json();
    const count = subnets.filter((s) => s.isL1).length;
    const primary = subnets.find((s) => s.id === PRIMARY_NETWORK_ID);
    const stake = primary?.totalStakeString
      ? Math.round(Number(BigInt(primary.totalStakeString) / 1_000_000_000n))
      : null;
    return { l1Count: count > 0 ? count : null, primaryStakeAvax: stake };
  } catch (error) {
    console.error('Failed to fetch P-Chain stats:', error);
    return { l1Count: null, primaryStakeAvax: null };
  }
}

export default async function HomeV2Page(): Promise<React.ReactElement> {
  const [globeData, pchain] = await Promise.all([getGlobeData(), getPChainStats()]);
  return (
    <StoryHome
      globeData={globeData}
      l1Count={pchain.l1Count}
      primaryStakeAvax={pchain.primaryStakeAvax}
    />
  );
}

'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

import WorkshopToken from '@/contracts/example-contracts/compiled/WorkshopToken.json';
import { Button } from '@/components/toolbox/components/Button';
import { ChainGate } from '@/components/toolbox/components/ChainGate';
import { EVMFaucetButton } from '@/components/toolbox/components/ConnectWallet/EVMFaucetButton';
import { Input } from '@/components/toolbox/components/Input';
import { Note } from '@/components/toolbox/components/Note';
import { Success } from '@/components/toolbox/components/Success';
import { useContractDeployer } from '@/components/toolbox/hooks/contracts';
import { WalletRequirementsConfigKey } from '@/components/toolbox/hooks/useWalletRequirements';
import { useWalletStore } from '@/components/toolbox/stores/walletStore';
import { generateConsoleToolGitHubUrl } from '@/components/toolbox/utils/githubUrl';
import { ConsoleToolMetadata, withConsoleToolMetadata } from '@/components/toolbox/components/WithConsoleToolMetadata';

const FUJI_CHAIN_ID = 43113;
const FUJI_EXPLORER = 'https://testnet.snowtrace.io';

// The workshop runs on a shoestring balance: a WorkshopToken deployment costs a
// small fraction of an AVAX, so anything above zero is enough to get going.
const LOW_BALANCE_THRESHOLD = 0.05;

const MAX_SUPPLY = 1_000_000_000_000n;

const metadata: ConsoleToolMetadata = {
  title: 'Deploy Your Token',
  description:
    'Give your ERC-20 token a name, a symbol and a starting supply, then deploy it to the Fuji testnet. The entire supply is minted to your wallet.',
  toolRequirements: [
    WalletRequirementsConfigKey.HasWallet,
    WalletRequirementsConfigKey.WalletConnected,
    WalletRequirementsConfigKey.TestnetRequired,
    WalletRequirementsConfigKey.EVMChainBalance,
  ],
  githubUrl: generateConsoleToolGitHubUrl(import.meta.url),
};

/** Validates one field at a time so the workshop attendee sees the specific thing to fix. */
function validate(tokenName: string, symbol: string, supply: string) {
  const errors: { name?: string; symbol?: string; supply?: string } = {};

  if (tokenName.trim().length === 0) {
    errors.name = 'Give your token a name.';
  } else if (tokenName.trim().length > 64) {
    errors.name = 'Keep the name under 64 characters.';
  }

  const trimmedSymbol = symbol.trim();
  if (trimmedSymbol.length === 0) {
    errors.symbol = 'Give your token a symbol.';
  } else if (!/^[A-Za-z0-9]+$/.test(trimmedSymbol)) {
    errors.symbol = 'Use letters and numbers only, with no spaces.';
  } else if (trimmedSymbol.length > 11) {
    errors.symbol = 'Most wallets truncate symbols longer than 11 characters.';
  }

  const trimmedSupply = supply.trim();
  if (trimmedSupply.length === 0) {
    errors.supply = 'Choose how many tokens to create.';
  } else if (!/^\d+$/.test(trimmedSupply)) {
    errors.supply = 'Enter a whole number, with no decimals or commas.';
  } else if (BigInt(trimmedSupply) === 0n) {
    errors.supply = 'Create at least one token.';
  } else if (BigInt(trimmedSupply) > MAX_SUPPLY) {
    errors.supply = 'That is more than a trillion tokens — try something smaller.';
  }

  return errors;
}

function DeployWorkshopToken() {
  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('1000000');
  const [contractAddress, setContractAddress] = useState('');
  const [deployError, setDeployError] = useState<string | null>(null);

  const walletChainId = useWalletStore((s) => s.walletChainId);
  const cChainBalance = useWalletStore((s) => s.cChainBalance);
  const { deploy, isDeploying } = useContractDeployer();

  const errors = validate(tokenName, symbol, supply);
  const hasErrors = Object.keys(errors).length > 0;
  const isOnFuji = walletChainId === FUJI_CHAIN_ID;
  const needsFunds = cChainBalance < LOW_BALANCE_THRESHOLD;

  async function handleDeploy() {
    setDeployError(null);
    try {
      const result = await deploy({
        abi: WorkshopToken.abi as any,
        bytecode: WorkshopToken.bytecode.object,
        args: [tokenName.trim(), symbol.trim().toUpperCase(), BigInt(supply.trim())],
        name: 'WorkshopToken',
      });

      setContractAddress(result.contractAddress);
    } catch (error) {
      // Deployment failures here are almost always a rejected signature or an
      // empty wallet, both of which the attendee can fix and retry. Keep the
      // tool mounted and show the reason rather than unmounting into an error
      // boundary mid-workshop.
      setDeployError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <ChainGate requiredChain="c-chain">
      <div className="space-y-4">
        {needsFunds && !contractAddress && (
          <Note variant="warning">
            <div className="flex flex-wrap items-center gap-2">
              <span>You need a little test AVAX to pay for the deployment.</span>
              <EVMFaucetButton chainId={FUJI_CHAIN_ID}>Get test AVAX</EVMFaucetButton>
            </div>
          </Note>
        )}

        <Input
          label="Token Name"
          id="workshop-token-name"
          value={tokenName}
          onChange={setTokenName}
          placeholder="Avalanche Workshop Token"
          helperText="The full name shown in wallets and explorers."
          error={tokenName.length > 0 ? errors.name : undefined}
          disabled={isDeploying}
        />

        <Input
          label="Token Symbol"
          id="workshop-token-symbol"
          value={symbol}
          onChange={(value) => setSymbol(value.toUpperCase())}
          placeholder="AWT"
          helperText="The short ticker, like AVAX or USDC."
          error={symbol.length > 0 ? errors.symbol : undefined}
          disabled={isDeploying}
        />

        <Input
          label="Initial Supply"
          id="workshop-token-supply"
          type="number"
          value={supply}
          onChange={setSupply}
          placeholder="1000000"
          unit={symbol.trim() || 'tokens'}
          helperText="How many tokens to create. All of them are sent to your wallet."
          error={supply.length > 0 ? errors.supply : undefined}
          disabled={isDeploying}
        />

        <Button
          variant={contractAddress ? 'secondary' : 'primary'}
          onClick={handleDeploy}
          loading={isDeploying}
          loadingText="Deploying..."
          disabled={isDeploying || hasErrors || !isOnFuji}
        >
          {contractAddress ? 'Deploy Another Token' : 'Deploy Token'}
        </Button>

        {deployError && <Note variant="destructive">{deployError}</Note>}

        {contractAddress && (
          <div className="space-y-3">
            <Success label="Your token is live at" value={contractAddress} confirmed />

            <a
              href={`${FUJI_EXPLORER}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
            >
              View your token on the Fuji explorer
              <ExternalLink className="h-4 w-4" />
            </a>

            <Note variant="success">
              You just deployed a smart contract to a real blockchain. Copy the address above — you will need it to add{' '}
              {symbol.trim() || 'your token'} to your wallet in the next step.
            </Note>
          </div>
        )}
      </div>
    </ChainGate>
  );
}

export default withConsoleToolMetadata(DeployWorkshopToken, metadata);

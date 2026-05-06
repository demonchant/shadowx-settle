import { PublicKey } from '@solana/web3.js';

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatSOL(lamports: number): string {
  return formatNumber(lamports / 1e9, 4);
}

export function getExplorerUrl(address: string, type: 'address' | 'tx' = 'address', cluster = 'devnet'): string {
  return `https://explorer.solana.com/${type}/${address}?cluster=${cluster}`;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

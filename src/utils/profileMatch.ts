import type { Session } from '../types/auth.ts';
import { STOCK_META } from '../data/stocks.ts';
import { CRYPTOS } from '../data/cryptos.ts';
import { CRYPTO_UNIVERSE_MAP } from '../data/cryptoUniverse.ts';

// Risque minimum requis (1–5) par catégorie crypto
const CATEGORY_MIN_RISK: Record<string, number> = {
  // ── Très sûr (risque 1+) ─────────────────────────────────
  'Layer 1 / PoW':               1,
  'Layer 1 / Smart Contracts':   1,
  'Layer 1 / Paiements':         1,
  'Layer 1 / Enterprise':        1,
  'Paiements / CBDC':            1,
  'Paiements':                   1,
  'Stablecoin':                  1,
  'Or Tokenisé':                 1,
  'RWA / Tokenized Treasury':    1,
  'DeFi / Stablecoin DEX':       2,
  'DeFi / Liquid Staking':       2,
  'Exchange Token':              2,
  'Oracle / Infra':              2,
  'Oracle':                      2,
  'Layer 1 / Exchange':          2,
  'Layer 1 / Interopérabilité':  2,
  'Data / Indexing':             2,
  'RWA / Credit':                2,
  'Storage / Compute':           2,
  'Storage / Permanent':         2,

  // ── Modéré (risque 3+) ───────────────────────────────────
  'Layer 1 / Privacy':           3,
  'Layer 1 / ZK':                3,
  'Layer 1 / Modular':           3,
  'Layer 2 / EVM':               3,
  'Layer 2 / Optimistic':        3,
  'Layer 2 / ZK':                3,
  'Layer 2 / Omnichain':         3,
  'DeFi / DEX':                  3,
  'DeFi / DEX Aggregator':       3,
  'DeFi / Lending':              3,
  'DeFi / Aggregator':           3,
  'Cross-chain / Bridge':        3,
  'DePIN / IoT':                 3,
  'DePIN / Telecom':             3,
  'DePIN / GPS':                 3,
  'DePIN / Storage':             3,
  'Identity / DNS':              3,
  'Solana / Liquid Staking':     3,
  'Solana / Oracle':             3,
  'Cosmos / Smart Contracts':    3,
  'Polkadot / EVM':              3,
  'Polkadot / RWA':              3,
  'Liquid Staking':              3,

  // ── Dynamique (risque 4+) ────────────────────────────────
  'Layer 1 / DeFi':              4,
  'Layer 1 / Rollup':            4,
  'Layer 1 / Bitcoin L2':        4,
  'Layer 2 / ZK Privacy':        4,
  'Layer 2 / Gaming / NFT':      4,
  'Layer 2 / Gaming':            4,
  'DeFi / DEX Perps':            4,
  'DeFi / Yield':                4,
  'DeFi / Synthetics':           4,
  'DeFi / Cross-chain DEX':      4,
  'DeFi / CDP / Stablecoin':     4,
  'DeFi / ve(3,3)':              4,
  'DeFi / Leverage':             4,
  'Restaking':                   4,
  'DePIN / Mobility':            4,
  'DePIN / Energie':             4,
  'AI / Agent':                  4,
  'AI / Marketplace':            4,
  'AI / Decentralized ML':       4,
  'AI / Identity':               4,
  'AI / Analytics':              4,
  'AI / Media':                  4,
  'AI / Web3':                   4,
  'AI / Agents':                 4,
  'AI / Data':                   4,
  'AI / Gaming':                 4,
  'Gaming / P2E':                4,
  'Gaming / Metaverse':          4,
  'Gaming / NFT':                4,
  'Gaming / Ecosystem':          4,
  'Gaming':                      4,
  'Gaming / Chain':              4,
  'Gaming / L1':                 4,
  'Gaming / L2':                 4,
  'Gaming / L3 Arbitrum':        4,
  'Gaming / Cross-chain':        4,
  'Media / Streaming':           4,
  'Media / Video':               4,
  'Media / Music':               4,
  'NFT / Sports Fan':            4,
  'NFT / Marketplace':           4,
  'Social / Web3':               4,
  'Move-to-Earn':                4,
  'Launchpad':                   4,
  'Education / Web3':            4,
  'Solana / NFT':                4,
  'Solana / DEX Perps':          4,
  'Solana / DeFi':               4,
  'Cosmos / DeFi':               4,
  'Cosmos / EVM':                4,
  'Cosmos / NFT':                4,
  'Polkadot / DEX':              4,
  'Polkadot / DeFi':             4,

  // ── Agressif (risque 5 seulement) ───────────────────────
  'Memecoin':                    5,
  'AI / Memecoin':               5,
  'Memecoin / Depegged':         5,
  'Paiements / Depegged':        5,
  'Privacy / DeFi':              5,
  'Privacy / MimbleWimble':      5,
  'Privacy':                     5,
  'Inscription / BRC-20':        5,
};

/**
 * Une action "correspond" au profil si :
 * - Elle a une fiche complète (★ Analysé)
 * - L'horizon n'est pas court terme (équités = investissement long)
 */
export function matchesEquityProfile(sym: string, session: Session | null): boolean {
  if (!session?.onboardingDone || session.riskLevel === 0) return false;
  if (session.horizon === 'court') return false;
  return !!STOCK_META[sym];
}

/**
 * Une crypto "correspond" au profil selon son niveau de risque (riskClass ou catégorie)
 * mappé au risque utilisateur (1–5).
 */
export function matchesCryptoProfile(sym: string, session: Session | null): boolean {
  if (!session?.onboardingDone || session.riskLevel === 0) return false;

  const userRisk = session.riskLevel;

  // Crypto analysée → utilise le riskClass existant
  const analyzed = CRYPTOS.find(c => c.sym === sym);
  if (analyzed) {
    if (analyzed.riskClass === 'risk-mid')   return userRisk >= 1;
    if (analyzed.riskClass === 'risk-high')  return userRisk >= 3;
    if (analyzed.riskClass === 'risk-vhigh') return userRisk >= 5;
    return false;
  }

  // Crypto univers → utilise la catégorie
  const entry = CRYPTO_UNIVERSE_MAP[sym];
  if (!entry) return false;

  const minRisk = CATEGORY_MIN_RISK[entry.category] ?? 4;
  return userRisk >= minRisk;
}

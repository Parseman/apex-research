export interface CryptoUniverseEntry {
  sym: string;          // Ticker affiché (BTC, ETH…)
  name: string;         // Nom complet
  category: string;     // Catégorie
  pair: string | null;  // Paire Binance USDT — null = pas de paire (skip fetch)
}

// Format : [sym, name, category, binancePair?]
// binancePair optionnel → `${sym}USDT` par défaut ; null → pas de paire Binance
const RAW: [string, string, string, (string | null)?][] = [

  // ── LAYER 1 — PROOF OF WORK ─────────────────────────────────────────────
  ['BTC',   'Bitcoin',                    'Layer 1 / PoW'],
  ['LTC',   'Litecoin',                   'Layer 1 / PoW'],
  ['BCH',   'Bitcoin Cash',               'Layer 1 / PoW'],
  ['ETC',   'Ethereum Classic',           'Layer 1 / PoW'],
  ['DASH',  'Dash',                       'Layer 1 / PoW'],
  ['ZEC',   'Zcash',                      'Layer 1 / PoW'],
  ['RVN',   'Ravencoin',                  'Layer 1 / PoW'],
  ['XMR',   'Monero',                     'Layer 1 / Privacy',    null], // retiré de Binance fév. 2024
  ['KAS',   'Kaspa',                      'Layer 1 / PoW',        null], // pas listé sur Binance
  ['DGB',   'DigiByte',                   'Layer 1 / PoW'],
  ['ZEN',   'Horizen',                    'Layer 1 / Privacy'],
  ['FIRO',  'Firo',                       'Layer 1 / Privacy'],
  ['BTG',   'Bitcoin Gold',               'Layer 1 / PoW'],
  ['XVG',   'Verge',                      'Layer 1 / Privacy'],

  // ── LAYER 1 — PROOF OF STAKE ────────────────────────────────────────────
  ['ETH',   'Ethereum',                   'Layer 1 / Smart Contracts'],
  ['SOL',   'Solana',                     'Layer 1 / Smart Contracts'],
  ['BNB',   'BNB Chain',                  'Layer 1 / Exchange'],
  ['ADA',   'Cardano',                    'Layer 1 / Smart Contracts'],
  ['AVAX',  'Avalanche',                  'Layer 1 / Smart Contracts'],
  ['DOT',   'Polkadot',                   'Layer 1 / Interopérabilité'],
  ['ATOM',  'Cosmos',                     'Layer 1 / Interopérabilité'],
  ['NEAR',  'NEAR Protocol',              'Layer 1 / Smart Contracts'],
  ['APT',   'Aptos',                      'Layer 1 / Smart Contracts'],
  ['SUI',   'Sui',                        'Layer 1 / Smart Contracts'],
  ['TON',   'Toncoin',                    'Layer 1 / Smart Contracts'],
  ['ICP',   'Internet Computer',          'Layer 1 / Smart Contracts'],
  ['FTM',   'Fantom',                     'Layer 1 / Smart Contracts'],
  ['EGLD',  'MultiversX',                 'Layer 1 / Smart Contracts'],
  ['ONE',   'Harmony',                    'Layer 1 / Smart Contracts'],
  ['ALGO',  'Algorand',                   'Layer 1 / Smart Contracts'],
  ['HBAR',  'Hedera',                     'Layer 1 / Enterprise'],
  ['XTZ',   'Tezos',                      'Layer 1 / Smart Contracts'],
  ['EOS',   'EOS',                        'Layer 1 / Smart Contracts'],
  ['XLM',   'Stellar',                    'Layer 1 / Paiements'],
  ['TRX',   'TRON',                       'Layer 1 / Smart Contracts'],
  ['VET',   'VeChain',                    'Layer 1 / Supply Chain'],
  ['ZIL',   'Zilliqa',                    'Layer 1 / Smart Contracts'],
  ['KLAY',  'Klaytn',                     'Layer 1 / Smart Contracts'],
  ['CELO',  'Celo',                       'Layer 1 / Paiements'],
  ['ROSE',  'Oasis Network',              'Layer 1 / Privacy'],
  ['FLOW',  'Flow',                       'Layer 1 / NFT / Gaming'],
  ['MINA',  'Mina Protocol',              'Layer 1 / ZK'],
  ['ICX',   'ICON',                       'Layer 1 / Interopérabilité'],
  ['IOST',  'IOST',                       'Layer 1 / Smart Contracts'],
  ['ONT',   'Ontology',                   'Layer 1 / Enterprise'],
  ['WAVES', 'Waves',                      'Layer 1 / Smart Contracts'],
  ['CFX',   'Conflux',                    'Layer 1 / Smart Contracts'],
  ['STX',   'Stacks',                     'Layer 1 / Bitcoin L2'],
  ['SEI',   'Sei Network',                'Layer 1 / DeFi'],
  ['INJ',   'Injective',                  'Layer 1 / DeFi'],
  ['TIA',   'Celestia',                   'Layer 1 / Modular'],
  ['DYM',   'Dymension',                  'Layer 1 / Rollup'],
  ['SAGA',  'Saga',                       'Layer 1 / Gaming'],
  ['OSMO',  'Osmosis',                    'Layer 1 / DeFi'],
  ['KAVA',  'Kava',                       'Layer 1 / DeFi'],
  ['SCRT',  'Secret Network',             'Layer 1 / Privacy'],
  ['LUNA',  'Terra Luna 2.0',             'Layer 1 / Smart Contracts'],
  ['XDC',   'XDC Network',               'Layer 1 / Enterprise'],
  ['QTUM',  'Qtum',                       'Layer 1 / Smart Contracts'],
  ['NANO',  'Nano',                       'Layer 1 / Paiements'],
  ['CKB',   'Nervos Network',             'Layer 1 / Smart Contracts'],
  ['MOVR',  'Moonriver',                  'Layer 1 / EVM'],
  ['TOMO',  'TomoChain',                  'Layer 1 / Smart Contracts'],
  ['XEM',   'NEM',                        'Layer 1 / Smart Contracts'],
  ['SC',    'Siacoin',                    'Layer 1 / Storage'],
  ['NULS',  'NULS',                       'Layer 1 / Smart Contracts'],
  ['NKN',   'NKN',                        'Layer 1 / Network'],
  ['AION',  'Aion',                       'Layer 1 / Interopérabilité'],
  ['SYS',   'Syscoin',                    'Layer 1 / Smart Contracts'],
  ['CTXC',  'Cortex',                     'Layer 1 / AI'],
  ['BTTC',  'BitTorrent Chain',           'Layer 1 / Smart Contracts'],
  ['WAN',   'Wanchain',                   'Layer 1 / Cross-chain'],
  ['HIVE',  'Hive',                       'Layer 1 / Social'],
  ['STEEM', 'Steem',                      'Layer 1 / Social'],

  // ── LAYER 2 / SCALING ────────────────────────────────────────────────────
  ['MATIC', 'Polygon',                    'Layer 2 / EVM'],
  ['ARB',   'Arbitrum',                   'Layer 2 / Optimistic'],
  ['OP',    'Optimism',                   'Layer 2 / Optimistic'],
  ['IMX',   'Immutable X',               'Layer 2 / Gaming / NFT'],
  ['LRC',   'Loopring',                   'Layer 2 / DeFi'],
  ['BOBA',  'Boba Network',               'Layer 2 / Optimistic'],
  ['SKL',   'SKALE',                      'Layer 2 / Gaming'],
  ['METIS', 'Metis',                      'Layer 2 / Optimistic'],
  ['MANTA', 'Manta Network',              'Layer 2 / ZK Privacy'],
  ['STRK',  'Starknet',                   'Layer 2 / ZK'],
  ['ZK',    'ZKsync',                     'Layer 2 / ZK'],
  ['ZETA',  'ZetaChain',                  'Layer 2 / Omnichain',  null], // 400 Binance
  ['TAIKO', 'Taiko',                      'Layer 2 / ZK',         null], // 400 Binance

  // ── DEFI — ÉCHANGES DÉCENTRALISÉS ────────────────────────────────────────
  ['UNI',   'Uniswap',                    'DeFi / DEX'],
  ['CAKE',  'PancakeSwap',                'DeFi / DEX'],
  ['SUSHI', 'SushiSwap',                  'DeFi / DEX'],
  ['DYDX',  'dYdX',                       'DeFi / DEX Perps'],
  ['GMX',   'GMX',                        'DeFi / DEX Perps'],
  ['GNS',   'Gains Network',              'DeFi / DEX Perps'],
  ['PERP',  'Perpetual Protocol',         'DeFi / DEX Perps'],
  ['RDNT',  'Radiant Capital',            'DeFi / Lending'],
  ['WOO',   'WOO Network',                'DeFi / DEX'],
  ['DODO',  'DODO',                       'DeFi / DEX'],
  ['QUICK', 'QuickSwap',                  'DeFi / DEX'],
  ['VELO',  'Velodrome Finance',          'DeFi / DEX'],
  ['AERO',  'Aerodrome Finance',          'DeFi / DEX'],
  ['JUP',   'Jupiter',                    'DeFi / DEX Aggregator'],
  ['RAY',   'Raydium',                    'DeFi / DEX'],
  ['ORCA',  'Orca',                       'DeFi / DEX'],

  // ── DEFI — LENDING / BORROWING ───────────────────────────────────────────
  ['AAVE',  'Aave Protocol',              'DeFi / Lending'],
  ['COMP',  'Compound Finance',           'DeFi / Lending'],
  ['MKR',   'MakerDAO',                   'DeFi / CDP / Stablecoin'],
  ['CREAM', 'Cream Finance',              'DeFi / Lending'],
  ['ALPHA', 'Alpha Finance',              'DeFi / Lending'],
  ['EULER', 'Euler Finance',              'DeFi / Lending'],

  // ── DEFI — LIQUID STAKING ────────────────────────────────────────────────
  ['LDO',   'Lido DAO',                   'DeFi / Liquid Staking'],
  ['RPL',   'Rocket Pool',                'DeFi / Liquid Staking'],
  ['ANKR',  'Ankr',                       'DeFi / Staking / Infra'],
  ['SSV',   'SSV Network',                'DeFi / Liquid Staking'],
  ['FXS',   'Frax Share',                 'DeFi / Stablecoin'],
  ['CRV',   'Curve Finance',              'DeFi / Stablecoin DEX'],
  ['BAL',   'Balancer',                   'DeFi / DEX AMM'],
  ['YFI',   'Yearn Finance',              'DeFi / Yield'],
  ['CVX',   'Convex Finance',             'DeFi / Yield'],
  ['PENDLE','Pendle Finance',             'DeFi / Yield'],
  ['SNX',   'Synthetix',                  'DeFi / Synthetics'],
  ['UMA',   'UMA',                        'DeFi / Synthetics'],
  ['BAND',  'Band Protocol',              'DeFi / Oracle'],
  ['1INCH', '1inch Network',              'DeFi / Aggregator', '1INCHUSDT'],
  ['RUNE',  'THORChain',                  'DeFi / Cross-chain DEX'],

  // ── ORACLES & DATA ───────────────────────────────────────────────────────
  ['LINK',  'Chainlink',                  'Oracle / Infra'],
  ['GRT',   'The Graph',                  'Data / Indexing'],
  ['API3',  'API3',                       'Oracle'],
  ['TRB',   'Tellor Tributes',            'Oracle', 'TRBUSD'],
  ['DIA',   'DIA',                        'Oracle'],
  ['PYTH',  'Pyth Network',               'Oracle'],
  ['SUPRA', 'Supra',                      'Oracle'],
  ['OCEAN', 'Ocean Protocol',             'Data / AI'],
  ['NMR',   'Numeraire',                  'Data / AI'],

  // ── AI & COMPUTE ─────────────────────────────────────────────────────────
  ['FET',   'Fetch.ai',                   'AI / Agent'],
  ['AGIX',  'SingularityNET',             'AI / Marketplace'],
  ['RNDR',  'Render Network',             'AI / GPU Compute'],
  ['TAO',   'Bittensor',                  'AI / Decentralized ML'],
  ['WLD',   'Worldcoin',                  'AI / Identity'],
  ['AIOZ',  'AIOZ Network',               'AI / Media'],
  ['ALI',   'Artificial Liquid Intelligence', 'AI'],
  ['ARKM',  'Arkham Intelligence',        'AI / Analytics'],
  ['RSS3',  'RSS3',                       'AI / Web3'],
  ['TURBO', 'Turbo',                      'AI / Memecoin'],
  ['MASA',  'Masa Network',               'AI / Data'],
  ['VIRTUAL','Virtuals Protocol',         'AI / Agents'],
  ['AI16Z', 'ai16z',                      'AI / Agents'],
  ['ACT',   'Act I : The AI Prophecy',    'AI / Memecoin'],
  ['PRIME', 'Echelon Prime',              'AI / Gaming'],

  // ── GAMING & METAVERSE ───────────────────────────────────────────────────
  ['AXS',   'Axie Infinity',              'Gaming / P2E'],
  ['SAND',  'The Sandbox',                'Gaming / Metaverse'],
  ['MANA',  'Decentraland',               'Gaming / Metaverse'],
  ['ENJ',   'Enjin Coin',                 'Gaming / NFT'],
  ['GALA',  'Gala Games',                 'Gaming'],
  ['ILV',   'Illuvium',                   'Gaming / P2E'],
  ['YGG',   'Yield Guild Games',          'Gaming / P2E'],
  ['SLP',   'Smooth Love Potion',         'Gaming / P2E'],
  ['TLM',   'Alien Worlds',               'Gaming / P2E'],
  ['CHR',   'Chromia',                    'Gaming / Infra'],
  ['ALICE', 'My Neighbor Alice',          'Gaming / Metaverse'],
  ['GODS',  'Gods Unchained',             'Gaming / NFT'],
  ['MAGIC', 'Magic (Treasure)',           'Gaming / Ecosystem'],
  ['BEAM',  'Beam',                       'Gaming / L2'],
  ['SUPER', 'SuperFarm',                  'Gaming / NFT'],
  ['ACE',   'Fusionist',                  'Gaming'],
  ['XAI',   'Xai',                        'Gaming / L3 Arbitrum'],
  ['PIXEL', 'Pixels',                     'Gaming / P2E'],
  ['PORTAL','Portal',                     'Gaming / Cross-chain'],
  ['MAVIA', 'Heroes of Mavia',            'Gaming / P2E'],
  ['NYAN',  'Nyan Heroes',               'Gaming'],
  ['PYUSD', 'PayPal USD',                'Stablecoin',            null], // stablecoin, pas de paire USDT
  ['G',     'Gravity (G)',                'Gaming / Chain'],
  ['RONIN', 'Ronin',                      'Gaming / L1'],

  // ── NFT & SOCIAL ─────────────────────────────────────────────────────────
  ['CHZ',   'Chiliz',                     'NFT / Sports Fan'],
  ['THETA', 'Theta Network',              'Media / Streaming'],
  ['LPT',   'Livepeer',                   'Media / Video'],
  ['MASK',  'Mask Network',               'Social / Web3'],
  ['AUDIO', 'Audius',                     'Media / Music'],
  ['LIVE',  'Live Peer',                  'Media / Video'],
  ['RARI',  'Rarible',                    'NFT / Marketplace'],
  ['HIGH',  'Highstreet',                 'NFT / Retail Metaverse'],
  ['RARE',  'SuperRare',                  'NFT / Marketplace'],
  ['LOOKS', 'LooksRare',                  'NFT / Marketplace'],
  ['BLUR',  'Blur',                       'NFT / Marketplace'],

  // ── EXCHANGE TOKENS ──────────────────────────────────────────────────────
  ['CRO',   'Cronos / Crypto.com',        'Exchange Token'],
  ['KCS',   'KuCoin Token',               'Exchange Token'],
  ['GT',    'Gate Token',                 'Exchange Token'],
  ['MX',    'MEXC Token',                 'Exchange Token'],
  ['OKB',   'OKX Token',                  'Exchange Token'],
  ['NEXO',  'Nexo',                       'Exchange / Lending'],
  ['COIN',  'Coinbase Token',             'Exchange Token'],

  // ── PAIEMENTS / FINANCE ──────────────────────────────────────────────────
  ['XRP',   'XRP (Ripple)',               'Paiements / CBDC'],
  ['XLM',   'Stellar Lumens',             'Paiements'],
  ['NANO',  'Nano',                       'Paiements'],
  ['PAX',   'Paxos Standard',             'Stablecoin'],
  ['PAXG',  'PAX Gold',                   'Or Tokenisé'],
  ['LUNC',  'Terra Luna Classic',         'Paiements / Depegged'],
  ['ZRX',   '0x Protocol',               'DeFi / DEX Infra'],
  ['KNC',   'Kyber Network',              'DeFi / Liquidity'],
  ['BAT',   'Basic Attention Token',      'Web3 / Media'],
  ['REQ',   'Request Network',            'Paiements / Invoicing'],
  ['RLC',   'iExec RLC',                  'Compute / Cloud'],
  ['POWR',  'Power Ledger',               'Énergie'],
  ['WPR',   'WePower',                    'Énergie'],
  ['MTL',   'Metal DAO',                  'Paiements'],
  ['OGN',   'Origin Protocol',            'E-Commerce / DeFi'],
  ['DENT',  'Dent',                       'Mobile / Data'],
  ['RIF',   'RSK Infrastructure',         'Bitcoin DeFi'],

  // ── PRIVACY ──────────────────────────────────────────────────────────────
  ['OXEN',  'Oxen',                       'Privacy / Messaging'],
  ['BEAM',  'Beam Privacy',               'Privacy / MimbleWimble'],
  ['GRIN',  'Grin',                       'Privacy / MimbleWimble'],
  ['PIRATE','PirateChain',               'Privacy'],

  // ── STORAGE & COMPUTE ────────────────────────────────────────────────────
  ['FIL',   'Filecoin',                   'Storage / Compute'],
  ['AR',    'Arweave',                    'Storage / Permanent'],
  ['STORJ', 'Storj',                      'Storage'],
  ['AKT',   'Akash Network',              'Compute / Cloud'],
  ['FLUX',  'Flux',                       'Compute / Cloud'],
  ['BLZZ',  'Bluzelle',                   'Storage / DB'],

  // ── BRIDGES / CROSS-CHAIN ────────────────────────────────────────────────
  ['AXL',   'Axelar',                     'Cross-chain / Bridge'],
  ['W',     'Wormhole',                   'Cross-chain / Bridge'],
  ['ZRO',   'LayerZero',                  'Cross-chain / Bridge'],
  ['CELR',  'Celer Network',              'Cross-chain / Bridge'],
  ['REN',   'Ren Protocol',               'Cross-chain / Bridge'],
  ['MULTI', 'Multichain',                 'Cross-chain / Bridge'],
  ['HOP',   'Hop Protocol',               'L2 Bridge'],
  ['ACROSS','Across Protocol',            'L2 Bridge'],

  // ── REAL WORLD ASSETS (RWA) ──────────────────────────────────────────────
  ['POLYX', 'Polymesh',                   'RWA / Compliance'],
  ['ONDO',  'Ondo Finance',               'RWA / Tokenized Treasury'],
  ['CPOOL', 'Clearpool',                  'RWA / Credit'],
  ['MPL',   'Maple Finance',              'RWA / Credit'],
  ['CENTRIFUGE', 'Centrifuge',            'RWA / Credit'],

  // ── SOCIAL / IDENTITY ────────────────────────────────────────────────────
  ['ENS',   'Ethereum Name Service',      'Identity / DNS'],
  ['CVC',   'Civic',                      'Identity / KYC'],
  ['CTSI',  'Cartesi',                    'Infrastructure / OS'],
  ['SWEAT', 'Sweatcoin',                  'Move-to-Earn'],
  ['STEPN', 'STEPN (GMT)',                'Move-to-Earn', 'GMTUSDT'],
  ['SFP',   'SafePal',                    'Wallet / Hardware'],

  // ── MEMECOINS ────────────────────────────────────────────────────────────
  ['DOGE',  'Dogecoin',                   'Memecoin'],
  ['SHIB',  'Shiba Inu',                  'Memecoin'],
  ['PEPE',  'Pepe',                       'Memecoin'],
  ['FLOKI', 'Floki',                      'Memecoin'],
  ['BONK',  'Bonk',                       'Memecoin'],
  ['WIF',   'Dogwifhat',                  'Memecoin'],
  ['MEME',  'Memecoin',                   'Memecoin'],
  ['NEIRO', 'Neiro',                      'Memecoin'],
  ['COQ',   'Coq Inu',                    'Memecoin'],
  ['MYRO',  'Myro',                       'Memecoin'],
  ['SAMO',  'Samoyedcoin',               'Memecoin'],
  ['DOGS',  'Dogs',                       'Memecoin'],
  ['BRETT', 'Brett',                      'Memecoin'],
  ['POPCAT','Popcat',                     'Memecoin'],
  ['MEW',   'Cat in a Dogs World',        'Memecoin'],
  ['SLERF', 'Slerf',                      'Memecoin'],
  ['BOME',  'Book of Meme',               'Memecoin'],
  ['MOG',   'Mog Coin',                   'Memecoin'],
  ['PNUT',  'Peanut the Squirrel',        'Memecoin'],
  ['BABYDOGE','Baby Doge Coin',           'Memecoin'],
  ['ELON',  'Dogelon Mars',               'Memecoin'],
  ['LUNC',  'Terra Luna Classic',         'Memecoin / Depegged'],

  // ── DePIN ────────────────────────────────────────────────────────────────
  ['HNT',   'Helium',                     'DePIN / IoT'],
  ['IOTX',  'IoTeX',                      'DePIN / IoT'],
  ['IOTA',  'IOTA',                       'DePIN / IoT', 'IOTAUSDT'],
  ['PUNDIX','Pundi X',                    'DePIN / Payments'],
  ['NOIA',  'Syntropy',                   'DePIN / Network'],
  ['DIMO',  'DIMO',                       'DePIN / Mobility'],
  ['MOBILE','Helium Mobile',              'DePIN / Telecom'],
  ['IOT',   'Helium IoT',                 'DePIN / IoT'],
  ['GEODNET','Geodnet',                   'DePIN / GPS'],
  ['XCH',   'Chia',                       'DePIN / Storage'],
  ['NRG',   'Energi',                     'DePIN / Energie'],
  ['POWR',  'PowerLedger',               'DePIN / Energie'],

  // ── INSCRIPTION / ORDINALS ──────────────────────────────────────────────
  ['ORDI',  'ORDI (Bitcoin Ordinals)',    'Inscription / BRC-20'],
  ['SATS',  'SATS (Satoshi)',             'Inscription / BRC-20'],
  ['RATS',  'Rats (BRC-20)',              'Inscription / BRC-20'],

  // ── DERIVATIVES & STRUCTURED ────────────────────────────────────────────
  ['LEVER', 'LeverFi',                    'DeFi / Leverage'],
  ['VELO',  'Velodrome',                  'DeFi / ve(3,3)'],
  ['SPELL', 'Spell Token',                'DeFi / CDP'],
  ['ICE',   'IceOpen Network',            'DeFi'],
  ['HOOK',  'Hooked Protocol',            'DeFi / Learn2Earn'],
  ['EDU',   'Open Campus',                'Education / Web3'],

  // ── STAKING / LIQUID STAKING DERIVATIVES ───────────────────────────────
  ['WBETH', 'Wrapped Beacon ETH',         'Liquid Staking'],
  ['ETHFI', 'Ether.fi',                   'Liquid Staking'],
  ['EIGEN', 'EigenLayer',                 'Restaking'],
  ['REZ',   'Renzo Protocol',             'Restaking'],
  ['PUFFER','Puffer Finance',             'Restaking'],
  ['SWELL', 'Swell Network',              'Liquid Staking'],
  ['KELP',  'KelpDAO',                    'Restaking'],

  // ── SOLANA ECOSYSTEM ────────────────────────────────────────────────────
  ['JTO',   'Jito (Solana MEV)',          'Solana / Liquid Staking'],
  ['PYTH',  'Pyth Network',               'Solana / Oracle'],
  ['W',     'Wormhole',                   'Solana / Bridge'],
  ['TNSR',  'Tensor',                     'Solana / NFT'],
  ['DRIFT', 'Drift Protocol',             'Solana / DEX Perps'],
  ['KMNO',  'Kamino Finance',             'Solana / DeFi'],
  ['STEP',  'Step Finance',               'Solana / DeFi'],
  ['MNGO',  'Mango Markets',              'Solana / DeFi'],

  // ── COSMOS ECOSYSTEM ────────────────────────────────────────────────────
  ['JUNO',  'Juno Network',               'Cosmos / Smart Contracts'],
  ['EVMOS', 'Evmos',                      'Cosmos / EVM'],
  ['INJ',   'Injective',                  'Cosmos / DeFi'],
  ['STARS', 'Stargaze',                   'Cosmos / NFT'],
  ['NTRN',  'Neutron',                    'Cosmos / DeFi'],
  ['PYTH',  'Pyth Network',               'Oracle'],
  ['DYDX',  'dYdX',                       'DeFi / DEX Perps'],
  ['ARCH',  'Archway',                    'Cosmos / Smart Contracts'],

  // ── POLKADOT ECOSYSTEM ──────────────────────────────────────────────────
  ['GLMR',  'Moonbeam',                   'Polkadot / EVM'],
  ['ASTR',  'Astar Network',              'Polkadot / EVM'],
  ['PARA',  'Parallel Finance',           'Polkadot / DeFi'],
  ['HDX',   'HydraDX',                    'Polkadot / DEX'],
  ['CFG',   'Centrifuge',                 'Polkadot / RWA'],

  // ── AUTRES NOTABLES ─────────────────────────────────────────────────────
  ['XRP',   'XRP',                        'Paiements'],
  ['XDC',   'XDC Network',               'Enterprise'],
  ['VGX',   'Voyager Token',              'Exchange Token'],
  ['COTI',  'COTI',                       'Paiements'],
  ['SXP',   'Solar',                      'Paiements'],
  ['VTHO',  'VeThor Token',               'VeChain / Utility'],
  ['POLS',  'Polkastarter',               'Launchpad'],
  ['POOLX', 'KuCoin Pool-X',             'DeFi'],
  ['BEL',   'Bella Protocol',             'DeFi / One-Click'],
  ['TORN',  'Tornado Cash',               'Privacy / DeFi'],
  ['DUSK',  'Dusk Network',               'Privacy / Compliance'],
  ['CTSI',  'Cartesi',                    'Infrastructure'],
  ['LOKA',  'League of Kingdoms',         'Gaming'],
  ['CHESS', 'Tranchess',                  'DeFi / Yield'],
  ['RARE',  'SuperRare',                  'NFT'],
  ['WAXP',  'WAX',                        'Gaming / NFT'],
  ['ATLAS', 'Star Atlas',                 'Gaming / Metaverse'],
  ['POLIS', 'Star Atlas DAO',             'Gaming / Governance'],
  ['MAPS',  'MAPS (Jupiter co.)',         'DeFi'],
  ['OXY',   'Oxygen',                     'DeFi / Lending'],
  ['SRM',   'Serum',                      'DeFi / DEX'],
  ['FIDA',  'Bonfida',                    'Solana / Name Service'],
  ['SLIM',  'Solanium',                   'Launchpad / Solana'],
  ['PORT',  'Port Finance',               'DeFi / Lending'],
  ['COPE',  'Cope',                       'DeFi / Solana'],
  ['MEDIA', 'Media Network',              'CDN / DePIN'],
  ['LARIX', 'Larix',                      'DeFi / Lending'],
  ['SBR',   'Saber',                      'DeFi / Stablecoin'],
  ['SUNNY', 'Sunny Aggregator',           'DeFi / Yield'],
  ['TULIP', 'Tulip Protocol',             'DeFi / Yield'],
  ['GENE',  'GenopetsAI',                 'Gaming / Move-to-Earn'],
  ['FORGE', 'Blocksmith Labs',            'NFT'],
  ['SHDW',  'Shadow Token (GenesysGo)',   'Storage / Solana'],
];

// Déduplique + construit l'entrée finale
const seen = new Set<string>();
export const CRYPTO_UNIVERSE: CryptoUniverseEntry[] = RAW
  .filter(([sym]) => {
    if (seen.has(sym)) return false;
    seen.add(sym);
    return true;
  })
  .map(([sym, name, category, pair]) => ({
    sym,
    name,
    category,
    pair: pair !== undefined ? pair : `${sym}USDT`,
  }));

export const CRYPTO_UNIVERSE_MAP: Record<string, CryptoUniverseEntry> = Object.fromEntries(
  CRYPTO_UNIVERSE.map(e => [e.sym, e])
);

// Map sym → pair Binance pour lookup rapide (exclut les paires nulles)
export const SYM_TO_PAIR: Record<string, string> = Object.fromEntries(
  CRYPTO_UNIVERSE.filter(e => e.pair !== null).map(e => [e.sym, e.pair as string])
);

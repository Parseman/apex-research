
export function fmtPrice(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

export function fmtChg(c: number | null | undefined): string {
  if (c == null) return '—';
  const sign = c >= 0 ? '+' : '';
  return `${sign}${c.toFixed(2)}%`;
}

export function fmtMcap(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
}

export async function fetchStock(sym: string): Promise<{ price: number; chg: number }> {
  const key = import.meta.env.VITE_FINNHUB_KEY as string;
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { c: number; dp: number };
    if (!data.c) throw new Error('No price data');
    return { price: data.c, chg: data.dp };
  } finally {
    clearTimeout(timer);
  }
}

// Map CoinGecko IDs → Binance trading pairs (kept for legacy CryptoCard compatibility)
const BINANCE_MAP: Record<string, string> = {
  'bitcoin': 'BTCUSDT', 'ethereum': 'ETHUSDT', 'solana': 'SOLUSDT',
  'binancecoin': 'BNBUSDT', 'chainlink': 'LINKUSDT', 'avalanche-2': 'AVAXUSDT',
  'uniswap': 'UNIUSDT', 'polkadot': 'DOTUSDT', 'aave': 'AAVEUSDT',
  'internet-computer': 'ICPUSDT',
};

interface CoinGeckoEntry {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
}

export async function fetchCryptos(ids: string): Promise<Record<string, CoinGeckoEntry>> {
  const idList = ids.split(',');
  const symbols = idList
    .filter(id => BINANCE_MAP[id])
    .map(id => BINANCE_MAP[id]);

  const symbolsParam = encodeURIComponent(JSON.stringify(symbols));
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tickers = await res.json() as { symbol: string; lastPrice: string; priceChangePercent: string }[];

    // Reverse map Binance symbol → CoinGecko ID
    const reverseMap: Record<string, string> = {};
    for (const [cgId, binanceSym] of Object.entries(BINANCE_MAP)) {
      reverseMap[binanceSym] = cgId;
    }

    const result: Record<string, CoinGeckoEntry> = {};
    for (const t of tickers) {
      const cgId = reverseMap[t.symbol];
      if (cgId) {
        result[cgId] = {
          usd: parseFloat(t.lastPrice),
          usd_24h_change: parseFloat(t.priceChangePercent),
          usd_market_cap: 0,
        };
      }
    }
    return result;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch 24h ticker data for a list of Binance trading pairs.
 * Returns a map keyed by pair (e.g. "BTCUSDT") → { price, chg }.
 */
export async function fetchCryptoPairs(
  pairs: string[],
): Promise<Record<string, { price: number; chg: number }>> {
  if (pairs.length === 0) return {};

  const symbolsParam = encodeURIComponent(JSON.stringify(pairs));
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tickers = await res.json() as { symbol: string; lastPrice: string; priceChangePercent: string }[];

    const result: Record<string, { price: number; chg: number }> = {};
    for (const t of tickers) {
      result[t.symbol] = {
        price: parseFloat(t.lastPrice),
        chg: parseFloat(t.priceChangePercent),
      };
    }
    return result;
  } finally {
    clearTimeout(timer);
  }
}

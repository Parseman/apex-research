import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_KEY = Deno.env.get('GROQ_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Featured cryptos to analyze
const CRYPTO_ORDER = ['BTC', 'ETH', 'SOL', 'BNB', 'LINK', 'AVAX', 'UNI', 'DOT', 'AAVE', 'ICP'];

// Binance trading pairs
const BINANCE_PAIR: Record<string, string> = {
  BTC: 'BTCUSDT', ETH: 'ETHUSDT', SOL: 'SOLUSDT', BNB: 'BNBUSDT',
  LINK: 'LINKUSDT', AVAX: 'AVAXUSDT', UNI: 'UNIUSDT', DOT: 'DOTUSDT',
  AAVE: 'AAVEUSDT', ICP: 'ICPUSDT',
};

// CoinGecko IDs
const COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
  LINK: 'chainlink', AVAX: 'avalanche-2', UNI: 'uniswap', DOT: 'polkadot',
  AAVE: 'aave', ICP: 'internet-computer',
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchBinanceTicker(pair: string) {
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchCoinGecko(id: string) {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) { console.warn(`CoinGecko ${id}: ${res.status}`); return null; }
    return res.json();
  } catch (e) {
    console.warn(`CoinGecko fetch failed for ${id}:`, e);
    return null;
  }
}

async function analyzeCrypto(sym: string, db: ReturnType<typeof createClient>) {
  const pair = BINANCE_PAIR[sym];
  const geckoId = COINGECKO_ID[sym];

  if (!pair || !geckoId) return;

  const [ticker, gecko] = await Promise.all([
    fetchBinanceTicker(pair),
    fetchCoinGecko(geckoId),
  ]);

  if (!ticker || !ticker.lastPrice) return;

  const price = parseFloat(ticker.lastPrice);
  const chg24h = parseFloat(ticker.priceChangePercent);
  const high24h = parseFloat(ticker.highPrice);
  const low24h = parseFloat(ticker.lowPrice);
  const volume24h = parseFloat(ticker.quoteVolume);

  // CoinGecko market data
  const md = gecko?.market_data;
  const marketCap = md?.market_cap?.usd ?? null;
  const ath = md?.ath?.usd ?? null;
  const athDate = md?.ath_date?.usd ? new Date(md.ath_date.usd).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : null;
  const athPct = md?.ath_change_percentage?.usd ?? null;
  const chg7d = md?.price_change_percentage_7d ?? null;
  const chg30d = md?.price_change_percentage_30d ?? null;

  const fmtUsd = (n: number | null) => n != null ? `$${n.toLocaleString('en-US', { maximumFractionDigits: n >= 1 ? 2 : 6 })}` : 'N/D';
  const fmtPct = (n: number | null) => n != null ? `${n.toFixed(2)}%` : 'N/D';
  const fmtBn = (n: number | null) => n != null ? `$${(n / 1e9).toFixed(1)}Mds` : 'N/D';

  const prompt = `Tu es un analyste crypto senior. Analyse ${sym} et génère un rapport JSON.

DONNÉES MARCHÉ:
- Prix actuel: ${fmtUsd(price)}
- Variation 24h: ${fmtPct(chg24h)}
- Variation 7j: ${fmtPct(chg7d)}
- Variation 30j: ${fmtPct(chg30d)}
- Plus haut 24h: ${fmtUsd(high24h)} / Plus bas 24h: ${fmtUsd(low24h)}
- Volume 24h: ${fmtBn(volume24h)}
- Market Cap: ${fmtBn(marketCap)}
- ATH: ${fmtUsd(ath)}${athDate ? ` (${athDate})` : ''} — distance ATH: ${fmtPct(athPct)}

Retourne UNIQUEMENT ce JSON valide (sans markdown, en français):
{
  "recommendation": "BUY",
  "confidence": 4,
  "buy_below": 85000,
  "sell_above": 120000,
  "buy_window_start": "2026-04-01",
  "buy_window_end": "2026-05-15",
  "sell_window_start": "2026-09-01",
  "sell_window_end": "2026-12-31",
  "summary": "Résumé en 2 phrases incluant contexte macro crypto et catalyseurs spécifiques.",
  "bull_factors": ["facteur 1", "facteur 2", "facteur 3"],
  "bear_factors": ["risque 1", "risque 2", "risque 3"],
  "key_insight": "L'insight clé en 1 phrase actionnable."
}

Règles strictes:
- confidence DOIT être entre 1 et 5
- Les dates sont au format YYYY-MM-DD
- Si recommendation est HOLD, buy_window et sell_window peuvent être null
- Prends en compte les cycles crypto (halving, DeFi summer, corrélation BTC dominance)
- Les prix cibles doivent être réalistes par rapport au prix actuel et à l'ATH`;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 700,
    }),
  });

  if (!groqRes.ok) {
    console.error(`Groq error ${sym}:`, groqRes.status, await groqRes.text());
    return;
  }

  const groqData = await groqRes.json();
  const content = groqData.choices?.[0]?.message?.content;
  if (!content) return;

  let analysis: Record<string, unknown>;
  try { analysis = JSON.parse(content); }
  catch { console.error(`JSON parse error ${sym}`); return; }

  const confidence = Math.min(5, Math.max(1, Number(analysis.confidence) || 3));

  await db.from('crypto_analyses').upsert({
    sym,
    recommendation: analysis.recommendation,
    confidence,
    buy_below: analysis.buy_below ?? null,
    sell_above: analysis.sell_above ?? null,
    buy_window_start: analysis.buy_window_start ?? null,
    buy_window_end: analysis.buy_window_end ?? null,
    sell_window_start: analysis.sell_window_start ?? null,
    sell_window_end: analysis.sell_window_end ?? null,
    summary: analysis.summary,
    bull_factors: analysis.bull_factors,
    bear_factors: analysis.bear_factors,
    key_insight: analysis.key_insight,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'sym' });

  // Snapshot immutable pour tracking des performances (fire-and-forget)
  const evalDue = analysis.sell_window_end
    ? new Date(String(analysis.sell_window_end))
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  db.from('analysis_snapshots').insert({
    asset_type: 'crypto',
    sym,
    signal: String(analysis.recommendation),
    confidence,
    price_at_analysis: price,
    buy_below: analysis.buy_below ?? null,
    sell_above: analysis.sell_above ?? null,
    buy_window_end: analysis.buy_window_end ?? null,
    sell_window_end: analysis.sell_window_end ?? null,
    evaluation_due_at: evalDue.toISOString(),
    full_analysis: analysis,
  }).then(({ error }: { error: { message: string } | null }) => {
    if (error) console.warn(`Snapshot insert failed for ${sym}:`, error.message);
  });

  console.log(`✓ ${sym}: ${analysis.recommendation}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let syms: string[] = CRYPTO_ORDER;
  try {
    const body = await req.json().catch(() => ({}));
    if (body.sym) syms = [body.sym];
    else if (Array.isArray(body.syms)) syms = body.syms;
  } catch { /* ignore */ }

  const results: string[] = [];

  for (const sym of syms) {
    try {
      await analyzeCrypto(sym, db);
      results.push(`✓ ${sym}`);
    } catch (e) {
      results.push(`✗ ${sym}: ${e}`);
      console.error(`Error ${sym}:`, e);
    }
    // 5s between cryptos (CoinGecko free tier: 10-30 req/min)
    await sleep(5000);
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FINNHUB_KEY = Deno.env.get('FINNHUB_KEY')!;
const GROQ_KEY = Deno.env.get('GROQ_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EQUITY_ORDER = [
  'NVDA', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AVGO', 'ORCL',
  'ADBE', 'CRM', 'AMD', 'QCOM', 'V', 'MA', 'AXP', 'JPM', 'BAC', 'GS', 'WFC',
  'BLK', 'UNH', 'LLY', 'JNJ', 'ABBV', 'MRK', 'TMO', 'COST', 'WMT', 'MCD',
  'SBUX', 'NKE', 'KO', 'PEP', 'PG', 'PM', 'XOM', 'CVX', 'CAT', 'HON', 'GE',
];

// Finnhub uses dot notation for some symbols
const FINNHUB_MAP: Record<string, string> = { 'BRK-B': 'BRK.B' };

function toFinnhub(sym: string) { return FINNHUB_MAP[sym] ?? sym; }

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

async function fetchFinnhub(path: string) {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`https://finnhub.io/api/v1${path}${sep}token=${FINNHUB_KEY}`);
  if (!res.ok) return null;
  return res.json();
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function analyzeStock(sym: string, db: ReturnType<typeof createClient>) {
  const fsym = toFinnhub(sym);

  const [quote, news] = await Promise.all([
    fetchFinnhub(`/quote?symbol=${fsym}`),
    fetchFinnhub(`/company-news?symbol=${fsym}&from=${daysAgo(3)}&to=${daysAgo(0)}`),
  ]);

  if (!quote || !quote.c) return;

  const newsText = Array.isArray(news) && news.length > 0
    ? news.slice(0, 5).map((n: { headline: string }) => `- ${n.headline}`).join('\n')
    : '- Aucune actualité récente';

  const prompt = `Tu es un analyste financier senior. Analyse l'action ${sym} et génère un rapport JSON.

DONNÉES:
- Prix: $${quote.c.toFixed(2)} (${quote.dp?.toFixed(2)}% sur 24h)
- Plus haut 52 semaines: $${quote.h?.toFixed(2) ?? 'N/D'}
- Plus bas 52 semaines: $${quote.l?.toFixed(2) ?? 'N/D'}

ACTUALITÉS (72h):
${newsText}

Retourne UNIQUEMENT ce JSON valide (sans markdown, en français):
{
  "recommendation": "BUY",
  "confidence": 4,
  "buy_below": 185.00,
  "sell_above": 220.00,
  "buy_window_start": "2026-04-01",
  "buy_window_end": "2026-05-15",
  "sell_window_start": "2026-09-01",
  "sell_window_end": "2026-12-31",
  "summary": "Résumé en 2 phrases.",
  "bull_factors": ["facteur 1", "facteur 2", "facteur 3"],
  "bear_factors": ["risque 1", "risque 2", "risque 3"],
  "key_insight": "L'insight clé en 1 phrase."
}

Règles strictes:
- confidence DOIT être entre 1 et 5
- Les dates sont au format YYYY-MM-DD
- Si recommendation est HOLD, buy_window et sell_window peuvent être null
- Les fenêtres d'achat/vente sont basées sur les catalyseurs identifiés (earnings, événements macro, saisonnalité)`;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 600,
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

  await db.from('stock_analyses').upsert({
    sym,
    recommendation: analysis.recommendation,
    confidence,
    buy_below: analysis.buy_below,
    sell_above: analysis.sell_above,
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
    asset_type: 'stock',
    sym,
    signal: String(analysis.recommendation),
    confidence,
    price_at_analysis: quote.c,
    buy_below: analysis.buy_below ?? null,
    sell_above: analysis.sell_above ?? null,
    buy_window_end: analysis.buy_window_end ?? null,
    sell_window_end: analysis.sell_window_end ?? null,
    evaluation_due_at: evalDue.toISOString(),
    full_analysis: analysis,
  }).then(({ error }) => {
    if (error) console.warn(`Snapshot insert failed for ${sym}:`, error.message);
  });

  console.log(`✓ ${sym}: ${analysis.recommendation}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Parse body: { sym } for single, { syms } for list, empty for all
  let syms: string[] = EQUITY_ORDER;
  try {
    const body = await req.json().catch(() => ({}));
    if (body.sym) syms = [body.sym];
    else if (Array.isArray(body.syms)) syms = body.syms;
  } catch { /* ignore */ }

  const results: string[] = [];

  for (const sym of syms) {
    try {
      await analyzeStock(sym, db);
      results.push(`✓ ${sym}`);
    } catch (e) {
      results.push(`✗ ${sym}: ${e}`);
      console.error(`Error ${sym}:`, e);
    }
    // 3s between stocks → ~20 Finnhub req/min (2 calls/stock)
    await sleep(3000);
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});

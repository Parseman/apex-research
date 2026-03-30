import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_KEY = Deno.env.get('GROQ_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BINANCE_PAIR: Record<string, string> = {
  BTC: 'BTCUSDT', ETH: 'ETHUSDT', SOL: 'SOLUSDT', BNB: 'BNBUSDT',
  LINK: 'LINKUSDT', AVAX: 'AVAXUSDT', UNI: 'UNIUSDT', DOT: 'DOTUSDT',
  AAVE: 'AAVEUSDT', ICP: 'ICPUSDT',
};

async function fetchBinanceTicker(pair: string) {
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchBinanceKlines(pair: string, interval = '4h', limit = 48) {
  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchNews(sym: string) {
  try {
    const res = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?categories=${sym}&lang=EN&sortOrder=latest&limit=6`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.Data ?? []) as Array<{ title: string; source: string; published_on: number }>;
  } catch {
    return [];
  }
}

function analyzeKlines(klines: number[][]) {
  if (!klines || klines.length < 2) return null;

  const closes = klines.map(k => parseFloat(String(k[4])));
  const highs  = klines.map(k => parseFloat(String(k[2])));
  const lows   = klines.map(k => parseFloat(String(k[3])));
  const vols   = klines.map(k => parseFloat(String(k[5])));

  const current = closes[closes.length - 1];
  const oldest  = closes[0];
  const periodHigh = Math.max(...highs);
  const periodLow  = Math.min(...lows);
  const posInRange = ((current - periodLow) / (periodHigh - periodLow) * 100).toFixed(1);

  // Simple momentum: last 3 candles vs previous 3
  const last3Avg  = (closes.slice(-3).reduce((a, b) => a + b, 0) / 3);
  const prev3Avg  = (closes.slice(-6, -3).reduce((a, b) => a + b, 0) / 3);
  const momentum  = ((last3Avg - prev3Avg) / prev3Avg * 100).toFixed(2);

  // Volume trend: last 6 vs previous 6
  const lastVol  = vols.slice(-6).reduce((a, b) => a + b, 0) / 6;
  const prevVol  = vols.slice(-12, -6).reduce((a, b) => a + b, 0) / 6;
  const volTrend = lastVol > prevVol ? 'en hausse' : 'en baisse';

  const pctChange = ((current - oldest) / oldest * 100).toFixed(2);
  const trend = parseFloat(pctChange) > 2 ? 'haussière' : parseFloat(pctChange) < -2 ? 'baissière' : 'neutre';

  return { current, oldest, periodHigh, periodLow, posInRange, momentum, pctChange, trend, volTrend };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  let sym = 'BTC';
  try {
    const body = await req.json().catch(() => ({}));
    if (body.sym) sym = body.sym.toUpperCase();
  } catch { /* ignore */ }

  const pair = BINANCE_PAIR[sym];
  if (!pair) {
    return new Response(JSON.stringify({ error: `Symbol inconnu: ${sym}` }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const [ticker, klines4h, news] = await Promise.all([
    fetchBinanceTicker(pair),
    fetchBinanceKlines(pair, '4h', 48),
    fetchNews(sym),
  ]);

  if (!ticker) {
    return new Response(JSON.stringify({ error: 'Données Binance indisponibles' }), {
      status: 503, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const price  = parseFloat(ticker.lastPrice);
  const chg24h = parseFloat(ticker.priceChangePercent);
  const vol24h = parseFloat(ticker.quoteVolume);
  const high24 = parseFloat(ticker.highPrice);
  const low24  = parseFloat(ticker.lowPrice);

  const kd = analyzeKlines(klines4h);

  const fmtP = (n: number) => n >= 1 ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : `$${n.toFixed(6)}`;

  const newsText = news.length > 0
    ? news.slice(0, 5).map(n => `- [${n.source}] ${n.title}`).join('\n')
    : '- Aucune actualité récente';

  const klinesText = kd ? `
- Tendance 8 derniers jours: ${kd.trend} (${kd.pctChange}%)
- Plus haut période: ${fmtP(kd.periodHigh)} / Plus bas période: ${fmtP(kd.periodLow)}
- Position dans la range: ${kd.posInRange}% (0%=bas, 100%=haut)
- Momentum court terme (3 dernières bougies 4h): ${kd.momentum}%
- Volume: ${kd.volTrend} par rapport à la semaine passée` : '';

  // Valeurs d'exemple ancrées sur le prix réel pour éviter que le LLM copie des valeurs BTC
  const ex = {
    entry_min:  parseFloat((price * 0.98).toPrecision(4)),
    entry_max:  parseFloat((price * 1.01).toPrecision(4)),
    target:     parseFloat((price * 1.15).toPrecision(4)),
    stop_loss:  parseFloat((price * 0.92).toPrecision(4)),
    support:    parseFloat((price * 0.94).toPrecision(4)),
    resistance: parseFloat((price * 1.12).toPrecision(4)),
  };

  const prompt = `Tu es un trader crypto expérimenté spécialisé en trading court terme (1 à 8 semaines max).
Analyse ${sym} (prix actuel: ${fmtP(price)}) pour une opportunité de trade rapide et génère un rapport JSON.

DONNÉES TECHNIQUES (bougies 4h, 48 dernières):${klinesText}

DONNÉES 24H:
- Prix: ${fmtP(price)} (${chg24h >= 0 ? '+' : ''}${chg24h.toFixed(2)}% sur 24h)
- Range 24h: ${fmtP(low24)} → ${fmtP(high24)}
- Volume 24h: $${(vol24h / 1e6).toFixed(0)}M

ACTUALITÉS RÉCENTES:
${newsText}

IMPORTANT: Tous les prix dans ta réponse doivent être cohérents avec le prix actuel de ${sym} (${fmtP(price)}).

Retourne UNIQUEMENT ce JSON valide (en français, les valeurs numériques ci-dessous sont des EXEMPLES à remplacer par les vrais niveaux pour ${sym}):
{
  "signal": "BUY",
  "confidence": 4,
  "timeframe": "2-3 semaines",
  "entry_min": ${ex.entry_min},
  "entry_max": ${ex.entry_max},
  "target": ${ex.target},
  "stop_loss": ${ex.stop_loss},
  "risk_reward": "1:2.5",
  "trend": "haussière",
  "momentum": "fort",
  "summary": "Résumé du setup en 2 phrases. Contexte marché + déclencheur.",
  "catalysts": ["catalyseur 1", "catalyseur 2", "catalyseur 3"],
  "risks": ["risque 1", "risque 2"],
  "support": ${ex.support},
  "resistance": ${ex.resistance},
  "invalidation": "Clôture 4h sous ${fmtP(ex.stop_loss)} invalide le setup."
}

Règles:
- signal: BUY, SELL ou WAIT (WAIT si pas de setup clair)
- confidence: 1 à 5 (sois strict, 5 = setup exceptionnel)
- timeframe: délai estimé pour atteindre la cible (ex: "1-2 semaines")
- entry_min/entry_max: zone d'entrée en prix COHÉRENTE avec ${fmtP(price)}
- target: objectif de prix réaliste, basé sur les résistances identifiées
- stop_loss: niveau d'invalidation strict, COHÉRENT avec ${fmtP(price)}
- risk_reward: ratio formaté (ex: "1:2.5")
- trend: "haussière", "baissière" ou "neutre"
- momentum: "fort", "modéré" ou "faible"
- invalidation: condition précise qui invalide le trade`;

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 800,
    }),
  });

  if (!groqRes.ok) {
    return new Response(JSON.stringify({ error: 'Erreur Groq' }), {
      status: 503, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const groqData = await groqRes.json();
  const content = groqData.choices?.[0]?.message?.content;

  let analysis: Record<string, unknown> = {};
  try { analysis = JSON.parse(content); }
  catch { return new Response(JSON.stringify({ error: 'Erreur parsing JSON' }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }); }

  // Snapshot pour tracking des performances (fire-and-forget)
  const tfStr = String(analysis.timeframe ?? '');
  const weeksMatch = tfStr.match(/(\d+)(?:-\d+)?\s*semaine/i);
  const monthsMatch = tfStr.match(/(\d+)(?:-\d+)?\s*mois/i);
  const daysAhead = weeksMatch
    ? parseInt(weeksMatch[1]) * 7 + 7   // borne haute + 1 semaine buffer
    : monthsMatch
    ? parseInt(monthsMatch[1]) * 30 + 7
    : 30;
  const evalDue = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  db.from('analysis_snapshots').insert({
    asset_type: 'crypto',
    sym,
    signal: String(analysis.signal ?? 'WAIT'),
    confidence: Math.min(5, Math.max(1, Number(analysis.confidence) || 3)),
    price_at_analysis: price,
    buy_below: analysis.entry_max ?? null,
    sell_above: analysis.target ?? null,
    evaluation_due_at: evalDue.toISOString(),
    full_analysis: analysis,
  }).then(({ error }: { error: { message: string } | null }) => {
    if (error) console.warn(`Snapshot insert failed for ${sym}:`, error.message);
  });

  return new Response(JSON.stringify({
    sym,
    price,
    chg24h,
    analysis,
    generatedAt: new Date().toISOString(),
  }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});

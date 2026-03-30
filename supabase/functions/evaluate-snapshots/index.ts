import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FINNHUB_KEY = Deno.env.get('FINNHUB_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const FINNHUB_MAP: Record<string, string> = { 'BRK-B': 'BRK.B' };
const EVAL_THRESHOLD = 2.0; // ±2% pour WIN/LOSS

// Prix actuel d'une action via Finnhub
async function fetchStockPrice(sym: string): Promise<number | null> {
  const fsym = FINNHUB_MAP[sym] ?? sym;
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${fsym}&token=${FINNHUB_KEY}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.c > 0 ? data.c : null;
  } catch { return null; }
}

// Prix actuel d'une crypto via Binance
async function fetchCryptoPrice(sym: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}USDT`);
    if (!res.ok) return null;
    const data = await res.json();
    return parseFloat(data.price) || null;
  } catch { return null; }
}

// Calcule le résultat d'une analyse
// pnl_pct : positif = signal correct (profit si suivi), négatif = signal incorrect
function computeOutcome(
  signal: string,
  priceAtAnalysis: number,
  priceAtEval: number,
): { outcome: 'win' | 'loss' | 'neutral'; pnlPct: number } {
  const rawPct = (priceAtEval - priceAtAnalysis) / priceAtAnalysis * 100;

  if (signal === 'HOLD') return { outcome: 'neutral', pnlPct: rawPct };

  // Pour BUY : bon si prix monte, mauvais si prix baisse
  // Pour SELL : bon si prix baisse, mauvais si prix monte
  const pnlPct = signal === 'SELL' ? -rawPct : rawPct;

  if (pnlPct > EVAL_THRESHOLD)  return { outcome: 'win',     pnlPct };
  if (pnlPct < -EVAL_THRESHOLD) return { outcome: 'loss',    pnlPct };
  return                               { outcome: 'neutral',  pnlPct };
}

interface Snapshot {
  id: string;
  asset_type: 'stock' | 'crypto';
  sym: string;
  signal: string;
  price_at_analysis: number;
  evaluation_due_at: string;
  evaluated_at: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let snapshotId: string | null = null;
  let evaluateAll = false;
  try {
    const body = await req.json().catch(() => ({}));
    snapshotId = body.snapshot_id ?? null;
    evaluateAll = body.evaluate_all === true;
  } catch { /* ignore */ }

  // snapshot_id : réévaluation forcée à tout moment (avant expiry, déjà évalué ou non)
  // evaluate_all : tous les snapshots sans résultat (sans contrainte de date d'expiry)
  let query = db
    .from('analysis_snapshots')
    .select('id, asset_type, sym, signal, price_at_analysis, evaluation_due_at, evaluated_at')
    .is('evaluated_at', null);

  if (snapshotId) {
    query = db
      .from('analysis_snapshots')
      .select('id, asset_type, sym, signal, price_at_analysis, evaluation_due_at, evaluated_at')
      .eq('id', snapshotId);
  }

  const { data: snapshots, error: fetchErr } = await query;
  if (fetchErr) {
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  if (!snapshots || snapshots.length === 0) {
    return new Response(JSON.stringify({ ok: true, evaluated: 0, message: 'Aucun snapshot à évaluer' }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const results: string[] = [];
  const toProcess = evaluateAll ? (snapshots as Snapshot[]) : (snapshots as Snapshot[]).slice(0, 1);

  for (const snap of toProcess) {
    const currentPrice = snap.asset_type === 'stock'
      ? await fetchStockPrice(snap.sym)
      : await fetchCryptoPrice(snap.sym);

    if (currentPrice === null) {
      results.push(`✗ ${snap.sym}: prix indisponible`);
      continue;
    }

    const { outcome, pnlPct } = computeOutcome(
      snap.signal,
      Number(snap.price_at_analysis),
      currentPrice,
    );

    const { error: updateErr } = await db
      .from('analysis_snapshots')
      .update({
        evaluated_at: new Date().toISOString(),
        price_at_eval: currentPrice,
        outcome,
        pnl_pct: Math.round(pnlPct * 100) / 100,
      })
      .eq('id', snap.id);

    if (updateErr) {
      results.push(`✗ ${snap.sym}: ${updateErr.message}`);
    } else {
      results.push(`✓ ${snap.sym}: ${outcome.toUpperCase()} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`);
    }
  }

  return new Response(JSON.stringify({ ok: true, evaluated: results.length, results }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});

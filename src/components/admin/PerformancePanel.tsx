import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase.ts';

interface Snapshot {
  id: string;
  asset_type: 'stock' | 'crypto';
  sym: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price_at_analysis: number;
  buy_below: number | null;
  sell_above: number | null;
  evaluation_due_at: string;
  created_at: string;
  evaluated_at: string | null;
  price_at_eval: number | null;
  outcome: 'win' | 'loss' | 'neutral' | null;
  pnl_pct: number | null;
}

const PAGE_SIZE = 15;

function fmtPrice(n: number) {
  return n >= 1
    ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    : `$${n.toFixed(6)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: '2-digit',
  });
}

function SignalBadge({ signal }: { signal: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    BUY:  { bg: 'rgba(6,95,70,0.15)',   color: '#065F46' },
    SELL: { bg: 'rgba(127,29,29,0.15)', color: '#7F1D1D' },
    HOLD: { bg: 'rgba(55,65,81,0.3)',   color: '#9CA3AF' },
  };
  const s = styles[signal] ?? styles.HOLD;
  return (
    <span className="px-1.5 py-0.5 rounded font-mono-dm text-[9px] font-bold tracking-wider"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40` }}>
      {signal}
    </span>
  );
}

function OutcomeBadge({ outcome, pending }: { outcome: string | null; pending: boolean }) {
  if (pending || outcome === null) {
    return (
      <span className="px-1.5 py-0.5 rounded font-mono-dm text-[9px] font-bold tracking-wider"
        style={{ background: 'rgba(155,127,232,0.1)', color: 'rgba(155,127,232,0.6)', border: '1px dashed rgba(155,127,232,0.3)' }}>
        EN ATTENTE
      </span>
    );
  }
  const styles: Record<string, { bg: string; color: string }> = {
    win:     { bg: 'rgba(6,95,70,0.15)',   color: '#065F46' },
    loss:    { bg: 'rgba(127,29,29,0.15)', color: '#7F1D1D' },
    neutral: { bg: 'rgba(55,65,81,0.2)',   color: '#9CA3AF' },
  };
  const s = styles[outcome] ?? styles.neutral;
  const label = outcome === 'win' ? '✓ WIN' : outcome === 'loss' ? '✗ LOSS' : '— NEUTRE';
  return (
    <span className="px-1.5 py-0.5 rounded font-mono-dm text-[9px] font-bold tracking-wider"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40` }}>
      {label}
    </span>
  );
}

function Dots({ n }: { n: number }) {
  return (
    <span className="font-mono-dm text-xs tracking-tight" style={{ color: '#9B7FE8' }}>
      {'●'.repeat(n)}{'○'.repeat(5 - n)}
    </span>
  );
}

export default function PerformancePanel() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalLog, setEvalLog] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [filterSignal, setFilterSignal] = useState<'all' | 'BUY' | 'SELL' | 'HOLD'>('all');
  const [filterAsset, setFilterAsset] = useState<'all' | 'stock' | 'crypto'>('all');

  const loadSnapshots = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analysis_snapshots')
      .select('*')
      .order('created_at', { ascending: false });
    setSnapshots((data ?? []) as Snapshot[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadSnapshots(); }, [loadSnapshots]);

  // Filtrage
  const filtered = snapshots.filter(s => {
    if (filterSignal !== 'all' && s.signal !== filterSignal) return false;
    if (filterAsset !== 'all' && s.asset_type !== filterAsset) return false;
    return true;
  });

  const now = new Date();
  const wins     = filtered.filter(s => s.outcome === 'win').length;
  const losses   = filtered.filter(s => s.outcome === 'loss').length;
  const neutrals = filtered.filter(s => s.outcome === 'neutral').length;
  const pending  = filtered.filter(s => s.outcome === null).length;
  const evaluated = wins + losses + neutrals;
  const decidable = wins + losses; // HOLD = neutral always, only BUY/SELL count for win rate
  const winRate = decidable > 0 ? Math.round(wins / decidable * 100) : null;

  const avgPnl = evaluated > 0
    ? filtered
        .filter(s => s.pnl_pct !== null)
        .reduce((sum, s) => sum + (s.pnl_pct ?? 0), 0) /
      filtered.filter(s => s.pnl_pct !== null).length
    : null;

  const avgConf = filtered.length > 0
    ? (filtered.reduce((s, r) => s + r.confidence, 0) / filtered.length).toFixed(1)
    : null;

  // Evaluate all expired
  const evaluateAll = async () => {
    setEvaluating(true);
    setEvalLog([]);
    const { data, error } = await supabase.functions.invoke('evaluate-snapshots', {
      body: { evaluate_all: true },
    });
    if (error) {
      setEvalLog([`Erreur : ${error.message}`]);
    } else {
      setEvalLog((data as { results: string[] }).results ?? []);
      await loadSnapshots();
    }
    setEvaluating(false);
  };

  // Evaluate single snapshot
  const evaluateOne = async (id: string) => {
    const { data, error } = await supabase.functions.invoke('evaluate-snapshots', {
      body: { snapshot_id: id },
    });
    if (!error) {
      setEvalLog((data as { results: string[] }).results ?? []);
      await loadSnapshots();
    }
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const total = filtered.length;
  const barTotal = total || 1;

  const winRateColor = winRate === null ? '#9B7FE8'
    : winRate >= 55 ? '#065F46'
    : winRate >= 40 ? '#C9A84C'
    : '#7F1D1D';

  return (
    <div className="mt-8 rounded-xl border p-6" style={{ borderColor: 'rgba(155,127,232,0.2)', background: 'rgba(155,127,232,0.03)' }}>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-mono-dm text-xs tracking-widest uppercase mb-1" style={{ color: '#9B7FE8' }}>
            PERFORMANCE IA — HISTORIQUE DES ANALYSES
          </p>
          <p className="font-sans-dm text-sm text-muted">
            Chaque analyse générée est horodatée et comparée au prix réel à échéance.
          </p>
        </div>
        <button
          onClick={() => { void evaluateAll(); }}
          disabled={evaluating || snapshots.length === 0}
          className="px-4 py-2 rounded-lg font-mono-dm text-xs font-medium tracking-wider transition-all disabled:opacity-40"
          style={{ background: evaluating ? 'transparent' : '#9B7FE8', color: evaluating ? '#9B7FE8' : '#fff', border: '1px solid #9B7FE8' }}
        >
          {evaluating ? '⟳ Évaluation...' : `⚖ Vérifier toutes les analyses (${pending} en attente)`}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center font-mono-dm text-xs" style={{ color: 'rgba(155,127,232,0.4)' }}>
          Chargement...
        </div>
      ) : snapshots.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-mono-dm text-xs mb-1" style={{ color: 'rgba(155,127,232,0.4)' }}>AUCUNE DONNÉE</p>
          <p className="font-sans-dm text-sm text-muted">Lancez une analyse IA pour commencer à suivre les performances.</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'ANALYSES TOTALES', value: total.toString(), sub: `${evaluated} évaluées · ${pending} en attente` },
              { label: 'TAUX DE RÉUSSITE', value: winRate !== null ? `${winRate}%` : '—', sub: `${wins} WIN · ${losses} LOSS`, color: winRateColor },
              { label: 'P&L MOYEN', value: avgPnl !== null ? `${avgPnl >= 0 ? '+' : ''}${avgPnl.toFixed(2)}%` : '—', sub: 'sur analyses évaluées', color: avgPnl !== null ? (avgPnl >= 0 ? '#065F46' : '#7F1D1D') : undefined },
              { label: 'CONF. MOYENNE', value: avgConf ?? '—', sub: 'sur 5 étoiles' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-lg p-4" style={{ background: 'rgba(155,127,232,0.06)', border: '1px solid rgba(155,127,232,0.15)' }}>
                <p className="font-mono-dm text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(155,127,232,0.5)' }}>{label}</p>
                <p className="font-mono-dm text-2xl font-bold" style={{ color: color ?? '#9B7FE8' }}>{value}</p>
                <p className="font-sans-dm text-xs mt-1 text-muted">{sub}</p>
              </div>
            ))}
          </div>

          {/* Stacked bar chart */}
          <div className="mb-6">
            <p className="font-mono-dm text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(155,127,232,0.5)' }}>RÉPARTITION DES RÉSULTATS</p>
            <div className="flex rounded-lg overflow-hidden h-7" style={{ background: 'rgba(155,127,232,0.08)' }}>
              {wins > 0 && (
                <div title={`WIN: ${wins}`} className="flex items-center justify-center font-mono-dm text-[10px] font-bold text-white transition-all"
                  style={{ width: `${wins / barTotal * 100}%`, background: '#065F46' }}>
                  {Math.round(wins / barTotal * 100) >= 8 && `${Math.round(wins / barTotal * 100)}%`}
                </div>
              )}
              {losses > 0 && (
                <div title={`LOSS: ${losses}`} className="flex items-center justify-center font-mono-dm text-[10px] font-bold text-white transition-all"
                  style={{ width: `${losses / barTotal * 100}%`, background: '#7F1D1D' }}>
                  {Math.round(losses / barTotal * 100) >= 8 && `${Math.round(losses / barTotal * 100)}%`}
                </div>
              )}
              {neutrals > 0 && (
                <div title={`NEUTRE: ${neutrals}`} className="flex items-center justify-center font-mono-dm text-[10px] font-bold transition-all"
                  style={{ width: `${neutrals / barTotal * 100}%`, background: 'rgba(55,65,81,0.6)', color: '#9CA3AF' }}>
                  {Math.round(neutrals / barTotal * 100) >= 8 && `${Math.round(neutrals / barTotal * 100)}%`}
                </div>
              )}
              {pending > 0 && (
                <div title={`EN ATTENTE: ${pending}`} className="flex items-center justify-center font-mono-dm text-[10px] transition-all"
                  style={{ width: `${pending / barTotal * 100}%`, background: 'rgba(155,127,232,0.12)', color: 'rgba(155,127,232,0.5)', borderLeft: '1px dashed rgba(155,127,232,0.2)' }}>
                  {Math.round(pending / barTotal * 100) >= 8 && `${Math.round(pending / barTotal * 100)}%`}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-2">
              {[
                { label: `WIN (${wins})`, color: '#065F46' },
                { label: `LOSS (${losses})`, color: '#7F1D1D' },
                { label: `NEUTRE (${neutrals})`, color: '#6B7280' },
                { label: `EN ATTENTE (${pending})`, color: 'rgba(155,127,232,0.5)' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
                  <span className="font-mono-dm text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eval log */}
          {evalLog.length > 0 && (
            <div className="rounded-lg p-3 mb-4 font-mono-dm text-xs space-y-0.5 max-h-32 overflow-y-auto" style={{ background: '#0D1117', border: '1px solid rgba(155,127,232,0.15)' }}>
              {evalLog.map((line, i) => (
                <div key={i} style={{ color: line.startsWith('✓') ? '#065F46' : line.startsWith('✗') ? '#7F1D1D' : '#9B7FE8' }}>{line}</div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1 rounded-md p-0.5" style={{ background: 'rgba(155,127,232,0.08)', border: '1px solid rgba(155,127,232,0.15)' }}>
              {(['all', 'stock', 'crypto'] as const).map(v => (
                <button key={v} onClick={() => { setFilterAsset(v); setPage(0); }}
                  className="px-3 py-1 rounded font-mono-dm text-[10px] font-medium tracking-wider transition-all"
                  style={{ background: filterAsset === v ? '#9B7FE8' : 'transparent', color: filterAsset === v ? '#fff' : 'rgba(155,127,232,0.5)' }}>
                  {v === 'all' ? 'Tous' : v === 'stock' ? 'Stocks' : 'Cryptos'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-md p-0.5" style={{ background: 'rgba(155,127,232,0.08)', border: '1px solid rgba(155,127,232,0.15)' }}>
              {(['all', 'BUY', 'SELL', 'HOLD'] as const).map(v => (
                <button key={v} onClick={() => { setFilterSignal(v); setPage(0); }}
                  className="px-3 py-1 rounded font-mono-dm text-[10px] font-medium tracking-wider transition-all"
                  style={{ background: filterSignal === v ? '#9B7FE8' : 'transparent', color: filterSignal === v ? '#fff' : 'rgba(155,127,232,0.5)' }}>
                  {v === 'all' ? 'Tous signaux' : v}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'rgba(155,127,232,0.15)' }}>
            <table className="w-full text-xs border-collapse font-mono-dm">
              <thead>
                <tr style={{ background: '#0D1117', color: 'rgba(155,127,232,0.7)' }}>
                  <th className="text-left px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">DATE</th>
                  <th className="text-left px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">ACTIF</th>
                  <th className="text-center px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">SIGNAL</th>
                  <th className="text-center px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">CONF.</th>
                  <th className="text-right px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">PRIX ANALYSE</th>
                  <th className="text-right px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">PRIX ÉVAL.</th>
                  <th className="text-right px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">P&L</th>
                  <th className="text-center px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">RÉSULTAT</th>
                  <th className="text-center px-3 py-2.5 text-[9px] tracking-widest uppercase whitespace-nowrap">ÉVALUER</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((snap, i) => {
                  const isExpired = snap.outcome === null && new Date(snap.evaluation_due_at) < now;
                  const isPending = snap.outcome === null && !isExpired;
                  const pnl = snap.pnl_pct;
                  const rowBg = i % 2 === 0 ? 'rgba(155,127,232,0.02)' : 'rgba(155,127,232,0.05)';

                  return (
                    <tr key={snap.id} style={{ background: rowBg, borderTop: '1px solid rgba(155,127,232,0.08)' }}>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {fmtDate(snap.created_at)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold mr-1.5"
                          style={snap.asset_type === 'stock'
                            ? { background: 'rgba(200,169,110,0.12)', color: '#C9A84C' }
                            : { background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}>
                          {snap.asset_type === 'stock' ? 'STOCK' : 'CRYPTO'}
                        </span>
                        <span style={{ color: snap.asset_type === 'stock' ? '#C9A84C' : '#2DD4BF' }}>{snap.sym}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <SignalBadge signal={snap.signal} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Dots n={snap.confidence} />
                      </td>
                      <td className="px-3 py-2.5 text-right" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {fmtPrice(snap.price_at_analysis)}
                      </td>
                      <td className="px-3 py-2.5 text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {snap.price_at_eval !== null ? fmtPrice(snap.price_at_eval) : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold" style={{ color: pnl !== null ? (pnl >= 0 ? '#065F46' : '#7F1D1D') : 'rgba(255,255,255,0.25)' }}>
                        {pnl !== null ? `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <OutcomeBadge outcome={snap.outcome} pending={isPending} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => { void evaluateOne(snap.id); }}
                          className="px-2 py-1 rounded font-mono-dm text-[9px] font-medium tracking-wider transition-all hover:opacity-80"
                          style={{ background: 'rgba(155,127,232,0.15)', color: '#9B7FE8', border: '1px solid rgba(155,127,232,0.3)' }}
                        >
                          ⚖ {snap.evaluated_at ? 'Revérifier' : 'Vérifier'}
                        </button>
                        {snap.evaluated_at && (
                          <div className="font-mono-dm text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                            {fmtDate(snap.evaluated_at)}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <span className="font-mono-dm text-xs" style={{ color: 'rgba(155,127,232,0.4)' }}>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} sur {filtered.length}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="px-2.5 py-1 rounded font-mono-dm text-xs disabled:opacity-30"
                  style={{ background: 'rgba(155,127,232,0.1)', color: '#9B7FE8', border: '1px solid rgba(155,127,232,0.2)' }}>‹</button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="px-2.5 py-1 rounded font-mono-dm text-xs disabled:opacity-30"
                  style={{ background: 'rgba(155,127,232,0.1)', color: '#9B7FE8', border: '1px solid rgba(155,127,232,0.2)' }}>›</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

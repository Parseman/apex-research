import type { StockAnalysis } from '../../types/analysis.ts';

interface Props {
  sym: string;
  analysis: StockAnalysis | null;
  onClose: () => void;
}

const REC_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  BUY:  { bg: '#1a6b3c15', color: '#1a6b3c', border: '#1a6b3c40' },
  SELL: { bg: '#8b1a1a15', color: '#8b1a1a', border: '#8b1a1a40' },
  HOLD: { bg: '#7a4f0015', color: '#7a4f00', border: '#7a4f0040' },
};

function Confidence({ n }: { n: number }) {
  const v = Math.min(5, Math.max(0, Math.round(n)));
  return (
    <span className="font-plex-mono text-xs" style={{ color: '#C9A84C' }}>
      {'★'.repeat(v)}{'☆'.repeat(5 - v)}
    </span>
  );
}

export default function StockAnalysisModal({ sym, analysis, onClose }: Props) {
  const rec = analysis?.recommendation ?? 'HOLD';
  const style = REC_STYLE[rec] ?? REC_STYLE.HOLD;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        style={{ background: '#F5F0E8', border: '1px solid #D4C9A8' }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#1A1A1A' }}>
          <div>
            <span className="font-plex-mono font-bold text-sm" style={{ color: '#C9A84C' }}>{sym}</span>
            <span className="font-plex-sans text-xs ml-2" style={{ color: '#8a6f2e' }}>— Rapport IA</span>
          </div>
          <button onClick={onClose} className="text-lg leading-none hover:opacity-70" style={{ color: '#8a6f2e' }}>✕</button>
        </div>

        {!analysis ? (
          <div className="px-5 py-12 text-center font-plex-sans text-sm" style={{ color: '#5a5040' }}>
            Aucune analyse disponible pour {sym}.<br />
            <span className="text-xs">L'analyse sera générée lors du prochain cycle (toutes les 3h).</span>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Recommendation */}
            <div className="flex items-center gap-3">
              <span
                className="px-4 py-1.5 rounded-full font-plex-mono font-bold text-sm tracking-widest"
                style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
              >
                {rec}
              </span>
              <Confidence n={analysis.confidence ?? 0} />
              <span className="font-plex-mono text-[10px] ml-auto" style={{ color: '#8a6f2e' }}>
                {analysis.updated_at ? new Date(analysis.updated_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>

            {/* Price targets */}
            {(analysis.buy_below != null || analysis.sell_above != null) && (
              <div className="flex gap-3">
                {analysis.buy_below != null && (
                  <div className="flex-1 rounded-lg px-3 py-2.5" style={{ background: '#1a6b3c15', border: '1px solid #1a6b3c30' }}>
                    <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#1a6b3c' }}>Acheter sous</div>
                    <div className="font-plex-mono font-bold text-lg" style={{ color: '#1a6b3c' }}>${Number(analysis.buy_below).toFixed(2)}</div>
                  </div>
                )}
                {analysis.sell_above != null && (
                  <div className="flex-1 rounded-lg px-3 py-2.5" style={{ background: '#8b1a1a15', border: '1px solid #8b1a1a30' }}>
                    <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#8b1a1a' }}>Vendre au-dessus</div>
                    <div className="font-plex-mono font-bold text-lg" style={{ color: '#8b1a1a' }}>${Number(analysis.sell_above).toFixed(2)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <div className="rounded-lg px-4 py-3" style={{ background: '#EDE7D9', border: '1px solid #D4C9A8' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1.5" style={{ color: '#8a6f2e' }}>Synthèse</div>
                <p className="font-plex-sans text-xs leading-relaxed" style={{ color: '#1A1A1A' }}>{analysis.summary}</p>
              </div>
            )}

            {/* Bull / Bear */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg px-3 py-2.5" style={{ background: '#1a6b3c08', border: '1px solid #1a6b3c25' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: '#1a6b3c' }}>Facteurs haussiers</div>
                <ul className="space-y-1">
                  {(Array.isArray(analysis.bull_factors) ? analysis.bull_factors : []).map((f, i) => (
                    <li key={i} className="font-plex-sans text-[11px] leading-snug flex gap-1.5" style={{ color: '#1A1A1A' }}>
                      <span style={{ color: '#1a6b3c' }}>↑</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg px-3 py-2.5" style={{ background: '#8b1a1a08', border: '1px solid #8b1a1a25' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: '#8b1a1a' }}>Facteurs baissiers</div>
                <ul className="space-y-1">
                  {(Array.isArray(analysis.bear_factors) ? analysis.bear_factors : []).map((f, i) => (
                    <li key={i} className="font-plex-sans text-[11px] leading-snug flex gap-1.5" style={{ color: '#1A1A1A' }}>
                      <span style={{ color: '#8b1a1a' }}>↓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Date windows */}
            {(analysis.buy_window_start || analysis.sell_window_start) && (
              <div className="grid grid-cols-2 gap-3">
                {analysis.buy_window_start && (
                  <div className="rounded-lg px-3 py-2.5" style={{ background: '#1a6b3c08', border: '1px solid #1a6b3c25' }}>
                    <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1.5" style={{ color: '#1a6b3c' }}>Fenêtre d'achat</div>
                    <div className="font-plex-mono text-xs font-medium" style={{ color: '#1a6b3c' }}>
                      {new Date(analysis.buy_window_start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      {analysis.buy_window_end && (
                        <> → {new Date(analysis.buy_window_end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</>
                      )}
                    </div>
                  </div>
                )}
                {analysis.sell_window_start && (
                  <div className="rounded-lg px-3 py-2.5" style={{ background: '#8b1a1a08', border: '1px solid #8b1a1a25' }}>
                    <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1.5" style={{ color: '#8b1a1a' }}>Fenêtre de vente</div>
                    <div className="font-plex-mono text-xs font-medium" style={{ color: '#8b1a1a' }}>
                      {new Date(analysis.sell_window_start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      {analysis.sell_window_end && (
                        <> → {new Date(analysis.sell_window_end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key insight */}
            {analysis.key_insight && (
              <div className="rounded-lg px-4 py-3" style={{ background: '#C9A84C10', border: '1px solid #C9A84C30' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#8a6f2e' }}>Insight clé</div>
                <p className="font-plex-sans text-xs font-medium leading-relaxed" style={{ color: '#1A1A1A' }}>
                  ★ {analysis.key_insight}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

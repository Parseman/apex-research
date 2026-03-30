import type { CryptoAnalysis } from '../../types/analysis.ts';

interface Props {
  sym: string;
  analysis: CryptoAnalysis | null;
  onClose: () => void;
}

const REC_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  BUY:  { bg: '#065F4615', color: '#065F46', border: '#065F4640' },
  SELL: { bg: '#7F1D1D15', color: '#7F1D1D', border: '#7F1D1D40' },
  HOLD: { bg: '#78350F15', color: '#78350F', border: '#78350F40' },
};

function Confidence({ n }: { n: number }) {
  const v = Math.min(5, Math.max(0, Math.round(n)));
  return (
    <span className="font-plex-mono text-xs" style={{ color: '#2DD4BF' }}>
      {'★'.repeat(v)}{'☆'.repeat(5 - v)}
    </span>
  );
}

export default function CryptoAnalysisModal({ sym, analysis, onClose }: Props) {
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
        style={{ background: '#E8F4F8', border: '1px solid #B0D4E0' }}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#0D1520' }}>
          <div>
            <span className="font-plex-mono font-bold text-sm" style={{ color: '#2DD4BF' }}>{sym}</span>
            <span className="font-plex-sans text-xs ml-2" style={{ color: '#0E7490' }}>— Rapport IA Crypto</span>
          </div>
          <button onClick={onClose} className="text-lg leading-none hover:opacity-70" style={{ color: '#0E7490' }}>✕</button>
        </div>

        {!analysis ? (
          <div className="px-5 py-12 text-center font-plex-sans text-sm" style={{ color: '#2A6070' }}>
            Aucune analyse disponible pour {sym}.<br />
            <span className="text-xs">L'analyse sera générée lors du prochain cycle.</span>
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
              <span className="font-plex-mono text-[10px] ml-auto" style={{ color: '#0E7490' }}>
                {analysis.updated_at ? new Date(analysis.updated_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>

            {/* Price targets */}
            {(analysis.buy_below != null || analysis.sell_above != null) && (
              <div className="flex gap-3">
                {analysis.buy_below != null && (
                  <div className="flex-1 rounded-lg px-3 py-2.5" style={{ background: '#065F4615', border: '1px solid #065F4630' }}>
                    <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#065F46' }}>Acheter sous</div>
                    <div className="font-plex-mono font-bold text-base" style={{ color: '#065F46' }}>
                      ${Number(analysis.buy_below).toLocaleString('en-US', { maximumFractionDigits: Number(analysis.buy_below) >= 1 ? 2 : 6 })}
                    </div>
                  </div>
                )}
                {analysis.sell_above != null && (
                  <div className="flex-1 rounded-lg px-3 py-2.5" style={{ background: '#7F1D1D15', border: '1px solid #7F1D1D30' }}>
                    <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#7F1D1D' }}>Vendre au-dessus</div>
                    <div className="font-plex-mono font-bold text-base" style={{ color: '#7F1D1D' }}>
                      ${Number(analysis.sell_above).toLocaleString('en-US', { maximumFractionDigits: Number(analysis.sell_above) >= 1 ? 2 : 6 })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <div className="rounded-lg px-4 py-3" style={{ background: '#D8EDF4', border: '1px solid #B0D4E0' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1.5" style={{ color: '#0E7490' }}>Synthèse</div>
                <p className="font-plex-sans text-xs leading-relaxed" style={{ color: '#0D1520' }}>{analysis.summary}</p>
              </div>
            )}

            {/* Bull / Bear */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg px-3 py-2.5" style={{ background: '#065F4608', border: '1px solid #065F4625' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: '#065F46' }}>Facteurs haussiers</div>
                <ul className="space-y-1">
                  {(Array.isArray(analysis.bull_factors) ? analysis.bull_factors : []).map((f, i) => (
                    <li key={i} className="font-plex-sans text-[11px] leading-snug flex gap-1.5" style={{ color: '#0D1520' }}>
                      <span style={{ color: '#065F46' }}>↑</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg px-3 py-2.5" style={{ background: '#7F1D1D08', border: '1px solid #7F1D1D25' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: '#7F1D1D' }}>Facteurs baissiers</div>
                <ul className="space-y-1">
                  {(Array.isArray(analysis.bear_factors) ? analysis.bear_factors : []).map((f, i) => (
                    <li key={i} className="font-plex-sans text-[11px] leading-snug flex gap-1.5" style={{ color: '#0D1520' }}>
                      <span style={{ color: '#7F1D1D' }}>↓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Date windows */}
            {(analysis.buy_window_start || analysis.sell_window_start) && (
              <div className="grid grid-cols-2 gap-3">
                {analysis.buy_window_start && (
                  <div className="rounded-lg px-3 py-2.5" style={{ background: '#065F4608', border: '1px solid #065F4625' }}>
                    <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1.5" style={{ color: '#065F46' }}>Fenêtre d'achat</div>
                    <div className="font-plex-mono text-xs font-medium" style={{ color: '#065F46' }}>
                      {new Date(analysis.buy_window_start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      {analysis.buy_window_end && (
                        <> → {new Date(analysis.buy_window_end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</>
                      )}
                    </div>
                  </div>
                )}
                {analysis.sell_window_start && (
                  <div className="rounded-lg px-3 py-2.5" style={{ background: '#7F1D1D08', border: '1px solid #7F1D1D25' }}>
                    <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1.5" style={{ color: '#7F1D1D' }}>Fenêtre de vente</div>
                    <div className="font-plex-mono text-xs font-medium" style={{ color: '#7F1D1D' }}>
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
              <div className="rounded-lg px-4 py-3" style={{ background: '#2DD4BF10', border: '1px solid #2DD4BF30' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#0E7490' }}>Insight clé</div>
                <p className="font-plex-sans text-xs font-medium leading-relaxed" style={{ color: '#0D1520' }}>
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

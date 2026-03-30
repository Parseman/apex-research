import { STOCK_META } from '../../data/stocks.ts';
import { UNIVERSE_MAP } from '../../data/stockUniverse.ts';
import { fmtPrice, fmtChg } from '../../api/api.ts';
import type { StockAnalysis } from '../../types/analysis.ts';

const REC_COLOR: Record<string, string> = { BUY: '#1a6b3c', SELL: '#8b1a1a', HOLD: '#7a4f00' };
const REC_BG: Record<string, string> = { BUY: '#1a6b3c20', SELL: '#8b1a1a20', HOLD: '#7a4f0020' };

interface EquitySummaryTableProps {
  symbols: string[];
  prices: Record<string, { price: number | null; chg: number | null }>;
  analyses: Record<string, StockAnalysis>;
  search: string;
  onSearchChange: (v: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (p: number) => void;
  onSelectSym: (sym: string) => void;
  matchFn?: (sym: string) => boolean;
  isFavorite?: (sym: string) => boolean;
  onToggleFavorite?: (sym: string) => void;
  favoritesCount?: number;
  favoritesAtLimit?: boolean;
}

const PAGE_SIZE = 20;

function EquitySummaryTable({
  symbols, prices, analyses, search, onSearchChange, page, totalPages, totalCount, onPageChange, onSelectSym, matchFn,
  isFavorite, onToggleFavorite, favoritesCount = 0, favoritesAtLimit = false,
}: EquitySummaryTableProps) {
  const borderColor = '#D4C9A8';
  const mutedColor = '#5a5040';
  const inkColor = '#1A1A1A';
  const rowBg1 = '#F5F0E8';
  const rowBg2 = '#EDE7D9';

  const start = page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, totalCount);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-plex-mono text-sm pointer-events-none" style={{ color: '#8a6f2e' }}>⌕</span>
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Ticker, nom ou secteur..."
            className="w-full pl-8 pr-8 py-2 rounded border text-sm font-plex-sans outline-none"
            style={{ background: '#EDE7D9', borderColor, color: inkColor }}
          />
          {search && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:opacity-70" style={{ color: '#8a6f2e' }}>✕</button>
          )}
        </div>
        <span className="font-plex-mono text-xs" style={{ color: mutedColor }}>
          {totalCount} résultat{totalCount > 1 ? 's' : ''}
        </span>
        {onToggleFavorite && (
          <span className="font-plex-mono text-xs ml-auto" style={{ color: favoritesAtLimit ? '#8b1a1a' : '#8a6f2e' }}>
            ★ {favoritesCount}/10 favoris
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor }}>
        <table className="w-full text-sm border-collapse font-plex-sans">
          <thead>
            <tr style={{ background: '#1A1A1A', color: '#E8C97A' }}>
              {onToggleFavorite && <th className="px-2 py-2.5 w-8" />}
              <th className="text-left px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">TICKER</th>
              <th className="text-left px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">NOM</th>
              <th className="text-left px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">SECTEUR</th>
              <th className="text-right px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">PRIX</th>
              <th className="text-right px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">VAR 24H</th>
              <th className="text-center px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">ANALYSE</th>
            </tr>
          </thead>
          <tbody>
            {symbols.length === 0 ? (
              <tr>
                <td colSpan={onToggleFavorite ? 7 : 6} className="px-4 py-10 text-center font-plex-sans text-sm" style={{ color: mutedColor, background: rowBg1 }}>
                  Aucun résultat pour « {search} »
                </td>
              </tr>
            ) : symbols.map((sym, i) => {
              const universe = UNIVERSE_MAP[sym];
              const meta = STOCK_META[sym];
              const name = meta?.name ?? universe?.name ?? sym;
              const sector = meta?.sector ?? universe?.sector ?? '—';
              const lp = prices[sym];
              const chg = lp?.chg ?? null;
              const isUp = (chg ?? 0) >= 0;
              const hasMeta = !!meta;
              const matchesProfile = matchFn?.(sym) ?? false;
              const analysis = analyses[sym];
              const rec = analysis?.recommendation;
              const rowBg = i % 2 === 0 ? rowBg1 : rowBg2;
              const fav = isFavorite?.(sym) ?? false;

              return (
                <tr
                  key={sym}
                  style={{ background: rowBg, borderTop: `1px solid ${borderColor}`, cursor: 'pointer' }}
                  className="hover:brightness-95 transition-all"
                  onClick={() => onSelectSym(sym)}
                >
                  {onToggleFavorite && (
                    <td className="px-2 py-2.5 text-center" onClick={e => { e.stopPropagation(); onToggleFavorite(sym); }}>
                      <button
                        title={fav ? 'Retirer des favoris' : favoritesAtLimit ? 'Limite de 10 favoris atteinte' : 'Ajouter aux favoris'}
                        className="text-sm leading-none transition-all hover:scale-110"
                        style={{ color: fav ? '#C9A84C' : 'rgba(200,169,110,0.25)', cursor: favoritesAtLimit && !fav ? 'not-allowed' : 'pointer' }}
                        disabled={favoritesAtLimit && !fav}
                      >
                        {fav ? '★' : '☆'}
                      </button>
                    </td>
                  )}
                  <td className="px-3 py-2.5 font-plex-mono font-bold text-xs whitespace-nowrap" style={{ color: '#C9A84C' }}>
                    {sym}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-medium whitespace-nowrap" style={{ color: inkColor }}>
                    {name}
                  </td>
                  <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: mutedColor }}>
                    {sector}
                  </td>
                  <td className="px-3 py-2.5 text-right font-plex-mono text-xs whitespace-nowrap" style={{ color: inkColor }}>
                    {lp?.price != null ? fmtPrice(lp.price) : <span style={{ color: mutedColor }}>—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right font-plex-mono text-xs whitespace-nowrap font-medium" style={{ color: chg != null ? (isUp ? '#1a6b3c' : '#8b1a1a') : mutedColor }}>
                    {chg != null ? fmtChg(chg) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {rec && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-plex-mono font-bold" style={{ background: REC_BG[rec], color: REC_COLOR[rec], border: `1px solid ${REC_COLOR[rec]}40` }}>
                          {rec}
                        </span>
                      )}
                      {hasMeta && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-plex-mono font-medium" style={{ background: '#C9A84C25', color: '#8a6f2e', border: '1px solid #C9A84C40' }}>
                          ★ Analysé
                        </span>
                      )}
                      {matchesProfile && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-plex-mono font-medium" style={{ background: '#1a6b3c20', color: '#1a6b3c', border: '1px solid #1a6b3c40' }}>
                          ✓ Profil
                        </span>
                      )}
                      {!rec && !hasMeta && !matchesProfile && (
                        <span className="text-[9px] font-plex-mono" style={{ color: 'rgba(90,80,64,0.3)' }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="font-plex-mono text-xs" style={{ color: mutedColor }}>
            {start}–{end} sur {totalCount}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange(0)} disabled={page === 0}
              className="px-2 py-1 rounded font-plex-mono text-xs disabled:opacity-30 hover:brightness-95"
              style={{ background: '#EDE7D9', color: '#8a6f2e', border: `1px solid ${borderColor}` }}>«</button>
            <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
              className="px-2.5 py-1 rounded font-plex-mono text-xs disabled:opacity-30 hover:brightness-95"
              style={{ background: '#EDE7D9', color: '#8a6f2e', border: `1px solid ${borderColor}` }}>‹</button>

            {/* Page numbers: show window of 5 around current */}
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 2)
              .reduce<(number | '…')[]>((acc, i, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (i as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                acc.push(i);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '…' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 font-plex-mono text-xs" style={{ color: mutedColor }}>…</span>
                ) : (
                  <button key={item} onClick={() => onPageChange(item as number)}
                    className="w-7 py-1 rounded font-plex-mono text-xs transition-colors"
                    style={{
                      background: item === page ? '#C9A84C' : '#EDE7D9',
                      color: item === page ? '#1A1A1A' : '#8a6f2e',
                      border: `1px solid ${item === page ? '#C9A84C' : borderColor}`,
                      fontWeight: item === page ? 700 : 400,
                    }}>
                    {(item as number) + 1}
                  </button>
                )
              )}

            <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages - 1}
              className="px-2.5 py-1 rounded font-plex-mono text-xs disabled:opacity-30 hover:brightness-95"
              style={{ background: '#EDE7D9', color: '#8a6f2e', border: `1px solid ${borderColor}` }}>›</button>
            <button onClick={() => onPageChange(totalPages - 1)} disabled={page === totalPages - 1}
              className="px-2 py-1 rounded font-plex-mono text-xs disabled:opacity-30 hover:brightness-95"
              style={{ background: '#EDE7D9', color: '#8a6f2e', border: `1px solid ${borderColor}` }}>»</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquitySummaryTable;

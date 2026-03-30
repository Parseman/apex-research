import { CRYPTO_UNIVERSE_MAP } from '../../data/cryptoUniverse.ts';
import { CRYPTOS } from '../../data/cryptos.ts';
import { fmtPrice, fmtChg } from '../../api/api.ts';
import type { CryptoAnalysis } from '../../types/analysis.ts';
import type { JSX } from 'react';

const ANALYZED_SYMS = new Set(CRYPTOS.map(c => c.sym));

const PAGE_SIZE = 20;

const REC_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  BUY:  { bg: '#065F4615', color: '#065F46', border: '#065F4640' },
  SELL: { bg: '#7F1D1D15', color: '#7F1D1D', border: '#7F1D1D40' },
  HOLD: { bg: '#78350F15', color: '#78350F', border: '#78350F40' },
};

interface CryptoSummaryTableProps {
  symbols: string[];
  prices: Record<string, { price: number | null; chg: number | null }>;
  analyses: Record<string, CryptoAnalysis>;
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

export default function CryptoSummaryTable({
  symbols, prices, analyses, search, onSearchChange, page, totalPages, totalCount, onPageChange, onSelectSym, matchFn,
  isFavorite, onToggleFavorite, favoritesCount = 0, favoritesAtLimit = false,
}: CryptoSummaryTableProps): JSX.Element {
  const borderColor = '#B0D4E0';
  const mutedColor = '#2A6070';
  const inkColor = '#0D1520';
  const rowBg1 = '#E8F4F8';
  const rowBg2 = '#D8EDF4';

  const start = page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, totalCount);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-plex-mono text-sm pointer-events-none" style={{ color: '#0E7490' }}>⌕</span>
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Ticker, nom ou catégorie..."
            className="w-full pl-8 pr-8 py-2 rounded border text-sm font-plex-sans outline-none"
            style={{ background: '#D8EDF4', borderColor, color: inkColor }}
          />
          {search && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:opacity-70" style={{ color: '#0E7490' }}>✕</button>
          )}
        </div>
        <span className="font-plex-mono text-xs" style={{ color: mutedColor }}>
          {totalCount} résultat{totalCount > 1 ? 's' : ''}
        </span>
        {onToggleFavorite && (
          <span className="font-plex-mono text-xs ml-auto" style={{ color: favoritesAtLimit ? '#7F1D1D' : '#0E7490' }}>
            ★ {favoritesCount}/10 favoris
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor }}>
        <table className="w-full text-sm border-collapse font-plex-sans">
          <thead>
            <tr style={{ background: '#0D1520', color: '#67E8F9' }}>
              {onToggleFavorite && <th className="px-2 py-2.5 w-8" />}
              <th className="text-left px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">TICKER</th>
              <th className="text-left px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">NOM</th>
              <th className="text-left px-3 py-2.5 font-plex-mono text-xs tracking-wider whitespace-nowrap">CATÉGORIE</th>
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
              const entry = CRYPTO_UNIVERSE_MAP[sym];
              const name = entry?.name ?? sym;
              const category = entry?.category ?? '—';
              const lp = prices[sym];
              const chg = lp?.chg ?? null;
              const isUp = (chg ?? 0) >= 0;
              const isAnalyzed = ANALYZED_SYMS.has(sym);
              const matchesProfile = matchFn?.(sym) ?? false;
              const rowBg = i % 2 === 0 ? rowBg1 : rowBg2;
              const analysis = analyses[sym] ?? null;
              const rec = analysis?.recommendation;
              const recStyle = rec ? REC_STYLE[rec] : null;
              const hasAiAnalysis = !!analysis;
              const fav = isFavorite?.(sym) ?? false;

              return (
                <tr
                  key={sym}
                  style={{ background: rowBg, borderTop: `1px solid ${borderColor}`, cursor: hasAiAnalysis ? 'pointer' : 'default' }}
                  className="hover:brightness-95 transition-all"
                  onClick={() => { if (hasAiAnalysis) onSelectSym(sym); }}
                >
                  {onToggleFavorite && (
                    <td className="px-2 py-2.5 text-center" onClick={e => { e.stopPropagation(); onToggleFavorite(sym); }}>
                      <button
                        title={fav ? 'Retirer des favoris' : favoritesAtLimit ? 'Limite de 10 favoris atteinte' : 'Ajouter aux favoris'}
                        className="text-sm leading-none transition-all hover:scale-110"
                        style={{ color: fav ? '#2DD4BF' : 'rgba(45,212,191,0.25)', cursor: favoritesAtLimit && !fav ? 'not-allowed' : 'pointer' }}
                        disabled={favoritesAtLimit && !fav}
                      >
                        {fav ? '★' : '☆'}
                      </button>
                    </td>
                  )}
                  <td className="px-3 py-2.5 font-plex-mono font-bold text-xs whitespace-nowrap" style={{ color: '#2DD4BF' }}>
                    {sym}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-medium whitespace-nowrap" style={{ color: inkColor }}>
                    {name}
                  </td>
                  <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: mutedColor }}>
                    {category}
                  </td>
                  <td className="px-3 py-2.5 text-right font-plex-mono text-xs whitespace-nowrap" style={{ color: inkColor }}>
                    {lp?.price != null ? fmtPrice(lp.price) : <span style={{ color: mutedColor }}>—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right font-plex-mono text-xs whitespace-nowrap font-medium" style={{ color: chg != null ? (isUp ? '#065F46' : '#7F1D1D') : mutedColor }}>
                    {chg != null ? fmtChg(chg) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {recStyle && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-plex-mono font-bold tracking-wider" style={{ background: recStyle.bg, color: recStyle.color, border: `1px solid ${recStyle.border}` }}>
                          {rec}
                        </span>
                      )}
                      {isAnalyzed && !hasAiAnalysis && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-plex-mono font-medium" style={{ background: '#2DD4BF25', color: '#0E7490', border: '1px solid #2DD4BF40' }}>
                          ★ Analysé
                        </span>
                      )}
                      {matchesProfile && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-plex-mono font-medium" style={{ background: '#065F4620', color: '#065F46', border: '1px solid #065F4640' }}>
                          ✓ Profil
                        </span>
                      )}
                      {!isAnalyzed && !matchesProfile && !hasAiAnalysis && (
                        <span className="text-[9px] font-plex-mono" style={{ color: 'rgba(42,96,112,0.3)' }}>—</span>
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
              style={{ background: '#D8EDF4', color: '#0E7490', border: `1px solid ${borderColor}` }}>«</button>
            <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
              className="px-2.5 py-1 rounded font-plex-mono text-xs disabled:opacity-30 hover:brightness-95"
              style={{ background: '#D8EDF4', color: '#0E7490', border: `1px solid ${borderColor}` }}>‹</button>

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
                      background: item === page ? '#2DD4BF' : '#D8EDF4',
                      color: item === page ? '#0D1520' : '#0E7490',
                      border: `1px solid ${item === page ? '#2DD4BF' : borderColor}`,
                      fontWeight: item === page ? 700 : 400,
                    }}>
                    {(item as number) + 1}
                  </button>
                )
              )}

            <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages - 1}
              className="px-2.5 py-1 rounded font-plex-mono text-xs disabled:opacity-30 hover:brightness-95"
              style={{ background: '#D8EDF4', color: '#0E7490', border: `1px solid ${borderColor}` }}>›</button>
            <button onClick={() => onPageChange(totalPages - 1)} disabled={page === totalPages - 1}
              className="px-2 py-1 rounded font-plex-mono text-xs disabled:opacity-30 hover:brightness-95"
              style={{ background: '#D8EDF4', color: '#0E7490', border: `1px solid ${borderColor}` }}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}

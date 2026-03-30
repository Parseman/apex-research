import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ScreenerNav from '../components/layout/ScreenerNav.tsx';
import TabNav from '../components/screener/TabNav.tsx';
import EquitySummaryTable from '../components/screener/EquitySummaryTable.tsx';
import StockCard from '../components/screener/StockCard.tsx';
import EquityStrategy from '../components/screener/EquityStrategy.tsx';
import StockAnalysisModal from '../components/screener/StockAnalysisModal.tsx';
import { fetchStock } from '../api/api.ts';
import { EQUITY_ORDER, STOCK_META } from '../data/stocks.ts';
import { STOCK_UNIVERSE, UNIVERSE_MAP } from '../data/stockUniverse.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { matchesEquityProfile } from '../utils/profileMatch.ts';
import { supabase } from '../lib/supabase.ts';
import type { StockAnalysis } from '../types/analysis.ts';
import { useFavorites } from '../hooks/useFavorites.ts';

const PAGE_SIZE = 20;
const REFRESH_MS = 120_000;

// Univers complet : STOCK_UNIVERSE + featured stocks non présents dans l'univers
const FEATURED_ONLY = EQUITY_ORDER.filter(sym => !UNIVERSE_MAP[sym]);
const ALL_SYMBOLS = [
  ...STOCK_UNIVERSE.map(e => e.sym),
  ...FEATURED_ONLY,
];

type PriceMap = Record<string, { price: number | null; chg: number | null }>;

const PROFILE_COLS = [
  { label: 'Univers', value: `${ALL_SYMBOLS.length} Actions` },
  { label: 'Type', value: 'Large Cap US' },
  { label: 'Horizon', value: '3–10 ans' },
  { label: 'Méthode', value: 'Fondamental + DCA' },
];

const TABS = ['Résumé', 'Fiches', 'Stratégie'];

export default function EquityScreenerPage() {
  const { session } = useAuth();
  const { isFavorite, toggle: toggleFavorite, count: favCount, atLimit: favAtLimit } = useFavorites();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [prices, setPrices] = useState<PriceMap>({});
  const [fetchStatus, setFetchStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000);
  const [analyses, setAnalyses] = useState<Record<string, StockAnalysis>>({});
  const [selectedSym, setSelectedSym] = useState<string | null>(null);

  const filteredSymbols = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = !q ? ALL_SYMBOLS : ALL_SYMBOLS.filter(sym => {
      const meta = STOCK_META[sym];
      const universe = UNIVERSE_MAP[sym];
      const name = (meta?.name ?? universe?.name ?? '').toLowerCase();
      const sector = (meta?.sector ?? universe?.sector ?? '').toLowerCase();
      return sym.toLowerCase().includes(q) || name.includes(q) || sector.includes(q);
    });
    // Option A: sort profile matches to top
    if (session?.onboardingDone) {
      return [...base].sort((a, b) =>
        (matchesEquityProfile(a, session) ? 0 : 1) - (matchesEquityProfile(b, session) ? 0 : 1)
      );
    }
    return base;
  }, [search, session]);

  const totalPages = Math.ceil(filteredSymbols.length / PAGE_SIZE);

  const pageSymbols = useMemo(
    () => filteredSymbols.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filteredSymbols, page]
  );

  const pageSymbolsRef = useRef(pageSymbols);
  pageSymbolsRef.current = pageSymbols;

  // Reset page when search changes
  useEffect(() => { setPage(0); }, [search]);

  // Fetch AI analyses from Supabase
  useEffect(() => {
    supabase.from('stock_analyses').select('*').then(({ data, error }) => {
      if (error) { console.error('analyses fetch error:', error); return; }
      if (!data) return;
      console.log('analyses loaded:', data.length, data[0]);
      const map: Record<string, StockAnalysis> = {};
      data.forEach((row: StockAnalysis) => { map[row.sym] = row; });
      setAnalyses(map);
    });
  }, []);

  const fetchFresh = useCallback(async (syms: string[], silent = false) => {
    if (!silent) setFetchStatus('loading');

    const results = await Promise.allSettled(
      syms.map((sym, i) =>
        new Promise<void>(r => setTimeout(r, i * 120))
          .then(() => fetchStock(sym).then(d => ({ sym, ...d })))
      )
    );

    const map: PriceMap = {};
    let anySuccess = false;

    results.forEach((r, i) => {
      const sym = syms[i];
      if (r.status === 'fulfilled') {
        map[sym] = { price: r.value.price, chg: r.value.chg };
        anySuccess = true;
      } else {
        map[sym] = { price: null, chg: null };
      }
    });

    setPrices(prev => ({ ...prev, ...map }));

    if (anySuccess) {
      const now = new Date();
      setLastUpdated(now);
      setFetchStatus('done');
      setCountdown(REFRESH_MS / 1000);
    } else if (!silent) {
      setFetchStatus('error');
    }
  }, []);

  // Fetch when page changes, set up auto-refresh
  useEffect(() => {
    void fetchFresh(pageSymbols, false);

    const refreshInterval = setInterval(() => {
      void fetchFresh(pageSymbolsRef.current, true);
    }, REFRESH_MS);

    const tickInterval = setInterval(() => {
      setCountdown(c => (c <= 1 ? REFRESH_MS / 1000 : c - 1));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(tickInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSymbols.join(','), fetchFresh]);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <ScreenerNav theme="equity" />

      <div style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C97A, #C9A84C)', height: '3px' }} />

      {/* Masthead */}
      <div className="border-b px-6 py-6" style={{ borderColor: '#D4C9A8', background: '#EDE7D9' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-plex-mono text-xs tracking-widest uppercase mb-1" style={{ color: '#8a6f2e' }}>
              BERDINVEST EQUITY — RAPPORT ANALYTIQUE
            </p>
            <h1 className="font-playfair text-3xl font-bold" style={{ color: '#111111' }}>
              Screener Actions Premium
            </h1>
            <p className="font-plex-sans text-sm mt-1" style={{ color: '#5a5040' }}>
              Analyse fondamentale · {ALL_SYMBOLS.length} titres · Stratégie DCA incluse
            </p>
          </div>
          <div className="text-right">
            <div className="font-plex-mono text-xs" style={{ color: '#5a5040' }}>{today}</div>
            <div
              className="font-plex-mono text-xs mt-1 flex items-center gap-1.5 justify-end"
              style={{ color: fetchStatus === 'done' ? '#1a6b3c' : fetchStatus === 'error' ? '#8b1a1a' : '#7a4f00' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-blink"
                style={{ background: fetchStatus === 'done' ? '#1a6b3c' : fetchStatus === 'error' ? '#8b1a1a' : '#C9A84C' }}
              />
              {fetchStatus === 'loading'
                ? 'Chargement des cours...'
                : fetchStatus === 'error'
                  ? 'Données indisponibles'
                  : `Cours à jour · ${lastUpdated?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) ?? ''} · actualisation dans ${countdown}s`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Profile banner */}
      <div className="border-b" style={{ borderColor: '#D4C9A8', background: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4">
          {PROFILE_COLS.map((col, i) => (
            <div key={col.label} className="py-4 px-4 border-r last:border-r-0" style={{ borderColor: 'rgba(212,201,168,0.2)' }}>
              <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#8a6f2e' }}>
                {i > 0 && <span>·</span>} {col.label}
              </div>
              <div className="font-plex-mono text-sm font-medium" style={{ color: '#E8C97A' }}>{col.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyst note */}
      <div className="border-b px-6 py-3" style={{ borderColor: '#D4C9A8', background: '#EDE7D9' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-plex-sans text-xs leading-relaxed" style={{ color: '#5a5040' }}>
            <span className="font-bold" style={{ color: '#C9A84C' }}>NOTE ANALYSTE :</span>{' '}
            Ce screener couvre {ALL_SYMBOLS.length} actions US (S&P 500 + NASDAQ 100 + large caps). Les {EQUITY_ORDER.length} titres marqués
            <span className="font-bold" style={{ color: '#C9A84C' }}> ★ Analysé</span> disposent d'une fiche complète (bull/bear/moat). Cours actualisés toutes les 30 secondes.
          </p>
        </div>
      </div>

      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} theme="equity" />

      {selectedSym !== null && (
        <StockAnalysisModal
          sym={selectedSym}
          analysis={analyses[selectedSym] ?? null}
          onClose={() => setSelectedSym(null)}
        />
      )}
      {/* debug — à retirer */}
      {selectedSym && console.log('modal open for:', selectedSym, 'analysis:', analyses[selectedSym]) as unknown as null}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 0 && (
          <EquitySummaryTable
            symbols={pageSymbols}
            prices={prices}
            analyses={analyses}
            search={search}
            onSearchChange={setSearch}
            page={page}
            totalPages={totalPages}
            totalCount={filteredSymbols.length}
            onPageChange={setPage}
            onSelectSym={setSelectedSym}
            matchFn={sym => matchesEquityProfile(sym, session)}
            isFavorite={isFavorite}
            onToggleFavorite={sym => toggleFavorite(sym, 'stock')}
            favoritesCount={favCount}
            favoritesAtLimit={favAtLimit}
          />
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            {/* Search bar for cards */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-plex-mono pointer-events-none" style={{ color: '#8a6f2e' }}>⌕</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un ticker ou un nom..."
                  className="w-full pl-8 pr-4 py-2 rounded border text-sm font-plex-sans outline-none"
                  style={{ background: '#EDE7D9', borderColor: '#D4C9A8', color: '#1A1A1A' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#8a6f2e' }}>✕</button>
                )}
              </div>
              <span className="font-plex-mono text-xs" style={{ color: '#5a5040' }}>{filteredSymbols.length} titre{filteredSymbols.length > 1 ? 's' : ''}</span>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {pageSymbols.map(sym => (
                <StockCard
                  key={sym}
                  sym={sym}
                  meta={STOCK_META[sym]}
                  price={prices[sym]?.price ?? null}
                  chg={prices[sym]?.chg ?? null}
                />
              ))}
            </div>

            {/* Pagination for cards */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="font-plex-mono text-xs" style={{ color: '#5a5040' }}>
                  Page {page + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-1.5 rounded font-plex-mono text-xs disabled:opacity-30"
                    style={{ background: '#EDE7D9', color: '#8a6f2e', border: '1px solid #D4C9A8' }}
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="px-4 py-1.5 rounded font-plex-mono text-xs disabled:opacity-30"
                    style={{ background: '#EDE7D9', color: '#8a6f2e', border: '1px solid #D4C9A8' }}
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 2 && <EquityStrategy />}
      </div>

      <footer className="border-t px-6 py-6" style={{ borderColor: '#D4C9A8', background: '#EDE7D9' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-plex-sans text-xs text-center leading-relaxed" style={{ color: '#5a5040' }}>
            Les informations présentées sont fournies à titre informatif et ne constituent pas un conseil
            en investissement financier. Les données de marché sont indicatives.
            © {new Date().getFullYear()} Berdinvest
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import ScreenerNav from '../components/layout/ScreenerNav.tsx';
import TabNav from '../components/screener/TabNav.tsx';
import CryptoSummaryTable from '../components/screener/CryptoSummaryTable.tsx';
import CryptoCard from '../components/screener/CryptoCard.tsx';
import CryptoStrategy from '../components/screener/CryptoStrategy.tsx';
import { fetchCryptoPairs } from '../api/api.ts';
import { CRYPTOS } from '../data/cryptos.ts';
import { CRYPTO_UNIVERSE, CRYPTO_UNIVERSE_MAP, SYM_TO_PAIR } from '../data/cryptoUniverse.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { matchesCryptoProfile } from '../utils/profileMatch.ts';

const PAGE_SIZE = 20;
const REFRESH_MS = 30_000;

const ALL_SYMS = CRYPTO_UNIVERSE.map(e => e.sym);

type PriceMap = Record<string, { price: number | null; chg: number | null }>;

const PROFILE_COLS = [
  { label: 'Univers', value: `${ALL_SYMS.length} Cryptos` },
  { label: 'Risque', value: '5 → 9 / 10' },
  { label: 'Horizon', value: '1–4 ans (cycle)' },
  { label: 'Méthode', value: 'On-chain + DCA' },
];

const TABS = ['Résumé', 'Fiches', 'Stratégie'];

export default function CryptoScreenerPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [prices, setPrices] = useState<PriceMap>({});
  const [fetchStatus, setFetchStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000);

  const filteredSyms = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = !q ? ALL_SYMS : ALL_SYMS.filter(sym => {
      const entry = CRYPTO_UNIVERSE_MAP[sym];
      const name = (entry?.name ?? '').toLowerCase();
      const cat = (entry?.category ?? '').toLowerCase();
      return sym.toLowerCase().includes(q) || name.includes(q) || cat.includes(q);
    });
    // Option A: sort profile matches to top
    if (session?.onboardingDone) {
      return [...base].sort((a, b) =>
        (matchesCryptoProfile(a, session) ? 0 : 1) - (matchesCryptoProfile(b, session) ? 0 : 1)
      );
    }
    return base;
  }, [search, session]);

  const totalPages = Math.ceil(filteredSyms.length / PAGE_SIZE);

  const pageSyms = useMemo(
    () => filteredSyms.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filteredSyms, page]
  );

  const pageSymsRef = useRef(pageSyms);
  pageSymsRef.current = pageSyms;

  // Reset page when search changes
  useEffect(() => { setPage(0); }, [search]);

  const fetchFresh = useCallback(async (syms: string[], silent = false) => {
    if (!silent) setFetchStatus('loading');

    const pairs = syms.map(sym => SYM_TO_PAIR[sym]).filter(Boolean);
    if (pairs.length === 0) {
      if (!silent) setFetchStatus('done');
      return;
    }

    try {
      const data = await fetchCryptoPairs(pairs);
      const map: PriceMap = {};
      let anySuccess = false;

      syms.forEach(sym => {
        const pair = SYM_TO_PAIR[sym];
        if (pair && data[pair]) {
          map[sym] = { price: data[pair].price, chg: data[pair].chg };
          anySuccess = true;
        } else {
          map[sym] = { price: null, chg: null };
        }
      });

      setPrices(prev => ({ ...prev, ...map }));

      if (anySuccess) {
        setLastUpdated(new Date());
        setFetchStatus('done');
        setCountdown(REFRESH_MS / 1000);
      } else if (!silent) {
        setFetchStatus('error');
      }
    } catch {
      if (!silent) setFetchStatus('error');
    }
  }, []);

  // Fetch when page changes, set up auto-refresh
  useEffect(() => {
    void fetchFresh(pageSyms, false);

    const refreshInterval = setInterval(() => {
      void fetchFresh(pageSymsRef.current, true);
    }, REFRESH_MS);

    const tickInterval = setInterval(() => {
      setCountdown(c => (c <= 1 ? REFRESH_MS / 1000 : c - 1));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(tickInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSyms.join(','), fetchFresh]);

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ background: '#E8F4F8', minHeight: '100vh' }}>
      <ScreenerNav theme="crypto" />

      <div style={{ background: 'linear-gradient(90deg, #2DD4BF, #67E8F9, #2DD4BF)', height: '3px' }} />

      {/* Masthead */}
      <div className="border-b px-6 py-6" style={{ borderColor: '#B0D4E0', background: '#D8EDF4' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-plex-mono text-xs tracking-widest uppercase mb-1" style={{ color: '#0E7490' }}>
              APEX CRYPTO RESEARCH — RAPPORT ANALYTIQUE
            </p>
            <h1 className="font-playfair text-3xl font-bold" style={{ color: '#0D1520' }}>
              Screener Crypto Premium
            </h1>
            <p className="font-plex-sans text-sm mt-1" style={{ color: '#2A6070' }}>
              Analyse on-chain · {ALL_SYMS.length} actifs · Stratégie DCA incluse
            </p>
          </div>
          <div className="text-right">
            <div className="font-plex-mono text-xs" style={{ color: '#2A6070' }}>{today}</div>
            <div
              className="font-plex-mono text-xs mt-1 flex items-center gap-1.5 justify-end"
              style={{ color: fetchStatus === 'done' ? '#065F46' : fetchStatus === 'error' ? '#7F1D1D' : '#78350F' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-blink"
                style={{ background: fetchStatus === 'done' ? '#065F46' : fetchStatus === 'error' ? '#7F1D1D' : '#2DD4BF' }}
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

      {/* Risk warning */}
      <div className="border-b px-6 py-3" style={{ borderColor: '#B0D4E0', background: '#FEE2E2' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-plex-sans text-xs leading-relaxed" style={{ color: '#7F1D1D' }}>
            <span className="font-bold">⚠️ AVERTISSEMENT RISQUE :</span>{' '}
            Les cryptomonnaies sont des actifs hautement spéculatifs. Des corrections de 50–80% sont
            historiquement fréquentes. N'investissez que ce que vous êtes prêt à perdre intégralement.
          </p>
        </div>
      </div>

      {/* Profile banner */}
      <div className="border-b" style={{ borderColor: '#B0D4E0', background: '#0D1520' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4">
          {PROFILE_COLS.map((col, i) => (
            <div key={col.label} className="py-4 px-4 border-r last:border-r-0" style={{ borderColor: 'rgba(176,212,224,0.2)' }}>
              <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#0E7490' }}>
                {i > 0 && <span>·</span>} {col.label}
              </div>
              <div className="font-plex-mono text-sm font-medium" style={{ color: '#67E8F9' }}>{col.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Analyst note */}
      <div className="border-b px-6 py-3" style={{ borderColor: '#B0D4E0', background: '#D8EDF4' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-plex-sans text-xs leading-relaxed" style={{ color: '#2A6070' }}>
            <span className="font-bold" style={{ color: '#2DD4BF' }}>NOTE ANALYSTE :</span>{' '}
            Ce screener couvre {ALL_SYMS.length} cryptomonnaies (Layer 1/2, DeFi, IA, Gaming, DePIN…). Les {CRYPTOS.length} actifs marqués
            <span className="font-bold" style={{ color: '#2DD4BF' }}> ★ Analysé</span> disposent d'une fiche complète (bull/bear/moat). Cours actualisés toutes les 30 secondes via Binance.
          </p>
        </div>
      </div>

      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} theme="crypto" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 0 && (
          <CryptoSummaryTable
            symbols={pageSyms}
            prices={prices}
            search={search}
            onSearchChange={setSearch}
            page={page}
            totalPages={totalPages}
            totalCount={filteredSyms.length}
            onPageChange={setPage}
            matchFn={sym => matchesCryptoProfile(sym, session)}
          />
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            {/* Search bar for cards */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-plex-mono pointer-events-none" style={{ color: '#0E7490' }}>⌕</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un ticker ou un nom..."
                  className="w-full pl-8 pr-4 py-2 rounded border text-sm font-plex-sans outline-none"
                  style={{ background: '#D8EDF4', borderColor: '#B0D4E0', color: '#0D1520' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#0E7490' }}>✕</button>
                )}
              </div>
              <span className="font-plex-mono text-xs" style={{ color: '#2A6070' }}>
                {CRYPTOS.filter(c => {
                  if (!search) return true;
                  const q = search.toLowerCase();
                  return c.sym.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
                }).length} fiche{CRYPTOS.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {CRYPTOS.filter(c => {
                if (!search) return true;
                const q = search.toLowerCase();
                return c.sym.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q);
              }).map(asset => (
                <CryptoCard
                  key={asset.id}
                  asset={asset}
                  price={prices[asset.sym]?.price ?? null}
                  chg={prices[asset.sym]?.chg ?? null}
                  mcap={null}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && <CryptoStrategy />}
      </div>

      <footer className="border-t px-6 py-6" style={{ borderColor: '#B0D4E0', background: '#D8EDF4' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-plex-sans text-xs text-center leading-relaxed" style={{ color: '#2A6070' }}>
            Les informations présentées sont fournies à titre informatif et ne constituent pas un conseil
            en investissement financier. Les données de marché sont indicatives.
            © {new Date().getFullYear()} Apex Research
          </p>
        </div>
      </footer>
    </div>
  );
}

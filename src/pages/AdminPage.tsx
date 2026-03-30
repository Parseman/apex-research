import { useState, useCallback, useEffect } from 'react';
import DarkNav from '../components/layout/DarkNav.tsx';
import StatsRow from '../components/admin/StatsRow.tsx';
import AddUserForm from '../components/admin/AddUserForm.tsx';
import UserTable from '../components/admin/UserTable.tsx';
import EditUserModal from '../components/admin/EditUserModal.tsx';
import { useAuth } from '../auth/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import type { User } from '../types/auth.ts';
import PerformancePanel from '../components/admin/PerformancePanel.tsx';

type AnalysisMode = 'all' | 'favorites';
type AnalysisStatus = 'idle' | 'running' | 'done' | 'error';

const ALL_STOCKS = [
  'NVDA','MSFT','AAPL','GOOGL','AMZN','META','TSLA','AVGO','ORCL','ADBE',
  'CRM','AMD','QCOM','V','MA','AXP','JPM','BAC','GS','WFC',
  'BLK','UNH','LLY','JNJ','ABBV','MRK','TMO','COST','WMT','MCD',
  'SBUX','NKE','KO','PEP','PG','PM','XOM','CVX','CAT','HON','GE',
];
const DELAY_MS = 3500;

const ALL_CRYPTOS = ['BTC','ETH','SOL','BNB','LINK','AVAX','UNI','DOT','AAVE','ICP'];
const CRYPTO_DELAY_MS = 5500;

const CRYPTO_LOGO: Record<string, string> = {
  BTC:  'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH:  'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  SOL:  'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  BNB:  'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  UNI:  'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
  DOT:  'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
  AAVE: 'https://assets.coingecko.com/coins/images/12645/small/aave-logo.png',
  ICP:  'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png',
};

export default function AdminPage() {
  const { getUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  // Stock analysis state
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisTotal, setAnalysisTotal] = useState(ALL_STOCKS.length);
  const [currentSym, setCurrentSym] = useState<string | null>(null);
  const abortRef = useState({ cancelled: false })[0];

  // Crypto analysis state
  const [cryptoStatus, setCryptoStatus] = useState<AnalysisStatus>('idle');
  const [cryptoLog, setCryptoLog] = useState<string[]>([]);
  const [cryptoProgress, setCryptoProgress] = useState(0);
  const [cryptoTotal, setCryptoTotal] = useState(ALL_CRYPTOS.length);
  const [currentCrypto, setCurrentCrypto] = useState<string | null>(null);
  const cryptoAbortRef = useState({ cancelled: false })[0];

  // Mode + favorites preview
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(
    () => (localStorage.getItem('analysis_mode') as AnalysisMode) ?? 'all'
  );
  const [stockFavs, setStockFavs] = useState<string[]>([]);
  const [cryptoFavs, setCryptoFavs] = useState<string[]>([]);
  const [favsLoading, setFavsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setFavsLoading(true);
    const { data } = await supabase.from('user_favorites').select('sym, asset_type');
    const rows = data ?? [];
    const stocks = [...new Set(rows.filter((r: { asset_type: string }) => r.asset_type === 'stock').map((r: { sym: string }) => r.sym))];
    const cryptos = [...new Set(rows.filter((r: { asset_type: string }) => r.asset_type === 'crypto').map((r: { sym: string }) => r.sym))];
    setStockFavs(stocks);
    setCryptoFavs(cryptos);
    setFavsLoading(false);
  }, []);

  const setMode = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    localStorage.setItem('analysis_mode', mode);
    if (mode === 'favorites') void fetchFavorites();
  };

  useEffect(() => {
    if (analysisMode === 'favorites') void fetchFavorites();
  }, [analysisMode, fetchFavorites]);

  // Effective lists based on mode
  const effectiveStocks = analysisMode === 'favorites' ? stockFavs : ALL_STOCKS;
  const effectiveCryptos = analysisMode === 'favorites' ? cryptoFavs : ALL_CRYPTOS;

  const runAnalysis = async () => {
    const symsToRun = effectiveStocks;
    if (symsToRun.length === 0) {
      setAnalysisLog(['Aucun stock favori trouvé.']);
      setAnalysisStatus('done');
      return;
    }
    setAnalysisStatus('running');
    setAnalysisLog([]);
    setAnalysisProgress(0);
    setAnalysisTotal(symsToRun.length);
    abortRef.cancelled = false;

    for (let i = 0; i < symsToRun.length; i++) {
      if (abortRef.cancelled) break;
      const sym = symsToRun[i];
      setCurrentSym(sym);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-stocks', { body: { syms: [sym] } });
        if (error) throw error;
        setAnalysisLog(prev => [...prev, data?.results?.[0] ?? `✓ ${sym}`]);
      } catch (e) {
        setAnalysisLog(prev => [...prev, `✗ ${sym}: ${e}`]);
      }
      setAnalysisProgress(i + 1);
      if (i < symsToRun.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
    }

    setCurrentSym(null);
    setAnalysisStatus(abortRef.cancelled ? 'idle' : 'done');
  };

  const stopAnalysis = () => { abortRef.cancelled = true; };

  const runCryptoAnalysis = async () => {
    const cryptosToRun = effectiveCryptos;
    if (cryptosToRun.length === 0) {
      setCryptoLog(['Aucun crypto favori trouvé.']);
      setCryptoStatus('done');
      return;
    }
    setCryptoStatus('running');
    setCryptoLog([]);
    setCryptoProgress(0);
    setCryptoTotal(cryptosToRun.length);
    cryptoAbortRef.cancelled = false;

    for (let i = 0; i < cryptosToRun.length; i++) {
      if (cryptoAbortRef.cancelled) break;
      const sym = cryptosToRun[i];
      setCurrentCrypto(sym);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-cryptos', { body: { syms: [sym] } });
        if (error) throw error;
        setCryptoLog(prev => [...prev, data?.results?.[0] ?? `✓ ${sym}`]);
      } catch (e) {
        setCryptoLog(prev => [...prev, `✗ ${sym}: ${e}`]);
      }
      setCryptoProgress(i + 1);
      if (i < cryptosToRun.length - 1) await new Promise(r => setTimeout(r, CRYPTO_DELAY_MS));
    }

    setCurrentCrypto(null);
    setCryptoStatus(cryptoAbortRef.cancelled ? 'idle' : 'done');
  };

  const stopCryptoAnalysis = () => { cryptoAbortRef.cancelled = true; };

  const refresh = useCallback(async () => {
    const list = await getUsers();
    setUsers(list);
  }, [getUsers]);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div style={{ background: '#080C10', minHeight: '100vh' }}>
      <DarkNav title="Administration" badge="Admin Panel" />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="font-mono-dm text-xs tracking-widest uppercase mb-1" style={{ color: '#9B7FE8' }}>
            PANNEAU D'ADMINISTRATION
          </p>
          <h1 className="font-cormorant text-4xl font-bold text-cream">Gestion des Utilisateurs</h1>
          <p className="font-sans-dm text-sm text-muted mt-1">Créez, modifiez et gérez les accès au portail Berdinvest.</p>
        </div>

        <StatsRow users={users} />
        <AddUserForm onUserAdded={() => { void refresh(); }} />
        <UserTable users={users} onEdit={u => setEditTarget(u)} onRefresh={() => { void refresh(); }} />
        <EditUserModal user={editTarget} allUsers={users} onClose={() => setEditTarget(null)} onSaved={() => { void refresh(); }} />

        {/* ── Mode toggle ── */}
        <div className="mt-10 rounded-xl border p-5" style={{ borderColor: 'rgba(155,127,232,0.2)', background: 'rgba(155,127,232,0.04)' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono-dm text-xs tracking-widest uppercase mb-1" style={{ color: '#9B7FE8' }}>MODE D'ANALYSE</p>
              <p className="font-sans-dm text-sm text-muted">
                {analysisMode === 'all'
                  ? `Tous les actifs analysés — ${ALL_STOCKS.length} stocks · ${ALL_CRYPTOS.length} cryptos`
                  : favsLoading
                    ? 'Chargement des favoris...'
                    : `${effectiveStocks.length} stock${effectiveStocks.length > 1 ? 's' : ''} favori${effectiveStocks.length > 1 ? 's' : ''} · ${effectiveCryptos.length} crypto${effectiveCryptos.length > 1 ? 's' : ''} favorite${effectiveCryptos.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgba(155,127,232,0.08)', border: '1px solid rgba(155,127,232,0.2)' }}>
              <button onClick={() => setMode('all')}
                className="px-4 py-2 rounded-md font-mono-dm text-xs font-medium tracking-wider transition-all"
                style={{ background: analysisMode === 'all' ? '#9B7FE8' : 'transparent', color: analysisMode === 'all' ? '#fff' : 'rgba(155,127,232,0.6)' }}>
                Tous
              </button>
              <button onClick={() => setMode('favorites')}
                className="px-4 py-2 rounded-md font-mono-dm text-xs font-medium tracking-wider transition-all"
                style={{ background: analysisMode === 'favorites' ? '#9B7FE8' : 'transparent', color: analysisMode === 'favorites' ? '#fff' : 'rgba(155,127,232,0.6)' }}>
                ★ Favoris uniquement
              </button>
            </div>
          </div>

          {/* Favorites preview */}
          {analysisMode === 'favorites' && !favsLoading && (
            <div className="mt-4 space-y-3">
              {/* Stock favs */}
              <div>
                <p className="font-mono-dm text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(200,169,110,0.6)' }}>
                  STOCKS ({effectiveStocks.length})
                </p>
                {effectiveStocks.length === 0 ? (
                  <p className="font-mono-dm text-xs" style={{ color: 'rgba(155,127,232,0.35)' }}>Aucun stock en favori</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {effectiveStocks.map(sym => (
                      <span key={sym} className="px-2.5 py-1 rounded-md font-mono-dm text-xs font-bold"
                        style={{ background: 'rgba(200,169,110,0.1)', color: '#C9A84C', border: '1px solid rgba(200,169,110,0.25)' }}>
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Crypto favs */}
              <div>
                <p className="font-mono-dm text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(45,212,191,0.6)' }}>
                  CRYPTOS ({effectiveCryptos.length})
                </p>
                {effectiveCryptos.length === 0 ? (
                  <p className="font-mono-dm text-xs" style={{ color: 'rgba(155,127,232,0.35)' }}>Aucune crypto en favori</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {effectiveCryptos.map(sym => (
                      <span key={sym} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono-dm text-xs font-bold"
                        style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}>
                        {CRYPTO_LOGO[sym] && (
                          <img src={CRYPTO_LOGO[sym]} alt={sym} className="w-4 h-4 rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Stocks analysis ── */}
        <div className="mt-4 rounded-xl border p-6" style={{ borderColor: 'rgba(200,169,110,0.15)', background: 'rgba(200,169,110,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono-dm text-xs tracking-widest uppercase mb-1" style={{ color: '#C9A84C' }}>
                ANALYSE IA — MARCHÉ ACTIONS
              </p>
              <p className="font-sans-dm text-sm text-muted">
                {effectiveStocks.length} stock{effectiveStocks.length > 1 ? 's' : ''} · ~{Math.round(effectiveStocks.length * DELAY_MS / 60000)} min estimées
              </p>
            </div>
            <div className="flex gap-2">
              {analysisStatus === 'running' && (
                <button onClick={stopAnalysis}
                  className="px-4 py-2.5 rounded-lg font-mono-dm text-xs font-medium tracking-wider transition-all"
                  style={{ background: 'transparent', color: '#8b1a1a', border: '1px solid #8b1a1a' }}>
                  ■ Arrêter
                </button>
              )}
              <button onClick={() => { void runAnalysis(); }} disabled={analysisStatus === 'running' || effectiveStocks.length === 0}
                className="px-5 py-2.5 rounded-lg font-mono-dm text-xs font-medium tracking-wider transition-all disabled:opacity-40"
                style={{ background: analysisStatus === 'running' ? 'transparent' : '#C9A84C', color: analysisStatus === 'running' ? '#C9A84C' : '#1A1A1A', border: '1px solid #C9A84C' }}>
                {analysisStatus === 'running' ? '⟳ En cours...' : '▶ Lancer l\'analyse'}
              </button>
            </div>
          </div>

          {(analysisStatus === 'running' || analysisStatus === 'done') && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-dm text-xs" style={{ color: '#C9A84C' }}>
                  {analysisStatus === 'running' ? `Analyse de ${currentSym ?? '...'}` : '✓ Terminé'}
                </span>
                <span className="font-mono-dm text-xs" style={{ color: '#8a6f2e' }}>
                  {analysisProgress}/{analysisTotal}
                  {analysisStatus === 'running' && analysisProgress < analysisTotal && (
                    <span style={{ color: 'rgba(138,111,46,0.6)' }}>
                      {' '}· ~{Math.round((analysisTotal - analysisProgress) * DELAY_MS / 60000)}m{Math.round(((analysisTotal - analysisProgress) * DELAY_MS % 60000) / 1000)}s restantes
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(200,169,110,0.15)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(analysisProgress / analysisTotal) * 100}%`, background: analysisStatus === 'done' ? '#1a6b3c' : '#C9A84C' }} />
              </div>
            </div>
          )}

          {analysisLog.length > 0 && (
            <div className="rounded-lg p-3 font-mono-dm text-xs space-y-0.5 max-h-48 overflow-y-auto" style={{ background: '#0D1117', border: '1px solid rgba(200,169,110,0.1)' }}>
              {analysisLog.map((line, i) => (
                <div key={i} style={{ color: line.startsWith('✓') ? '#1a6b3c' : line.startsWith('✗') ? '#8b1a1a' : '#C9A84C' }}>{line}</div>
              ))}
              {analysisStatus === 'done' && (
                <div className="pt-1 border-t" style={{ color: '#1a6b3c', borderColor: 'rgba(26,107,60,0.2)' }}>
                  — {analysisLog.filter(l => l.startsWith('✓')).length} analyses sauvegardées —
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Crypto analysis ── */}
        <div className="mt-6 rounded-xl border p-6" style={{ borderColor: 'rgba(45,212,191,0.15)', background: 'rgba(45,212,191,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono-dm text-xs tracking-widest uppercase mb-1" style={{ color: '#2DD4BF' }}>
                ANALYSE IA — MARCHÉ CRYPTO
              </p>
              <p className="font-sans-dm text-sm text-muted">
                {effectiveCryptos.length} crypto{effectiveCryptos.length > 1 ? 's' : ''} · ~{Math.round(effectiveCryptos.length * CRYPTO_DELAY_MS / 60000)} min estimées · Binance + CoinGecko
              </p>
            </div>
            <div className="flex gap-2">
              {cryptoStatus === 'running' && (
                <button onClick={stopCryptoAnalysis}
                  className="px-4 py-2.5 rounded-lg font-mono-dm text-xs font-medium tracking-wider transition-all"
                  style={{ background: 'transparent', color: '#7F1D1D', border: '1px solid #7F1D1D' }}>
                  ■ Arrêter
                </button>
              )}
              <button onClick={() => { void runCryptoAnalysis(); }} disabled={cryptoStatus === 'running' || effectiveCryptos.length === 0}
                className="px-5 py-2.5 rounded-lg font-mono-dm text-xs font-medium tracking-wider transition-all disabled:opacity-40"
                style={{ background: cryptoStatus === 'running' ? 'transparent' : '#2DD4BF', color: cryptoStatus === 'running' ? '#2DD4BF' : '#0D1520', border: '1px solid #2DD4BF' }}>
                {cryptoStatus === 'running' ? '⟳ En cours...' : '▶ Lancer l\'analyse crypto'}
              </button>
            </div>
          </div>

          {/* Crypto pills with logos (always visible) */}
          {effectiveCryptos.length > 0 && cryptoStatus === 'idle' && (
            <div className="flex flex-wrap gap-2 mb-4">
              {effectiveCryptos.map(sym => (
                <span key={sym} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono-dm text-xs font-bold"
                  style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)' }}>
                  {CRYPTO_LOGO[sym] && (
                    <img src={CRYPTO_LOGO[sym]} alt={sym} className="w-4 h-4 rounded-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  {sym}
                </span>
              ))}
            </div>
          )}

          {(cryptoStatus === 'running' || cryptoStatus === 'done') && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-dm text-xs" style={{ color: '#2DD4BF' }}>
                  {cryptoStatus === 'running' ? `Analyse de ${currentCrypto ?? '...'}` : '✓ Terminé'}
                </span>
                <span className="font-mono-dm text-xs" style={{ color: '#0E7490' }}>
                  {cryptoProgress}/{cryptoTotal}
                  {cryptoStatus === 'running' && cryptoProgress < cryptoTotal && (
                    <span style={{ color: 'rgba(14,116,144,0.6)' }}>
                      {' '}· ~{Math.round((cryptoTotal - cryptoProgress) * CRYPTO_DELAY_MS / 60000)}m{Math.round(((cryptoTotal - cryptoProgress) * CRYPTO_DELAY_MS % 60000) / 1000)}s restantes
                    </span>
                  )}
                </span>
              </div>
              {/* Pills avec état pendant l'analyse */}
              <div className="flex flex-wrap gap-2">
                {effectiveCryptos.map((sym, idx) => {
                  const done = idx < cryptoProgress;
                  const active = cryptoStatus === 'running' && sym === currentCrypto;
                  const hasError = cryptoLog[idx]?.startsWith('✗');
                  return (
                    <span key={sym} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono-dm text-xs font-bold transition-all"
                      style={{
                        background: active ? 'rgba(45,212,191,0.2)' : done ? (hasError ? 'rgba(127,29,29,0.15)' : 'rgba(6,95,70,0.15)') : 'rgba(45,212,191,0.05)',
                        color: active ? '#2DD4BF' : done ? (hasError ? '#7F1D1D' : '#065F46') : 'rgba(45,212,191,0.35)',
                        border: `1px solid ${active ? '#2DD4BF60' : done ? (hasError ? '#7F1D1D40' : '#065F4640') : 'rgba(45,212,191,0.1)'}`,
                      }}>
                      {CRYPTO_LOGO[sym] && (
                        <img src={CRYPTO_LOGO[sym]} alt={sym} className="w-4 h-4 rounded-full"
                          style={{ opacity: done || active ? 1 : 0.3 }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                      {active ? <span className="animate-pulse">⟳</span> : done ? (hasError ? '✗' : '✓') : ''} {sym}
                    </span>
                  );
                })}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(45,212,191,0.15)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(cryptoProgress / cryptoTotal) * 100}%`, background: cryptoStatus === 'done' ? '#065F46' : '#2DD4BF' }} />
              </div>
            </div>
          )}

          {cryptoLog.length > 0 && (
            <div className="rounded-lg p-3 font-mono-dm text-xs space-y-0.5 max-h-32 overflow-y-auto" style={{ background: '#0D1117', border: '1px solid rgba(45,212,191,0.1)' }}>
              {cryptoLog.map((line, i) => (
                <div key={i} style={{ color: line.startsWith('✓') ? '#065F46' : line.startsWith('✗') ? '#7F1D1D' : '#2DD4BF' }}>{line}</div>
              ))}
              {cryptoStatus === 'done' && (
                <div className="pt-1 border-t" style={{ color: '#065F46', borderColor: 'rgba(6,95,70,0.2)' }}>
                  — {cryptoLog.filter(l => l.startsWith('✓')).length} analyses sauvegardées —
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-4">
        <PerformancePanel />
      </div>

      <footer className="border-t mt-10" style={{ borderColor: 'rgba(200,169,110,0.1)' }}>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="font-sans-dm text-xs text-muted text-center">Berdinvest — Administration · Accès restreint</p>
        </div>
      </footer>
    </div>
  );
}

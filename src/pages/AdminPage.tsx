import { useState, useCallback, useEffect } from 'react';
import DarkNav from '../components/layout/DarkNav.tsx';
import StatsRow from '../components/admin/StatsRow.tsx';
import AddUserForm from '../components/admin/AddUserForm.tsx';
import UserTable from '../components/admin/UserTable.tsx';
import EditUserModal from '../components/admin/EditUserModal.tsx';
import { useAuth } from '../auth/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import type { User } from '../types/auth.ts';

const ALL_STOCKS = [
  'NVDA','MSFT','AAPL','GOOGL','AMZN','META','TSLA','AVGO','ORCL','ADBE',
  'CRM','AMD','QCOM','V','MA','AXP','JPM','BAC','GS','WFC',
  'BLK','UNH','LLY','JNJ','ABBV','MRK','TMO','COST','WMT','MCD',
  'SBUX','NKE','KO','PEP','PG','PM','XOM','CVX','CAT','HON','GE',
];
const DELAY_MS = 3500; // 2 Finnhub calls/stock → ~34 req/min, sous la limite 60

type AnalysisStatus = 'idle' | 'running' | 'done' | 'error';

export default function AdminPage() {
  const { getUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentSym, setCurrentSym] = useState<string | null>(null);
  const abortRef = useState({ cancelled: false })[0];

  const runAnalysis = async () => {
    setAnalysisStatus('running');
    setAnalysisLog([]);
    setAnalysisProgress(0);
    abortRef.cancelled = false;

    for (let i = 0; i < ALL_STOCKS.length; i++) {
      if (abortRef.cancelled) break;
      const sym = ALL_STOCKS[i];
      setCurrentSym(sym);

      try {
        const { data, error } = await supabase.functions.invoke('analyze-stocks', { body: { syms: [sym] } });
        if (error) throw error;
        const result = data?.results?.[0] ?? `✓ ${sym}`;
        setAnalysisLog(prev => [...prev, result]);
      } catch (e) {
        setAnalysisLog(prev => [...prev, `✗ ${sym}: ${e}`]);
      }

      setAnalysisProgress(i + 1);
      if (i < ALL_STOCKS.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
    }

    setCurrentSym(null);
    setAnalysisStatus(abortRef.cancelled ? 'idle' : 'done');
  };

  const stopAnalysis = () => { abortRef.cancelled = true; };

  const refresh = useCallback(async () => {
    const list = await getUsers();
    setUsers(list);
  }, [getUsers]);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div style={{ background: '#080C10', minHeight: '100vh' }}>
      <DarkNav title="Administration" badge="Admin Panel" />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <p className="font-mono-dm text-xs tracking-widest uppercase mb-1" style={{ color: '#9B7FE8' }}>
            PANNEAU D'ADMINISTRATION
          </p>
          <h1 className="font-cormorant text-4xl font-bold text-cream">
            Gestion des Utilisateurs
          </h1>
          <p className="font-sans-dm text-sm text-muted mt-1">
            Créez, modifiez et gérez les accès au portail Berdinvest.
          </p>
        </div>

        {/* Stats row */}
        <StatsRow users={users} />

        {/* Add user form */}
        <AddUserForm onUserAdded={() => { void refresh(); }} />

        {/* User table */}
        <UserTable
          users={users}
          onEdit={(user) => setEditTarget(user)}
          onRefresh={() => { void refresh(); }}
        />

        {/* Edit modal */}
        <EditUserModal
          user={editTarget}
          allUsers={users}
          onClose={() => setEditTarget(null)}
          onSaved={() => { void refresh(); }}
        />

        {/* AI Analysis trigger */}
        <div className="mt-10 rounded-xl border p-6" style={{ borderColor: 'rgba(200,169,110,0.15)', background: 'rgba(200,169,110,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono-dm text-xs tracking-widest uppercase mb-1" style={{ color: '#C9A84C' }}>
                ANALYSE IA — MARCHÉ ACTIONS
              </p>
              <p className="font-sans-dm text-sm text-muted">
                Analyse Groq sur {ALL_STOCKS.length} stocks · ~{Math.round(ALL_STOCKS.length * DELAY_MS / 60000)} min estimées
              </p>
            </div>
            <div className="flex gap-2">
              {analysisStatus === 'running' && (
                <button
                  onClick={stopAnalysis}
                  className="px-4 py-2.5 rounded-lg font-mono-dm text-xs font-medium tracking-wider transition-all"
                  style={{ background: 'transparent', color: '#8b1a1a', border: '1px solid #8b1a1a' }}
                >
                  ■ Arrêter
                </button>
              )}
              <button
                onClick={() => { void runAnalysis(); }}
                disabled={analysisStatus === 'running'}
                className="px-5 py-2.5 rounded-lg font-mono-dm text-xs font-medium tracking-wider transition-all disabled:opacity-40"
                style={{
                  background: analysisStatus === 'running' ? 'transparent' : '#C9A84C',
                  color: analysisStatus === 'running' ? '#C9A84C' : '#1A1A1A',
                  border: '1px solid #C9A84C',
                }}
              >
                {analysisStatus === 'running' ? '⟳ En cours...' : '▶ Lancer l\'analyse'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {(analysisStatus === 'running' || analysisStatus === 'done') && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-dm text-xs" style={{ color: '#C9A84C' }}>
                  {analysisStatus === 'running' ? `Analyse de ${currentSym ?? '...'}` : '✓ Terminé'}
                </span>
                <span className="font-mono-dm text-xs" style={{ color: '#8a6f2e' }}>
                  {analysisProgress}/{ALL_STOCKS.length}
                  {analysisStatus === 'running' && analysisProgress < ALL_STOCKS.length && (
                    <span style={{ color: 'rgba(138,111,46,0.6)' }}>
                      {' '}· ~{Math.round((ALL_STOCKS.length - analysisProgress) * DELAY_MS / 60000)}m{Math.round(((ALL_STOCKS.length - analysisProgress) * DELAY_MS % 60000) / 1000)}s restantes
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(200,169,110,0.15)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(analysisProgress / ALL_STOCKS.length) * 100}%`,
                    background: analysisStatus === 'done' ? '#1a6b3c' : '#C9A84C',
                  }}
                />
              </div>
            </div>
          )}

          {/* Log */}
          {analysisLog.length > 0 && (
            <div className="rounded-lg p-3 font-mono-dm text-xs space-y-0.5 max-h-48 overflow-y-auto" style={{ background: '#0D1117', border: '1px solid rgba(200,169,110,0.1)' }}>
              {analysisLog.map((line, i) => (
                <div key={i} style={{ color: line.startsWith('✓') ? '#1a6b3c' : line.startsWith('✗') ? '#8b1a1a' : '#C9A84C' }}>
                  {line}
                </div>
              ))}
              {analysisStatus === 'done' && (
                <div className="pt-1 border-t" style={{ color: '#1a6b3c', borderColor: 'rgba(26,107,60,0.2)' }}>
                  — {analysisLog.filter(l => l.startsWith('✓')).length} analyses sauvegardées —
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t mt-10" style={{ borderColor: 'rgba(200,169,110,0.1)' }}>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="font-sans-dm text-xs text-muted text-center">
            Berdinvest — Administration · Accès restreint
          </p>
        </div>
      </footer>
    </div>
  );
}

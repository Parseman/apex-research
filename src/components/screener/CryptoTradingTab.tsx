import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase.ts';
import { useAuth } from '../../auth/AuthContext.tsx';
import { CRYPTOS } from '../../data/cryptos.ts';

const TV_INTERVALS = [
  { label: '15m', tv: '15' },
  { label: '1h',  tv: '60' },
  { label: '4h',  tv: '240' },
  { label: '1J',  tv: 'D' },
];

const SIGNAL_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  BUY:  { bg: '#065F4615', color: '#065F46', border: '#065F4640' },
  SELL: { bg: '#7F1D1D15', color: '#7F1D1D', border: '#7F1D1D40' },
  WAIT: { bg: '#78350F15', color: '#78350F', border: '#78350F40' },
};

function Confidence({ n }: { n: number }) {
  const v = Math.min(5, Math.max(0, Math.round(n)));
  return (
    <span className="font-plex-mono text-sm" style={{ color: '#2DD4BF' }}>
      {'★'.repeat(v)}{'☆'.repeat(5 - v)}
    </span>
  );
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published_on: number;
  imageurl?: string;
  body?: string;
}

interface ShortAnalysis {
  signal: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  timeframe: string;
  entry_min: number;
  entry_max: number;
  target: number;
  stop_loss: number;
  risk_reward: string;
  trend: string;
  momentum: string;
  summary: string;
  catalysts: string[];
  risks: string[];
  support: number;
  resistance: number;
  invalidation: string;
}

interface AnalysisResult {
  sym: string;
  price: number;
  chg24h: number;
  analysis: ShortAnalysis;
  generatedAt: string;
}

function TradingViewChart({ sym, interval }: { sym: string; interval: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.cssText = 'height:100%;width:100%;';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.text = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${sym}USDT`,
      interval,
      timezone: 'Europe/Paris',
      theme: 'dark',
      style: '1',
      locale: 'fr',
      backgroundColor: '#0D1520',
      gridColor: 'rgba(45,212,191,0.06)',
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });
    container.appendChild(script);

    return () => { container.innerHTML = ''; };
  }, [sym, interval]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: '460px', width: '100%' }}
    />
  );
}

export default function CryptoTradingTab() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [selectedSym, setSelectedSym] = useState('BTC');
  const [tvInterval, setTvInterval] = useState('240');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (sym: string) => {
    setNewsLoading(true);
    setNews([]);
    try {
      const res = await fetch(
        `https://min-api.cryptocompare.com/data/v2/news/?categories=${sym}&lang=EN&sortOrder=latest&limit=8`
      );
      const data = await res.json();
      setNews(Array.isArray(data.Data) ? data.Data : []);
    } catch { /* silently fail */ }
    setNewsLoading(false);
  }, []);

  useEffect(() => {
    void fetchNews(selectedSym);
    setResult(null);
    setError(null);
  }, [selectedSym, fetchNews]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-crypto-trading', {
        body: { sym: selectedSym },
      });
      if (fnError) throw fnError;
      setResult(data as AnalysisResult);
    } catch (e) {
      setError(`Erreur : ${e instanceof Error ? e.message : String(e)}`);
    }
    setLoading(false);
  };

  const fmtPrice = (n: number) => n >= 1
    ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    : `$${n.toFixed(6)}`;

  const a = result?.analysis;
  const signal = a?.signal ?? 'WAIT';
  const sigStyle = SIGNAL_STYLE[signal] ?? SIGNAL_STYLE.WAIT;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Crypto selector */}
        <select
          value={selectedSym}
          onChange={e => setSelectedSym(e.target.value)}
          className="px-3 py-2 rounded-lg border font-plex-mono text-sm outline-none"
          style={{ background: '#0D1520', borderColor: '#2DD4BF40', color: '#2DD4BF' }}
        >
          {CRYPTOS.map(c => (
            <option key={c.sym} value={c.sym}>{c.sym} — {c.name}</option>
          ))}
        </select>

        {/* Interval selector */}
        <div className="flex gap-1 rounded-lg p-1" style={{ background: '#0D1520', border: '1px solid rgba(45,212,191,0.2)' }}>
          {TV_INTERVALS.map(iv => (
            <button
              key={iv.tv}
              onClick={() => setTvInterval(iv.tv)}
              className="px-3 py-1.5 rounded-md font-plex-mono text-xs font-medium transition-all"
              style={{
                background: tvInterval === iv.tv ? '#2DD4BF' : 'transparent',
                color: tvInterval === iv.tv ? '#0D1520' : 'rgba(45,212,191,0.6)',
              }}
            >
              {iv.label}
            </button>
          ))}
        </div>

        {/* Analyse button — admin only */}
        {isAdmin ? (
          <button
            onClick={() => void runAnalysis()}
            disabled={loading}
            className="ml-auto px-5 py-2 rounded-lg font-plex-mono text-xs font-bold tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: loading ? 'transparent' : '#2DD4BF', color: loading ? '#2DD4BF' : '#0D1520', border: '1px solid #2DD4BF' }}
          >
            {loading ? (
              <><span className="animate-spin inline-block">⟳</span> Analyse en cours...</>
            ) : (
              <>⚡ Analyser {selectedSym}</>
            )}
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-plex-mono text-xs"
            style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', color: 'rgba(45,212,191,0.4)' }}>
            🔒 Analyse réservée aux admins
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg px-4 py-3 font-plex-sans text-xs" style={{ background: '#7F1D1D15', border: '1px solid #7F1D1D40', color: '#7F1D1D' }}>
          {error}
        </div>
      )}

      {/* Main grid: chart + analysis */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Chart (left, wider) */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(45,212,191,0.2)' }}>
          <TradingViewChart sym={selectedSym} interval={tvInterval} />
        </div>

        {/* Analysis card (right) */}
        <div className="lg:col-span-2 space-y-3">
          {!result && !loading && (
            <div className="rounded-xl p-6 flex flex-col items-center justify-center text-center h-full" style={{ background: '#0D1520', border: '1px solid rgba(45,212,191,0.15)', minHeight: '200px' }}>
              <p className="font-plex-mono text-xs mb-2" style={{ color: 'rgba(45,212,191,0.5)' }}>ANALYSE COURT TERME</p>
              {isAdmin ? (
                <p className="font-plex-sans text-sm" style={{ color: 'rgba(45,212,191,0.4)' }}>
                  Clique sur <strong style={{ color: '#2DD4BF' }}>⚡ Analyser</strong> pour générer<br />un setup de trading 1–8 semaines.
                </p>
              ) : (
                <p className="font-plex-sans text-sm" style={{ color: 'rgba(45,212,191,0.35)' }}>
                  🔒 L'analyse IA court terme<br />est réservée aux administrateurs.
                </p>
              )}
            </div>
          )}

          {loading && (
            <div className="rounded-xl p-6 flex flex-col items-center justify-center text-center h-full" style={{ background: '#0D1520', border: '1px solid rgba(45,212,191,0.15)', minHeight: '200px' }}>
              <span className="text-2xl animate-spin inline-block mb-3">⟳</span>
              <p className="font-plex-mono text-xs" style={{ color: '#2DD4BF' }}>Analyse des données Binance + IA...</p>
            </div>
          )}

          {result && a && (
            <>
              {/* Signal header */}
              <div className="rounded-xl p-4" style={{ background: '#0D1520', border: '1px solid rgba(45,212,191,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-4 py-1.5 rounded-full font-plex-mono font-bold text-sm tracking-widest"
                      style={{ background: sigStyle.bg, color: sigStyle.color, border: `1px solid ${sigStyle.border}` }}
                    >
                      {signal}
                    </span>
                    <Confidence n={a.confidence} />
                  </div>
                  <span className="font-plex-mono text-[10px]" style={{ color: 'rgba(45,212,191,0.4)' }}>
                    {new Date(result.generatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex gap-2 text-[10px] font-plex-mono mb-3">
                  <span className="px-2 py-1 rounded" style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF' }}>
                    ⏱ {a.timeframe}
                  </span>
                  <span className="px-2 py-1 rounded" style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF' }}>
                    R/R {a.risk_reward}
                  </span>
                  <span className="px-2 py-1 rounded" style={{ background: 'rgba(45,212,191,0.08)', color: '#2DD4BF' }}>
                    {a.trend} · {a.momentum}
                  </span>
                </div>

                <p className="font-plex-sans text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {a.summary}
                </p>
              </div>

              {/* Levels */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3" style={{ background: '#065F4612', border: '1px solid #065F4630' }}>
                  <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#065F46' }}>Zone d'entrée</div>
                  <div className="font-plex-mono text-xs font-bold" style={{ color: '#065F46' }}>
                    {fmtPrice(a.entry_min)} – {fmtPrice(a.entry_max)}
                  </div>
                </div>
                <div className="rounded-lg p-3" style={{ background: '#065F4612', border: '1px solid #065F4630' }}>
                  <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#065F46' }}>Objectif</div>
                  <div className="font-plex-mono text-xs font-bold" style={{ color: '#065F46' }}>{fmtPrice(a.target)}</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: '#7F1D1D12', border: '1px solid #7F1D1D30' }}>
                  <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#7F1D1D' }}>Stop Loss</div>
                  <div className="font-plex-mono text-xs font-bold" style={{ color: '#7F1D1D' }}>{fmtPrice(a.stop_loss)}</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)' }}>
                  <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#0E7490' }}>Support / Résist.</div>
                  <div className="font-plex-mono text-[10px] font-bold" style={{ color: '#2DD4BF' }}>
                    {fmtPrice(a.support)} / {fmtPrice(a.resistance)}
                  </div>
                </div>
              </div>

              {/* Catalysts + Risks */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-3" style={{ background: '#065F4608', border: '1px solid #065F4620' }}>
                  <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: '#065F46' }}>Catalyseurs</div>
                  <ul className="space-y-1">
                    {(a.catalysts ?? []).map((c, i) => (
                      <li key={i} className="font-plex-sans text-[10px] leading-snug flex gap-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        <span style={{ color: '#065F46' }}>↑</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg p-3" style={{ background: '#7F1D1D08', border: '1px solid #7F1D1D20' }}>
                  <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: '#7F1D1D' }}>Risques</div>
                  <ul className="space-y-1">
                    {(a.risks ?? []).map((r, i) => (
                      <li key={i} className="font-plex-sans text-[10px] leading-snug flex gap-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        <span style={{ color: '#7F1D1D' }}>↓</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Invalidation */}
              <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(127,29,29,0.06)', border: '1px solid rgba(127,29,29,0.2)' }}>
                <div className="font-plex-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: '#7F1D1D' }}>Invalidation du setup</div>
                <p className="font-plex-sans text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{a.invalidation}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* News section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-plex-mono text-xs tracking-widest uppercase" style={{ color: '#0E7490' }}>
            ACTUALITÉS — {selectedSym}
          </h3>
          {newsLoading && <span className="font-plex-mono text-[10px] animate-pulse" style={{ color: '#2DD4BF' }}>chargement...</span>}
        </div>

        {news.length === 0 && !newsLoading && (
          <p className="font-plex-sans text-xs" style={{ color: 'rgba(45,212,191,0.4)' }}>Aucune actualité disponible.</p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          {news.map(item => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg p-3 transition-all hover:brightness-110"
              style={{ background: '#0D1520', border: '1px solid rgba(45,212,191,0.12)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-plex-mono text-[9px] tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}>
                  {item.source}
                </span>
                <span className="font-plex-mono text-[9px]" style={{ color: 'rgba(45,212,191,0.3)' }}>
                  {new Date(item.published_on * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="font-plex-sans text-xs font-medium leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {item.title}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(127,29,29,0.08)', border: '1px solid rgba(127,29,29,0.2)' }}>
        <p className="font-plex-sans text-[10px] leading-relaxed" style={{ color: 'rgba(200,100,100,0.8)' }}>
          <strong>⚠️ DISCLAIMER :</strong> Les analyses générées par IA sont fournies à titre informatif uniquement.
          Le trading crypto court terme comporte des risques élevés. Ne jamais investir plus que ce que vous êtes prêt à perdre.
          Cette analyse ne constitue pas un conseil financier.
        </p>
      </div>
    </div>
  );
}

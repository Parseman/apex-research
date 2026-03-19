import { memo } from 'react';
import type { StockMeta } from '../../data/stocks.ts';
import { fmtPrice, fmtChg } from '../../api/api.ts';

interface StockCardProps {
  sym: string;
  meta: StockMeta;
  price: number | null;
  chg: number | null;
}

const StockCard = memo(function StockCard({ sym, meta, price, chg }: StockCardProps) {
  const isUp = (chg ?? 0) >= 0;

  const riskColor = meta.riskClass === 'risk-low'
    ? { bg: '#e8f5ee', text: '#1a6b3c' }
    : meta.riskClass === 'risk-mid'
    ? { bg: '#fff3d6', text: '#7a4f00' }
    : { bg: '#f5e8e8', text: '#8b1a1a' };

  const deColor = meta.deClass === 'pos'
    ? '#1a6b3c'
    : meta.deClass === 'neg'
    ? '#8b1a1a'
    : '#7a4f00';

  return (
    <div
      className="rounded-lg border overflow-hidden flex flex-col"
      style={{ background: '#F5F0E8', borderColor: '#D4C9A8' }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ background: '#1A1A1A' }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <span className="font-plex-mono font-bold text-sm" style={{ color: '#E8C97A' }}>
              {sym}
            </span>
            <span className="ml-2 text-xs font-plex-sans" style={{ color: '#9ca3af' }}>
              {meta.sector}
            </span>
          </div>
          <div className="text-right">
            <div className="font-plex-mono text-sm font-medium text-white">
              {price != null ? fmtPrice(price) : '—'}
            </div>
            <div className={`font-plex-mono text-xs`} style={{ color: isUp ? '#4ECB71' : '#E05C5C' }}>
              {chg != null ? fmtChg(chg) : '—'}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-plex-sans" style={{ color: '#9ca3af' }}>
            {meta.name}
          </p>
          <span className="text-xs" style={{ color: '#C9A84C' }}>
            {meta.rating}
          </span>
        </div>
      </div>

      {/* Metrics row */}
      <div
        className="grid grid-cols-4 border-b"
        style={{ borderColor: '#D4C9A8', background: '#EDE7D9' }}
      >
        {[
          { l: 'P/E', v: meta.pe },
          { l: 'P/E Sect', v: meta.peSect },
          { l: 'D/E', v: meta.de, c: deColor },
          { l: 'Div', v: meta.div },
        ].map((m) => (
          <div key={m.l} className="px-3 py-2 border-r last:border-r-0" style={{ borderColor: '#D4C9A8' }}>
            <div className="text-[9px] font-plex-mono uppercase tracking-wide mb-0.5" style={{ color: '#5a5040' }}>
              {m.l}
            </div>
            <div className="text-xs font-plex-mono font-medium" style={{ color: m.c ?? '#1A1A1A' }}>
              {m.v}
            </div>
          </div>
        ))}
      </div>

      {/* Target boxes */}
      <div className="grid grid-cols-2 gap-3 p-3 border-b" style={{ borderColor: '#D4C9A8' }}>
        <div className="rounded p-2.5" style={{ background: '#e8f5ee' }}>
          <div className="text-[9px] font-plex-mono uppercase mb-1" style={{ color: '#5a5040' }}>
            Bull Target
          </div>
          <div className="text-sm font-plex-mono font-bold" style={{ color: '#1a6b3c' }}>
            {meta.bull}
          </div>
        </div>
        <div className="rounded p-2.5" style={{ background: '#f5e8e8' }}>
          <div className="text-[9px] font-plex-mono uppercase mb-1" style={{ color: '#5a5040' }}>
            Bear Target
          </div>
          <div className="text-sm font-plex-mono font-bold" style={{ color: '#8b1a1a' }}>
            {meta.bear}
          </div>
        </div>
      </div>

      {/* Entry / Stop */}
      <div className="grid grid-cols-2 gap-3 px-3 py-2 border-b" style={{ borderColor: '#D4C9A8', background: '#EDE7D9' }}>
        <div>
          <div className="text-[9px] font-plex-mono uppercase mb-0.5" style={{ color: '#5a5040' }}>Zone d'entrée</div>
          <div className="text-xs font-plex-mono" style={{ color: '#1A1A1A' }}>{meta.entry}</div>
        </div>
        <div>
          <div className="text-[9px] font-plex-mono uppercase mb-0.5" style={{ color: '#5a5040' }}>Stop-Loss</div>
          <div className="text-xs font-plex-mono" style={{ color: '#8b1a1a' }}>{meta.stopLoss}</div>
        </div>
      </div>

      {/* Bull/Bear cases */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="rounded p-2.5" style={{ background: '#e8f5ee' }}>
          <div className="text-[9px] font-plex-mono font-bold uppercase mb-1" style={{ color: '#1a6b3c' }}>
            BULL CASE
          </div>
          <p className="text-xs font-plex-sans leading-relaxed" style={{ color: '#1a6b3c' }}>
            {meta.bullCase}
          </p>
        </div>
        <div className="rounded p-2.5" style={{ background: '#f5e8e8' }}>
          <div className="text-[9px] font-plex-mono font-bold uppercase mb-1" style={{ color: '#8b1a1a' }}>
            BEAR CASE
          </div>
          <p className="text-xs font-plex-sans leading-relaxed" style={{ color: '#8b1a1a' }}>
            {meta.bearCase}
          </p>
        </div>
      </div>

      {/* Moat + Risk */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: '#D4C9A8', background: '#EDE7D9' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-plex-mono uppercase" style={{ color: '#5a5040' }}>Moat:</span>
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-plex-mono"
            style={{ background: '#C9A84C20', color: '#8a6f2e' }}
          >
            {meta.moatLabel}
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded"
          style={{ background: riskColor.bg }}
        >
          <span className="text-[9px] font-plex-mono uppercase" style={{ color: riskColor.text }}>
            Risque {meta.risk}/10
          </span>
        </div>
      </div>
    </div>
  );
});

export default StockCard;

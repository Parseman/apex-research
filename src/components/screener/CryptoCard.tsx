import { memo } from 'react';
import type { CryptoAsset } from '../../data/cryptos.ts';
import { fmtPrice, fmtChg, fmtMcap } from '../../api/api.ts';

interface CryptoCardProps {
  asset: CryptoAsset;
  price: number | null;
  chg: number | null;
  mcap: number | null;
}

const CryptoCard = memo(function CryptoCard({ asset, price, chg, mcap }: CryptoCardProps) {
  const isUp = (chg ?? 0) >= 0;

  let riskColor = { bg: '#D1FAE5', text: '#065F46' };
  if (asset.riskClass === 'risk-high') riskColor = { bg: '#FEF3C7', text: '#78350F' };
  if (asset.riskClass === 'risk-vhigh') riskColor = { bg: '#FEE2E2', text: '#7F1D1D' };

  return (
    <div
      className="rounded-lg border overflow-hidden flex flex-col"
      style={{ background: '#E8F4F8', borderColor: '#B0D4E0' }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ background: '#0D1520' }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <span className="font-plex-mono font-bold text-sm" style={{ color: '#67E8F9' }}>
              {asset.sym}
            </span>
            {asset.speculative && (
              <span
                className="ml-2 text-[9px] font-plex-mono px-1.5 py-0.5 rounded"
                style={{ background: '#4C1D9540', color: '#a78bfa' }}
              >
                SPÉCULATIF
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="font-plex-mono text-sm font-medium text-white">
              {price != null ? fmtPrice(price) : '—'}
            </div>
            <div className="font-plex-mono text-xs" style={{ color: isUp ? '#4ECB71' : '#E05C5C' }}>
              {chg != null ? fmtChg(chg) : '—'}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-plex-sans" style={{ color: '#9ca3af' }}>
            {asset.name} · {asset.cat}
          </p>
          <span className="text-xs" style={{ color: '#2DD4BF' }}>
            {asset.rating}
          </span>
        </div>
      </div>

      {/* Market cap */}
      {mcap != null && (
        <div
          className="px-4 py-1.5 flex items-center gap-2 border-b"
          style={{ borderColor: '#B0D4E0', background: '#D8EDF4' }}
        >
          <span className="text-[9px] font-plex-mono uppercase" style={{ color: '#2A6070' }}>
            Market Cap:
          </span>
          <span className="text-xs font-plex-mono font-medium" style={{ color: '#0D1520' }}>
            {fmtMcap(mcap)}
          </span>
        </div>
      )}

      {/* Metrics */}
      <div
        className="grid grid-cols-3 border-b"
        style={{ borderColor: '#B0D4E0', background: '#D8EDF4' }}
      >
        {[
          { l: asset.metric1L, v: asset.metric1V },
          { l: asset.metric2L, v: asset.metric2V },
          { l: asset.metric3L, v: asset.metric3V },
        ].map((m) => (
          <div key={m.l} className="px-2.5 py-2 border-r last:border-r-0" style={{ borderColor: '#B0D4E0' }}>
            <div className="text-[9px] font-plex-mono uppercase tracking-wide mb-0.5" style={{ color: '#2A6070' }}>
              {m.l}
            </div>
            <div className="text-xs font-plex-mono font-medium" style={{ color: '#0D1520' }}>
              {m.v}
            </div>
          </div>
        ))}
      </div>

      {/* Target boxes */}
      <div className="grid grid-cols-2 gap-3 p-3 border-b" style={{ borderColor: '#B0D4E0' }}>
        <div className="rounded p-2.5" style={{ background: '#D1FAE5' }}>
          <div className="text-[9px] font-plex-mono uppercase mb-1" style={{ color: '#2A6070' }}>
            Bull Target
          </div>
          <div className="text-sm font-plex-mono font-bold" style={{ color: '#065F46' }}>
            {asset.bull}
          </div>
        </div>
        <div className="rounded p-2.5" style={{ background: '#FEE2E2' }}>
          <div className="text-[9px] font-plex-mono uppercase mb-1" style={{ color: '#2A6070' }}>
            Bear Target
          </div>
          <div className="text-sm font-plex-mono font-bold" style={{ color: '#7F1D1D' }}>
            {asset.bear}
          </div>
        </div>
      </div>

      {/* Entry / Stop */}
      <div className="grid grid-cols-2 gap-3 px-3 py-2 border-b" style={{ borderColor: '#B0D4E0', background: '#D8EDF4' }}>
        <div>
          <div className="text-[9px] font-plex-mono uppercase mb-0.5" style={{ color: '#2A6070' }}>Zone d'entrée</div>
          <div className="text-xs font-plex-mono" style={{ color: '#0D1520' }}>{asset.entry}</div>
        </div>
        <div>
          <div className="text-[9px] font-plex-mono uppercase mb-0.5" style={{ color: '#2A6070' }}>Stop-Loss</div>
          <div className="text-xs font-plex-mono" style={{ color: '#7F1D1D' }}>{asset.stopLoss}</div>
        </div>
      </div>

      {/* Bull/Bear cases */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="rounded p-2.5" style={{ background: '#D1FAE5' }}>
          <div className="text-[9px] font-plex-mono font-bold uppercase mb-1" style={{ color: '#065F46' }}>
            BULL CASE
          </div>
          <p className="text-xs font-plex-sans leading-relaxed" style={{ color: '#065F46' }}>
            {asset.bullCase}
          </p>
        </div>
        <div className="rounded p-2.5" style={{ background: '#FEE2E2' }}>
          <div className="text-[9px] font-plex-mono font-bold uppercase mb-1" style={{ color: '#7F1D1D' }}>
            BEAR CASE
          </div>
          <p className="text-xs font-plex-sans leading-relaxed" style={{ color: '#7F1D1D' }}>
            {asset.bearCase}
          </p>
        </div>
      </div>

      {/* Moat + Risk */}
      <div
        className="flex items-center justify-between px-3 py-2 border-t"
        style={{ borderColor: '#B0D4E0', background: '#D8EDF4' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-plex-mono uppercase" style={{ color: '#2A6070' }}>Moat:</span>
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-plex-mono"
            style={{ background: '#2DD4BF20', color: '#0E7490' }}
          >
            {asset.moatLbl}
          </span>
        </div>
        <div
          className="px-2 py-1 rounded"
          style={{ background: riskColor.bg }}
        >
          <span className="text-[9px] font-plex-mono uppercase" style={{ color: riskColor.text }}>
            Risque {asset.risk}/10
          </span>
        </div>
      </div>
    </div>
  );
});

export default CryptoCard;

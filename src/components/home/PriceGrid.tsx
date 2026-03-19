import { fmtPrice, fmtChg } from '../../api/api.ts';
import type { LivePrice } from '../../types/market.ts';

interface PriceGridProps {
  prices: LivePrice[];
}

export default function PriceGrid({ prices }: PriceGridProps) {
  if (prices.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <h2 className="font-cormorant text-2xl text-cream font-semibold mb-6">
        Cours en temps réel
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {prices.map((item) => {
          const isUp = (item.chg ?? 0) >= 0;
          const isCrypto = item.type === 'crypto';
          return (
            <div
              key={item.symbol}
              className="rounded-lg p-4 border transition-colors hover:border-gold/30"
              style={{
                background: 'rgba(13,17,23,0.8)',
                borderColor: 'rgba(200,169,110,0.15)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-dm text-xs text-gold">{item.symbol}</span>
                {isCrypto ? (
                  <span className="text-[9px] font-mono-dm px-1 rounded bg-portal-cyan/10 text-portal-cyan">
                    CRYPTO
                  </span>
                ) : (
                  <span className="text-[9px] font-mono-dm px-1 rounded bg-gold/10 text-gold">
                    STOCK
                  </span>
                )}
              </div>
              <div className="font-mono-dm text-sm text-cream mb-0.5">
                {item.price != null ? fmtPrice(item.price) : '—'}
              </div>
              <div className={`font-mono-dm text-xs ${isUp ? 'text-up' : 'text-down'}`}>
                {item.chg != null ? fmtChg(item.chg) : '—'}
              </div>
              <div className="text-muted font-sans-dm text-[10px] mt-1 truncate">
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

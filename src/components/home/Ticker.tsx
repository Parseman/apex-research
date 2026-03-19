import { useEffect, useState } from 'react';
import { fmtPrice, fmtChg } from '../../api/api.ts';

interface TickerItem {
  sym: string;
  price: number | null;
  chg: number | null;
}

interface TickerProps {
  items: TickerItem[];
}

export default function Ticker({ items }: TickerProps) {
  const [doubled, setDoubled] = useState<TickerItem[]>([]);

  useEffect(() => {
    setDoubled([...items, ...items]);
  }, [items]);

  if (doubled.length === 0) {
    return (
      <div className="h-9 bg-bg2 border-y border-border flex items-center justify-center">
        <span className="text-muted font-mono-dm text-xs">Chargement des cours...</span>
      </div>
    );
  }

  return (
    <div
      className="h-9 bg-bg2 border-y overflow-hidden flex items-center"
      style={{ borderColor: 'rgba(200,169,110,0.15)' }}
    >
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => {
          const isUp = (item.chg ?? 0) >= 0;
          return (
            <span
              key={`${item.sym}-${i}`}
              className="inline-flex items-center gap-2 px-5 text-xs font-mono-dm"
            >
              <span className="text-gold">{item.sym}</span>
              <span className="text-cream">{fmtPrice(item.price)}</span>
              <span className={isUp ? 'text-up' : 'text-down'}>
                {fmtChg(item.chg)}
              </span>
              <span className="text-border mx-1">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

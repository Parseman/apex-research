import { useEffect, useState } from 'react';
import DarkNav from '../components/layout/DarkNav.tsx';
import Ticker from '../components/home/Ticker.tsx';
import Hero from '../components/home/Hero.tsx';
import PriceGrid from '../components/home/PriceGrid.tsx';
import FeatureBar from '../components/home/FeatureBar.tsx';
import ReportCards from '../components/home/ReportCards.tsx';
import { fetchStock, fetchCryptos } from '../api/api.ts';
import type { LivePrice } from '../types/market.ts';
import { EQUITY_ORDER, STOCK_META } from '../data/stocks.ts';
import { CRYPTOS, CRYPTO_IDS } from '../data/cryptos.ts';

interface TickerItem {
  sym: string;
  price: number | null;
  chg: number | null;
}

const CACHE_KEY_STOCKS = 'apexStockData';
const CACHE_KEY_CRYPTOS = 'apexCryptoData';

function loadCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function HomePage() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [gridPrices, setGridPrices] = useState<LivePrice[]>([]);

  useEffect(() => {
    let cancelled = false;

    const buildInitial = () => {
      const items: TickerItem[] = [
        ...EQUITY_ORDER.map(sym => ({ sym, price: null, chg: null })),
        ...CRYPTOS.map(c => ({ sym: c.sym, price: null, chg: null })),
      ];
      setTickerItems(items);

      const grid: LivePrice[] = [
        ...EQUITY_ORDER.slice(0, 5).map(sym => ({
          symbol: sym,
          name: STOCK_META[sym].name,
          price: null,
          chg: null,
          type: 'stock' as const,
        })),
        ...CRYPTOS.slice(0, 5).map(c => ({
          symbol: c.sym,
          name: c.name,
          price: null,
          chg: null,
          type: 'crypto' as const,
        })),
      ];
      setGridPrices(grid);
    };

    buildInitial();

    const fetchAll = async () => {
      type StockCache = Record<string, { price: number; chg: number }>;
      type CryptoCache = Record<string, { usd: number; usd_24h_change: number; usd_market_cap: number }>;

      const cachedStocks = loadCache<StockCache>(CACHE_KEY_STOCKS);
      const cachedCryptos = loadCache<CryptoCache>(CACHE_KEY_CRYPTOS);

      let stockData: StockCache = cachedStocks ?? {};
      let cryptoData: CryptoCache = cachedCryptos ?? {};

      const fetchPromises: Promise<void>[] = [];

      if (!cachedStocks) {
        const stockPromises = EQUITY_ORDER.map(sym =>
          fetchStock(sym).then(d => { stockData[sym] = d; }).catch(() => {
            // leave null
          })
        );
        fetchPromises.push(...stockPromises);
      }

      if (!cachedCryptos) {
        fetchPromises.push(
          fetchCryptos(CRYPTO_IDS).then(d => {
            cryptoData = d;
          }).catch(() => {
            // leave empty
          })
        );
      }

      await Promise.allSettled(fetchPromises);

      if (cancelled) return;

      // Save to cache
      if (!cachedStocks && Object.keys(stockData).length > 0) {
        saveCache(CACHE_KEY_STOCKS, stockData);
      }
      if (!cachedCryptos && Object.keys(cryptoData).length > 0) {
        saveCache(CACHE_KEY_CRYPTOS, cryptoData);
      }

      // Build ticker
      const newTicker: TickerItem[] = [
        ...EQUITY_ORDER.map(sym => ({
          sym,
          price: stockData[sym]?.price ?? null,
          chg: stockData[sym]?.chg ?? null,
        })),
        ...CRYPTOS.map(c => ({
          sym: c.sym,
          price: cryptoData[c.id]?.usd ?? null,
          chg: cryptoData[c.id]?.usd_24h_change ?? null,
        })),
      ];
      setTickerItems(newTicker);

      // Build grid
      const newGrid: LivePrice[] = [
        ...EQUITY_ORDER.slice(0, 5).map(sym => ({
          symbol: sym,
          name: STOCK_META[sym].name,
          price: stockData[sym]?.price ?? null,
          chg: stockData[sym]?.chg ?? null,
          type: 'stock' as const,
        })),
        ...CRYPTOS.slice(0, 5).map(c => ({
          symbol: c.sym,
          name: c.name,
          price: cryptoData[c.id]?.usd ?? null,
          chg: cryptoData[c.id]?.usd_24h_change ?? null,
          type: 'crypto' as const,
        })),
      ];
      setGridPrices(newGrid);
    };

    void fetchAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: '#080C10', minHeight: '100vh' }}>
      <DarkNav title="Market Intelligence" />
      <Ticker items={tickerItems} />
      <Hero />
      <PriceGrid prices={gridPrices} />
      <FeatureBar />
      <ReportCards />

      {/* Disclaimer */}
      <footer className="border-t" style={{ borderColor: 'rgba(200,169,110,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="font-sans-dm text-xs text-muted text-center leading-relaxed">
            Apex Research — Plateforme d'analyse de marché. Les informations présentées sont
            fournies à titre informatif et ne constituent pas des conseils en investissement.
            Les performances passées ne préjugent pas des performances futures. Tout investissement
            comporte un risque de perte en capital.
          </p>
          <p className="font-mono-dm text-[10px] text-center mt-3" style={{ color: 'rgba(107,123,141,0.5)' }}>
            © {new Date().getFullYear()} Apex Research — Market Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}

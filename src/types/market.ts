export interface StockData {
  symbol: string;
  price: number;
  chg: number;
}

export interface CryptoData {
  id: string;
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
}

export interface LivePrice {
  symbol: string;
  name: string;
  price: number | null;
  chg: number | null;
  type: 'stock' | 'crypto';
}

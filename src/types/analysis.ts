export interface StockAnalysis {
  sym: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 1–5
  buy_below: number | null;
  sell_above: number | null;
  buy_window_start: string | null;  // ex: "2026-04-01"
  buy_window_end: string | null;    // ex: "2026-05-15"
  sell_window_start: string | null;
  sell_window_end: string | null;
  summary: string;
  bull_factors: string[];
  bear_factors: string[];
  key_insight: string;
  updated_at: string;
}

export interface CryptoAnalysis {
  sym: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 1–5
  buy_below: number | null;
  sell_above: number | null;
  buy_window_start: string | null;
  buy_window_end: string | null;
  sell_window_start: string | null;
  sell_window_end: string | null;
  summary: string;
  bull_factors: string[];
  bear_factors: string[];
  key_insight: string;
  updated_at: string;
}

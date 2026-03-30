import { Link } from 'react-router-dom';

export default function ReportCards() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="font-mono-dm text-xs text-muted tracking-widest uppercase mb-2">
          Nos Screeners
        </p>
        <h2 className="font-cormorant text-3xl text-cream font-semibold">
          Deux univers, une plateforme
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Equity Card */}
        <Link
          to="/equity"
          className="group rounded-xl border p-8 transition-all hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, rgba(200,169,110,0.08), rgba(13,17,23,0.9))',
            borderColor: 'rgba(200,169,110,0.25)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="font-mono-dm text-xs text-gold tracking-widest uppercase">
                BERDINVEST EQUITY
              </span>
              <h3 className="font-cormorant text-2xl text-cream font-bold mt-1">
                Screener Actions
              </h3>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'rgba(200,169,110,0.15)' }}
            >
              📈
            </div>
          </div>
          <p className="font-sans-dm text-muted text-sm leading-relaxed mb-6">
            Plus de 500 actions US avec prix live. 41 titres phares — NVDA, MSFT, AAPL, META,
            TSLA, JPM et bien d'autres — couverts par des analyses IA complètes avec
            recommandation, cibles et fenêtres d'achat/vente.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {['500+ Actions', '41 Analyses IA', 'Finnhub Live', 'BUY / SELL / HOLD'].map(t => (
              <span
                key={t}
                className="px-2 py-0.5 rounded text-xs font-mono-dm"
                style={{ background: 'rgba(200,169,110,0.1)', color: '#C8A96E' }}
              >
                {t}
              </span>
            ))}
          </div>
          <span
            className="font-sans-dm text-sm font-medium group-hover:gap-3 transition-all"
            style={{ color: '#C8A96E' }}
          >
            Accéder au screener →
          </span>
        </Link>

        {/* Crypto Card */}
        <Link
          to="/crypto"
          className="group rounded-xl border p-8 transition-all hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, rgba(78,205,196,0.08), rgba(13,17,23,0.9))',
            borderColor: 'rgba(78,205,196,0.25)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="font-mono-dm text-xs text-portal-cyan tracking-widest uppercase">
                BERDINVEST CRYPTO
              </span>
              <h3 className="font-cormorant text-2xl text-cream font-bold mt-1">
                Screener Crypto
              </h3>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'rgba(78,205,196,0.15)' }}
            >
              ₿
            </div>
          </div>
          <p className="font-sans-dm text-muted text-sm leading-relaxed mb-6">
            Plus de 100 cryptomonnaies par catégorie (L1, DeFi, Oracle, AI, Gaming…).
            10 actifs phares analysés en profondeur par IA. Signaux de trading court terme
            avec chart TradingView, zones d'entrée et stop-loss.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {['100+ Cryptos', '10 Analyses IA', 'Binance Live', 'Signaux Court Terme'].map(t => (
              <span
                key={t}
                className="px-2 py-0.5 rounded text-xs font-mono-dm"
                style={{ background: 'rgba(78,205,196,0.1)', color: '#4ECDC4' }}
              >
                {t}
              </span>
            ))}
          </div>
          <span
            className="font-sans-dm text-sm font-medium"
            style={{ color: '#4ECDC4' }}
          >
            Accéder au screener →
          </span>
        </Link>
      </div>
    </section>
  );
}

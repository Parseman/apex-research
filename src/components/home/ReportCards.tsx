import { Link } from 'react-router-dom';

export default function ReportCards() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="font-mono-dm text-xs text-muted tracking-widest uppercase mb-2">
          Nos Screeners
        </p>
        <h2 className="font-cormorant text-3xl text-cream font-semibold">
          Rapports d'Analyse
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
            10 actions premium — Microsoft, Apple, Alphabet, Berkshire Hathaway, Visa, Costco,
            Amazon, P&G, J&J et VOO. Analyse complète avec stratégie DCA.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {['10 Actions', 'S&P 500', 'ETF VOO', 'Stratégie DCA'].map(t => (
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
            Consulter le rapport →
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
            10 cryptomonnaies sélectionnées — Bitcoin, Ethereum, Solana et 7 altcoins à
            fort potentiel. Analyse des risques et guide DCA crypto.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {['10 Cryptos', 'BTC & ETH', 'DeFi & L1', 'Risk Score'].map(t => (
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
            Consulter le rapport →
          </span>
        </Link>
      </div>
    </section>
  );
}

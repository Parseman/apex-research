const ALLOCATION = [
  { label: 'VOO (Index ETF)', pct: '40%', color: '#C9A84C', note: 'Socle — jamais toucher' },
  { label: 'Blue Chips (MSFT, GOOGL, AAPL, BRK-B, V)', pct: '35%', color: '#1a6b3c', note: 'Compounders long terme' },
  { label: 'Growth / Consumer (COST, AMZN, PG, JNJ)', pct: '20%', color: '#7a4f00', note: 'Diversification sectorielle' },
  { label: 'Cash / Opportunités', pct: '5%', color: '#5a5040', note: 'Pour les crises' },
];

const DOS = [
  'Investir régulièrement (DCA mensuel) quelle que soit la conjoncture',
  'Réinvestir les dividendes automatiquement (DRIP)',
  'Toujours avoir un stop-loss mental ou physique',
  'Commencer avec VOO si vous avez moins de 1 000€',
  'Lire les rapports trimestriels (10-Q) des positions core',
];

const DONTS = [
  'Ne jamais investir de l\'argent dont vous avez besoin à court terme',
  'Éviter de "timer le marché" — le temps dans le marché > timing',
  'Ne pas concentrer plus de 20% sur un seul titre',
  'Résister à la panique lors des corrections de -20% ou plus',
  'Ne pas acheter sur marge sans comprendre le risque d\'appel de marge',
];

const PLATFORMS = [
  { name: 'Trade Republic', note: 'Frais 1€/ordre, plans d\'épargne gratuits, idéal particuliers EU' },
  { name: 'Degiro', note: 'Frais très bas, accès NYSE/NASDAQ, interface simple' },
  { name: 'Boursorama', note: 'Banque + brokerage FR, PEA disponible, fiable' },
  { name: 'Interactive Brokers', note: 'Pro, accès mondial, meilleur pour volumes importants' },
];

export default function EquityStrategy() {
  return (
    <div className="space-y-8 font-plex-sans" style={{ color: '#1A1A1A' }}>
      {/* DCA Guide */}
      <div className="rounded-lg border p-6" style={{ background: '#EDE7D9', borderColor: '#D4C9A8' }}>
        <h3 className="font-playfair text-xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
          Guide DCA — Dollar Cost Averaging
        </h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#5a5040' }}>
          Le DCA consiste à investir un montant fixe à intervalles réguliers, indépendamment du prix.
          Cette stratégie réduit l'impact de la volatilité et élimine le stress du timing de marché.
          Accessible dès 50€/mois.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { budget: '50€/mois', strat: '100% VOO', horizon: '10 ans → ~10 000€' },
            { budget: '150€/mois', strat: '60% VOO + 40% Blue Chips', horizon: '10 ans → ~30 000€' },
            { budget: '300€/mois', strat: 'Allocation complète', horizon: '10 ans → ~61 000€' },
          ].map(s => (
            <div key={s.budget} className="rounded p-4" style={{ background: '#F5F0E8', border: '1px solid #D4C9A8' }}>
              <div className="font-plex-mono font-bold text-base mb-1" style={{ color: '#C9A84C' }}>
                {s.budget}
              </div>
              <div className="text-xs font-plex-mono mb-1" style={{ color: '#1A1A1A' }}>{s.strat}</div>
              <div className="text-xs" style={{ color: '#1a6b3c' }}>{s.horizon}</div>
              <div className="text-[9px] mt-1" style={{ color: '#5a5040' }}>@10% CAGR historique S&P 500</div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation */}
      <div className="rounded-lg border p-6" style={{ background: '#EDE7D9', borderColor: '#D4C9A8' }}>
        <h3 className="font-playfair text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
          Allocation Recommandée
        </h3>
        <div className="space-y-3">
          {ALLOCATION.map(a => (
            <div key={a.label} className="flex items-center gap-4">
              <div className="font-plex-mono text-xl font-bold w-14 flex-shrink-0" style={{ color: a.color }}>
                {a.pct}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{a.label}</div>
                <div className="text-xs" style={{ color: '#5a5040' }}>{a.note}</div>
              </div>
              <div
                className="h-2 rounded-full flex-shrink-0"
                style={{
                  width: `${parseInt(a.pct)}%`,
                  maxWidth: '120px',
                  background: a.color,
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Do's and Dont's */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-6" style={{ background: '#e8f5ee', borderColor: '#c8e6d4' }}>
          <h3 className="font-playfair text-lg font-bold mb-4" style={{ color: '#1a6b3c' }}>
            À Faire ✓
          </h3>
          <ul className="space-y-2">
            {DOS.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: '#1a6b3c' }}>+</span>
                <span style={{ color: '#1a6b3c' }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border p-6" style={{ background: '#f5e8e8', borderColor: '#e6c8c8' }}>
          <h3 className="font-playfair text-lg font-bold mb-4" style={{ color: '#8b1a1a' }}>
            À Éviter ✗
          </h3>
          <ul className="space-y-2">
            {DONTS.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: '#8b1a1a' }}>−</span>
                <span style={{ color: '#8b1a1a' }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Platforms */}
      <div className="rounded-lg border p-6" style={{ background: '#EDE7D9', borderColor: '#D4C9A8' }}>
        <h3 className="font-playfair text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
          Plateformes Recommandées
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <div
              key={p.name}
              className="rounded p-3"
              style={{ background: '#F5F0E8', border: '1px solid #D4C9A8' }}
            >
              <div className="font-plex-mono font-bold text-sm mb-1" style={{ color: '#C9A84C' }}>
                {p.name}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#5a5040' }}>{p.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final note */}
      <div className="rounded-lg border-l-4 p-5" style={{ borderLeftColor: '#C9A84C', background: '#fff3d6' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#7a4f00' }}>
          <strong>Note de l'analyste :</strong> Ce screener est fourni à titre informatif uniquement.
          Les performances passées ne préjugent pas des performances futures. Tout investissement
          comporte un risque de perte en capital. Consultez un conseiller financier agréé avant
          toute décision d'investissement significative.
        </p>
      </div>
    </div>
  );
}

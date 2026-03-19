const ALLOCATION = [
  { label: 'Bitcoin (BTC)', pct: '40%', color: '#F59E0B', note: 'Réserve de valeur — cœur de portefeuille' },
  { label: 'Ethereum (ETH)', pct: '25%', color: '#6366F1', note: 'Infrastructure Web3 dominante' },
  { label: 'Large Caps (SOL, BNB, LINK)', pct: '25%', color: '#2DD4BF', note: 'Diversification L1/Infra' },
  { label: 'Mid/Alt Caps (AVAX, UNI, DOT, AAVE)', pct: '9%', color: '#78350F', note: 'Potentiel élevé, risque élevé' },
  { label: 'ICP (Spéculatif)', pct: '1%', color: '#7F1D1D', note: 'Max 1% — Paris asymétrique' },
];

const DOS = [
  'Commencer par BTC+ETH uniquement (80%+ du portefeuille crypto)',
  'Utiliser des hardware wallets (Ledger, Trezor) pour les montants > 500€',
  'DCA mensuel automatisé — ignorer la volatilité quotidienne',
  'Diversifier entre CEX (Binance, Coinbase) et self-custody',
  'Comprendre le projet avant d\'investir — white paper, team, tokenomics',
];

const DONTS = [
  'Ne jamais investir plus que ce que vous acceptez de perdre à 100%',
  'Éviter les "memecoins" sans cas d\'usage réel',
  'Ne pas suivre les tips des réseaux sociaux / influenceurs',
  'Ne jamais trader avec effet de levier sans formation solide',
  'Éviter les exchanges non-réglementés ou sans historique',
];

const PLATFORMS = [
  { name: 'Coinbase', note: 'Réglementé US/EU, interface simple, bonne sécurité' },
  { name: 'Binance', note: 'Volumes #1 mondial, frais bas, écosystème BNB Chain' },
  { name: 'Kraken', note: 'Réputé pour sécurité, disponible EU, staking natif' },
  { name: 'Ledger (Hardware)', note: 'Self-custody — indispensable pour montants > 500€' },
];

export default function CryptoStrategy() {
  return (
    <div className="space-y-8 font-plex-sans" style={{ color: '#0D1520' }}>
      {/* Risk Warning */}
      <div
        className="rounded-lg border-l-4 p-5"
        style={{ borderLeftColor: '#7F1D1D', background: '#FEE2E2' }}
      >
        <p className="text-sm leading-relaxed font-medium" style={{ color: '#7F1D1D' }}>
          ⚠️ <strong>Avertissement risque :</strong> Les cryptomonnaies sont des actifs hautement spéculatifs.
          Des pertes de 50–80% sont historiquement fréquentes lors des marchés baissiers.
          N'investissez que ce que vous êtes prêt à perdre intégralement.
          Ces informations sont fournies à titre informatif uniquement.
        </p>
      </div>

      {/* DCA Guide */}
      <div className="rounded-lg border p-6" style={{ background: '#D8EDF4', borderColor: '#B0D4E0' }}>
        <h3 className="font-playfair text-xl font-bold mb-2" style={{ color: '#0D1520' }}>
          Guide DCA Crypto — Approche Progressive
        </h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#2A6070' }}>
          Le DCA est encore plus crucial en crypto en raison de la volatilité extrême.
          Investir régulièrement permet d'obtenir un prix moyen favorable sur les cycles de 4 ans.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { budget: '30€/mois', strat: '100% BTC', horizon: 'Cycle 4 ans → exposition minimale' },
            { budget: '100€/mois', strat: '60% BTC + 30% ETH + 10% SOL', horizon: 'Portefeuille diversifié' },
            { budget: '200€/mois', strat: 'Allocation complète', horizon: 'Portfolio crypto structuré' },
          ].map(s => (
            <div key={s.budget} className="rounded p-4" style={{ background: '#E8F4F8', border: '1px solid #B0D4E0' }}>
              <div className="font-plex-mono font-bold text-base mb-1" style={{ color: '#2DD4BF' }}>
                {s.budget}
              </div>
              <div className="text-xs font-plex-mono mb-1" style={{ color: '#0D1520' }}>{s.strat}</div>
              <div className="text-xs" style={{ color: '#065F46' }}>{s.horizon}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation */}
      <div className="rounded-lg border p-6" style={{ background: '#D8EDF4', borderColor: '#B0D4E0' }}>
        <h3 className="font-playfair text-xl font-bold mb-4" style={{ color: '#0D1520' }}>
          Allocation Recommandée
        </h3>
        <div className="space-y-3">
          {ALLOCATION.map(a => (
            <div key={a.label} className="flex items-center gap-4">
              <div className="font-plex-mono text-xl font-bold w-14 flex-shrink-0" style={{ color: a.color }}>
                {a.pct}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: '#0D1520' }}>{a.label}</div>
                <div className="text-xs" style={{ color: '#2A6070' }}>{a.note}</div>
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
        <div className="rounded-lg border p-6" style={{ background: '#D1FAE5', borderColor: '#A7F3D0' }}>
          <h3 className="font-playfair text-lg font-bold mb-4" style={{ color: '#065F46' }}>
            À Faire ✓
          </h3>
          <ul className="space-y-2">
            {DOS.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: '#065F46' }}>+</span>
                <span style={{ color: '#065F46' }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border p-6" style={{ background: '#FEE2E2', borderColor: '#FECACA' }}>
          <h3 className="font-playfair text-lg font-bold mb-4" style={{ color: '#7F1D1D' }}>
            À Éviter ✗
          </h3>
          <ul className="space-y-2">
            {DONTS.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: '#7F1D1D' }}>−</span>
                <span style={{ color: '#7F1D1D' }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Platforms */}
      <div className="rounded-lg border p-6" style={{ background: '#D8EDF4', borderColor: '#B0D4E0' }}>
        <h3 className="font-playfair text-xl font-bold mb-4" style={{ color: '#0D1520' }}>
          Plateformes Recommandées
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {PLATFORMS.map(p => (
            <div
              key={p.name}
              className="rounded p-3"
              style={{ background: '#E8F4F8', border: '1px solid #B0D4E0' }}
            >
              <div className="font-plex-mono font-bold text-sm mb-1" style={{ color: '#2DD4BF' }}>
                {p.name}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#2A6070' }}>{p.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final note */}
      <div className="rounded-lg border-l-4 p-5" style={{ borderLeftColor: '#2DD4BF', background: '#FEF3C7' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#78350F' }}>
          <strong>Note de l'analyste :</strong> Ce screener crypto est fourni à titre informatif uniquement.
          Les cryptomonnaies ne sont pas des valeurs mobilières réglementées dans la plupart des juridictions.
          Les performances passées ne préjugent pas des performances futures.
          Investissez uniquement ce que vous êtes prêt à perdre intégralement.
        </p>
      </div>
    </div>
  );
}

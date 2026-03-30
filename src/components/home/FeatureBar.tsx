const FEATURES = [
  {
    icon: '🤖',
    title: 'Analyses IA',
    desc: 'Recommandations BUY/SELL/HOLD générées par LLM avec niveaux d\'entrée, cibles et facteurs bull/bear.',
  },
  {
    icon: '⚡',
    title: 'Signaux Court Terme',
    desc: 'Setups de trading 1–8 semaines : zone d\'entrée, target, stop-loss et ratio risk/reward en temps réel.',
  },
  {
    icon: '📊',
    title: 'Données Live',
    desc: 'Prix actions via Finnhub, cryptos via Binance — actualisés en continu avec variation 24h.',
  },
  {
    icon: '🎯',
    title: 'Suivi des Performances',
    desc: 'Chaque analyse est horodatée et évaluée à échéance. Win rate, P&L moyen et historique complet.',
  },
];

export default function FeatureBar() {
  return (
    <section
      className="border-y"
      style={{
        background: 'rgba(13,17,23,0.6)',
        borderColor: 'rgba(200,169,110,0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex flex-col gap-3">
            <span className="text-2xl">{f.icon}</span>
            <h3 className="font-cormorant text-lg text-cream font-semibold">
              {f.title}
            </h3>
            <p className="font-sans-dm text-muted text-sm leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

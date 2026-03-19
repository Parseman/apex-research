const FEATURES = [
  {
    icon: '📊',
    title: 'Analyse Fondamentale',
    desc: 'P/E, D/E, dividendes, moat et croissance analysés pour chaque titre.',
  },
  {
    icon: '🎯',
    title: 'Targets Bull/Bear',
    desc: 'Prix cibles haussiers et baissiers avec zones d\'entrée et stop-loss.',
  },
  {
    icon: '📐',
    title: 'Stratégie DCA',
    desc: 'Guide complet d\'investissement progressif, accessible dès 50€/mois.',
  },
  {
    icon: '⚡',
    title: 'Données Live',
    desc: 'Yahoo Finance et CoinGecko en temps réel — prix, variation 24h et market cap.',
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

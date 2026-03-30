import { Link } from 'react-router-dom';

const STAT_CARDS = [
  { label: 'Actions couvertes', value: '500+', sub: '41 analyses IA approfondies' },
  { label: 'Cryptos couvertes', value: '100+', sub: '10 analyses IA + signaux court terme' },
  { label: 'Analyses IA', value: 'Live', sub: 'Groq · llama-3.3-70b' },
  { label: 'Suivi performances', value: 'Intégré', sub: 'Win rate & P&L historique' },
];

export default function Hero() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-20 overflow-hidden">
      {/* Background orbs */}
      <div
        className="absolute top-10 right-20 w-96 h-96 rounded-full opacity-5 animate-orb pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C8A96E, transparent)' }}
      />
      <div
        className="absolute bottom-0 left-10 w-72 h-72 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4ECDC4, transparent)', animationDelay: '4s' }}
      />

      <div className="relative grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <div className="animate-fade-up">
          <p className="text-gold font-mono-dm text-xs tracking-[0.2em] uppercase mb-4">
            Market Intelligence — Berdinvest
          </p>
          <h1 className="font-cormorant text-5xl lg:text-6xl font-bold text-cream leading-tight mb-6">
            L'IA au service<br />
            de tes <span className="text-gold">investissements</span>
          </h1>
          <p className="font-sans-dm text-muted text-base leading-relaxed mb-8 max-w-md">
            Screeners professionnels, analyses fondamentales générées par IA et signaux de
            trading court terme — pour lire les marchés avec clarté et méthode.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/equity"
              className="px-6 py-2.5 rounded font-sans-dm text-sm font-medium transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #C8A96E, #E8CC90)', color: '#080C10' }}
            >
              Screener Actions →
            </Link>
            <Link
              to="/crypto"
              className="px-6 py-2.5 rounded font-sans-dm text-sm font-medium border transition-all hover:bg-portal-cyan/10"
              style={{ borderColor: '#4ECDC4', color: '#4ECDC4' }}
            >
              Screener Crypto →
            </Link>
          </div>
        </div>

        {/* Right: stat cards */}
        <div className="grid grid-cols-2 gap-4">
          {STAT_CARDS.map((card, i) => (
            <div
              key={card.label}
              className="rounded-lg p-5 border animate-slide-in"
              style={{
                background: 'rgba(13,17,23,0.8)',
                borderColor: 'rgba(200,169,110,0.15)',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="text-gold font-cormorant text-3xl font-bold mb-1">
                {card.value}
              </div>
              <div className="text-cream font-sans-dm text-sm font-medium mb-0.5">
                {card.label}
              </div>
              <div className="text-muted font-sans-dm text-xs">
                {card.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

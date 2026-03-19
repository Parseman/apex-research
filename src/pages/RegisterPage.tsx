import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';

type Step = 'form' | 'check_email';

export default function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password);
      setStep('check_email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(13,17,23,0.8)',
    borderColor: 'rgba(200,169,110,0.2)',
    color: '#F0EBE0',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#080C10' }}
    >
      {/* Orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C8A96E, transparent)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4ECDC4, transparent)' }}
      />

      <div
        className="w-full max-w-sm rounded-2xl border p-8 relative z-10"
        style={{ background: '#0D1117', borderColor: 'rgba(200,169,110,0.15)' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-xl border flex items-center justify-center mb-3"
            style={{ background: 'rgba(200,169,110,0.1)', borderColor: 'rgba(200,169,110,0.3)' }}
          >
            <span className="font-cormorant text-gold text-2xl font-bold">A</span>
          </div>
          <h1 className="font-cormorant text-2xl font-bold text-cream">Apex Research</h1>
          <p className="font-sans-dm text-xs text-muted mt-1 tracking-widest uppercase">
            Créer un compte
          </p>
        </div>

        {step === 'check_email' ? (
          /* ── Écran de confirmation ── */
          <div className="text-center space-y-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)' }}
            >
              <span className="text-2xl">✉️</span>
            </div>
            <div>
              <p className="font-cormorant text-xl text-cream font-semibold">Vérifiez votre email</p>
              <p className="font-sans-dm text-sm text-muted mt-2 leading-relaxed">
                Un lien de confirmation a été envoyé à
              </p>
              <p className="font-mono-dm text-sm mt-1" style={{ color: '#C8A96E' }}>{email}</p>
            </div>
            <div
              className="rounded-lg p-4 text-left"
              style={{ background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.15)' }}
            >
              <p className="font-sans-dm text-xs text-muted leading-relaxed">
                ⚠️ Le lien expire dans <span className="text-cream font-medium">24 heures</span>.
                Passé ce délai, votre compte sera bloqué et vous devrez vous réinscrire.
              </p>
            </div>
            <p className="font-sans-dm text-xs text-muted pt-2">
              Déjà un compte ?{' '}
              <Link to="/login" className="underline underline-offset-2 transition-opacity hover:opacity-70" style={{ color: '#C8A96E' }}>
                Se connecter
              </Link>
            </p>
          </div>
        ) : (
          /* ── Formulaire d'inscription ── */
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans-dm text-xs text-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="px-4 py-2.5 rounded-lg border text-sm font-sans-dm outline-none transition-colors"
                style={inputStyle}
                placeholder="vous@exemple.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans-dm text-xs text-muted">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="px-4 py-2.5 rounded-lg border text-sm font-sans-dm outline-none transition-colors"
                style={inputStyle}
                placeholder="8 caractères minimum"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans-dm text-xs text-muted">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="px-4 py-2.5 rounded-lg border text-sm font-sans-dm outline-none transition-colors"
                style={inputStyle}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <p
                className="text-xs font-sans-dm px-3 py-2 rounded"
                style={{ color: '#E05C5C', background: 'rgba(224,92,92,0.1)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-sans-dm text-sm font-medium transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ background: 'linear-gradient(135deg, #C8A96E, #E8CC90)', color: '#080C10' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
                  Inscription...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>

            <p className="text-center font-sans-dm text-xs text-muted pt-1">
              Déjà un compte ?{' '}
              <Link to="/login" className="underline underline-offset-2 transition-opacity hover:opacity-70" style={{ color: '#C8A96E' }}>
                Se connecter
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion.');
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
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 pointer-events-none animate-orb"
        style={{ background: 'radial-gradient(circle, #C8A96E, transparent)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4ECDC4, transparent)', animationDelay: '4s' }}
      />

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl border p-8 animate-fade-up relative z-10"
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
          <h1 className="font-cormorant text-2xl font-bold text-cream">Berdinvest</h1>
          <p className="font-sans-dm text-xs text-muted mt-1 tracking-widest uppercase">
            Market Intelligence
          </p>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans-dm text-xs text-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-4 py-2.5 rounded-lg border text-sm font-sans-dm outline-none transition-colors"
              style={{
                ...inputStyle,
                borderColor: 'rgba(200,169,110,0.2)',
              }}
              placeholder="admin@exemple.com"
              autoComplete="email"
              autoFocus
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
              placeholder="••••••••"
              autoComplete="current-password"
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
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <p className="text-center font-sans-dm text-xs text-muted mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: '#C8A96E' }}>
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}

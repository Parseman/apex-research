import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.tsx';

interface ScreenerNavProps {
  theme: 'equity' | 'crypto';
}

export default function ScreenerNav({ theme }: ScreenerNavProps) {
  const { session, logout } = useAuth();
  const isEquity = theme === 'equity';

  const accentColor = isEquity ? '#C9A84C' : '#2DD4BF';
  const bgColor = isEquity ? '#EDE7D9' : '#D8EDF4';
  const textColor = isEquity ? '#1A1A1A' : '#0D1520';
  const mutedColor = isEquity ? '#5a5040' : '#2A6070';
  const borderColor = isEquity ? '#D4C9A8' : '#B0D4E0';

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ background: bgColor, borderColor }}
    >
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
        {/* Back link */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-plex-sans transition-opacity hover:opacity-70"
          style={{ color: accentColor }}
        >
          <span>←</span>
          <span>Retour au portail</span>
        </Link>

        {/* Right: user + logout */}
        <div className="flex items-center gap-4">
          {session && (
            <>
              <span className="text-xs font-plex-sans hidden sm:block" style={{ color: mutedColor }}>
                {session.username}
              </span>
              {session.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-xs font-plex-sans px-2 py-0.5 rounded border transition-colors"
                  style={{ color: '#9B7FE8', borderColor: 'rgba(155,127,232,0.4)' }}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-xs font-plex-sans px-3 py-1 rounded border transition-opacity hover:opacity-70"
                style={{ color: textColor, borderColor }}
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

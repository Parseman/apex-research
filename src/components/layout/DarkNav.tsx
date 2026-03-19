import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.tsx';

interface DarkNavProps {
  title?: string;
  badge?: string;
}

export default function DarkNav({ title, badge }: DarkNavProps) {
  const { session, logout } = useAuth();

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm"
      style={{ borderBottom: '1px solid rgba(200,169,110,0.15)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded bg-gold/20 border border-gold/40 flex items-center justify-center">
            <span className="text-gold font-cormorant font-bold text-sm">A</span>
          </div>
          <span className="text-cream font-cormorant text-lg font-semibold tracking-wide">
            Apex Research
          </span>
        </Link>

        {/* Center: title/badge */}
        {(title || badge) && (
          <div className="hidden md:flex items-center gap-3">
            {title && (
              <span className="text-muted font-sans-dm text-xs tracking-widest uppercase">
                {title}
              </span>
            )}
            {badge && (
              <span className="px-2 py-0.5 rounded text-xs font-mono-dm bg-admin/20 text-admin border border-admin/30">
                {badge}
              </span>
            )}
          </div>
        )}

        {/* Right: user info + actions */}
        <div className="flex items-center gap-4">
          {/* Live badge */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-up animate-blink" />
            <span className="text-muted font-mono-dm text-xs">LIVE</span>
          </div>

          {session && (
            <>
              <span className="text-muted font-sans-dm text-xs hidden sm:block">
                {session.username}
              </span>
              {session.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-admin font-sans-dm text-xs px-2 py-1 rounded border border-admin/30 hover:bg-admin/10 transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-muted font-sans-dm text-xs px-3 py-1.5 rounded border border-border hover:border-gold/40 hover:text-cream transition-colors"
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

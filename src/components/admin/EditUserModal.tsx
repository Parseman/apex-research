import { useState, useEffect } from 'react';
import type { User } from '../../types/auth.ts';
import { useAuth } from '../../auth/AuthContext.tsx';

interface EditUserModalProps {
  user: User | null;
  allUsers: User[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditUserModal({ user, allUsers, onClose, onSaved }: EditUserModalProps) {
  const { updateUserPassword, updateUserRole, session } = useAuth();
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setPassword('');
      setMessage(null);
    }
  }, [user]);

  if (!user) return null;

  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const isLastAdmin = user.role === 'admin' && adminCount <= 1;
  const isSelf = user.id === session?.userId;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Guard: can't demote last admin
      if (role === 'user' && isLastAdmin) {
        throw new Error('Impossible de rétrograder le dernier administrateur.');
      }
      // Update role if changed
      if (role !== user.role) {
        await updateUserRole(user.id, role);
      }
      // Update password if provided
      if (password.trim()) {
        if (password.length < 6) throw new Error('Le mot de passe doit faire au moins 6 caractères.');
        await updateUserPassword(user.id, password.trim());
      }
      setMessage({ type: 'success', text: 'Modifications sauvegardées.' });
      setTimeout(() => {
        onSaved();
        onClose();
      }, 800);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur inconnue.' });
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,12,16,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-xl border p-6 animate-fade-up"
        style={{ background: '#0D1117', borderColor: 'rgba(200,169,110,0.2)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-cormorant text-xl text-cream font-semibold">
              Modifier l'utilisateur
            </h2>
            <p className="font-sans-dm text-xs text-muted mt-0.5">
              {user.email}
              {isSelf && <span className="ml-1 text-gold">(vous-même)</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-cream transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => { void handleSave(e); }} className="space-y-4">
          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans-dm text-xs text-muted">Rôle</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'admin' | 'user')}
              disabled={isLastAdmin}
              className="px-3 py-2 rounded border text-sm font-sans-dm outline-none focus:border-gold/50 transition-colors cursor-pointer disabled:opacity-50"
              style={inputStyle}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
            </select>
            {isLastAdmin && (
              <p className="text-xs font-sans-dm" style={{ color: '#E05C5C' }}>
                Dernier admin — impossible de rétrograder.
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans-dm text-xs text-muted">
              Nouveau mot de passe <span className="text-[10px]">(laisser vide pour ne pas changer)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="px-3 py-2 rounded border text-sm font-sans-dm outline-none focus:border-gold/50 transition-colors"
              style={inputStyle}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {message && (
            <p
              className="text-xs font-sans-dm px-3 py-2 rounded"
              style={{
                color: message.type === 'success' ? '#4ECB71' : '#E05C5C',
                background: message.type === 'success' ? 'rgba(78,203,113,0.1)' : 'rgba(224,92,92,0.1)',
              }}
            >
              {message.text}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded font-sans-dm text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C8A96E, #E8CC90)', color: '#080C10' }}
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border font-sans-dm text-sm text-muted transition-colors hover:text-cream"
              style={{ borderColor: 'rgba(200,169,110,0.2)' }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

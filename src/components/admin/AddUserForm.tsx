import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext.tsx';

interface AddUserFormProps {
  onUserAdded: () => void;
}

export default function AddUserForm({ onUserAdded }: AddUserFormProps) {
  const { addUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Tous les champs sont requis.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit faire au moins 6 caractères.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await addUser(email.trim(), password, role);
      setMessage({ type: 'success', text: `Utilisateur "${email}" créé avec succès.` });
      setEmail('');
      setPassword('');
      setRole('user');
      onUserAdded();
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
      className="rounded-lg border p-6 mb-8"
      style={{ background: 'rgba(13,17,23,0.6)', borderColor: 'rgba(200,169,110,0.15)' }}
    >
      <h2 className="font-cormorant text-xl text-cream font-semibold mb-5">
        Ajouter un utilisateur
      </h2>
      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="font-sans-dm text-xs text-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-3 py-2 rounded border text-sm font-sans-dm outline-none focus:border-gold/50 transition-colors"
            style={inputStyle}
            placeholder="utilisateur@exemple.com"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="font-sans-dm text-xs text-muted">Mot de passe</label>
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
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <label className="font-sans-dm text-xs text-muted">Rôle</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'admin' | 'user')}
            className="px-3 py-2 rounded border text-sm font-sans-dm outline-none focus:border-gold/50 transition-colors cursor-pointer"
            style={inputStyle}
          >
            <option value="user">Utilisateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded font-sans-dm text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #C8A96E, #E8CC90)', color: '#080C10' }}
        >
          {loading ? 'Création...' : 'Créer'}
        </button>
      </form>
      {message && (
        <p
          className="mt-3 text-xs font-sans-dm px-3 py-2 rounded"
          style={{
            color: message.type === 'success' ? '#4ECB71' : '#E05C5C',
            background: message.type === 'success' ? 'rgba(78,203,113,0.1)' : 'rgba(224,92,92,0.1)',
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

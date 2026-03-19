import type { User } from '../../types/auth.ts';
import { useAuth } from '../../auth/AuthContext.tsx';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onRefresh: () => void;
}

export default function UserTable({ users, onEdit, onRefresh }: UserTableProps) {
  const { session, deleteUser } = useAuth();

  const adminCount = users.filter(u => u.role === 'admin').length;

  const handleDelete = async (user: User) => {
    const isLastAdmin = user.role === 'admin' && adminCount <= 1;
    if (isLastAdmin) {
      alert('Impossible de supprimer le dernier administrateur.');
      return;
    }
    if (!confirm(`Supprimer l'utilisateur "${user.email}" ?`)) return;
    try {
      await deleteUser(user.id);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'rgba(200,169,110,0.15)' }}
    >
      <table className="w-full text-sm font-sans-dm border-collapse">
        <thead>
          <tr style={{ background: 'rgba(13,17,23,0.95)', borderBottom: '1px solid rgba(200,169,110,0.15)' }}>
            <th className="text-left px-4 py-3 font-mono-dm text-xs text-gold tracking-wider">EMAIL</th>
            <th className="text-center px-4 py-3 font-mono-dm text-xs text-gold tracking-wider">RÔLE</th>
            <th className="text-left px-4 py-3 font-mono-dm text-xs text-gold tracking-wider hidden sm:table-cell">CRÉÉ LE</th>
            <th className="text-left px-4 py-3 font-mono-dm text-xs text-gold tracking-wider hidden md:table-cell">CRÉÉ PAR</th>
            <th className="text-center px-4 py-3 font-mono-dm text-xs text-gold tracking-wider">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => {
            const isSelf = user.id === session?.userId;
            const isLastAdmin = user.role === 'admin' && adminCount <= 1;
            const canDelete = !isSelf && !isLastAdmin;
            const rowBg = i % 2 === 0 ? 'rgba(13,17,23,0.6)' : 'rgba(13,17,23,0.4)';

            return (
              <tr
                key={user.id}
                style={{ background: rowBg, borderTop: '1px solid rgba(200,169,110,0.08)' }}
                className="hover:brightness-110 transition-all"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-sans-dm font-medium text-cream">{user.email}</span>
                    {isSelf && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-dm bg-gold/10 text-gold">
                        MOI
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono-dm"
                    style={
                      user.role === 'admin'
                        ? { background: 'rgba(155,127,232,0.15)', color: '#9B7FE8' }
                        : { background: 'rgba(78,205,196,0.1)', color: '#4ECDC4' }
                    }
                  >
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="font-mono-dm text-xs text-muted">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="font-mono-dm text-xs text-muted">{user.createdBy}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="px-3 py-1 rounded border text-xs font-sans-dm transition-colors hover:bg-gold/10"
                      style={{ borderColor: 'rgba(200,169,110,0.3)', color: '#C8A96E' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => { void handleDelete(user); }}
                      disabled={!canDelete}
                      className="px-3 py-1 rounded border text-xs font-sans-dm transition-colors hover:bg-down/10 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ borderColor: 'rgba(224,92,92,0.3)', color: '#E05C5C' }}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

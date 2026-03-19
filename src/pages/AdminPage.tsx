import { useState, useCallback, useEffect } from 'react';
import DarkNav from '../components/layout/DarkNav.tsx';
import StatsRow from '../components/admin/StatsRow.tsx';
import AddUserForm from '../components/admin/AddUserForm.tsx';
import UserTable from '../components/admin/UserTable.tsx';
import EditUserModal from '../components/admin/EditUserModal.tsx';
import { useAuth } from '../auth/AuthContext.tsx';
import type { User } from '../types/auth.ts';

export default function AdminPage() {
  const { getUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const refresh = useCallback(async () => {
    const list = await getUsers();
    setUsers(list);
  }, [getUsers]);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div style={{ background: '#080C10', minHeight: '100vh' }}>
      <DarkNav title="Administration" badge="Admin Panel" />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <p className="font-mono-dm text-xs tracking-widest uppercase mb-1" style={{ color: '#9B7FE8' }}>
            PANNEAU D'ADMINISTRATION
          </p>
          <h1 className="font-cormorant text-4xl font-bold text-cream">
            Gestion des Utilisateurs
          </h1>
          <p className="font-sans-dm text-sm text-muted mt-1">
            Créez, modifiez et gérez les accès au portail Apex Research.
          </p>
        </div>

        {/* Stats row */}
        <StatsRow users={users} />

        {/* Add user form */}
        <AddUserForm onUserAdded={() => { void refresh(); }} />

        {/* User table */}
        <UserTable
          users={users}
          onEdit={(user) => setEditTarget(user)}
          onRefresh={() => { void refresh(); }}
        />

        {/* Edit modal */}
        <EditUserModal
          user={editTarget}
          allUsers={users}
          onClose={() => setEditTarget(null)}
          onSaved={() => { void refresh(); }}
        />
      </div>

      <footer className="border-t mt-10" style={{ borderColor: 'rgba(200,169,110,0.1)' }}>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="font-sans-dm text-xs text-muted text-center">
            Apex Research — Administration · Accès restreint
          </p>
        </div>
      </footer>
    </div>
  );
}

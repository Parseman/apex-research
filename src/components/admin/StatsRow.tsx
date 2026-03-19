import type { User } from '../../types/auth.ts';

interface StatsRowProps {
  users: User[];
}

export default function StatsRow({ users }: StatsRowProps) {
  const admins = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;

  const stats = [
    { label: 'Total Utilisateurs', value: users.length, color: '#C8A96E' },
    { label: 'Administrateurs', value: admins, color: '#9B7FE8' },
    { label: 'Utilisateurs', value: regularUsers, color: '#4ECDC4' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {stats.map(s => (
        <div
          key={s.label}
          className="rounded-lg border p-5"
          style={{ background: 'rgba(13,17,23,0.8)', borderColor: 'rgba(200,169,110,0.15)' }}
        >
          <div className="font-cormorant text-4xl font-bold mb-1" style={{ color: s.color }}>
            {s.value}
          </div>
          <div className="font-sans-dm text-sm" style={{ color: '#6B7B8D' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

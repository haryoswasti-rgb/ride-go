import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRequests, getVehicles } from '@/lib/store';
import StatusBadge from '@/components/StatusBadge';

export default function MyRequestsPage() {
  const { user } = useAuth();
  const requests = useMemo(() => getRequests().filter(r => r.userId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [user]);
  const vehicles = useMemo(() => getVehicles(), []);
  const vMap = Object.fromEntries(vehicles.map(v => [v.id, v.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengajuan Saya</h1>
        <p className="text-muted-foreground text-sm mt-1">Riwayat dan status pengajuan peminjaman anda</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-12 text-center animate-fade-in-up">
          <p className="text-muted-foreground">Belum ada pengajuan. Ajukan peminjaman pertama anda!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r, i) => (
            <div key={r.id} className="bg-card rounded-xl shadow-card p-5 animate-fade-in-up hover:shadow-card-hover transition-shadow" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{r.destination}</h3>
                  <p className="text-sm text-muted-foreground">{r.purpose}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.startDate).toLocaleDateString('id-ID')} — {new Date(r.endDate).toLocaleDateString('id-ID')}
                  </p>
                  {r.vehicleId && <p className="text-xs text-primary font-medium">🚗 {vMap[r.vehicleId] || r.vehicleId}</p>}
                  {r.adminNote && <p className="text-xs text-muted-foreground italic">Catatan: {r.adminNote}</p>}
                </div>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

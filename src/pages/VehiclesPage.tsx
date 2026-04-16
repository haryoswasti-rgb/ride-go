import { useState, useMemo } from 'react';
import { getVehicles, saveVehicles } from '@/lib/store';
import { getRequests } from '@/lib/store';
import { Vehicle } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { Car, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VehiclesPage() {
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(0);
  const vehicles = useMemo(() => getVehicles(), [refresh]);
  const requests = useMemo(() => getRequests(), [refresh]);
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const addVehicle = () => {
    if (!newName.trim()) return;
    const updated: Vehicle[] = [...vehicles, { id: crypto.randomUUID(), name: newName.trim(), active: true }];
    saveVehicles(updated);
    setNewName('');
    setRefresh(r => r + 1);
    toast({ title: 'Kendaraan ditambahkan!' });
  };

  const toggleActive = (id: string) => {
    const updated = vehicles.map(v => v.id === id ? { ...v, active: !v.active } : v);
    saveVehicles(updated);
    setRefresh(r => r + 1);
  };

  const remove = (id: string) => {
    saveVehicles(vehicles.filter(v => v.id !== id));
    setRefresh(r => r + 1);
    toast({ title: 'Kendaraan dihapus' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Kelola Kendaraan</h1>

      <div className="bg-card rounded-xl shadow-card p-5 flex flex-wrap gap-3 items-end animate-fade-in-up">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Tambah Kendaraan</label>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama kendaraan"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={e => e.key === 'Enter' && addVehicle()} />
        </div>
        <button onClick={addVehicle} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm shadow-primary hover:opacity-90 transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="space-y-3">
        {vehicles.map((v, i) => {
          const vRequests = requests.filter(r => r.vehicleId === v.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          return (
            <div key={v.id} className="bg-card rounded-xl shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${v.active ? 'gradient-success' : 'bg-muted'}`}>
                    <Car className={`w-5 h-5 ${v.active ? 'text-success-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{v.name}</h3>
                    <p className="text-xs text-muted-foreground">{v.active ? 'Aktif' : 'Nonaktif'} · {vRequests.length} peminjaman</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpanded(expanded === v.id ? null : v.id)} className="text-xs text-primary font-medium hover:underline">
                    {expanded === v.id ? 'Tutup' : 'Riwayat'}
                  </button>
                  <button onClick={() => toggleActive(v.id)} className={`px-3 py-1 rounded-full text-xs font-medium ${v.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {v.active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button onClick={() => remove(v.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expanded === v.id && vRequests.length > 0 && (
                <div className="border-t border-border px-5 pb-4 animate-scale-in">
                  <table className="w-full text-sm mt-3">
                    <thead><tr className="text-muted-foreground border-b border-border"><th className="text-left py-1.5 font-medium">Peminjam</th><th className="text-left py-1.5 font-medium">Tanggal</th><th className="text-left py-1.5 font-medium">Tujuan</th><th className="text-left py-1.5 font-medium">Status</th></tr></thead>
                    <tbody>
                      {vRequests.slice(0, 10).map(r => (
                        <tr key={r.id} className="border-b border-border/50">
                          <td className="py-2 text-foreground">{r.userName}</td>
                          <td className="py-2 text-muted-foreground">{new Date(r.startDate).toLocaleDateString('id-ID')}</td>
                          <td className="py-2 text-muted-foreground">{r.destination}</td>
                          <td className="py-2"><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

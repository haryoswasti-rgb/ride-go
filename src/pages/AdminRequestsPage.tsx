import { useState, useMemo, useCallback } from 'react';
import { getRequests, getVehicles, updateRequestStatus } from '@/lib/store';
import { RequestStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';

export default function AdminRequestsPage() {
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(0);
  const requests = useMemo(() => getRequests().sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [refresh]);
  const vehicles = useMemo(() => getVehicles().filter(v => v.active), []);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ vehicleId: string; status: RequestStatus; note: string }>({ vehicleId: '', status: 'Pending', note: '' });

  const startEdit = useCallback((r: typeof requests[0]) => {
    setEditing(r.id);
    setEditData({ vehicleId: r.vehicleId || '', status: r.status, note: r.adminNote || '' });
  }, []);

  const save = useCallback(() => {
    if (!editing) return;
    if (editData.status === 'Disetujui' && !editData.vehicleId) {
      toast({ title: 'Pilih kendaraan terlebih dahulu', variant: 'destructive' });
      return;
    }
    updateRequestStatus(editing, editData.status, editData.vehicleId || undefined, editData.note || undefined);
    setEditing(null);
    setRefresh(r => r + 1);
    toast({ title: 'Status diperbarui!' });
  }, [editing, editData, toast]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Kelola Pengajuan</h1>

      {requests.length === 0 ? (
        <div className="bg-card rounded-xl shadow-card p-12 text-center">
          <p className="text-muted-foreground">Belum ada pengajuan masuk</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r, i) => (
            <div key={r.id} className="bg-card rounded-xl shadow-card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{r.userName}</h3>
                  <p className="text-sm text-muted-foreground">{r.destination} — {r.purpose}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.startDate).toLocaleDateString('id-ID')} — {new Date(r.endDate).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {editing === r.id ? (
                <div className="border-t border-border pt-3 space-y-3 animate-scale-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Kendaraan</label>
                      <select value={editData.vehicleId} onChange={e => setEditData(d => ({ ...d, vehicleId: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">-- Pilih --</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Status</label>
                      <select value={editData.status} onChange={e => setEditData(d => ({ ...d, status: e.target.value as RequestStatus }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="Pending">Pending</option>
                        <option value="Disetujui">Disetujui</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Catatan</label>
                      <input value={editData.note} onChange={e => setEditData(d => ({ ...d, note: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Opsional" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={save} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-primary hover:opacity-90 transition">Simpan</button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-input text-muted-foreground text-sm font-medium hover:bg-muted transition">Batal</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => startEdit(r)} className="text-sm text-primary font-medium hover:underline">
                  ✏️ Edit Status
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

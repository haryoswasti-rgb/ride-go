import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createRequest, getAvailableVehicles } from '@/lib/store';
import { useNavigate } from 'react-router-dom';
import { Car, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ startDate: '', endDate: '', destination: '', purpose: '' });

  const available = useMemo(() => {
    if (form.startDate && form.endDate && form.startDate <= form.endDate) {
      return getAvailableVehicles(form.startDate, form.endDate);
    }
    return null;
  }, [form.startDate, form.endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createRequest({
      userId: user.id,
      userName: user.name,
      startDate: form.startDate,
      endDate: form.endDate,
      destination: form.destination,
      purpose: form.purpose,
    });
    toast({ title: 'Pengajuan berhasil dikirim!', description: 'Menunggu persetujuan admin.' });
    navigate('/my-requests');
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ajukan Peminjaman</h1>
        <p className="text-muted-foreground text-sm mt-1">Isi form di bawah untuk mengajukan peminjaman kendaraan dinas</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card p-6 space-y-5 animate-fade-in-up">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Nama Peminjam</label>
          <input value={user?.name || ''} disabled className="w-full px-4 py-2.5 rounded-lg border border-input bg-muted text-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal Mulai</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal Selesai</label>
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required min={form.startDate}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {available !== null && (
          <div className="bg-muted rounded-lg p-4 animate-scale-in">
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" /> Kendaraan Tersedia ({available.length})
            </p>
            {available.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {available.map(v => (
                  <span key={v.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> {v.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-destructive">Semua kendaraan sudah terpakai pada tanggal tersebut</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tujuan</label>
          <input type="text" value={form.destination} onChange={e => set('destination', e.target.value)} required placeholder="Contoh: Jakarta"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Keperluan</label>
          <textarea value={form.purpose} onChange={e => set('purpose', e.target.value)} required rows={3} placeholder="Jelaskan keperluan peminjaman"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>

        <button type="submit" className="w-full py-3 rounded-lg gradient-primary text-primary-foreground font-semibold shadow-primary hover:opacity-90 transition">
          Kirim Pengajuan
        </button>
      </form>
    </div>
  );
}

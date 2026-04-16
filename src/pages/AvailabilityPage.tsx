import { useState, useMemo } from 'react';
import { getVehicles, getRequests, getAvailableVehicles } from '@/lib/store';
import { Car, CheckCircle, XCircle } from 'lucide-react';

export default function AvailabilityPage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const vehicles = useMemo(() => getVehicles().filter(v => v.active), []);
  const available = useMemo(() => getAvailableVehicles(date, date), [date]);
  const availableIds = new Set(available.map(v => v.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ketersediaan Kendaraan</h1>
        <p className="text-muted-foreground text-sm mt-1">Cek kendaraan yang tersedia pada tanggal tertentu</p>
      </div>

      <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in-up">
        <label className="text-sm font-medium text-foreground mb-1.5 block">Pilih Tanggal</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v, i) => {
          const isAvail = availableIds.has(v.id);
          return (
            <div
              key={v.id}
              className={`rounded-xl p-5 flex items-center gap-4 animate-fade-in-up transition-shadow ${
                isAvail ? 'bg-card shadow-card hover:shadow-card-hover' : 'bg-destructive/5 border border-destructive/20'
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isAvail ? 'gradient-success' : 'gradient-danger'}`}>
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{v.name}</h3>
                <p className={`text-sm flex items-center gap-1 ${isAvail ? 'text-success' : 'text-destructive'}`}>
                  {isAvail ? <><CheckCircle className="w-3.5 h-3.5" /> Tersedia</> : <><XCircle className="w-3.5 h-3.5" /> Terpakai</>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

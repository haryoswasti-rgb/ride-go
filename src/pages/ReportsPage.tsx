import { useMemo } from 'react';
import { getRequests, getVehicles } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FileDown } from 'lucide-react';

export default function ReportsPage() {
  const requests = useMemo(() => getRequests(), []);
  const vehicles = useMemo(() => getVehicles(), []);
  const vMap = Object.fromEntries(vehicles.map(v => [v.id, v.name]));

  const vehicleUsage = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.filter(r => r.status === 'Disetujui' && r.vehicleId).forEach(r => {
      const name = vMap[r.vehicleId!] || r.vehicleId!;
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [requests, vMap]);

  const exportCSV = () => {
    const header = 'Nama,Tujuan,Keperluan,Tanggal Mulai,Tanggal Selesai,Kendaraan,Status\n';
    const rows = requests.map(r =>
      `"${r.userName}","${r.destination}","${r.purpose}","${r.startDate}","${r.endDate}","${r.vehicleId ? vMap[r.vehicleId] || '' : ''}","${r.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `laporan-kendaraan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground text-sm mt-1">Statistik penggunaan kendaraan dinas</p>
        </div>
        <button onClick={exportCSV} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground font-medium text-sm shadow-primary hover:opacity-90 transition flex items-center gap-2">
          <FileDown className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in-up">
        <h3 className="font-semibold text-foreground mb-4">Penggunaan per Kendaraan</h3>
        {vehicleUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleUsage}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Peminjaman" fill="hsl(280,67%,60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-12">Belum ada data penggunaan</p>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 className="font-semibold text-foreground mb-4">Semua Pengajuan ({requests.length})</h3>
        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Nama</th>
                  <th className="text-left py-2 font-medium">Tujuan</th>
                  <th className="text-left py-2 font-medium">Tanggal</th>
                  <th className="text-left py-2 font-medium">Kendaraan</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2.5 font-medium text-foreground">{r.userName}</td>
                    <td className="py-2.5 text-muted-foreground">{r.destination}</td>
                    <td className="py-2.5 text-muted-foreground">{new Date(r.startDate).toLocaleDateString('id-ID')}</td>
                    <td className="py-2.5 text-muted-foreground">{r.vehicleId ? vMap[r.vehicleId] || '-' : '-'}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.status === 'Disetujui' ? 'gradient-success text-success-foreground' :
                        r.status === 'Ditolak' ? 'gradient-danger text-destructive-foreground' :
                        'gradient-warning text-warning-foreground'
                      }`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">Belum ada data</p>
        )}
      </div>
    </div>
  );
}

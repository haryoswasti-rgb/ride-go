import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRequests, getVehicles } from '@/lib/store';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Car, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['hsl(217,91%,60%)', 'hsl(160,84%,39%)', 'hsl(0,84%,60%)'];

export default function DashboardPage() {
  const { user } = useAuth();
  const requests = useMemo(() => getRequests(), []);
  const vehicles = useMemo(() => getVehicles(), []);

  const myRequests = user?.role === 'peminjam' ? requests.filter(r => r.userId === user.id) : requests;
  const pending = myRequests.filter(r => r.status === 'Pending').length;
  const approved = myRequests.filter(r => r.status === 'Disetujui').length;
  const rejected = myRequests.filter(r => r.status === 'Ditolak').length;

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    myRequests.forEach(r => {
      const m = r.createdAt.slice(0, 7);
      months[m] = (months[m] || 0) + 1;
    });
    return Object.entries(months).sort().slice(-6).map(([m, count]) => ({
      month: new Date(m + '-01').toLocaleDateString('id-ID', { month: 'short' }),
      count,
    }));
  }, [myRequests]);

  const pieData = [
    { name: 'Pending', value: pending },
    { name: 'Disetujui', value: approved },
    { name: 'Ditolak', value: rejected },
  ].filter(d => d.value > 0);

  const recent = [...myRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Selamat Datang, {user?.name} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.role === 'admin' ? 'Panel administrasi kendaraan dinas' : 'Kelola peminjaman kendaraan anda'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pengajuan" value={myRequests.length} icon={FileText} gradient="gradient-primary" delay={0} />
        <StatCard title="Pending" value={pending} icon={Clock} gradient="gradient-warning" delay={80} />
        <StatCard title="Disetujui" value={approved} icon={CheckCircle} gradient="gradient-success" delay={160} />
        {user?.role === 'admin' && (
          <StatCard title="Kendaraan" value={vehicles.filter(v => v.active).length} icon={Car} gradient="gradient-danger" delay={240} />
        )}
        {user?.role === 'peminjam' && (
          <StatCard title="Ditolak" value={rejected} icon={XCircle} gradient="gradient-danger" delay={240} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-semibold text-foreground mb-4">Peminjaman per Bulan</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(220,10%,50%)" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(217,91%,60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">Belum ada data</p>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
          <h3 className="font-semibold text-foreground mb-4">Persentase Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[['Pending', 'Disetujui', 'Ditolak'].indexOf(pieData[i]?.name)] || PIE_COLORS[0]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">Belum ada data</p>
          )}
        </div>
      </div>

      {/* Recent */}
      <div className="bg-card rounded-xl shadow-card p-5 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <h3 className="font-semibold text-foreground mb-4">Pengajuan Terbaru</h3>
        {recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Nama</th>
                  <th className="text-left py-2 font-medium">Tujuan</th>
                  <th className="text-left py-2 font-medium">Tanggal</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-2.5 font-medium text-foreground">{r.userName}</td>
                    <td className="py-2.5 text-muted-foreground">{r.destination}</td>
                    <td className="py-2.5 text-muted-foreground">{new Date(r.startDate).toLocaleDateString('id-ID')}</td>
                    <td className="py-2.5"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">Belum ada pengajuan</p>
        )}
      </div>
    </div>
  );
}

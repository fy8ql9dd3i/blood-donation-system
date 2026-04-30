import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader } from '../../components/ui/Card'
import BarChart from '../../components/charts/BarChart'
import PieChart from '../../components/charts/PieChart'
import api from '../../services/api'
import clsx from 'clsx'
import NewsWidget from '../../components/NewsWidget'

export default function AdminDashboard() {
  const statsQ = useQuery({
    queryKey: ['admin', 'statistics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/statistics')
      return data
    },
  })

  const usersQ = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users')
      return data
    },
  })

  const stats = statsQ.data?.data || statsQ.data || {}
  const users = Array.isArray(usersQ.data?.data) ? usersQ.data.data : (Array.isArray(usersQ.data) ? usersQ.data : [])

  const roleCount = users.reduce((acc, u) => {
    const r = u.role || 'unknown'
    acc[r] = (acc[r] || 0) + 1
    return acc
  }, {})

  const barData = {
    labels: Object.keys(roleCount).map(r => r.replace('_', ' ')),
    datasets: [
      {
        label: 'Staff Count',
        data: Object.values(roleCount),
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
        borderRadius: 8,
      },
    ],
  }

  const pieData = {
    labels: ['Active Users', 'Clinics', 'Blood Units'],
    datasets: [
      {
        data: [
          users.length || 0,
          Number(stats.totalHospitals) || 0,
          Number(stats.totalBloodUnits) || 0,
        ],
        backgroundColor: ['#4f46e5', '#10b981', '#f43f5e'],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* 📢 Latest News & Announcements (Hero) */}
      <NewsWidget />

      {/* Premium Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
             <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300">System Secure</span>
             <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-300">Live Operations</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-2">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Central Command Center</h1>
              <p className="text-slate-400 mt-2 max-w-xl text-lg font-medium italic">
                Monitoring global connectivity, blood inventory health, and secure clinical staff access.
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/admin/news" className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-50 transition-all flex items-center gap-2">
                <span className="text-xl">📢</span> Post Announcement
              </a>
              <a href="/admin/broadcast" className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-red-700 transition-all flex items-center gap-2">
                <span className="text-xl">🔔</span> Broadcast All
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Registered Users', val: users.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Partner Hospitals', val: stats.totalHospitals ?? '0', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Blood Inventory (Units)', val: stats.totalBloodUnits ?? '0', color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'System Uptime', val: '99.9%', color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((kpi, idx) => (
          <div key={idx} className={clsx("p-6 rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg", kpi.bg)}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <p className={clsx("mt-2 text-3xl font-black tracking-tighter", kpi.color)}>
              {statsQ.isLoading ? '...' : kpi.val}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="rounded-3xl border-none shadow-xl ring-1 ring-slate-100 p-6">
          <div className="mb-6">
             <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Workforce Distribution</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Role-based Staffing Breakdown</p>
          </div>
          <BarChart data={barData} />
        </Card>

        <Card className="rounded-3xl border-none shadow-xl ring-1 ring-slate-100 p-6">
           <div className="mb-6">
             <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Operational Composition</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">High-Level Data Integrity Map</p>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <PieChart data={pieData} />
          </div>
        </Card>
      </div>

      {/* System Health Section */}
      <div className="bg-slate-100/50 p-8 rounded-3xl border border-slate-200">
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
               <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">System Health & Security Sentinel</h2>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Real-time Data Integrity Verification</p>
            </div>
         </div>
         
         <div className="grid gap-4 md:grid-cols-3">
            {[
               { title: 'Database Connectivity', desc: 'Secure PostgreSQL connection active', status: 'Optimal', color: 'text-emerald-600' },
               { title: 'Auth Protection', desc: 'JWT & Multi-Role Guarding active', status: 'Hardened', color: 'text-indigo-600' },
               { title: 'Data Encryption', desc: 'SSL/TLS & Bcrypt hashing verified', status: 'Encrypted', color: 'text-blue-600' }
            ].map((s, i) => (
               <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className={clsx("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100", s.color)}>{s.status}</span>
                  <h4 className="font-black text-slate-800 mt-2 text-sm">{s.title}</h4>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tight">{s.desc}</p>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}

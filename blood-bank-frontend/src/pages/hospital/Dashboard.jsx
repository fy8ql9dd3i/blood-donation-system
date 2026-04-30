import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import BarChart from '../../components/charts/BarChart'
import PieChart from '../../components/charts/PieChart'
import * as hospitalService from '../../services/hospitalService'
import * as inventoryService from '../../services/inventoryService'
import NewsWidget from '../../components/NewsWidget'
import clsx from 'clsx'

function pickList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}

function pickInventory(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}

export default function HospitalDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['hospital', 'my-requests'],
    queryFn: () => hospitalService.getMyBloodRequests(),
  })

  const requests = pickList(data)

  const byStatus = requests.reduce((acc, r) => {
    const s = r.status || 'unknown'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  const barData = {
    labels: Object.keys(byStatus).length ? Object.keys(byStatus) : ['pending'],
    datasets: [
      {
        label: 'Requests',
        data: Object.keys(byStatus).length
          ? Object.values(byStatus)
          : [0],
        backgroundColor: '#dc2626',
        borderRadius: 6,
      },
    ],
  }

  const urgency = requests.reduce((acc, r) => {
    const u = r.urgencyLevel || 'unknown'
    acc[u] = (acc[u] || 0) + 1
    return acc
  }, {})

  const pieData = {
    labels: Object.keys(urgency).length ? Object.keys(urgency) : ['—'],
    datasets: [
      {
        data: Object.keys(urgency).length ? Object.values(urgency) : [1],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#94a3b8'],
        borderWidth: 0,
      },
    ],
  }

  const { data: inventoryData, isLoading: invLoading } = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => inventoryService.getInventory(),
  })

  const inventory = pickInventory(inventoryData)
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const getStockForType = (type) => {
    return inventory
      .filter(i => (i.bloodType || i.blood_type) === type)
      .reduce((sum, i) => sum + Number(i.quantity || i.qty || 0), 0)
  }

  const pending = requests.filter((r) => r.status === 'pending').length
  const high = requests.filter((r) => r.urgencyLevel === 'high').length

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Hospital Logistics</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Real-time Inventory & Request Console
          </p>
        </div>
        <Link
          to="/hospital/request-blood"
          className="bg-brand-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 active:scale-95 transition-all"
        >
          Submit New Request
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-3xl border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
          <p className="mt-1 text-3xl font-black text-slate-900 tracking-tighter">
            {isLoading ? '…' : requests.length}
          </p>
        </Card>
        <Card className="rounded-3xl border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</p>
          <p className="mt-1 text-3xl font-black text-amber-600 tracking-tighter">
            {isLoading ? '…' : pending}
          </p>
        </Card>
        <Card className="rounded-3xl border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Dispatches</p>
          <p className="mt-1 text-3xl font-black text-red-600 tracking-tighter">
            {isLoading ? '…' : high}
          </p>
        </Card>
      </div>

      {/* Live Blood Bank Inventory (Hospital View) */}
      <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-slate-900 text-white">
        <CardHeader 
          title={<span className="text-white font-black uppercase tracking-tight">Live Blood Bank Availability</span>}
          subtitle={<span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Real-time stock across the regional network</span>}
        />
        <div className="p-6 pt-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {bloodTypes.map(type => {
            const stock = getStockForType(type)
            return (
              <div key={type} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center flex flex-col justify-between items-center group hover:bg-white/10 transition-all">
                <span className="text-brand-500 font-black text-xl mb-1">{type}</span>
                <span className={clsx(
                  "text-lg font-black tracking-tighter",
                  stock === 0 ? "text-red-500" : "text-white"
                )}>
                  {invLoading ? '...' : stock}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Units</span>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-slate-200">
          <CardHeader title="Order Distribution" />
          <div className="h-64 flex items-center justify-center">
            <BarChart data={barData} />
          </div>
        </Card>
        <Card className="rounded-3xl border-slate-200">
          <CardHeader title="Urgency Mix" />
          <div className="h-64 flex items-center justify-center">
            <PieChart data={pieData} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Quick actions"
          subtitle="Submit a new request or review progress"
          action={
            <Link
              to="/hospital/request-blood"
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              New request →
            </Link>
          }
        />
        <div className="flex flex-wrap gap-3">
          <Link
            to="/hospital/request-blood"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Request blood
          </Link>
          <Link
            to="/hospital/track"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
          >
            Track requests
          </Link>
          <Link
            to="/hospital/availability"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
          >
            View availability
          </Link>
        </div>
      </Card>
      {/* Recent Activity Table */}
      <Card>
        <CardHeader 
          title="Recent request activity" 
          subtitle="Real-time status of your hospital's latest orders"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Safety/Expiry</th>
                <th className="px-4 py-3">Bank Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="5" className="p-10 text-center animate-pulse text-slate-400">Syncing with Blood Bank...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-300 italic">No recent requests recorded.</td></tr>
              ) : requests.slice(0, 5).map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{r.patientName}</td>
                  <td className="px-4 py-3">
                    <span className="bg-brand-50 text-brand-700 px-2 py-1 rounded font-black text-xs">{r.bloodType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      r.status === 'fulfilled' ? "bg-emerald-100 text-emerald-700" : 
                      r.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    )}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'fulfilled' ? (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified Safe</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Pending check</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 italic">
                    {r.responseMessage || 'Awaiting inventory verification...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* News Widget */}
      <NewsWidget />
    </div>
  )
}

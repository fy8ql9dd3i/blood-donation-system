import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader } from '../../components/ui/Card'
import BarChart from '../../components/charts/BarChart'
import PieChart from '../../components/charts/PieChart'
import api from '../../services/api'

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
  const users = Array.isArray(usersQ.data?.data)
    ? usersQ.data.data
    : Array.isArray(usersQ.data)
      ? usersQ.data
      : []

  const roleCount = users.reduce((acc, u) => {
    const r = u.role || 'unknown'
    acc[r] = (acc[r] || 0) + 1
    return acc
  }, {})

  const barData = {
    labels: Object.keys(roleCount).length ? Object.keys(roleCount) : ['users'],
    datasets: [
      {
        label: 'Users by role',
        data: Object.keys(roleCount).length ? Object.values(roleCount) : [users.length || 0],
        backgroundColor: '#4f46e5',
        borderRadius: 6,
      },
    ],
  }

  const pieData = {
    labels: ['Users', 'Hospitals (stat)', 'Blood units (stat)'],
    datasets: [
      {
        data: [
          users.length || 1,
          Number(stats.totalHospitals ?? 1) || 1,
          Number(stats.totalBloodUnits ?? 1) || 1,
        ],
        backgroundColor: ['#6366f1', '#22c55e', '#ef4444'],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="text-slate-600">System-wide metrics from /api/admin/*</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Users (from list endpoint)</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {usersQ.isLoading ? '…' : users.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Hospitals</p>
          <p className="mt-1 text-3xl font-semibold text-emerald-600">
            {statsQ.isLoading ? '…' : stats.totalHospitals ?? '—'}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Blood units</p>
          <p className="mt-1 text-3xl font-semibold text-red-600">
            {statsQ.isLoading ? '…' : stats.totalBloodUnits ?? '—'}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Users by role" />
          {usersQ.isError && (
            <p className="text-sm text-amber-700">
              User list failed — ensure admin controller returns data correctly.
            </p>
          )}
          <BarChart data={barData} />
        </Card>
        <Card>
          <CardHeader title="High-level mix" />
          <PieChart data={pieData} />
        </Card>
      </div>
    </div>
  )
}

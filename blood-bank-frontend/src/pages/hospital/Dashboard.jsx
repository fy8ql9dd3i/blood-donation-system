import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../../components/ui/Card'
import BarChart from '../../components/charts/BarChart'
import PieChart from '../../components/charts/PieChart'
import * as hospitalService from '../../services/hospitalService'

function pickList(res) {
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

  const pending = requests.filter((r) => r.status === 'pending').length
  const high = requests.filter((r) => r.urgencyLevel === 'high').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hospital dashboard</h1>
        <p className="text-slate-600">
          Overview of blood requests for your facility.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total requests</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {isLoading ? '…' : requests.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-1 text-3xl font-semibold text-amber-600">
            {isLoading ? '…' : pending}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">High urgency</p>
          <p className="mt-1 text-3xl font-semibold text-red-600">
            {isLoading ? '…' : high}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Requests by status" />
          <BarChart data={barData} />
        </Card>
        <Card>
          <CardHeader title="Urgency mix" />
          <PieChart data={pieData} />
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
    </div>
  )
}

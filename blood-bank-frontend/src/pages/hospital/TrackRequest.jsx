import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../components/ui/Card'
import * as hospitalService from '../../services/hospitalService'
function pickList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function TrackRequest() {
  const notifiedRef = useRef(false)

  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ['hospital', 'my-requests'],
    queryFn: () => hospitalService.getMyBloodRequests(),
  })

  const requests = pickList(data)

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message || 'Could not load your blood requests'
      )
    }
  }, [isError, error])

  useEffect(() => {
    if (isSuccess && !notifiedRef.current) {
      notifiedRef.current = true
      toast.success(
        requests.length
          ? `Loaded ${requests.length} request(s)`
          : 'No requests yet — submit one from Request blood'
      )
    }
  }, [isSuccess, requests.length])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Track requests</h1>
        <p className="text-slate-600">
          Blood requests submitted by your hospital (GET /api/requests/hospital/me).
        </p>
      </div>

      <Card>
        <CardHeader
          title="Your requests"
          subtitle="Newest and highest urgency first"
        />
        {isLoading && (
          <p className="text-sm text-slate-500">Loading requests…</p>
        )}
        {isError && (
          <p className="text-sm text-red-600">
            {error?.response?.data?.message || 'Could not load requests'}
          </p>
        )}
        {!isLoading && !isError && requests.length === 0 && (
          <p className="text-sm text-slate-500">No requests yet.</p>
        )}
        {!isLoading && requests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-2 pr-4 font-medium">Patient</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Units</th>
                  <th className="pb-2 pr-4 font-medium">Urgency</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {r.patientName}
                    </td>
                    <td className="py-3 pr-4">{r.bloodType}</td>
                    <td className="py-3 pr-4">{r.unitsRequired}</td>
                    <td className="py-3 pr-4 capitalize">{r.urgencyLevel}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          statusStyles[r.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

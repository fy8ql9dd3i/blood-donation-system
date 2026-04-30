import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../components/ui/Card'
import * as hospitalService from '../../services/hospitalService'
import clsx from 'clsx'
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
  cancelled: 'bg-red-100 text-red-800',
  fulfilled: 'bg-emerald-100 text-emerald-800',
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
  const dispatchesQ = useQuery({
    queryKey: ['hospital', 'my-dispatches'],
    queryFn: () => hospitalService.getMyDispatches(),
  })

  const dispatches = pickList(dispatchesQ.data)

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Supply Logistics</h1>
        <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-1">
          Monitor your hospital's blood requests and incoming inventory dispatches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <Card className="rounded-[32px] border-slate-200 shadow-xl overflow-hidden border-b-8 border-brand-500">
          <CardHeader
            title="Request Tracking"
            subtitle="Live status of your submitted blood orders"
          />
          <div className="p-6">
            {isLoading && (
              <p className="text-sm text-slate-500 animate-pulse font-bold uppercase tracking-widest">Loading orders…</p>
            )}
            {isError && (
              <p className="text-sm text-red-600 font-bold uppercase">
                {error?.response?.data?.message || 'Network error'}
              </p>
            )}
            {!isLoading && !isError && requests.length === 0 && (
              <p className="p-10 text-center text-xs text-slate-300 italic font-black uppercase tracking-[0.2em]">No Active Requests</p>
            )}
            {!isLoading && requests.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Group</th>
                      <th className="px-6 py-4">Units</th>
                      <th className="px-6 py-4">Urgency</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-5 font-black text-slate-900">
                          {r.patientName}
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-lg font-black text-xs">{r.bloodType}</span>
                        </td>
                        <td className="px-6 py-5 font-bold">{r.unitsRequired}</td>
                        <td className="px-6 py-5">
                          <span className={clsx(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                            r.urgencyLevel === 'high' || r.urgencyLevel === 'emergency' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                          )}>
                            {r.urgencyLevel}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                              statusStyles[r.status] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-[11px] font-medium text-slate-500 italic">
                          {r.responseMessage || 'Fulfillment in progress...'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* --- HOSPITAL TRACK TABLE --- */}
        <Card className="rounded-[32px] border-slate-900 border-b-8 shadow-2xl overflow-hidden bg-white">
          <div className="p-8 bg-slate-900">
            <h3 className="text-white font-black text-xl uppercase tracking-tight">Hospital Track Table</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Audit log of blood units received from the regional bank</p>
          </div>
          <div className="p-6">
            {dispatchesQ.isLoading ? (
              <p className="p-10 text-center text-xs text-slate-300 animate-pulse font-black uppercase tracking-widest">Scanning Dispatch Registry...</p>
            ) : dispatches.length === 0 ? (
              <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-xs text-slate-300 italic font-black uppercase tracking-[0.2em]">No Incoming Shipments Recorded</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Received Date</th>
                      <th className="px-6 py-4">Blood Group</th>
                      <th className="px-6 py-4 text-center">Units</th>
                      <th className="px-6 py-4 text-center">Expiry Date</th>
                      <th className="px-6 py-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dispatches.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-6 py-5 text-xs font-bold text-slate-500">
                          {new Date(d.dispatchedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-lg shadow-brand-100 group-hover:scale-110 transition-transform">
                              {d.bloodType}
                            </div>
                            <span className="font-black text-slate-900 text-sm tracking-tight">Type {d.bloodType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center font-black text-slate-900 text-lg">{d.units}</td>
                        <td className="px-6 py-5 text-center">
                          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg font-mono text-[11px] font-bold">
                            {new Date(d.expiryDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            Stocked
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}


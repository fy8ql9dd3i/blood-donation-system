import { useEffect, useRef, useState } from 'react'
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
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [thankYouMessage, setThankYouMessage] = useState('')
  const [patientContext, setPatientContext] = useState('Birth Mom / Childbirth')
  const [isSending, setIsSending] = useState(false)

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

  const handleSendThankYou = async () => {
    if (!thankYouMessage) return toast.error('Please enter a message')
    setIsSending(true)
    try {
      await hospitalService.sendThankYouLetter({
        message: thankYouMessage,
        bloodType: selectedRequest.bloodType,
        unitsUsed: selectedRequest.unitsRequired,
        patientContext: patientContext,
        patientName: selectedRequest.patientName,
        requestId: selectedRequest.id
      })
      toast.success('Appreciation sent to the Blood Bank!')
      setSelectedRequest(null)
      setThankYouMessage('')
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Logistics Node: Bahir Dar District</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Supply Intelligence</h1>
        <p className="text-slate-500 font-medium max-w-2xl">Real-time synchronization of hospital requirements and regional blood bank dispatches.</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* --- REQUEST TRACKING --- */}
        <Card className="rounded-2xl formal-border shadow-lg overflow-hidden bg-white border-b-4 border-brand-600">
          <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Requirements</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Status of pending and fulfilled requests</p>
            </div>
            <div className="text-4xl opacity-20">📋</div>
          </div>
          <div className="p-0">
            {isLoading && (
              <div className="p-20 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Querying Global Registry...</p>
              </div>
            )}
            {isError && (
              <div className="p-20 text-center">
                <p className="text-sm text-red-600 font-black uppercase tracking-widest">Connection Interrupted</p>
                <p className="text-xs text-slate-400 mt-2">{error?.response?.data?.message || 'Network sync failed'}</p>
              </div>
            )}
            {!isLoading && !isError && requests.length === 0 && (
              <div className="p-24 text-center">
                <div className="text-6xl mb-6 opacity-10">🍃</div>
                <p className="text-xs text-slate-300 italic font-black uppercase tracking-[0.3em]">No Active Requirements Found</p>
              </div>
            )}
            {!isLoading && requests.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-10 py-6">Patient Context</th>
                      <th className="px-10 py-6">Blood Spec</th>
                      <th className="px-10 py-6">Volume</th>
                      <th className="px-10 py-6">Priority</th>
                      <th className="px-10 py-6">Operational Status</th>
                      <th className="px-10 py-6 text-right">Notes & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">{r.patientName}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Request ID: #{r.id.toString().slice(-6)}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="bg-brand-50 text-brand-600 px-4 py-2 rounded-xl font-black text-sm border border-brand-100">{r.bloodType}</span>
                        </td>
                        <td className="px-10 py-8 font-black text-slate-900">
                          {r.unitsRequired} <span className="text-[10px] text-slate-400 uppercase ml-1">Units</span>
                          {r.dispatches && r.dispatches.length > 0 && (
                            <div className="text-[10px] text-brand-600 font-bold uppercase mt-1">
                              Dispatched: {r.dispatches.reduce((sum, d) => sum + Number(d.units || 0), 0)} units
                            </div>
                          )}
                        </td>
                        <td className="px-10 py-8">
                          <span className={clsx(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            r.urgencyLevel === 'high' || r.urgencyLevel === 'emergency'
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-slate-50 text-slate-500 border-slate-100"
                          )}>
                            {r.urgencyLevel}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <span
                            className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm ${statusStyles[r.status] || 'bg-slate-100 text-slate-700'
                              }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-6">
                            <span className="text-[11px] font-bold text-slate-400 italic max-w-[150px] truncate">{r.responseMessage || 'Processing...'}</span>
                            {(r.status === 'fulfilled' || r.status === 'completed') && (
                              <button
                                onClick={() => setSelectedRequest(r)}
                                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-black uppercase text-[10px] hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-95"
                              >
                                💝 Express Thanks
                              </button>
                            )}
                          </div>
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
        <Card className="rounded-2xl formal-border shadow-lg overflow-hidden bg-white border-b-4 border-slate-900">
          <div className="p-10 bg-slate-900 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Inventory Inbound Log</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Verified units received into hospital storage</p>
            </div>
            <div className="text-4xl opacity-30">🚚</div>
          </div>
          <div className="p-0">
            {dispatchesQ.isLoading ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Syncing Dispatch Manifest...</p>
              </div>
            ) : dispatches.length === 0 ? (
              <div className="p-24 text-center">
                <div className="text-6xl mb-6 opacity-10">📦</div>
                <p className="text-xs text-slate-300 italic font-black uppercase tracking-[0.3em]">No Incoming Shipments Logged</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-10 py-6">Dispatch Timeline</th>
                      <th className="px-10 py-6">Biological Specification</th>
                      <th className="px-10 py-6 text-center">Batch Volume</th>
                      <th className="px-10 py-6 text-center">Safety Expiry</th>
                      <th className="px-10 py-6 text-right">Authentication</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dispatches.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-10 py-8 text-xs font-black text-slate-500 uppercase tracking-tighter">
                          {new Date(d.dispatchedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-2xl shadow-brand-200 group-hover:rotate-6 transition-transform">
                              {d.bloodType}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-base tracking-tight leading-none mb-1">Type {d.bloodType}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Certified Batch</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center font-black text-slate-900 text-2xl tracking-tighter">{d.units} <span className="text-[10px] text-slate-400 uppercase font-bold">Units</span></td>
                        <td className="px-10 py-8 text-center">
                          <div className="inline-flex flex-col items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Safety Date</span>
                            <span className="font-mono text-xs font-black text-slate-900">
                              {new Date(d.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                            Verified & Stocked
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

      {/* --- THANK YOU MODAL (ENHANCED) --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500">
          <Card className="w-full max-w-xl rounded-2xl formal-border shadow-[0_0_100px_rgba(211,16,39,0.2)] bg-white overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-brand-600 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all text-lg"
              >✕</button>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mb-4 animate-bounce-slow">💝</div>
              <h3 className="text-2xl font-black tracking-tighter uppercase leading-tight">Express Gratitude<br />አድናቆትዎን ይግለጹ</h3>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Official feedback to the regional blood bank</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                  <p className="text-lg font-black text-slate-900 tracking-tighter truncate" title={selectedRequest.patientName}>{selectedRequest.patientName || 'Unknown'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Biological Group</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">{selectedRequest.bloodType}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verified Units</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">{selectedRequest.unitsRequired}</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Clinical Context • ክሊኒካዊ ሁኔታ</label>
                <input
                  type="text"
                  value={patientContext}
                  onChange={(e) => setPatientContext(e.target.value)}
                  placeholder="e.g. Birth Mom / Childbirth success"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Your Appreciation • የእርስዎ መልዕክት</label>
                <textarea
                  rows={4}
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  placeholder="Share how this supply impacted patient outcome..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-all resize-none"
                />
              </div>

              <button
                onClick={handleSendThankYou}
                disabled={isSending}
                className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 text-white py-4 rounded-xl shadow-lg shadow-slate-200 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isSending ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Transmitting...</>
                ) : (
                  <><span className="text-lg">🕊️</span> Dispatch Gratitude Letter</>
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../components/ui/Card'
import api from '../../services/api'
import clsx from 'clsx'

export default function EmergencyAlerts() {
  const [bloodType, setBloodType] = useState('O+')
  const [message, setMessage] = useState('Urgent: Blood donor needed at local facility.')

  const broadcastM = useMutation({
    mutationFn: (payload) => api.post('/notifications/broadcast', payload),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Emergency broadcast sent to all matching donors!')
    },
    onError: (err) => {
      console.error('Emergency Broadcast Error:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to send broadcast.'
      toast.error(msg, { autoClose: 5000 })
      if (err?.response?.status === 403) toast.warning('You do not have permission to send emergency alerts.')
    }
  })

  const reminderM = useMutation({
    mutationFn: () => api.post('/notifications/reminders'),
    onSuccess: (res) => {
      toast.info(res.data?.message || 'Donation reminders sent to all eligible donors!')
    },
    onError: () => toast.error('Failed to trigger manual reminders.')
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleSend = () => {
    if (!bloodType) return toast.warning('Please select a blood type')
    broadcastM.mutate({ 
        bloodType, 
        message: message || `Urgent: ${bloodType} blood needed near you. Can you donate?` 
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16" />
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Emergency Sentinel</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Direct donor broadcast system</p>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-2xl">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-rose-600 uppercase">Live Emergency Response</span>
         </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         <div className="lg:col-span-2">
            <Card className="rounded-3xl border-none shadow-xl ring-1 ring-slate-100 p-8">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Create Urgent Request</h3>
               
               <div className="space-y-6">
                  <div>
                     <label className="text-[11px] font-black text-slate-500 uppercase px-1">Target Blood Group</label>
                     <div className="grid grid-cols-5 gap-2 mt-2">
                        <button
                           onClick={() => setBloodType('ALL')}
                           className={clsx(
                              "py-3 rounded-xl text-xs font-black transition-all border-2",
                              bloodType === 'ALL' 
                                 ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200 scale-105" 
                                 : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:border-rose-200"
                           )}
                        >
                           ALL
                        </button>
                        {bloodTypes.map(t => (
                           <button
                              key={t}
                              onClick={() => setBloodType(t)}
                              className={clsx(
                                 "py-3 rounded-xl text-xs font-black transition-all border-2",
                                 bloodType === t 
                                    ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200 scale-105" 
                                    : "bg-slate-50 border-slate-100 text-slate-600 hover:border-rose-200"
                              )}
                           >
                              {t}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="text-[11px] font-black text-slate-500 uppercase px-1">Detailed Message</label>
                     <textarea 
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full mt-2 bg-slate-50 border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-rose-100 transition-all resize-none"
                        placeholder="Urgent: Your blood type is needed at City Hospital..."
                     />
                  </div>

                  <button 
                     onClick={handleSend}
                     disabled={broadcastM.isPending}
                     className="w-full bg-slate-900 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                     {broadcastM.isPending ? 'Broadcasting Alert...' : 'Initiate Global Broadcast'}
                  </button>
               </div>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="rounded-3xl bg-indigo-600 border-none shadow-xl p-8 text-white">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">Manual Reminders</h4>
               <p className="text-xs mt-2 opacity-90 leading-relaxed">
                  Triggers the system to search for all donors who have passed their 90-day waiting period and sends them a "Ready to Donate" notification.
               </p>
               <button 
                  onClick={() => reminderM.mutate()}
                  disabled={reminderM.isPending}
                  className="mt-6 w-full bg-white text-indigo-600 font-black uppercase text-[10px] py-4 rounded-2xl shadow-xl hover:scale-105 transition-all disabled:opacity-50"
               >
                  {reminderM.isPending ? 'Sending Reminders...' : 'Trigger System-Wide Reminders'}
               </button>
            </Card>

            <Card className="rounded-3xl bg-slate-900 border-none shadow-xl p-8 text-white">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">How Broadcast works</h4>
               <ul className="mt-4 space-y-4 text-xs font-medium">
                  <li className="flex gap-3 text-slate-400 font-bold">
                     <span className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-black text-white">1</span>
                     Select the critical blood type in short supply.
                  </li>
                  <li className="flex gap-3 text-slate-400 font-bold">
                     <span className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-black text-white">2</span>
                     Filters all registered donors on the mobile app.
                  </li>
                  <li className="flex gap-3 text-slate-400 font-bold">
                     <span className="w-5 h-5 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-black text-white">3</span>
                     Instant **Firebase Push Notifications** are sent.
                  </li>
               </ul>
            </Card>

            <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center text-center">
               <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-lg">⚠️</div>
               <p className="text-[10px] font-black text-slate-800 uppercase mt-3">Governance Policy</p>
               <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">ONLY USE FOR CRITICAL SHORTAGES TO AVOID NOTIFICATION FATIGUE.</p>
            </div>
         </div>
      </div>
    </div>
  )
}

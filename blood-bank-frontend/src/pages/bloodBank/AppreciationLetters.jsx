import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../../components/ui/Card'
import api from '../../services/api'
import { toast } from 'react-toastify'

export default function AppreciationLetters() {
  const queryClient = useQueryClient()

  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['letters', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/appreciation/all')
      return data.success ? data.data : []
    }
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => api.patch(`/appreciation/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(['letters', 'all'])
    }
  })

  const relayMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/appreciation/${id}/relay`)
      return data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      if (data.donors && data.donors.length > 0) {
        setHonoredDonors({ id: data.id, list: data.donors })
      }
    },
    onError: () => toast.error('Failed to relay commendation')
  })

  const [honoredDonors, setHonoredDonors] = React.useState({ id: null, list: [] })

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Hospital Gratitude</h1>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-1">
            Official thank you letters from hospitals and medical staff.
          </p>
        </div>
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl">🕊️</div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />)
        ) : letters.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="text-5xl">📭</span>
            <p className="mt-4 text-slate-400 font-black uppercase tracking-widest">No letters received yet</p>
          </div>
        ) : (
          letters.map((letter) => (
            <Card 
              key={letter.id} 
              className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                !letter.isRead ? 'bg-white shadow-lg border-emerald-100' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {!letter.isRead && (
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
              )}
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                      Success Story
                    </span>
                    <span className="text-slate-400 text-xs font-bold">
                      {new Date(letter.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    "{letter.message}"
                  </h3>

                  <div className="flex flex-wrap gap-4 pt-2">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Hospital:</span>
                        <span className="text-xs font-black text-slate-700 uppercase">{letter.hospitalName}</span>
                     </div>
                     <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                        <span className="text-xs font-bold text-slate-400">Case:</span>
                        <span className="text-xs font-black text-emerald-600 uppercase">{letter.patientName ? `${letter.patientName} - ` : ''}{letter.patientContext || 'General Care'}</span>
                     </div>
                     <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                        <span className="text-xs font-bold text-slate-400">Impact:</span>
                        <span className="text-xs font-black text-brand-600 uppercase">{letter.unitsUsed} Units of {letter.bloodType}</span>
                     </div>
                  </div>

                  {honoredDonors.list.length > 0 && honoredDonors.id === letter.id && (
                    <div className="mt-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Verified Heroes Notified:</p>
                      <div className="flex flex-wrap gap-2">
                        {honoredDonors.list.map(d => (
                          <span key={d.id} className="px-3 py-1 bg-white border border-emerald-200 rounded-lg text-[10px] font-bold text-slate-700">
                            {d.name} <span className="text-emerald-600 ml-1">({d.bloodType})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 space-y-4">
                  {!letter.isRead ? (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => markReadMutation.mutate(letter.id)}
                        className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                      >
                        Acknowledge
                      </button>
                      <button 
                        onClick={() => relayMutation.mutate(letter.id)}
                        disabled={relayMutation.isPending}
                        className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                      >
                        {relayMutation.isPending ? '⏳ Sending...' : 'Relay to Donor'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="text-emerald-500">✓</span> Archived in Registry
                       </span>
                       <button 
                        onClick={() => relayMutation.mutate(letter.id)}
                        disabled={relayMutation.isPending}
                        className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-50"
                      >
                        {relayMutation.isPending ? '⏳...' : 'Re-send Thanks'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="bg-brand-50 rounded-2xl p-8 border border-brand-100 flex items-center gap-6">
        <div className="text-5xl">❤️</div>
        <div>
          <h3 className="text-xl font-black text-brand-900 tracking-tighter uppercase">Why these matter</h3>
          <p className="text-brand-700/80 font-medium text-sm mt-1 leading-relaxed">
            Every unit of blood you process saves a life. These success stories from our partner hospitals are a testament to your hard work and dedication. Keep saving lives!
          </p>
        </div>
      </div>
    </div>
  )
}

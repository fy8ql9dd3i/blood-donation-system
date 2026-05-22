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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Gratitude</h1>
          <p className="text-slate-500 text-sm mt-1">
            Official thank you letters from hospitals and medical staff.
          </p>
        </div>
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-xl">🕊️</div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)
        ) : letters.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <span className="text-3xl">📭</span>
            <p className="mt-3 text-slate-500 font-medium">No letters received yet</p>
          </div>
        ) : (
          letters.map((letter) => (
            <Card 
              key={letter.id} 
              className={`p-5 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                !letter.isRead ? 'bg-white shadow-sm border-emerald-100' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {!letter.isRead && (
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              )}
              
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md">
                      Success Story
                    </span>
                    <span className="text-slate-500 text-xs font-medium">
                      {new Date(letter.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-medium text-slate-900 leading-relaxed">
                    "{letter.message}"
                  </h3>

                  <div className="flex flex-wrap gap-4 pt-1">
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Hospital:</span>
                        <span className="text-xs font-medium text-slate-700">{letter.hospitalName}</span>
                     </div>
                     <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                        <span className="text-xs text-slate-500">Case:</span>
                        <span className="text-xs font-medium text-emerald-600">{letter.patientName ? `${letter.patientName} - ` : ''}{letter.patientContext || 'General Care'}</span>
                     </div>
                     <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                        <span className="text-xs text-slate-500">Impact:</span>
                        <span className="text-xs font-medium text-brand-600">{letter.unitsUsed} Units of {letter.bloodType}</span>
                     </div>
                  </div>

                  {honoredDonors.list.length > 0 && honoredDonors.id === letter.id && (
                    <div className="mt-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-xs font-semibold text-emerald-700 mb-2">Verified Heroes Notified:</p>
                      <div className="flex flex-wrap gap-2">
                        {honoredDonors.list.map(d => (
                          <span key={d.id} className="px-2 py-1 bg-white border border-emerald-200 rounded text-xs font-medium text-slate-700">
                            {d.name} <span className="text-emerald-600 ml-1">({d.bloodType})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 space-y-3 w-full md:w-auto">
                  {!letter.isRead ? (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => markReadMutation.mutate(letter.id)}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm w-full md:w-auto"
                      >
                        Acknowledge
                      </button>
                      <button 
                        onClick={() => relayMutation.mutate(letter.id)}
                        disabled={relayMutation.isPending}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 w-full md:w-auto"
                      >
                        {relayMutation.isPending ? '⏳...' : 'Relay to Donor'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start md:items-end gap-2">
                       <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <span className="text-emerald-500">✓</span> Archived
                       </span>
                       <button 
                        onClick={() => relayMutation.mutate(letter.id)}
                        disabled={relayMutation.isPending}
                        className="px-3 py-1.5 bg-white text-emerald-600 text-xs font-medium rounded-md border border-emerald-200 hover:bg-emerald-50 transition-colors disabled:opacity-50"
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

      <div className="bg-brand-50 rounded-xl p-5 border border-brand-100 flex items-center gap-4">
        <div className="text-3xl">❤️</div>
        <div>
          <h3 className="text-base font-semibold text-brand-900">Why these matter</h3>
          <p className="text-brand-700 text-sm mt-0.5 leading-relaxed">
            Every unit of blood you process saves a life. These success stories from our partner hospitals are a testament to your hard work.
          </p>
        </div>
      </div>
    </div>
  )
}

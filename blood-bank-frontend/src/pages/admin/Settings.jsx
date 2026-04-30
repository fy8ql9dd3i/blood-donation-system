import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { useState } from 'react'

export default function Settings() {
  const queryClient = useQueryClient()
  const [isRestoring, setIsRestoring] = useState(false)

  // Maintenance Status Query
  const maintenanceStatusQ = useQuery({
    queryKey: ['admin', 'maintenance', 'status'],
    queryFn: async () => {
      const { data } = await api.get('/admin/maintenance/status')
      return data
    }
  })

  // Backups List Query
  const backupsQ = useQuery({
    queryKey: ['admin', 'backups'],
    queryFn: async () => {
      const { data } = await api.get('/admin/backups')
      return data.data || []
    }
  })

  // Mutations
  const backupM = useMutation({
    mutationFn: () => api.post('/admin/backup'),
    onSuccess: () => {
      toast.success('Database backup created successfully.')
      queryClient.invalidateQueries(['admin', 'backups'])
    },
    onError: () => toast.error('Backup failed')
  })

  const toggleMaintenanceM = useMutation({
    mutationFn: () => api.post('/admin/maintenance/toggle'),
    onSuccess: (res) => {
      toast.info(`Maintenance mode ${res.data.isMaintenance ? 'ENABLED' : 'DISABLED'}`)
      queryClient.invalidateQueries(['admin', 'maintenance', 'status'])
    },
    onError: () => toast.error('Failed to toggle maintenance mode')
  })

  const restoreM = useMutation({
    mutationFn: (fileName) => api.post('/admin/restore', { fileName }),
    onSuccess: () => {
      toast.success('System restoration successful!')
      setIsRestoring(false)
      window.location.reload() // Force reload to ensure all data is fresh
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Restoration failed')
      setIsRestoring(false)
    }
  })

  const handleRestore = (fileName) => {
    if (window.confirm(`⚠️ WARNING: Restoring from ${fileName} will delete all current data. Are you sure?`)) {
      setIsRestoring(true)
      restoreM.mutate(fileName)
    }
  }

  const isMaintenance = maintenanceStatusQ.data?.isMaintenance || false

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Technical Governance</h1>
           <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">System Control & Disaster Recovery</p>
        </div>
        <div className={clsx(
          "p-4 rounded-2xl border transition-all",
          isMaintenance ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
        )}>
           <div className={clsx(
             "w-3 h-3 rounded-full mb-1",
             isMaintenance ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
           )} />
           <p className="text-[10px] font-black uppercase text-slate-600">
             {isMaintenance ? 'Maintenance Active' : 'System Operational'}
           </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
         {/* System State Control */}
         <Card className="rounded-[2rem] border-none shadow-xl ring-1 ring-slate-100 p-8 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">System State Control</h3>
            
            <div className="flex-1 space-y-6">
              <div className={clsx(
                "p-6 rounded-3xl border-2 transition-all",
                isMaintenance ? "bg-amber-50 border-amber-500/30" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-800 uppercase text-xs">Maintenance Mode</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Locks all non-admin users out</p>
                  </div>
                  <button 
                    onClick={() => toggleMaintenanceM.mutate()}
                    className={clsx(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2",
                      isMaintenance ? "bg-amber-600 ring-amber-500" : "bg-slate-200 ring-slate-100"
                    )}
                  >
                    <span className={clsx(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isMaintenance ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200">
                 <p className="text-xs font-black uppercase tracking-widest opacity-80">Instant Snapshot</p>
                 <p className="text-base font-medium mt-1 leading-snug">Create a secure JSON restore point of all models.</p>
                 <button 
                    onClick={() => backupM.mutate()}
                    disabled={backupM.isPending}
                    className="mt-6 w-full bg-white text-indigo-600 font-black uppercase text-[11px] py-4 rounded-2xl shadow-lg hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                 >
                    {backupM.isPending ? 'Processing Snapshot...' : 'Initiate Secure Backup'}
                 </button>
              </div>
            </div>
         </Card>

         {/* Data Recovery Sentinel */}
         <Card className="rounded-[2rem] border-none shadow-xl ring-1 ring-slate-100 p-8">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Recovery Sentinel</h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {backupsQ.isLoading ? (
                <div className="text-center py-10 text-slate-400 font-bold uppercase text-xs">Loading recovery points...</div>
              ) : backupsQ.data?.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold uppercase text-xs italic">No recovery points found</div>
              ) : (
                backupsQ.data.map((b) => (
                  <div key={b.fileName} className="group p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-700">{b.fileName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {new Date(b.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRestore(b.fileName)}
                        disabled={isRestoring}
                        className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isRestoring ? 'Restoring...' : 'Recover Data'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase text-center border-t border-slate-100 pt-4">
              ⚠️ Restoration will overwrite all current data permanently.
            </p>
         </Card>
      </div>

      {/* Threshold Policies */}
      <Card className="rounded-[2rem] border-none shadow-xl ring-1 ring-slate-100 p-10">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-indigo-500 rounded-full" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Global Threshold Policies</h3>
         </div>
         <Formik
            initialValues={{
               lowStockThreshold: Number(localStorage.getItem('lowStockThreshold') || 5),
            }}
            onSubmit={(values) => {
               localStorage.setItem('lowStockThreshold', String(values.lowStockThreshold))
               toast.success('Threshold policies updated successfully.')
            }}
         >
            {({ values }) => (
               <Form className="flex flex-col md:flex-row items-end gap-6">
                  <div className="flex-1 space-y-3">
                     <label className="text-[11px] font-black text-slate-500 uppercase px-1">Inventory Low Stock Alert Value</label>
                     <Field name="lowStockThreshold" type="number" className="w-full bg-slate-50 border-slate-200 rounded-3xl px-8 py-5 text-2xl font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all border-2 focus:border-indigo-300" />
                  </div>
                  <div className="w-full md:w-64 pb-1">
                     <button type="submit" className="w-full bg-slate-900 text-white rounded-3xl py-6 text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95">
                        Update Global Policy
                     </button>
                  </div>
               </Form>
            )}
         </Formik>
      </Card>
    </div>
  )
}


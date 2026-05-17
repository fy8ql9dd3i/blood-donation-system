import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import BarChart from '../../../components/charts/BarChart'
import PieChart from '../../../components/charts/PieChart'
import * as inventoryService from '../../../services/inventoryService'
import api from '../../../services/api'
import clsx from 'clsx'

function pickList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}

const notifySchema = Yup.object({
  donorId: Yup.string().required('Donor ID required'),
  titleKey: Yup.string().required('Title key required'),
  messageKey: Yup.string().required('Message key required'),
})

export default function BloodBankDashboard() {
  const queryClient = useQueryClient()
  const [notifyOpen, setNotifyOpen] = useState(false)

  const inventoryQ = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => inventoryService.getInventory(),
  })

  const donorsQ = useQuery({
    queryKey: ['donors', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/donors')
      return data
    },
  })

  const alertsQ = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: () => inventoryService.getInventoryAlerts(),
  })

  const rows = pickList(inventoryQ.data)
  const donors = pickList(donorsQ.data)

  const barData = {
    labels: rows.length ? rows.map((r) => r.bloodType || r.blood_type) : ['—'],
    datasets: [
      {
        label: 'Units',
        data: rows.length ? rows.map((r) => Number(r.quantity ?? 0)) : [0],
        backgroundColor: '#b91c1c',
        borderRadius: 6,
      },
    ],
  }

  const low = rows.filter((r) => r.status === 'low' || r.status === 'empty').length
  const pieData = {
    labels: ['Adequate', 'Low / empty'],
    datasets: [
      {
        data: [Math.max(0, rows.length - low), low || 0.001],
        backgroundColor: ['#22c55e', '#f97316'],
        borderWidth: 0,
      },
    ],
  }

  const notifyMutation = useMutation({
    mutationFn: (body) => api.post('/notifications', body),
    onSuccess: () => {
      toast.success('Notification queued')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setNotifyOpen(false)
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to notify donor'
      )
    },
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 🚀 Command Center Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-[100px]" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
             <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Live Command Center • የቀጥታ መቆጣጠሪያ</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Inventory Intelligence</h1>
          <p className="text-slate-400 font-medium max-w-md">Real-time oversight of regional blood reserves and donor engagement metrics across Bahir Dar.</p>
        </div>
        <div className="relative z-10">
          <Button 
            type="button" 
            onClick={() => setNotifyOpen((o) => !o)}
            className={clsx(
              "px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95",
              notifyOpen ? "bg-white text-slate-900" : "bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/30"
            )}
          >
            {notifyOpen ? '× Close Form' : '📣 Notify Eligible Donors'}
          </Button>
        </div>
      </div>

      {notifyOpen && (
        <Card className="formal-border p-10 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 duration-500 bg-white">
          <div className="mb-10 border-b border-slate-100 pb-6">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Outreach Broadcast • የለጋሾች ማሳወቂያ</h2>
             <p className="text-slate-500 text-sm mt-1">Send secure notifications to eligible donors for emergency or routine collection.</p>
          </div>
          <Formik
            initialValues={{
              donorId: '',
              titleKey: 'emergency.title',
              messageKey: 'emergency.message',
            }}
            validationSchema={notifySchema}
            onSubmit={(values) => {
              notifyMutation.mutate({
                donorId: values.donorId,
                titleKey: values.titleKey.trim(),
                messageKey: values.messageKey.trim(),
              })
            }}
          >
            {({ errors, touched }) => (
              <Form className="grid gap-8 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Target Donor • ለጋሽ ይምረጡ</label>
                  <Field
                    as="select"
                    name="donorId"
                    className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 focus:border-brand-500 focus:ring-0 transition-colors"
                  >
                    <option value="">Select an eligible donor...</option>
                    {donors.map((d) => (
                      <option key={d.donorID} value={String(d.donorID)}>
                        {(d.name || 'Donor') + ` (ID: ${d.donorID}) — Type: ${d.bloodType || '?'}`}
                      </option>
                    ))}
                  </Field>
                  {touched.donorId && errors.donorId && (
                    <p className="mt-2 text-xs font-bold text-rose-600">{errors.donorId}</p>
                  )}
                </div>
                <Field name="titleKey">
                  {({ field }) => (
                    <Input
                      {...field}
                      label="Title Key • ርዕስ ኮድ"
                      className="rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold"
                      error={touched.titleKey && errors.titleKey}
                    />
                  )}
                </Field>
                <Field name="messageKey">
                  {({ field }) => (
                    <Input
                      {...field}
                      label="Message Key • የመልዕክት ኮድ"
                      className="rounded-2xl border-2 border-slate-100 bg-slate-50 font-bold"
                      error={touched.messageKey && errors.messageKey}
                    />
                  )}
                </Field>
                <div className="lg:col-span-2 pt-4">
                  <Button type="submit" className="w-full bg-slate-900 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl" disabled={notifyMutation.isPending}>
                    {notifyMutation.isPending ? '⏳ Broadcasting...' : '🚀 Execute Broadcast'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      )}

      {/* 📊 KPI Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-white p-8 rounded-[2rem] formal-border shadow-xl relative group overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 group-hover:scale-110 transition-transform">🩸</div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Stock • አጠቃላይ ክምችት</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black text-slate-900 tracking-tighter">
              {inventoryQ.isLoading ? '—' : rows.length}
            </span>
            <span className="text-xs font-black text-slate-400 uppercase">Batches</span>
          </div>
        </div>
        
        <div className="bg-rose-50 p-8 rounded-[2rem] border-2 border-rose-100 shadow-xl relative group overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform">⚠️</div>
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Critical Alert • የአደጋ ማስጠንቀቂያ</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black text-rose-700 tracking-tighter">
              {inventoryQ.isLoading ? '—' : low}
            </span>
            <span className="text-xs font-black text-rose-400 uppercase">Low Types</span>
          </div>
        </div>

        <div className="bg-brand-600 p-8 rounded-[2rem] shadow-2xl shadow-brand-200 relative group overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform">💝</div>
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Donor Network • የለጋሾች አውታረ መረብ</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black text-white tracking-tighter">
              {donorsQ.isLoading ? '—' : donors.length}
            </span>
            <span className="text-xs font-black text-white/40 uppercase">Heroes</span>
          </div>
        </div>
      </div>

      {/* 📈 Visual Intelligence */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-10 formal-border bg-white rounded-[2.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Reserve Distribution</h3>
             <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500">UNITS PER TYPE</div>
          </div>
          <div className="h-[350px]">
            <BarChart data={barData} />
          </div>
        </Card>
        
        <Card className="p-10 formal-border bg-white rounded-[2.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Stability Metrics</h3>
             <div className="px-3 py-1 bg-emerald-100 rounded-full text-[9px] font-black text-emerald-600 uppercase">Health Check</div>
          </div>
          <div className="h-[350px] flex items-center justify-center">
            <PieChart data={pieData} />
          </div>
        </Card>
      </div>
    </div>
  )
}

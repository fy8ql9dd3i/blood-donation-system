import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../../components/ui/Card'
import * as inventoryService from '../../../services/inventoryService'
import * as bloodRequestService from '../../../services/bloodRequestService'

import * as notificationService from '../../../services/notificationService'
import * as hospitalService from '../../../services/hospitalService'
import clsx from 'clsx'

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const schema = Yup.object({
  bloodType: Yup.string().required(),
  quantity: Yup.number().min(1).required('Quantity is required'),
  expiryDate: Yup.string().required('Expiry date is required'),
  collectionDate: Yup.string(),
  donorId: Yup.string(),
})

function pickList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}

export default function ManageInventory() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('inventory')
  const [filterType, setFilterType] = useState('ALL')
  const [dispatchDefaults, setDispatchDefaults] = useState({ hospitalId: '', bloodType: 'O+', units: 1, requestId: '' })
  const [discardIdInput, setDiscardIdInput] = useState('')

  // --- Queries ---
  const inventoryQ = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => inventoryService.getInventory(),
  })

  const requestsQ = useQuery({
    queryKey: ['requests', 'all'],
    queryFn: () => bloodRequestService.getAllRequests(),
  })

  const hospitalsQ = useQuery({
    queryKey: ['hospitals', 'public'],
    queryFn: () => hospitalService.listPublicHospitals(),
  })




  // --- Mutations ---
  const addStockM = useMutation({
    mutationFn: (payload) => inventoryService.addOrUpdateStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Inventory certified and stock updated')
    },
  })

  const updateRequestStatusM = useMutation({
    mutationFn: ({ id, status, responseMessage }) => bloodRequestService.updateRequestStatus(id, status, responseMessage),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })

      const statusText = res.data?.status || 'processed'
      const savers = res.data?.lifeSavers || []

      if (statusText === 'fulfilled' && savers.length > 0) {
        toast.success(
          <div>
            <p className="font-black">🚀 Request Fulfilled!</p>
            <p className="text-[10px] mt-1 uppercase tracking-widest opacity-80">Life Savers: {savers.join(', ')}</p>
          </div>
        )
      } else {
        toast.success(`Request marked as ${statusText}`)
      }
    },
  })

  const broadcastEmergencyM = useMutation({
    mutationFn: ({ bloodType, message }) => notificationService.broadcastEmergency(bloodType, message),
    onSuccess: (res) => {
      toast.success(res.message || 'Emergency broadcast initiated!')
    },
  })

  const manualDispatchM = useMutation({
    mutationFn: (payload) => bloodRequestService.manualDispatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success('Manual dispatch recorded successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to dispatch')
    }
  })

  const deleteRequestM = useMutation({
    mutationFn: (id) => bloodRequestService.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success('Request removed from the table')
    },
    onError: () => toast.error('Failed to delete request'),
  })

  const deleteStockM = useMutation({
    mutationFn: (id) => inventoryService.deleteInventoryItem(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.info(res?.message || 'Specimen discarded and removed from ledger.')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to discard specimen.')
  })

  const purgeExpiredM = useMutation({
    mutationFn: () => inventoryService.purgeExpiredStock(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      const count = res?.deletedCount ?? res?.data?.deletedCount ?? 0
      toast.success(`🗑️ ${count} expired blood bag(s) purged from the registry.`)
    },
    onError: () => toast.error('Failed to purge expired stock.')
  })

  const purgeAllM = useMutation({
    mutationFn: () => inventoryService.purgeAllStock(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      const count = res?.deletedCount ?? res?.data?.deletedCount ?? 0
      toast.success(`🗑️ All ${count} blood bag(s) purged from the registry.`)
    },
    onError: () => toast.error('Failed to purge all stock.')
  })

  const rows = pickList(inventoryQ.data)
  const filteredRows = filterType === 'ALL' ? rows : rows.filter(r => (r.bloodType || r.blood_type) === filterType)
  const requests = pickList(requestsQ.data)

  const getStockCount = (bt) => {
    return rows
      .filter(r => (r.bloodType === bt || r.blood_type === bt))
      .reduce((acc, r) => acc + Number(r.quantity || r.units || 0), 0)
  }

  const lowStockTypes = bloodTypes.filter(bt => getStockCount(bt) <= 5)
  const today = new Date().toISOString().slice(0, 10)

  const getDaysRemaining = (expDate) => {
    if (!expDate) return null
    const diff = new Date(expDate) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-in fade-in duration-700">
      {/* 🏙️ Regional Command Center Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-brand-500/20 group hover:rotate-6 transition-transform">
              <span className="text-white font-black text-2xl tracking-tighter">BD</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Logistics Center • የሎጂስቲክስ ማእከል</h1>
              <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.3em] mt-2">Bahir Dar Regional Command • የአማራ ክልል ማዕከል</p>
            </div>
          </div>

          <div className="flex items-center bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('inventory')}
              className={clsx(
                "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                activeTab === 'inventory' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-white"
              )}
            >
              Inventory Ledger • ክምችት
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={clsx(
                "px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ml-2",
                activeTab === 'dispatch' ? "bg-brand-600 text-white shadow-xl shadow-brand-500/30" : "text-slate-400 hover:text-white"
              )}
            >
              Dispatch Center • ስርጭት
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-600 shadow-xl border-2 border-brand-600">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        {/* 📊 Intelligence Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Volume • አጠቃላይ መጠን', value: `${rows.reduce((acc, r) => acc + Number(r.quantity || 0), 0)}`, unit: 'Units', sub: 'Regional Capacity', color: 'slate' },
            { label: 'Active Orders • ትዕዛዞች', value: requests.filter(r => r.status === 'pending').length, unit: 'Orders', sub: 'Hospital Queue', color: 'brand' },
            { label: 'Critical Types • የአደጋ አይነቶች', value: bloodTypes.filter(bt => getStockCount(bt) <= 10).length, unit: 'Alerts', sub: 'Below Safety Margin', color: 'red' },
            { label: 'Safety Check • የደህንነት ፍተሻ', value: rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length, unit: 'Expired', sub: 'Compliance Status', color: rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length > 0 ? 'amber' : 'emerald' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">{stat.label}</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <div className={clsx("text-5xl font-black tracking-tighter",
                  stat.color === 'brand' ? 'text-brand-600' :
                    stat.color === 'red' ? 'text-rose-600' :
                      stat.color === 'amber' ? 'text-amber-600' :
                        stat.color === 'emerald' ? 'text-emerald-600' : 'text-slate-900'
                )}>
                  {stat.value}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.unit}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 mt-4 relative z-10 flex items-center gap-2">
                <span className={clsx("w-1.5 h-1.5 rounded-full",
                  stat.color === 'brand' ? 'bg-brand-500' :
                    stat.color === 'red' ? 'bg-rose-500' :
                      stat.color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-400'
                )} />
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {lowStockTypes.length > 0 && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
            <p className="font-black uppercase tracking-[0.2em] text-amber-800 mb-2">Low Stock Alert</p>
            <p>
              The following blood groups are at or below the safe stock threshold: <span className="font-black">{lowStockTypes.join(', ')}</span>. Please prioritize collection or dispatch planning.
            </p>
          </div>
        )}

        {activeTab === 'inventory' ? (
          <div className="space-y-12">
            {/* 📥 Registration Console */}
            <Card className="rounded-[3rem] border-slate-200 shadow-2xl overflow-hidden bg-white">
              <div className="bg-slate-50/80 border-b border-slate-100 p-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Stock Certification • የምስክር ወረቀት</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Officially register and certify blood units into the regional logistics database.</p>
                  </div>
                  <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    {['ALL', ...bloodTypes].map(bt => (
                      <button
                        key={bt}
                        onClick={() => setFilterType(bt)}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          filterType === bt ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
                        )}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-200">
                  <Formik
                    initialValues={{ bloodType: 'O+', quantity: 1, expiryDate: today, collectionDate: today, donorId: '' }}
                    validationSchema={schema}
                    onSubmit={(values, { resetForm }) => {
                      addStockM.mutate({ ...values, quantity: Number(values.quantity) }, { onSuccess: () => resetForm() })
                    }}
                  >
                    {({ submitForm }) => (
                      <Form className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Traceability ID</label>
                          <Field name="donorId" className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none font-bold text-slate-900 transition-all" placeholder="Optional" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Blood Group</label>
                          <Field as="select" name="bloodType" className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none font-black text-brand-600 transition-all">
                            {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                          </Field>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Units (Volume)</label>
                          <Field name="quantity" type="number" min={1} className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none text-center font-black text-slate-900 transition-all" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Collection</label>
                          <Field name="collectionDate" type="date" className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none font-bold text-slate-900 transition-all" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Expiry Date</label>
                          <Field name="expiryDate" type="date" className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none font-bold text-slate-900 transition-all" />
                        </div>
                        <button type="button" onClick={submitForm} disabled={addStockM.isPending} className="bg-slate-900 text-white rounded-2xl py-4 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-black active:scale-95 transition-all disabled:opacity-50 h-[56px]">
                          {addStockM.isPending ? '⏳ certifying...' : '✓ Add to Ledger'}
                        </button>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </Card>

            {/* 📜 Master Ledger Table */}
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-900">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Master Logistics Ledger • ማስተር ደብተር</h3>
                  <p className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.3em] mt-1">Live synchronized inventory registry for the Amhara Region</p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Oracle Sync Active</span>
                  </div>
                  {rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length > 0 && (
                    <button
                      onClick={() => {
                        const expiredCount = rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length
                        if (window.confirm(`⚠️ PURGE PROTOCOL\n\nThis will permanently delete all ${expiredCount} expired blood bag(s) from the registry.\n\nThis action cannot be undone. Proceed?`)) {
                          purgeExpiredM.mutate()
                        }
                      }}
                      disabled={purgeExpiredM.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-rose-900/50 transition-all disabled:opacity-50"
                    >
                      {purgeExpiredM.isPending ? (
                        <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Purging...</>
                      ) : (
                        <><span>🗑️</span> Delete All Expired ({rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length})</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quick Discard by ID:</span>
                  <input
                    type="text"
                    placeholder="Enter Bag ID (e.g. 546)"
                    value={discardIdInput}
                    onChange={(e) => setDiscardIdInput(e.target.value)}
                    className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:ring-0 focus:outline-none w-52 transition-all"
                  />
                  <button
                    onClick={() => {
                      if (!discardIdInput.trim()) {
                        toast.warn('Please enter a Bag ID/number to discard');
                        return;
                      }
                      if (window.confirm(`Are you sure you want to discard the blood bag matching "${discardIdInput.trim()}"?`)) {
                        deleteStockM.mutate(discardIdInput.trim(), {
                          onSuccess: () => setDiscardIdInput('')
                        });
                      }
                    }}
                    disabled={deleteStockM.isPending}
                    className="px-6 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-rose-900/10"
                  >
                    {deleteStockM.isPending ? 'Discarding...' : 'Discard Bag'}
                  </button>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                  {rows.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm(`⚠️ CRITICAL PROTOCOL\n\nThis will permanently delete ALL ${rows.length} blood bag(s) from the registry.\n\nThis action cannot be undone. Proceed?`)) {
                          purgeAllM.mutate()
                        }
                      }}
                      disabled={purgeAllM.isPending}
                      className="px-6 py-2 bg-rose-800 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-rose-950/20"
                    >
                      {purgeAllM.isPending ? 'Purging All...' : '🗑️ Delete All Stock'}
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100">
                      <th className="px-10 py-8 text-center">Specimen #</th>
                      <th className="px-10 py-8 text-center">Biological Type</th>
                      <th className="px-10 py-8 text-center">Volume (Units)</th>
                      <th className="px-10 py-8 text-center">Timeline Control</th>
                      <th className="px-10 py-8 text-center">Stability Status</th>
                      <th className="px-10 py-8 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.length === 0 ? (
                      <tr><td colSpan="6" className="p-32 text-center text-slate-300 italic uppercase tracking-[0.4em] text-xs font-black bg-slate-50/50">NO REGISTRY DATA FOUND</td></tr>
                    ) : (
                      filteredRows.map((r, i) => {
                        const qty = Number(r.quantity || 0)
                        const daysLeft = getDaysRemaining(r.expiryDate)
                        const isExpired = daysLeft < 0

                        return (
                          <tr key={r.id || i} className="hover:bg-slate-50 transition-all group">
                            <td className="px-10 py-10">
                              <div className="flex flex-col items-center">
                                <span className="font-mono text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors tracking-tighter">
                                  Bag ID: {r.bloodId || r.blood_id || `BAG-SYS-${r.id}`}
                                </span>
                                {r.donor ? (
                                  <div className="flex flex-col items-center mt-1.5">
                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[8px] font-black uppercase tracking-tight">
                                      Donor: {r.donor.name} (ID: {r.donor.donorID})
                                    </span>
                                    {r.donor.phone && (
                                      <span className="text-[8px] font-mono text-slate-400 mt-0.5">{r.donor.phone}</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Batch Stock (No Donor)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-10 py-10">
                              <div className="w-16 h-16 bg-white border-4 border-slate-100 rounded-[1.5rem] flex items-center justify-center font-black text-2xl text-brand-600 mx-auto shadow-2xl shadow-slate-100 group-hover:rotate-6 transition-transform">
                                {r.bloodType}
                              </div>
                            </td>
                            <td className="px-10 py-10 text-center">
                              <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{qty}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Certified Units</p>
                            </td>
                            <td className="px-10 py-10">
                              <div className="flex flex-col gap-2 items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-center">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Collection Date</span>
                                  <span className="font-mono text-[10px] font-black text-slate-700 uppercase">
                                    {r.collectionDate ? new Date(r.collectionDate).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                                  </span>
                                </div>
                                <div className="w-full border-t border-slate-200 my-0.5" />
                                <div className="text-center">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Expiration Control</span>
                                  <span className="font-mono text-[10px] font-black text-slate-800 uppercase">
                                    {new Date(r.expiryDate).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-10">
                              <div className="flex flex-col items-center gap-3">
                                <span className={clsx(
                                  "px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl w-full text-center transition-all",
                                  isExpired
                                    ? "bg-rose-600 text-white shadow-rose-200"
                                    : daysLeft <= 7
                                      ? "bg-amber-600 text-white shadow-amber-200 animate-pulse"
                                      : "bg-emerald-600 text-white shadow-emerald-200"
                                )}>
                                  {isExpired ? '🚨 EXPIRED' : daysLeft <= 7 ? '⚠️ NEAR EXPIRY' : '🛡️ SAFE & ELIGIBLE'}
                                </span>
                                {!isExpired && (
                                  <p className={clsx(
                                    "text-[10px] font-black uppercase tracking-tighter",
                                    daysLeft <= 7 ? "text-rose-500 font-black" : "text-emerald-600 font-black"
                                  )}>
                                    {daysLeft} Days of Safe Storage
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-10 py-10 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to discard this blood bag from the inventory ledger? This action cannot be undone.')) {
                                      deleteStockM.mutate(r.id);
                                    }
                                  }}
                                  disabled={deleteStockM.isPending}
                                  className="px-4 py-2 bg-rose-50 border-2 border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-600 hover:text-white transition-all hover:shadow-xl shadow-rose-100 disabled:opacity-50"
                                >
                                  {deleteStockM.isPending && deleteStockM.variables === r.id ? 'Disposing...' : 'Discard Bag'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'dispatch' ? (
          /* 🚁 Logistics Console View */
          <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
            {/* 🛰️ Manual Dispatch Form */}
            <Card className="rounded-[3.5rem] border-slate-900 border-b-[16px] shadow-2xl overflow-hidden bg-white">
              <div className="p-12 bg-slate-900 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full -mr-32 -mt-32 blur-[100px]" />
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">Manual Dispatch Console • ስርጭት መቆጣጠሪያ</h3>
                <p className="text-brand-500 text-[11px] font-black uppercase tracking-[0.4em] mt-3 relative z-10">Regional Supply Chain Execution • የአማራ ክልል የአቅርቦት ሰንሰለት</p>
              </div>
              <div className="p-12">
                <Formik
                  enableReinitialize
                  initialValues={dispatchDefaults}
                  onSubmit={(values, { resetForm }) => {
                    manualDispatchM.mutate(values, {
                      onSuccess: () => {
                        resetForm()
                        setDispatchDefaults({ hospitalId: '', bloodType: 'O+', units: 1, requestId: '' })
                      }
                    })
                  }}
                >
                  {({ values, setFieldValue }) => (
                    <Form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-end">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Destination Facility</label>
                        <Field as="select" name="hospitalId" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none font-black text-slate-900 transition-all">
                          <option value="">Choose Hospital...</option>
                          {pickList(hospitalsQ.data).map(h => {
                            const id = h.hospitalId || h.hospitalID || h.id;
                            return (
                              <option key={id} value={id}>{h.name}</option>
                            );
                          })}
                        </Field>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Biological Specification</label>
                        <Field as="select" name="bloodType" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none font-black text-brand-600 transition-all uppercase">
                          {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                        </Field>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Certified Batch (Expiry)</label>
                        <Field as="select" name="expiryDate" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none font-bold text-slate-900 transition-all">
                          <option value="">Select Expiry Date...</option>
                          {rows
                            .filter(r => (r.bloodType === values.bloodType || r.blood_type === values.bloodType) && Number(r.quantity || 0) > 0)
                            .map(r => (
                              <option key={r.id} value={r.expiryDate}>
                                {String(r.expiryDate).slice(0, 10)} ({r.quantity} units)
                              </option>
                            ))}
                        </Field>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex-1 space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Volume</label>
                          <Field name="units" type="number" min={1} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs focus:border-brand-500 focus:ring-0 outline-none font-black text-slate-900 text-center transition-all" />
                        </div>
                        <button type="submit" disabled={manualDispatchM.isPending} className="bg-brand-600 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-200 hover:bg-brand-700 active:scale-95 transition-all self-end h-[56px] flex items-center justify-center gap-3">
                          {manualDispatchM.isPending ? '⏳ processing...' : '🚀 EXECUTE DISPATCH'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </Card>

            {/* 🏥 Regional Fulfillment Grid */}
            <div className="grid grid-cols-1 gap-12">
              {requestsQ.isLoading ? (
                <div className="bg-white p-32 rounded-[3rem] border border-slate-200 text-center space-y-6">
                  <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl shadow-brand-100" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">POLLING REGIONAL LOGISTICS NETWORK...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white p-32 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                  <div className="text-7xl mb-8 opacity-10">🕊️</div>
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">NO ACTIVE HOSPITAL REQUIREMENTS RECORDED</p>
                </div>
              ) : (
                Object.entries(
                  requests.reduce((acc, r) => {
                    const hName = r.hospital?.name || r.hospitalName || 'Unknown Facility'
                    if (!acc[hName]) acc[hName] = []
                    acc[hName].push(r)
                    return acc
                  }, {})
                ).map(([hospitalName, hospitalRequests]) => (
                  <div key={hospitalName} className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 group">
                    <div className="bg-slate-900 border-b border-white/5 p-10 flex justify-between items-center group-hover:bg-black transition-colors duration-500">
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xl shadow-brand-500/20">H</div>
                          <h4 className="text-2xl font-black text-white tracking-tighter uppercase">{hospitalName}</h4>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-14">
                          {hospitalRequests.length} Requirements Registered • Regional Priority System
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center backdrop-blur-xl">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Network Status</p>
                          <p className="text-xs font-black text-emerald-500 uppercase mt-1">CONNECTED</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-10 space-y-8">
                      {hospitalRequests.map((r) => {
                        const stockCount = getStockCount(r.bloodType)
                        const hasStock = stockCount >= r.unitsRequired
                        const isPending = r.status === 'pending'

                        return (
                          <div key={r._id || r.id} className={clsx(
                            "group/item rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden",
                            isPending ? "border-slate-50 bg-white shadow-sm hover:shadow-xl hover:border-brand-100" : "border-transparent bg-slate-50/50 opacity-50 grayscale"
                          )}>
                            <div className="flex flex-col lg:flex-row p-8 items-center gap-12">
                              {/* Request Metadata */}
                              <div className="flex-1 min-w-[250px]">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 mb-4">
                                  <span className={clsx("w-2 h-2 rounded-full animate-pulse", r.urgencyLevel === 'high' ? 'bg-rose-500' : 'bg-slate-400')} />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{r.urgencyLevel} PRIORITY REQUIREMENT</span>
                                </div>
                                <h5 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">{r.patientName}</h5>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Transaction Trace: #{r.id.toString().slice(-8).toUpperCase()}</p>
                              </div>

                              {/* Supply Chain Analytics */}
                              <div className="flex items-center gap-10 bg-slate-50 px-10 py-6 rounded-[2rem] border border-slate-100 shadow-inner group-hover/item:bg-white transition-colors">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-brand-600 rounded-2xl text-white flex items-center justify-center font-black text-xl mb-2 shadow-2xl shadow-brand-100 group-hover/item:rotate-6 transition-transform">{r.bloodType}</div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ordered Type</p>
                                </div>
                                <div className="h-16 w-px bg-slate-200" />
                                <div className="text-center min-w-[120px]">
                                  <div className={clsx(
                                    "text-3xl font-black tracking-tighter leading-none mb-2",
                                    hasStock ? "text-emerald-600" : "text-rose-600"
                                  )}>
                                    {stockCount}
                                    {hasStock && isPending && (
                                      <span className="text-slate-300 mx-2 tracking-normal">→</span>
                                    )}
                                    {hasStock && isPending && (
                                      <span className="text-brand-500">{stockCount - r.unitsRequired}</span>
                                    )}
                                  </div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {hasStock && isPending ? 'Projection Level' : 'Available Reserve'}
                                  </p>
                                </div>
                              </div>

                              {/* Command Actions */}
                              <div className="w-full lg:w-auto flex flex-col gap-3 min-w-[200px]">
                                {isPending ? (
                                  <>
                                    {hasStock ? (
                                      <button
                                        onClick={() => {
                                          setDispatchDefaults({
                                            hospitalId: r.hospitalId,
                                            bloodType: r.bloodType,
                                            units: r.unitsRequired,
                                            requestId: r._id || r.id
                                          })
                                          window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="bg-emerald-600 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                                      >
                                        ✓ AUTHORIZE DISPATCH
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`SECURITY ALERT: Broadcast a shortage alert for ${r.bloodType} to ${hospitalName}?`)) {
                                            updateRequestStatusM.mutate({ id: r._id || r.id, status: 'rejected', responseMessage: `Logistics Alert: Reserve depletion for type ${r.bloodType}. Fulfillment pending collection.` })
                                          }
                                        }}
                                        className="bg-rose-50 text-rose-600 border-2 border-rose-100 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-xl shadow-rose-100"
                                      >
                                        ⚠️ BROADCAST SHORTAGE
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <div className="px-10 py-4 rounded-2xl bg-emerald-50 text-emerald-700 border-2 border-emerald-100 text-[11px] font-black uppercase tracking-[0.3em] text-center shadow-inner">
                                    {r.status.toUpperCase()}
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Cleanup protocol: Permanently archive this request record?`)) {
                                      deleteRequestM.mutate(r._id || r.id)
                                    }
                                  }}
                                  disabled={deleteRequestM.isPending}
                                  className="text-[10px] font-black text-slate-300 hover:text-rose-600 uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 py-2 hover:bg-rose-50 rounded-xl mt-2"
                                >
                                  × Archive Trace Record
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

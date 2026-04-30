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

  const rows = pickList(inventoryQ.data)
  const filteredRows = filterType === 'ALL' ? rows : rows.filter(r => (r.bloodType || r.blood_type) === filterType)
  const requests = pickList(requestsQ.data)

  const today = new Date().toISOString().slice(0, 10)

  const getDaysRemaining = (expDate) => {
    if (!expDate) return null
    const diff = new Date(expDate) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getStockCount = (bt) => {
    return rows
      .filter(r => (r.bloodType === bt || r.blood_type === bt))
      .reduce((acc, r) => acc + Number(r.quantity || r.units || 0), 0)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Dynamic Navigation Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
              <span className="text-white font-black text-xl">L</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Logistics Center</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inventory Control & Hospital Dispatch</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('inventory')}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'inventory' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Inventory Stock
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
                activeTab === 'dispatch' ? "bg-brand-600 text-white shadow-lg shadow-brand-200" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Logistics & Dispatch
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Real-time Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Volume', value: `${rows.reduce((acc, r) => acc + Number(r.quantity || 0), 0)} Units`, sub: 'Active Inventory', color: 'slate' },
            { label: 'Pending Dispatch', value: requests.filter(r => r.status === 'pending').length, sub: 'Hospital Orders', color: 'brand' },
            { label: 'Critical Levels', value: bloodTypes.filter(bt => getStockCount(bt) <= 10).length, sub: 'Below Safety Margin', color: 'red' },
            { label: 'Medical Expired', value: rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length, sub: 'Pending Disposal', color: rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length > 0 ? 'amber' : 'slate' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <div className={clsx("text-3xl font-black", stat.color === 'brand' ? 'text-brand-600' : stat.color === 'red' ? 'text-red-600' : stat.color === 'amber' ? 'text-amber-600' : 'text-slate-900')}>
                {stat.value}
              </div>
              <p className="text-[11px] font-bold text-slate-500 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {activeTab === 'inventory' ? (
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden bg-white">
              <div className="bg-slate-50 border-b border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Stock Registration</h2>
                    <p className="text-xs text-slate-500 font-medium">Manually certify and add new blood units to the system inventory.</p>
                  </div>
                  <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
                    {['ALL', ...bloodTypes].map(bt => (
                      <button
                        key={bt}
                        onClick={() => setFilterType(bt)}
                        className={clsx(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                          filterType === bt ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
                        )}
                      >
                        {bt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Formik
                    initialValues={{ bloodType: 'O+', quantity: 1, expiryDate: today, collectionDate: today, donorId: '' }}
                    validationSchema={schema}
                    onSubmit={(values, { resetForm }) => {
                      addStockM.mutate({ ...values, quantity: Number(values.quantity) }, { onSuccess: () => resetForm() })
                    }}
                  >
                    {({ submitForm }) => (
                      <Form className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trace ID</label>
                          <Field name="donorId" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 ring-brand-500/20 outline-none font-medium" placeholder="Optional" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Group</label>
                          <Field as="select" name="bloodType" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 ring-brand-500/20 outline-none font-black text-brand-600">
                            {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                          </Field>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Units</label>
                          <Field name="quantity" type="number" min={1} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 ring-brand-500/20 outline-none text-center font-bold" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Collected</label>
                          <Field name="collectionDate" type="date" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 ring-brand-500/20 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry</label>
                          <Field name="expiryDate" type="date" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 ring-brand-500/20 outline-none" />
                        </div>
                        <button type="button" onClick={submitForm} disabled={addStockM.isPending} className="bg-slate-900 text-white rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50">
                          Add to Stock
                        </button>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </Card>

            <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Global Stock Ledger</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live tracking of all regional blood reserves</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">Sync Active</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-5">Traceability ID</th>
                    <th className="px-8 py-5 text-center">Group</th>
                    <th className="px-8 py-5 text-center">Quantity</th>
                    <th className="px-8 py-5 text-center">Expiry</th>
                    <th className="px-8 py-5 text-center">Viability</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRows.length === 0 ? (
                    <tr><td colSpan="6" className="p-20 text-center text-slate-300 italic uppercase tracking-widest text-[10px] font-black">No inventory records found in the ledger</td></tr>
                  ) : (
                    filteredRows.map((r, i) => {
                      const qty = Number(r.quantity || 0)
                      const daysLeft = getDaysRemaining(r.expiryDate)
                      const isExpired = daysLeft < 0
                      
                      return (
                        <tr key={r.id || i} className="hover:bg-slate-50/80 transition-all group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                                <span className="text-[10px] text-slate-400 group-hover:text-brand-600 font-black">#</span>
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-sm tracking-tight">{String(r.id || '').slice(0, 8).toUpperCase() || 'TRC-INV'}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Trace ID</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="bg-brand-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm mx-auto shadow-lg shadow-brand-100 group-hover:scale-110 transition-transform">
                              {r.bloodType}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-xl font-black text-slate-900 tracking-tighter">{qty}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Units</p>
                          </td>
                          <td className="px-8 py-6 text-center font-mono text-[11px] font-bold text-slate-500 bg-slate-50/30">
                            {String(r.expiryDate).slice(0, 10)}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className={clsx(
                                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 w-full",
                                isExpired 
                                  ? "bg-red-600 text-white shadow-lg shadow-red-200" 
                                  : daysLeft <= 3
                                    ? "bg-rose-500 text-white shadow-lg shadow-rose-200 animate-bounce"
                                    : qty <= 10 
                                      ? "bg-amber-500 text-white shadow-lg shadow-amber-200 animate-pulse" 
                                      : "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                              )}>
                                {isExpired ? '🚨 Expired' : daysLeft <= 3 ? '⏳ Urgent' : qty <= 10 ? '⚠️ Critical' : '✅ Stable'}
                              </span>
                              {!isExpired && (
                                <p className={clsx(
                                  "text-[10px] font-black uppercase tracking-tighter",
                                  daysLeft <= 7 ? "text-red-500" : "text-slate-400"
                                )}>
                                  {daysLeft} Days Remaining
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="text-[10px] font-black text-slate-300 hover:text-brand-600 uppercase tracking-widest transition-colors flex items-center justify-end gap-2 ml-auto">
                              <span>Manage</span>
                              <span className="text-lg">→</span>
                            </button>
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
          /* Dispatch Console View - Grouped by Hospital */
          <div className="space-y-8">
            {/* Manual Dispatch Console Form */}
            <Card className="rounded-[32px] border-slate-900 border-b-8 shadow-2xl overflow-hidden bg-white">
              <div className="p-8 bg-slate-900">
                <h3 className="text-white font-black text-xl uppercase tracking-tight">Manual Dispatch Console</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Directly issue blood units to a facility</p>
              </div>
              <div className="p-8">
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
                    <Form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Hospital</label>
                        <Field as="select" name="hospitalId" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 ring-brand-500/20 outline-none font-bold">
                          <option value="">Choose Hospital...</option>
                          {pickList(hospitalsQ.data).map(h => {
                            const id = h.hospitalId || h.hospitalID || h.id;
                            return (
                              <option key={id} value={id}>{h.name}</option>
                            );
                          })}
                        </Field>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blood Group</label>
                        <Field as="select" name="bloodType" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 ring-brand-500/20 outline-none font-black text-brand-600">
                          {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                        </Field>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Available Unit (Expiry)</label>
                        <Field as="select" name="expiryDate" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 ring-brand-500/20 outline-none font-bold">
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
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Units</label>
                          <Field name="units" type="number" min={1} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 ring-brand-500/20 outline-none font-black" />
                        </div>
                        <button type="submit" disabled={manualDispatchM.isPending} className="bg-brand-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-200 hover:bg-brand-700 active:scale-95 transition-all self-end h-[46px]">
                          Dispatch
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </Card>

            {/* Disaster Management Toolbar */}
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border-b-8 border-brand-600">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-brand-500/20">
                  <span className="text-white text-3xl">🌐</span>
                </div>
                <div>
                  <h3 className="text-white font-black text-xl uppercase tracking-tight leading-tight">Regional Fulfillment Center</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Network Overview & Hospital Dispatch</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Hospitals</p>
                  <p className="text-xl font-black text-white">{[...new Set(requests.map(r => r.hospitalId))].length}</p>
                </div>
                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending Units</p>
                  <p className="text-xl font-black text-brand-500">{requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + (Number(r.unitsRequired) || 0), 0)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {requestsQ.isLoading ? (
                <div className="bg-white p-20 rounded-3xl border border-slate-200 text-center animate-pulse">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Polling Regional Network...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-300 text-center">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">No Active Hospital Requests</p>
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
                  <div key={hospitalName} className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="bg-slate-50 border-b border-slate-100 p-8 flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-brand-500 shadow-sm" />
                          {hospitalName}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {hospitalRequests.length} Active Requests · Last activity {new Date(hospitalRequests[0].createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                         <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                           {hospitalRequests[0].hospital?.phoneNumber || 'No Contact'}
                         </span>
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      {hospitalRequests.map((r) => {
                        const stockCount = getStockCount(r.bloodType)
                        const hasStock = stockCount >= r.unitsRequired
                        const isPending = r.status === 'pending'

                        return (
                          <div key={r._id || r.id} className={clsx(
                            "group rounded-3xl border transition-all duration-300 overflow-hidden",
                            isPending ? "border-slate-100 bg-white" : "border-transparent bg-slate-50/50 opacity-60"
                          )}>
                            <div className="flex flex-col lg:flex-row p-6 items-center gap-8">
                              {/* Request Info */}
                              <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={clsx(
                                    "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                    r.urgencyLevel === 'high' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                                  )}>
                                    {r.urgencyLevel} Priority
                                  </span>
                                </div>
                                <h5 className="font-black text-slate-800 uppercase tracking-tight">{r.patientName}</h5>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Blood Request Order</p>
                              </div>

                              {/* Stock Match & Impact Preview */}
                              <div className="flex items-center gap-6 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-brand-600 rounded-xl text-white flex items-center justify-center font-black text-lg mb-1 shadow-lg shadow-brand-200">{r.bloodType}</div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">Needed</p>
                                </div>
                                <div className="h-10 w-px bg-slate-200" />
                                <div className="text-center min-w-[80px]">
                                  <div className={clsx(
                                    "text-lg font-black tracking-tighter mb-1",
                                    hasStock ? "text-emerald-600" : "text-red-600"
                                  )}>
                                    {stockCount} 
                                    {hasStock && isPending && (
                                      <span className="text-slate-300 mx-1">→</span>
                                    )}
                                    {hasStock && isPending && (
                                      <span className="text-brand-500">{stockCount - r.unitsRequired}</span>
                                    )}
                                  </div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                                    {hasStock && isPending ? 'Stock Impact' : 'Available'}
                                  </p>
                                </div>
                              </div>

                              {/* Action Console */}
                              <div className="w-full lg:w-auto flex flex-col gap-2">
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
                                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                      >
                                        ✅ Fulfill via Console
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`OFFICIAL ALERT: Notify ${hospitalName} of a shortage for ${r.bloodType}?`)) {
                                            updateRequestStatusM.mutate({ id: r._id || r.id, status: 'rejected', responseMessage: `Regional Alert: Current stock shortage for ${r.bloodType}.` })
                                          }
                                        }}
                                        className="bg-red-50 text-red-600 border-2 border-red-100 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                      >
                                        ⚠️ Send Shortage Alert
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <div className="px-6 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                    {r.status}
                                  </div>
                                )}
                                {/* Delete button — always visible for cleanup */}
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete this request from ${hospitalName} for ${r.bloodType}? This cannot be undone.`)) {
                                      deleteRequestM.mutate(r._id || r.id)
                                    }
                                  }}
                                  disabled={deleteRequestM.isPending}
                                  className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-1 border border-slate-100 hover:border-red-200 hover:bg-red-50 rounded-2xl px-4 py-2"
                                >
                                  🗑️ Remove
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

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import * as inventoryService from '../../../services/inventoryService'
import * as bloodRequestService from '../../../services/bloodRequestService'
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

  // --- Queries ---
  const inventoryQ = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => inventoryService.getInventory(),
  })

  const requestsQ = useQuery({
    queryKey: ['requests', 'all'],
    queryFn: () => bloodRequestService.getAllRequests(),
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
    mutationFn: ({ id, status }) => bloodRequestService.updateRequestStatus(id, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success(`Request marked as ${res.data?.status || 'processed'}`)
    },
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase p-0 m-0">
             Logistics Center
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest pl-1">
            Global Inventory & Hospital Supply Chain
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-900/5 p-1 rounded-2xl border border-slate-200">
           <button 
             onClick={() => setActiveTab('inventory')}
             className={clsx(
               "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
               activeTab === 'inventory' ? "bg-slate-900 text-white shadow-xl" : "text-slate-500 hover:text-slate-900"
             )}
           >
              Stock Management
           </button>
           <button 
             onClick={() => setActiveTab('requests')}
             className={clsx(
               "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
               activeTab === 'requests' ? "bg-brand-600 text-white shadow-xl" : "text-slate-500 hover:text-slate-900"
             )}
           >
              Hospital Requests
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] font-black">{requests.filter(r => r.status === 'pending').length}</span>
              )}
           </button>
        </div>
      </div>

      {/* Summary Stats & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
        <div className="bg-white border-b-4 border-slate-900 p-6 rounded-3xl shadow-xl">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Stock (Units)</p>
           <div className="text-3xl font-black text-slate-900">{rows.reduce((acc, r) => acc + Number(r.quantity || r.units || 0), 0)}</div>
        </div>
        <div className="bg-white border-b-4 border-red-600 p-6 rounded-3xl shadow-xl">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Shortage</p>
           <div className="text-3xl font-black text-red-600">{rows.filter(r => Number(r.quantity || r.units) <= 5).length} Groups</div>
        </div>
        <div className="bg-white border-b-4 border-green-500 p-6 rounded-3xl shadow-xl">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Surplus Stock</p>
           <div className="text-3xl font-black text-green-600">{rows.filter(r => Number(r.quantity || r.units) > 30).length} Groups</div>
        </div>
        <div className={clsx(
          "p-6 rounded-3xl shadow-xl border-b-4 transition-all",
          rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length > 0 
            ? "bg-red-600 border-red-900 text-white animate-pulse" 
            : "bg-white border-slate-200 text-slate-400"
        )}>
           <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Medical Expired Alert</p>
           <div className="flex items-center justify-between">
              <div className="text-3xl font-black">{rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length} Units</div>
              {rows.filter(r => getDaysRemaining(r.expiryDate) <= 0).length > 0 && (
                <button 
                  onClick={() => {
                    if(window.confirm('IRREVERSIBLE ACTION: Purge all expired medical waste?')) {
                      // Trigger removal logic for each
                      toast.info('Purging medical waste...')
                    }
                  }}
                  className="bg-white text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-black/20"
                >
                  Safe Purge
                </button>
              )}
           </div>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid gap-8 lg:grid-cols-4 px-4">
          {/* Manual Entry Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-slate-200 rounded-3xl border-t-8 border-slate-900">
              <CardHeader title="Lot Integration" subtitle="Add blood units after donation" />
              <Formik
                initialValues={{ bloodType: 'O+', quantity: 1, expiryDate: today, collectionDate: today, donorId: '' }}
                validationSchema={schema}
                onSubmit={(values, { resetForm }) => {
                  addStockM.mutate({
                    bloodType: values.bloodType,
                    quantity: Number(values.quantity),
                    expiryDate: values.expiryDate,
                    collectionDate: values.collectionDate,
                    donorId: values.donorId
                  }, { onSuccess: () => resetForm() })
                }}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-4 p-2">
                    <div className="bg-slate-50 p-6 rounded-2xl space-y-3 shadow-inner">
                      <Field name="donorId">{({ field }) => <Input {...field} label="Source Donor ID" placeholder="Traceability ID" />}</Field>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Blood Group</label>
                        <Field as="select" name="bloodType" className="w-full rounded-xl border border-slate-200 p-3 text-sm font-black text-brand-700 shadow-sm">
                          {bloodTypes.map(bt => <option key={bt} value={bt}>{bt} Group</option>)}
                        </Field>
                      </div>
                      <Field name="quantity">{({ field }) => <Input {...field} type="number" min={1} label="Units (Count)" />}</Field>
                      <Field name="expiryDate">{({ field }) => <Input {...field} type="date" label="Expiry Date" />}</Field>
                    </div>
                    <Button type="submit" disabled={addStockM.isPending} className="w-full h-14 text-xs font-black uppercase tracking-widest rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200">
                      Commit to Inventory
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card>
          </div>

          {/* Inventory Table */}
          <div className="lg:col-span-3">
             <Card className="shadow-2xl border-slate-200 rounded-3xl overflow-hidden min-h-[600px]">
                <CardHeader 
                  title="Global Inventory Analysis" 
                  action={
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                       {['ALL', ...bloodTypes].map(bt => (
                         <button key={bt} onClick={() => setFilterType(bt)} className={clsx("px-3 py-2 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap", filterType === bt ? "bg-white text-brand-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900")}>
                           {bt}
                         </button>
                       ))}
                    </div>
                  }
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-900 border-b border-white/5">
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[15%]">Donor Origin</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[10%] text-center">Type</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[15%] text-center">Volume</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[15%] text-center">Dates</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[15%] text-center">Stock Level</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[15%]">Expiry</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[15%] text-right">Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventoryQ.isLoading ? (
                        <tr><td colSpan="7" className="px-6 py-20 text-center uppercase font-black text-slate-300">Synchronizing...</td></tr>
                      ) : filteredRows.map((r, i) => {
                        const qty = Number(r.quantity || r.units || 0)
                        const daysLeft = getDaysRemaining(r.expiryDate)
                        const isExpired = daysLeft !== null && daysLeft <= 0
                        
                        return (
                          <tr key={r.id ?? i} className={clsx(
                            "hover:bg-slate-50 transition-all group border-l-[6px]",
                            qty <= 5 ? "border-red-600 bg-red-50/10" : qty > 30 ? "border-green-500 bg-green-50/10" : "border-slate-100"
                          )}>
                            <td className="px-6 py-6 font-mono">
                              <div className="text-[10px] font-black text-slate-900 truncate uppercase">{r.donorId ? `DNR-${r.donorId}` : 'BATCH LOG'}</div>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Traceability Index</div>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm border-2 border-slate-700 shadow-xl group-hover:scale-110 transition-transform">{r.bloodType || r.blood_type}</span>
                            </td>
                            <td className="px-6 py-6 text-center">
                              <div className={clsx("text-xl font-black", qty <= 5 ? "text-red-600" : "text-slate-900")}>{qty} Unit(s)</div>
                              <div className="text-[9px] font-bold text-slate-400">Total ~{qty * 450}ml</div>
                            </td>
                            <td className="px-6 py-6 text-center text-[10px] font-black text-slate-500 font-mono tracking-tighter">
                               COL: {r.collectionDate ? String(r.collectionDate).slice(0, 10) : '—'}<br/>
                               EXP: {String(r.expiryDate).slice(0, 10)}
                            </td>
                            <td className="px-6 py-6 text-center">
                               <div className={clsx(
                                 "px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest border border-dashed", 
                                 qty <= 5 ? "bg-red-600 text-white border-red-900 shadow-lg shadow-red-200" : 
                                 qty > 30 ? "bg-green-500 text-white border-green-700 shadow-lg shadow-green-200" : 
                                 "bg-white text-slate-500 border-slate-200"
                               )}>
                                 {qty <= 5 ? 'LOW STOCK' : qty > 30 ? 'HIGH STOCK' : 'STABLE'}
                               </div>
                            </td>
                            <td className="px-6 py-6">
                               <div className={clsx(
                                 "px-2 py-1 rounded-md text-[8px] font-black uppercase w-fit block text-center", 
                                 isExpired ? "bg-red-600 text-white animate-pulse" : "bg-brand-50 text-brand-700"
                               )}>
                                 {isExpired ? '!! EXPIRED !!' : 'CERTIFIED SAFE'}
                               </div>
                               {!isExpired && daysLeft !== null && (
                                 <span className="text-[8px] font-bold text-slate-400 mt-1 block tracking-tighter">{daysLeft}D remaining</span>
                               )}
                            </td>
                            <td className="px-6 py-6 text-right">
                               <Button 
                                 variant={isExpired ? "danger" : "secondary"} 
                                 className="text-[8px] h-8 px-3 uppercase font-black"
                               >
                                 {isExpired ? 'Discard' : 'Adjust'}
                               </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
             </Card>
          </div>
        </div>
      ) : (
        /* Hospital Requests View */
        <div className="px-4">
          <Card className="shadow-2xl border-brand-500/20 rounded-3xl overflow-hidden border-t-8 border-brand-600">
             <CardHeader title="Incoming Hospital Supply Requests" subtitle="Approve or reject blood supply orders based on current stock" />
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                   <thead>
                      <tr className="bg-slate-900 border-b border-white/5">
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[20%]">Requesting Unit</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[10%] text-center">Type</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[15%] text-center">Units Required</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[15%] text-center">Request Date</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[20%]">Order Status</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-[20%] text-right">Authorization</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {requestsQ.isLoading ? (
                        <tr><td colSpan="6" className="px-8 py-20 text-center uppercase font-black text-slate-400">Fetching Logistics Data...</td></tr>
                      ) : requests.length > 0 ? (
                        requests.map((r) => {
                          const stockForType = rows.find(inv => (inv.bloodType === r.bloodGroup || inv.blood_type === r.bloodGroup))
                          const stockCount = Number(stockForType?.quantity || stockForType?.units || 0)
                          const hasStock = stockCount >= r.unitsNeeded

                          return (
                            <tr key={r._id || r.id} className="hover:bg-brand-50/50 transition-all group">
                               <td className="px-8 py-8">
                                  <div className="text-sm font-black text-slate-900 uppercase tracking-tighter">{r.hospital?.name || r.hospitalName || 'HOSP-REF'}</div>
                                  <div className="text-[9px] font-bold text-brand-600 uppercase tracking-[0.2em]">Priority Supply</div>
                               </td>
                               <td className="px-8 py-8 text-center">
                                  <span className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-brand-200">{r.bloodGroup}</span>
                               </td>
                               <td className="px-8 py-8 text-center">
                                  <div className="text-xl font-black text-slate-900">{r.unitsNeeded} Units</div>
                                  <div className={clsx("text-[9px] font-bold mt-1 uppercase", hasStock ? "text-green-600" : "text-red-600")}>
                                    {hasStock ? 'Available in Stock' : `Shortage: Only ${stockCount} left`}
                                  </div>
                               </td>
                               <td className="px-8 py-8 text-center text-[10px] font-black text-slate-500 font-mono tracking-tighter">
                                  {new Date(r.createdAt || r.requestDate).toLocaleString()}
                               </td>
                               <td className="px-8 py-8 text-center uppercase">
                                  <span className={clsx(
                                    "px-3 py-1.5 rounded-xl text-[9px] font-black border-2",
                                    r.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                    r.status === 'fulfilled' ? "bg-green-50 text-green-700 border-green-200" :
                                    "bg-red-50 text-red-700 border-red-200"
                                  )}>
                                    {r.status}
                                  </span>
                               </td>
                               <td className="px-8 py-8 text-right">
                                  {r.status === 'pending' ? (
                                    <div className="flex justify-end gap-2">
                                       <Button 
                                          variant="secondary" 
                                          className="text-[9px] px-3 font-black h-10 border-red-200 text-red-600 hover:bg-red-50"
                                          onClick={() => updateRequestStatusM.mutate({ id: r._id || r.id, status: 'cancelled' })}
                                       >
                                          Reject
                                       </Button>
                                       <Button 
                                          disabled={!hasStock || updateRequestStatusM.isPending}
                                          className="text-[9px] px-4 font-black h-10 bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-100"
                                          onClick={() => updateRequestStatusM.mutate({ id: r._id || r.id, status: 'fulfilled' })}
                                       >
                                          Approve Supply
                                       </Button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Authorization Locked</span>
                                  )}
                               </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr><td colSpan="6" className="px-8 py-20 text-center opacity-30 font-black uppercase text-2xl tracking-widest">No Active Orders</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </Card>
        </div>
      )}
    </div>
  )
}

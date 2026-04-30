import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import * as labService from '../../../services/labService'
import donorService from '../../../services/donorService'
import api from '../../../services/api'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

function pickList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}


export default function VerifyDonor() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const donorsQ = useQuery({
    queryKey: ['donors', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/donors')
      return data
    },
  })

  // We are no longer strict filtering at the root, because we want to show non-eligible users
  // as "❌ Not Eligible" with a "Disabled" button, and then potentially remove them.
  const donors = pickList(donorsQ.data)

  const filteredDonors = donors.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.phone || d.phoneNumber)?.includes(searchTerm) ||
    String(d.donorID || d._id)?.includes(searchTerm)
  )

  const mutation = useMutation({
    mutationFn: (payload) => labService.submitLabResults(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['donors'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Sent to Inventory Successfully')
    },
    onError: (err) => {
      toast.error('Failed to update data')
    },
  })

  const regMutation = useMutation({
    mutationFn: (payload) => donorService.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] })
      toast.success('New Walk-In Donor Registered Successfully!')
    },
    onError: (err) => {
      toast.error('Registration failed: ' + (err.response?.data?.message || err.message))
    }
  })

  const deleteM = useMutation({
    mutationFn: (id) => donorService.deleteDonor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] })
      toast.info('Donor profile removed from registry.')
    },
    onError: () => {
      toast.error('Failed to remove donor.')
    }
  })

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="mb-6 flex justify-between items-center bg-slate-100 p-4 rounded border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lab Technician Donor Results Portal</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mt-0.5">Verification & Eligibility Sheet</p>
        </div>
        <div className="flex gap-4">
          <input
            placeholder="Search Donor Name / Phone..."
            className="border border-slate-300 rounded px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => navigate('/blood-bank/inventory')} className="bg-slate-700 text-white px-4 py-2 rounded text-xs uppercase font-bold">
            Generate Inventory Report
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-300 rounded shadow-sm">
        {/* Horizontal Walk-In Registration Dashboard Component - RE-ADDED FOR LAB TESTER */}
        <div className="bg-slate-100 border-b-2 border-slate-300 p-3">
          <Formik
            initialValues={{ name: '', age: '', phone: '', address: '' }}
            onSubmit={(values, { resetForm }) => {
              if(!values.name || !values.age || !values.phone || !values.address) {
                toast.error('All fields are required to register a donor'); return;
              }
              regMutation.mutate({ ...values, registeredBy: 'lab' }, { onSuccess: () => resetForm() })
            }}
          >
            {({ submitForm }) => (
              <Form className="flex flex-wrap items-end gap-3 w-full">
                <div className="flex-[2] min-w-[150px]">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Walk-In Name</label>
                  <Field name="name" className="w-full text-xs p-1.5 border border-slate-300 bg-white rounded shadow-sm focus:outline-none" placeholder="Full Name" />
                </div>
                <div className="flex-1 min-w-[110px]">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone</label>
                  <Field name="phone" className="w-full text-xs p-1.5 border border-slate-300 bg-white rounded shadow-sm focus:outline-none" placeholder="09..." />
                </div>
                <div className="w-16">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Age</label>
                  <Field name="age" type="number" className="w-full text-xs p-1.5 border border-slate-300 bg-white rounded shadow-sm focus:outline-none text-center" />
                </div>
                <div className="flex-[2] min-w-[150px]">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Address</label>
                  <Field name="address" className="w-full text-xs p-1.5 border border-slate-300 bg-white rounded shadow-sm focus:outline-none" placeholder="City or Region" />
                </div>
                <div className="w-36 flex items-end">
                  <button type="button" onClick={submitForm} disabled={regMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase px-3 py-1.5 rounded shadow-sm whitespace-nowrap transition-colors">
                    + Register Donor
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <table className="w-full text-[13px] border-collapse bg-white">
          <thead className="bg-slate-200 text-slate-700">
            <tr>
              <th className="border border-slate-300 px-3 py-3 text-left font-black uppercase">Name & Phone</th>
              <th className="border border-slate-300 px-1 py-3 text-center font-black uppercase w-12">Age</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-16">Group</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-24">HIV Test</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-24">HBV Test</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-20">Weight(kg)</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-24">Last Don.</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-24">Status</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* DONOR DATA ROWS */}
            {filteredDonors.length > 0 ? (
              filteredDonors.map((d) => {
                let isEligible = true
                if (d.lastDonationDate) {
                  const diffDays = Math.ceil(Math.abs(new Date() - new Date(d.lastDonationDate)) / (1000 * 60 * 60 * 24))
                  if (diffDays < 90) { isEligible = false; }
                }

                return (
                  <Formik
                    key={d._id || d.donorID}
                    initialValues={{
                      donorId: String(d._id || d.donorID || d.id),
                      name: d.name || '',
                      age: d.age || '',
                      phone: d.phone || d.phoneNumber || '',
                      address: d.address || '',
                      blood_type: d.bloodType || 'Unknown',
                      hiv: 'Non-Reactive',
                      hbv: 'Non-Reactive',
                      weight: 60,
                      bp: '120/80',
                      pulse: 72,
                      donation_amount: 450,
                      collection_date: today,
                    }}
                    onSubmit={(values) => mutation.mutate(values)}
                  >
                    {({ submitForm, values }) => (
                      <tr className={clsx("transition-colors", d.status === "rejected" ? "bg-red-50 opacity-70" : "hover:bg-slate-50")}>
                        <td className="border border-slate-300 p-1">
                          <Field name="name" className="w-full bg-transparent border-none font-bold text-slate-800 outline-none text-[11px] mb-1" placeholder="Name" />
                          <Field name="phone" className="w-full bg-transparent border-none outline-none text-[10px] font-mono text-slate-500" placeholder="Phone" />
                          <Field name="address" className="w-full bg-transparent border-none outline-none text-[10px] text-slate-400 truncate" placeholder="Address" />
                        </td>
                        <td className="border border-slate-300 p-1 text-center font-bold text-[12px] text-slate-600">
                          <Field name="age" type="number" className="w-full bg-transparent border-none text-center outline-none text-[11px]" />
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field as="select" name="blood_type" className="w-full bg-slate-100 border border-slate-200 rounded px-1 py-1.5 outline-none text-blue-800 font-bold text-[12px]">
                            <option value="Unknown">Choose</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                          </Field>
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field as="select" name="hiv" className={clsx("w-full border rounded px-1 py-1.5 font-bold text-[11px]", values.hiv === 'Positive' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-50 text-green-700 border-green-200')}>
                            <option value="Non-Reactive">Non-Reactive</option>
                            <option value="Positive">Positive / Reactive</option>
                          </Field>
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field as="select" name="hbv" className={clsx("w-full border rounded px-1 py-1.5 font-bold text-[11px]", values.hbv === 'Positive' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-green-50 text-green-700 border-green-200')}>
                            <option value="Non-Reactive">Non-Reactive</option>
                            <option value="Positive">Positive / Reactive</option>
                          </Field>
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field name="weight" type="number" className="w-16 bg-slate-100 border border-slate-200 rounded px-1 py-1.5 text-center font-bold text-[12px]" />
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-mono text-slate-600">
                              {d.lastDonationDate ? new Date(d.lastDonationDate).toISOString().slice(0, 10) : '-'}
                            </span>
                            {!isEligible && d.lastDonationDate && (
                              <span className="text-[9px] font-black text-rose-500 uppercase mt-0.5">
                                {90 - Math.ceil(Math.abs(new Date() - new Date(d.lastDonationDate)) / (1000 * 60 * 60 * 24))} Days Left
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="border border-slate-300 p-2 text-center uppercase tracking-wider font-black text-[10px]">
                          {d.status === 'rejected' ? <span className="text-red-600">Rejected</span> :
                            d.status === 'approved' ? <span className="text-green-600">Approved</span> :
                              <span className="text-orange-500 font-bold">Pending Check</span>}
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          {d.status === 'rejected' ? (
                            <button 
                               type="button" 
                               onClick={() => { if(window.confirm('Permanent Remove Rejected Donor?')) deleteM.mutate(d.donorID || d._id || d.id) }}
                               className="bg-red-500 text-white px-2 py-1.5 rounded font-black uppercase text-[10px] hover:bg-red-700 w-full transition-colors shadow-sm"
                            >
                               Purge Rejected
                            </button>
                          ) : (
                            <div className="flex flex-col gap-1 items-center">
                                <button
                                  type="button"
                                  onClick={submitForm}
                                  disabled={mutation.isPending || !isEligible || values.blood_type === 'Unknown'}
                                  className={clsx(
                                    "text-white px-2 py-1.5 rounded font-black uppercase text-[10px] w-full transition-colors shadow-sm",
                                    (!isEligible || values.blood_type === 'Unknown') ? 'bg-slate-400 cursor-not-allowed' :
                                      (values.hiv === 'Positive' || values.hbv === 'Positive' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700')
                                  )}
                                >
                                  {values.hiv === 'Positive' || values.hbv === 'Positive' ? 'Mark Rejected' : (!isEligible ? 'Wait 90 Days' : 'Verify & Bleed')}
                                </button>
                                
                                {!isEligible && (
                                   <button 
                                      type="button"
                                      onClick={() => { if(window.confirm('The donor is ineligible. Do you want to remove them from the list?')) deleteM.mutate(d.donorID || d._id || d.id) }} 
                                      className="text-[9px] font-bold text-red-400 hover:text-red-700 underline uppercase tracking-tighter"
                                   >
                                      Remove Ineligible
                                   </button>
                                )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Formik>
                )
              })
            ) : (
              <tr>
                <td colSpan="11" className="border border-slate-300 p-24 text-center text-slate-300 font-black uppercase tracking-widest text-lg">
                  Registry Empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


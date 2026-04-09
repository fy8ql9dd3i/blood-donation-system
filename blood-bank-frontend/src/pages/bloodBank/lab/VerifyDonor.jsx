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

const regSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  age: Yup.number().min(18, 'Must be 18+').required('Age is required'),
  phone: Yup.string().required('Phone is required'),
  address: Yup.string().required('Address is required'),
})

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

  const donors = pickList(donorsQ.data)

  // STRICT CLINICAL FILTER: Only show donors who are 100% eligible
  // 1. Must be > 90 days since last donation
  // 2. Health Info should not contain permanent exclusion keywords (optional safeguard)
  const eligibleRows = donors.filter(d => {
    if (d.lastDonationDate) {
      const diffDays = Math.ceil(Math.abs(new Date() - new Date(d.lastDonationDate)) / (1000 * 60 * 60 * 24))
      if (diffDays < 90) return false
    }
    // Also filter out known hazardous health remarks if any (e.g. HIV/Hepatitis)
    const health = (d.healthInfo || '').toUpperCase();
    if (health.includes('HIV') || health.includes('HBV') || health.includes('HEPATITIS')) return false;

    return true
  })

  // Search filter applied on top of eligible rows
  const filteredDonors = eligibleRows.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.phone || d.phoneNumber)?.includes(searchTerm) ||
    String(d.donorID || d._id)?.includes(searchTerm)
  )

  const mutation = useMutation({
    mutationFn: (payload) => labService.submitLabResults(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['donors'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Data Saved Successfully')
    },
    onError: (err) => {
      toast.error('Failed to save donor data')
    },
  })

  const regMutation = useMutation({
    mutationFn: (payload) => donorService.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] })
      toast.success('New Donor Registered')
    },
    onError: (err) => {
      toast.error('Registration failed')
    }
  })

  const today = new Date().toISOString().slice(0, 10)

  const getExpiry = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    d.setDate(d.getDate() + 42)
    return d.toLocaleDateString()
  }

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="mb-6 flex justify-between items-center bg-slate-100 p-4 rounded border border-slate-200">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Lab Technician Donor Results Portal</h1>
           <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mt-0.5">Excel-Format Certification Sheet</p>
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
        <table className="w-full text-[13px] border-collapse bg-white">
          <thead className="bg-slate-200 text-slate-700">
            <tr>
              <th className="border border-slate-300 px-3 py-3 text-left font-black uppercase">Name</th>
              <th className="border border-slate-300 px-1 py-3 text-center font-black uppercase w-12">Age</th>
              <th className="border border-slate-300 px-2 py-3 text-left font-black uppercase w-24">Phone</th>
              <th className="border border-slate-300 px-2 py-3 text-left font-black uppercase w-24">Address</th>
              <th className="border border-slate-300 px-1 py-3 text-center font-black uppercase w-20">Type</th>
              <th className="border border-slate-300 px-1 py-3 text-center font-black uppercase w-20">HIV</th>
              <th className="border border-slate-300 px-1 py-3 text-center font-black uppercase w-20">HBV</th>
              <th className="border border-slate-300 px-1 py-3 text-center font-black uppercase w-16">WT</th>
              <th className="border border-slate-300 px-1 py-3 text-center font-black uppercase w-20">BP</th>
              <th className="border border-slate-300 px-1 py-3 text-center font-black uppercase w-16">P</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-20">Vol</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-32">Date</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-32">Status</th>
              <th className="border border-slate-300 px-2 py-3 text-right font-black uppercase w-28">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* INLINE REGISTRATION ROW (Neutral Style) */}
            <Formik
              initialValues={{ name: '', age: '', phone: '', address: '' }}
              onSubmit={(values, { resetForm }) => {
                regMutation.mutate(values, { onSuccess: () => resetForm() })
              }}
            >
              {({ submitForm }) => (
                <tr className="bg-blue-50/50">
                  <td className="border border-slate-300 p-2">
                    <Field name="name" className="w-full border border-slate-200 rounded px-2 py-1.5 focus:bg-white outline-none" placeholder="Add Name..." />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <Field name="age" type="number" className="w-full border border-slate-200 rounded px-1 py-1.5 text-center focus:bg-white outline-none" placeholder="25" />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <Field name="phone" className="w-full border border-slate-200 rounded px-2 py-1.5 focus:bg-white outline-none" placeholder="09..." />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <Field name="address" className="w-full border border-slate-200 rounded px-2 py-1.5 focus:bg-white outline-none" placeholder="Addis..." />
                  </td>
                  <td colSpan="6" className="border border-slate-300 p-2 text-center text-slate-400 font-bold italic text-xs">
                     ← Fill columns on the left to register a new walk-in donor in the system
                  </td>
                  <td className="border border-slate-300 p-2 text-right">
                    <button onClick={submitForm} disabled={regMutation.isPending} className="bg-blue-600 text-white px-4 py-1.5 rounded font-black uppercase text-[10px] hover:bg-blue-700 w-full transition-colors">
                      {regMutation.isPending ? 'Saving...' : 'Register'}
                    </button>
                  </td>
                </tr>
              )}
            </Formik>

            {/* DONOR DATA ROWS */}
            {filteredDonors.length > 0 ? (
              filteredDonors.map((d) => {
                let isEligible = true, reason = ''
                if (d.lastDonationDate) {
                  const diffDays = Math.ceil(Math.abs(new Date() - new Date(d.lastDonationDate)) / (1000 * 60 * 60 * 24))
                  if (diffDays < 90) { isEligible = false; reason = `${90 - diffDays}d left`; }
                }

                return (
                  <Formik
                    key={d._id || d.donorID}
                    initialValues={{
                      donorId: String(d._id || d.donorID),
                      name: d.name || '',
                      age: d.age || '',
                      phone: d.phone || d.phoneNumber || '',
                      address: d.address || '',
                      blood_type: d.bloodType || 'O+',
                      hiv: 'Non-Reactive',
                      hbv: 'Non-Reactive',
                      weight: '',
                      bp: '',
                      pulse: '',
                      donation_amount: 450,
                      collection_date: today,
                      health_info: ''
                    }}
                    onSubmit={(values) => mutation.mutate(values)}
                  >
                    {({ submitForm, values }) => (
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="border border-slate-300 p-1">
                          <Field name="name" className="w-full bg-transparent border-none font-bold text-slate-800 outline-none text-xs" />
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field name="age" className="w-full bg-transparent border-none text-center outline-none text-xs" />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field name="phone" className="w-full bg-transparent border-none outline-none text-[11px] font-mono" />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field name="address" className="w-full bg-transparent border-none outline-none text-[11px] truncate" />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field as="select" name="blood_type" className="w-full bg-slate-100 border-none rounded px-1 py-1 outline-none text-blue-800 font-black text-[10px]">
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                          </Field>
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field as="select" name="hiv" className="w-full bg-slate-50 border-none rounded px-1 py-1 outline-none text-[10px] font-bold">
                             <option value="Non-Reactive">NR</option>
                             <option value="Positive">POS</option>
                          </Field>
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field as="select" name="hbv" className="w-full bg-slate-50 border-none rounded px-1 py-1 outline-none text-[10px] font-bold">
                             <option value="Non-Reactive">NR</option>
                             <option value="Positive">POS</option>
                          </Field>
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field name="weight" placeholder="60" className="w-full bg-transparent border-none text-center outline-none text-[10px] font-bold" />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field name="bp" placeholder="120/80" className="w-full bg-transparent border-none text-center outline-none text-[10px]" />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field name="pulse" placeholder="72" className="w-full bg-transparent border-none text-center outline-none text-[10px]" />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field name="donation_amount" type="number" className="w-full bg-slate-100 border-none px-1 py-1 text-center font-black text-[10px]" />
                        </td>
                        <td className="border border-slate-300 p-1">
                          <Field name="collection_date" type="date" className="w-full bg-transparent border-none outline-none text-[10px] text-center" />
                        </td>

                        <td className="border border-slate-300 p-1 text-center">
                          <span className="text-green-600 font-black text-[10px] flex items-center justify-center gap-1">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                             Eligible ✅
                          </span>
                        </td>
                        <td className="border border-slate-300 p-1 text-right">
                          <button 
                            onClick={submitForm} 
                            disabled={mutation.isPending} 
                            className="bg-green-600 text-white px-2 py-1.5 rounded font-black uppercase text-[9px] hover:bg-green-700 w-full transition-colors shadow-sm"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    )}
                  </Formik>
                )
              })
            ) : (
              <tr>
                <td colSpan="14" className="border border-slate-300 p-24 text-center text-slate-300 font-black uppercase tracking-widest text-lg">
                  Excel Registry Empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

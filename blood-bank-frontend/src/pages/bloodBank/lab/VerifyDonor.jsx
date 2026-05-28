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

function normalizePhoneForComparison(value) {
  const raw = String(value || '').trim().replace(/[\s\-().+]/g, '')
  if (raw.startsWith('251') && raw.length === 12) return raw
  if (raw.startsWith('09') && raw.length === 10) return `251${raw.slice(1)}`
  if (raw.startsWith('9') && raw.length === 9) return `251${raw}`
  return raw
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
      const message = err.response?.data?.message || err.message || 'Failed to update data';
      toast.error(message)
    },
  })

  const regMutation = useMutation({
    mutationFn: (payload) => donorService.register(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['donors'] })
      const isExisting = res?.alreadyExists || res?.message?.toLowerCase().includes('already exists')

      const donorObj = isExisting ? res?.donor : res;
      if (donorObj && donorObj.lastDonationDate) {
        const diffDays = Math.ceil(Math.abs(new Date() - new Date(donorObj.lastDonationDate)) / (1000 * 60 * 60 * 24))
        if (diffDays < 90) {
          toast.error(`Restriction: Donor last donated ${diffDays} days ago. Must wait 3 months! (${90 - diffDays} days remaining).`)
          return
        }
      }

      if (isExisting) {
        toast.info('Donor is already registered! Loaded existing profile from database.')
      } else {
        toast.success('New Walk-In Donor Registered Successfully!')
      }
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
          <Button
            onClick={() => {
              const token = localStorage.getItem('token');
              const base = api.defaults.baseURL.startsWith('http')
                ? api.defaults.baseURL
                : window.location.origin + api.defaults.baseURL;
              window.open(`${base}/reports/lab-generate?token=${token}`, '_blank');
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded text-xs uppercase font-bold hover:bg-emerald-700 transition-colors shadow-lg"
          >
            Generate Lab Report
          </Button>
          <Button onClick={() => navigate('/blood-bank/inventory')} className="bg-slate-700 text-white px-4 py-2 rounded text-xs uppercase font-bold">
            Inventory Report
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-300 rounded shadow-sm">
        {/* Horizontal Walk-In Registration Dashboard Component - RE-ADDED FOR LAB TESTER */}
        <div className="bg-slate-100 border-b-2 border-slate-300 p-3">
          <Formik
            initialValues={{ name: '', age: '', phone: '', gender: '', address: '' }}
            onSubmit={(values, { resetForm }) => {
              if (!values.name || !values.age || !values.phone || !values.address || !values.gender) {
                toast.error('All fields are required to register a donor'); return;
              }
              const parsedAge = parseInt(values.age);
              if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
                toast.error('Donor must be between 18 and 65 years old to register');
                return;
              }
              // Prevent duplicate registration of the same phone number
              const normalizedTarget = normalizePhoneForComparison(values.phone)
              const phoneExists = donors.some(d => normalizePhoneForComparison(d.phone || d.phoneNumber) === normalizedTarget)
              if (phoneExists) {
                toast.warning(`A donor with phone number ${values.phone} is already in the registry. Search for them below instead of registering again.`);
                return;
              }
              regMutation.mutate({ ...values, registeredBy: 'lab' }, { onSuccess: () => resetForm() })
            }}
          >
            {({ submitForm, setFieldValue, values }) => (
              <Form className="flex flex-wrap items-end gap-3 w-full">
                <div className="flex-1 min-w-[210px]">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                  <div className="flex gap-1">
                    <Field name="phone" className="w-full text-xs p-1.5 border border-slate-300 bg-white rounded shadow-sm focus:outline-none" placeholder="09..." />
                    <button
                      type="button"
                      onClick={async () => {
                        const trimmedPhone = values.phone?.trim();
                        if (!trimmedPhone) {
                          toast.warning('Please enter a phone number to check');
                          return;
                        }
                        try {
                          const { data } = await api.get(`/donors/phone/${trimmedPhone}`);
                          if (data) {
                            setFieldValue('name', data.name || '');
                            setFieldValue('age', data.age || '');
                            setFieldValue('address', data.address || '');
                            setFieldValue('gender', data.gender || '');
                            setSearchTerm(trimmedPhone); // Automatically filter table below to show their record!
                            toast.info(`Donor found! Previously donated ${data.totalDonations || 0} times. Details autofilled!`);
                          }
                        } catch (err) {
                          toast.success('New phone number! Fill out details to register a new donor.');
                        }
                      }}
                      className="bg-slate-300 hover:bg-slate-400 text-slate-700 text-[10px] font-black uppercase px-2 py-1.5 rounded shadow-sm transition-all"
                    >
                      Check
                    </button>
                  </div>
                </div>
                <div className="flex-[2] min-w-[150px]">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Walk-In Name</label>
                  <Field name="name" className="w-full text-xs p-1.5 border border-slate-300 bg-white rounded shadow-sm focus:outline-none" placeholder="Full Name" />
                </div>
                <div className="w-16">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Age</label>
                  <Field name="age" type="number" min="18" max="65" className="w-full text-xs p-1.5 border border-slate-300 bg-white rounded shadow-sm focus:outline-none text-center" />
                </div>
                <div className="w-32">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Gender</label>
                  <Field as="select" name="gender" className="w-full text-xs p-1.5 border border-slate-300 bg-white rounded shadow-sm focus:outline-none">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Field>
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
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-24">HIV/HBV</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-16">Weight</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-16">Hb</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-24">BP/Pulse</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-16">Temp</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-20">Vol (mL)</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-24">Last Don.</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-black uppercase w-32">Coll / Exp Date</th>
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
                      hiv: '',
                      hbv: '',
                      weight: '',
                      hemoglobin: '',
                      bp: '',
                      pulse: '',
                      bodyTemperature: '',
                      donation_amount: '',
                      collection_date: today,
                      expiry_date: new Date(new Date().getTime() + 42 * 24 * 3600 * 1000).toISOString().slice(0, 10),
                    }}
                    onSubmit={(values) => {
                      const parsedAge = parseInt(values.age);
                      if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
                        toast.error('Donor must be between 18 and 65 years old to donate');
                        return;
                      }
                      const measured = parseInt(values.donation_amount);
                      if (!measured || isNaN(measured) || measured <= 0) {
                        toast.error('Please enter the measured donation volume (mL) before submitting.');
                        return;
                      }
                      const FRONTEND_MIN_VOL = 400;
                      if (measured < FRONTEND_MIN_VOL) {
                        toast.warn(`Measured volume (${measured} mL) is below typical minimum (${FRONTEND_MIN_VOL} mL). Backend may reject.`);
                      }
                      mutation.mutate(values);
                    }}
                  >
                    {({ submitForm, values }) => (
                      <tr className={clsx("transition-colors", d.status === "rejected" ? "bg-red-50 opacity-70" : "hover:bg-slate-50")}>
                        <td className="border border-slate-300 p-1">
                          <Field name="name" className="w-full bg-transparent border-none font-bold text-slate-800 outline-none text-[11px] mb-1" placeholder="Name" />
                          <Field name="phone" className="w-full bg-transparent border-none outline-none text-[10px] font-mono text-slate-500" placeholder="Phone" />
                          <Field name="address" className="w-full bg-transparent border-none outline-none text-[10px] text-slate-400 truncate" placeholder="Address" />
                          <div className="mt-1 flex items-center">
                            <span className={clsx(
                              "px-1.5 py-0.5 rounded-[3px] text-[8px] font-black uppercase tracking-tight border",
                              !d.totalDonations || d.totalDonations === 0
                                ? "bg-slate-50 text-slate-500 border-slate-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            )}>
                              {!d.totalDonations || d.totalDonations === 0
                                ? "1st Time Donor"
                                : `${d.totalDonations} Donation${d.totalDonations > 1 ? 's' : ''}`}
                            </span>
                          </div>
                        </td>
                        <td className="border border-slate-300 p-1 text-center font-bold text-[12px] text-slate-600">
                          <Field name="age" type="number" min="18" max="65" className="w-full bg-transparent border-none text-center outline-none text-[11px]" />
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field as="select" name="blood_type" className="w-full bg-slate-100 border border-slate-200 rounded px-1 py-1.5 outline-none text-blue-800 font-bold text-[12px]">
                            <option value="Unknown">Choose</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                          </Field>
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <div className="flex flex-col gap-1">
                            <Field as="select" name="hiv" className={clsx("w-full border rounded px-1 py-1 font-bold text-[10px]", values.hiv === 'Positive' ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-700')}>
                              <option value="Non-Reactive">HIV-</option>
                              <option value="Positive">HIV+</option>
                            </Field>
                            <Field as="select" name="hbv" className={clsx("w-full border rounded px-1 py-1 font-bold text-[10px]", values.hbv === 'Positive' ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-700')}>
                              <option value="Non-Reactive">HBV-</option>
                              <option value="Positive">HBV+</option>
                            </Field>
                          </div>
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field name="weight" type="number" className="w-12 bg-slate-50 border border-slate-200 rounded text-center text-[11px]" />
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field name="hemoglobin" type="number" step="0.1" className="w-12 bg-slate-50 border border-slate-200 rounded text-center text-[11px]" />
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <div className="flex flex-col gap-1">
                            <Field name="bp" className="w-16 bg-slate-50 border border-slate-200 rounded text-center text-[10px]" placeholder="BP" />
                            <Field name="pulse" type="number" className="w-16 bg-slate-50 border border-slate-200 rounded text-center text-[10px]" placeholder="Pulse" />
                          </div>
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <Field name="bodyTemperature" type="number" step="0.1" className="w-12 bg-slate-50 border border-slate-200 rounded text-center text-[11px]" />
                        </td>
                        <td className="border border-slate-300 p-1 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Field name="donation_amount" type="number" min="0" placeholder="mL" className="w-20 bg-slate-50 border border-slate-200 rounded text-center text-[11px]" />
                            <span className="text-[10px] text-slate-500">mL</span>
                          </div>
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
                        <td className="border border-slate-300 p-1 text-center">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-bold text-slate-400 w-8">COLL:</span>
                              <Field name="collection_date" type="date" className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] w-full" />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-bold text-slate-400 w-8">EXP:</span>
                              <Field name="expiry_date" type="date" className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] w-full" />
                            </div>
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
                              onClick={() => { if (window.confirm('Permanent Remove Rejected Donor?')) deleteM.mutate(d.donorID) }}
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

                              <button
                                type="button"
                                onClick={() => { if (window.confirm('Are you sure you want to remove this donor profile from the registry?')) deleteM.mutate(d.donorID) }}
                                className="text-[9px] font-bold text-red-400 hover:text-red-700 underline uppercase tracking-tighter"
                              >
                                Remove Donor
                              </button>
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
                <td colSpan="13" className="border border-slate-300 p-24 text-center text-slate-300 font-black uppercase tracking-widest text-lg">
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


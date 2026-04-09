import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardHeader } from '../components/ui/Card'
import * as authService from '../services/authService'

const schema = Yup.object({
  name: Yup.string().required('Hospital name required'),
  address: Yup.string().required('Address required'),
  phoneNumber: Yup.string().required('Phone required'),
  latitude: Yup.string().optional(),
  longitude: Yup.string().optional(),
})
export default function RegisterHospital() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [newCredentials, setNewCredentials] = useState(null)

  const mutation = useMutation({
    mutationFn: (payload) => authService.registerHospitalOrganization(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['hospitals', 'public-list'] })
      // res.data.credentials {username, password}
      setNewCredentials(res?.data?.credentials)
      toast.success('Hospital registered successfully!')
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Could not register hospital'
      )
    },
  })

  const backTo =
    user?.role === 'admin' ? '/admin/dashboard' : '/blood-bank/dashboard'

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4">
      <Link
        to={backTo}
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register hospital</h1>
        <p className="text-slate-600 font-medium">
          Creates the hospital record and generates automated login credentials.
        </p>
      </div>

      {newCredentials && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 shadow-sm ring-4 ring-emerald-500/10 animate-in fade-in zoom-in duration-300">
           <div className="flex items-center gap-3 mb-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
               <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" /></svg>
             </div>
             <h2 className="text-lg font-bold text-emerald-900">Hospital Credentials Generated</h2>
           </div>
           
           <p className="text-sm text-emerald-700 mb-6">
             Please copy these credentials and provide them to the hospital staff. 
             <strong> These will not be shown again.</strong>
           </p>

           <div className="space-y-4">
              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Username</label>
                <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 shadow-inner group-hover:border-emerald-400 transition-colors">
                   <span>{newCredentials.username}</span>
                   <button onClick={() => { navigator.clipboard.writeText(newCredentials.username); toast.info('Username copied!') }} className="text-emerald-500 hover:text-emerald-700"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg></button>
                </div>
              </div>
              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Password</label>
                <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 shadow-inner group-hover:border-emerald-400 transition-colors">
                   <span>{newCredentials.password}</span>
                   <button onClick={() => { navigator.clipboard.writeText(newCredentials.password); toast.info('Password copied!') }} className="text-emerald-500 hover:text-emerald-700"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg></button>
                </div>
              </div>
           </div>

           <Button onClick={() => setNewCredentials(null)} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 border-none h-12 rounded-xl font-bold shadow-lg shadow-emerald-500/20">
              OK, I have recorded the credentials
           </Button>
        </div>
      )}

      {!newCredentials && (
        <Card className="shadow-xl rounded-2xl border-none ring-1 ring-slate-200">
          <CardHeader title="New Hospital Registration" />
          <Formik
            initialValues={{
              name: '',
              address: '',
              phoneNumber: '',
              latitude: '',
              longitude: '',
            }}
            validationSchema={schema}
            onSubmit={(values, { resetForm }) => {
              mutation.mutate(
                {
                  name: values.name.trim(),
                  address: values.address.trim(),
                  phoneNumber: values.phoneNumber.trim(),
                  latitude: values.latitude === '' ? undefined : Number(values.latitude),
                  longitude: values.longitude === '' ? undefined : Number(values.longitude),
                },
                { onSuccess: () => resetForm() }
              )
            }}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4 p-2">
                <Field name="name">
                  {({ field }) => (
                    <Input
                      {...field}
                      label="Official Hospital Name"
                      placeholder="e.g., St. Gabriel Specialist Hospital"
                      error={touched.name && errors.name}
                    />
                  )}
                </Field>
                <Field name="address">
                  {({ field }) => (
                    <Input
                      {...field}
                      label="Physical Address"
                      placeholder="Street, City, Region"
                      error={touched.address && errors.address}
                    />
                  )}
                </Field>
                <Field name="phoneNumber">
                  {({ field }) => (
                    <Input
                      {...field}
                      label="Primary Contact Number"
                      placeholder="+251..."
                      error={touched.phoneNumber && errors.phoneNumber}
                    />
                  )}
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field name="latitude">
                    {({ field }) => (
                      <Input {...field} type="number" step="any" label="Latitude" placeholder="Optional" />
                    )}
                  </Field>
                  <Field name="longitude">
                    {({ field }) => (
                      <Input {...field} type="number" step="any" label="Longitude" placeholder="Optional" />
                    )}
                  </Field>
                </div>
                <div className="pt-4">
                  <Button type="submit" disabled={mutation.isPending} className="w-full h-14 rounded-xl text-md font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 active:translate-y-1 transition-all">
                    {mutation.isPending ? 'Processing Registration...' : 'Authorize & Register Hospital'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      )}
    </div>
  )
}

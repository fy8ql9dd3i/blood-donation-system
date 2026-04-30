import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import * as authService from '../../services/authService'
import clsx from 'clsx'
const createSchema = Yup.object({
  name: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
  role: Yup.string().oneOf(['blood_bank_staff', 'hospital_staff', 'admin']).required(),
})

const inviteHospitalSchema = Yup.object({
  name: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
  hospitalId: Yup.string().required(),
})
function pickUsers(res) {
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

function pickHospitals(res) {
  if (!res) return []
  if (Array.isArray(res.data)) return res.data
  return []
}
export default function ManageUsers() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data: body } = await api.get('/admin/users')
      return body
    },
  })

  const users = pickUsers(data)

  const hospitalsQ = useQuery({
    queryKey: ['admin', 'hospitals-list'],
    queryFn: async () => {
      const { data: body } = await api.get('/hospitals')
      return body
    },
  })
  const hospitals = pickHospitals(hospitalsQ.data)

  const inviteHospitalMutation = useMutation({
    mutationFn: (payload) => authService.registerHospitalStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Hospital staff invited — they can sign in with email & password')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Invite failed')
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/delete-user/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User removed')
    },
    onError: () => toast.error('Delete failed'),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/toggle-status/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.info(res.data?.message || 'Status updated')
    },
    onError: () => toast.error('Status update failed'),
  })

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/create-user', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User created')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Create failed')
    },
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Control & User Registry</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase font-bold tracking-wider">System-Wide Account Management</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter leading-none">Total Active</span>
              <span className="text-xl font-black text-indigo-700 leading-tight">{users.filter(u => u.is_active).length}</span>
           </div>
           <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 flex flex-col items-center">
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-tighter leading-none">Blocked</span>
              <span className="text-xl font-black text-rose-700 leading-tight">{users.filter(u => !u.is_active).length}</span>
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader
            title="Onboard Hospital Staff"
            subtitle="Link medical professionals to registered clinics"
          />
          <div className="p-6 pt-0">
            <Formik
              initialValues={{ name: '', email: '', password: '', hospitalId: '' }}
              validationSchema={inviteHospitalSchema}
              onSubmit={(values, { resetForm }) => {
                inviteHospitalMutation.mutate(
                  {
                    name: values.name.trim(),
                    email: values.email.trim(),
                    password: values.password,
                    hospitalId: Number(values.hospitalId),
                  },
                  { onSuccess: () => resetForm() }
                )
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-1">Full Name</label>
                    <Field name="name" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Dr. John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-1">Email Address</label>
                    <Field name="email" type="email" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="hospital@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-1">Initial Password</label>
                    <Field name="password" type="password" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-1">Assign Hospital</label>
                    <Field as="select" name="hospitalId" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                      <option value="">Select Clinic...</option>
                      {hospitals.map((h) => <option key={h.hospitalId} value={String(h.hospitalId)}>{h.name}</option>)}
                    </Field>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50">
                      {isSubmitting ? 'Processing...' : 'Authorize Hospital Staff'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader title="General Account Creation" subtitle="Create internal bank staff or admin leads" />
          <div className="p-6 pt-0">
            <Formik
              initialValues={{ name: '', email: '', password: '', role: 'blood_bank_staff' }}
              validationSchema={createSchema}
              onSubmit={(values, { resetForm }) => {
                createMutation.mutate(values, { onSuccess: () => resetForm() })
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-1">Full Name</label>
                    <Field name="name" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-1">Email</label>
                    <Field name="email" type="email" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-1">Set Password</label>
                    <Field name="password" type="password" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase px-1">System Role</label>
                    <Field as="select" name="role" className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                      <option value="blood_bank_staff">Blood Bank Staff</option>
                      <option value="hospital_staff">Hospital Staff</option>
                      <option value="admin">System Admin</option>
                    </Field>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 disabled:opacity-50">
                      Generate System Access
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-xl border-none ring-1 ring-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
           <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Active User Directory</h3>
           <span className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-400 font-bold uppercase">Role-Based Access Control Enabled</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">System Privileges</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className={clsx("hover:bg-slate-50/80 transition-colors", !u.is_active && "bg-slate-50/50 opacity-75")}>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{u.name || 'Incognito User'}</span>
                        <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={clsx(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                        u.role === 'admin' ? "bg-amber-100 text-amber-700" :
                        u.role === 'hospital_staff' ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                     )}>
                        {u.role?.replace('_', ' ')}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-1.5">
                        <div className={clsx("w-2 h-2 rounded-full", u.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                        <span className={clsx("text-[10px] font-bold uppercase", u.is_active ? "text-emerald-700" : "text-rose-700")}>
                           {u.is_active ? 'Authorized' : 'Restricted'}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleStatusMutation.mutate(u.id)}
                      className={clsx(
                        "text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-2 transition-all",
                        u.is_active 
                          ? "border-amber-200 text-amber-600 hover:bg-amber-600 hover:text-white" 
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                      )}
                    >
                      {u.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('PERMANENT DELETION: Are you sure? This cannot be undone.')) {
                          deleteMutation.mutate(u.id)
                        }
                      }}
                      className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-2 border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
                    >
                      Purge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

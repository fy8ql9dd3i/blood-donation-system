import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import api from '../../services/api'
import * as authService from '../../services/authService'
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

  const deleteMutation = useMutation({    mutationFn: (id) => api.delete(`/admin/delete-user/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User removed')
    },
    onError: () => toast.error('Delete failed'),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage users</h1>
        <p className="text-slate-600">
          Manage accounts. Hospital employees can also self-register on{' '}
          <code className="rounded bg-slate-100 px-1">/register</code> after their hospital exists.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Invite hospital staff (admin)"
          subtitle="POST /api/auth/register-hospital-staff — role is set to hospital_staff; pick hospital"
        />
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            hospitalId: '',
          }}
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
          {({ errors, touched }) => (
            <Form className="grid gap-4 md:grid-cols-2">
              <Field name="name">
                {({ field }) => (
                  <Input
                    {...field}
                    label="Name"
                    error={touched.name && errors.name}
                  />
                )}
              </Field>
              <Field name="email">
                {({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    label="Email"
                    error={touched.email && errors.email}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    label="Password"
                    error={touched.password && errors.password}
                  />
                )}
              </Field>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Hospital
                </label>
                <Field
                  as="select"
                  name="hospitalId"
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {hospitals.map((h) => (
                    <option key={h.hospitalId} value={String(h.hospitalId)}>
                      {h.name}
                    </option>
                  ))}
                </Field>
                {touched.hospitalId && errors.hospitalId && (
                  <p className="mt-1 text-xs text-red-600">{errors.hospitalId}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={inviteHospitalMutation.isPending}>
                  {inviteHospitalMutation.isPending ? 'Sending…' : 'Create hospital staff login'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>

      <Card>
        <CardHeader title="Create user (admin API)" />        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            role: 'blood_bank_staff',
          }}
          validationSchema={createSchema}
          onSubmit={(values, { resetForm }) => {
            createMutation.mutate(values, { onSuccess: () => resetForm() })
          }}
        >
          {({ errors, touched }) => (
            <Form className="grid gap-4 md:grid-cols-2">
              <Field name="name">
                {({ field }) => (
                  <Input
                    {...field}
                    label="Name"
                    error={touched.name && errors.name}
                  />
                )}
              </Field>
              <Field name="email">
                {({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    label="Email"
                    error={touched.email && errors.email}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    label="Password"
                    error={touched.password && errors.password}
                  />
                )}
              </Field>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <Field
                  as="select"
                  name="role"
                  className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="blood_bank_staff">Blood bank staff</option>
                  <option value="hospital_staff">Hospital staff</option>
                  <option value="admin">Admin</option>
                </Field>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating…' : 'Create user'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>

      <Card>
        <CardHeader title="All users" />
        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {isError && (
          <p className="text-sm text-red-600">Could not load users.</p>
        )}
        {!isLoading && users.length === 0 && !isError && (
          <p className="text-sm text-slate-500">No users returned.</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Role</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4 capitalize">{u.role}</td>
                  <td className="py-2">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Delete this user?')) {
                          deleteMutation.mutate(u.id)
                        }
                      }}
                    >
                      Delete
                    </Button>
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

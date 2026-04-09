/**
 * Invite another blood bank staff member (POST /api/auth/register-blood-bank-staff).
 * Caller must be admin or blood_bank_staff; backend forces role blood_bank_staff.
 * Fields: name, email, password (role is assigned on the server).
 */
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardHeader } from '../../components/ui/Card'
import * as authService from '../../services/authService'

const schema = Yup.object({
  name: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
})

export default function RegisterColleague() {
  const location = useLocation()
  const backTo = location.pathname.startsWith('/admin')
    ? '/admin/dashboard'
    : '/blood-bank/dashboard'

  const mutation = useMutation({
    mutationFn: (payload) => authService.registerBloodBankStaff(payload),
    onSuccess: () => {
      toast.success('Blood bank staff account created — they can sign in now')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Registration failed')
    },
  })

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        to={backTo}
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Back to dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Register blood bank staff</h1>
        <p className="text-slate-600">
          Creates a user with role <code className="rounded bg-slate-100 px-1">blood_bank_staff</code>.
        </p>
      </div>
      <Card>
        <CardHeader title="New colleague" />
        <Formik
          initialValues={{ name: '', email: '', password: '' }}
          validationSchema={schema}
          onSubmit={(values, { resetForm }) => {
            mutation.mutate(
              {
                name: values.name.trim(),
                email: values.email.trim(),
                password: values.password,
              },
              { onSuccess: () => resetForm() }
            )
          }}
        >
          {({ errors, touched }) => (
            <Form className="space-y-3">
              <Field name="name">
                {({ field }) => (
                  <Input {...field} label="Full name" error={touched.name && errors.name} />
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating…' : 'Create account'}
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  )
}

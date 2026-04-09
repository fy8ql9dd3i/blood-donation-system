/**
 * Public registration hub.
 * Only use: First system admin setup.
 * Hospital staff accounts are created exclusively by admin via /register-hospital.
 */
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardHeader } from '../../components/ui/Card'
import * as authService from '../../services/authService'

const adminSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email().required('Email is required'),
  password: Yup.string().min(6).required('Password is required'),
})

export default function RegisterPortal() {
  const { completeRegistrationLogin } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">System Setup</h1>
          <p className="mt-2 text-sm text-slate-600">
            Initialize the first administrator account for the Blood Bank Portal.
          </p>
          <Link
            to="/login"
            className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Already have an account? Sign in
          </Link>
        </div>

        {/* First admin setup */}
        <Card>
          <CardHeader
            title="First Administrator Setup"
            subtitle="Only works while no administrator exists in the database"
          />
          <Formik
            initialValues={{ name: '', email: '', password: '' }}
            validationSchema={adminSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const res = await authService.registerFirstAdmin({
                  name: values.name.trim(),
                  email: values.email.trim(),
                  password: values.password,
                })
                await completeRegistrationLogin(res, values.email.trim())
                resetForm()
              } catch (e) {
                toast.error(
                  e?.response?.data?.message || e?.message || 'Could not create admin'
                )
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-3">
                <Field name="name">
                  {({ field }) => (
                    <Input {...field} label="Full name" error={touched.name && errors.name} />
                  )}
                </Field>
                <Field name="email">
                  {({ field }) => (
                    <Input {...field} type="email" label="Email" error={touched.email && errors.email} />
                  )}
                </Field>
                <Field name="password">
                  {({ field }) => (
                    <Input {...field} type="password" label="Password" error={touched.password && errors.password} />
                  )}
                </Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'Initialize system admin'}
                </Button>
              </Form>
            )}
          </Formik>
        </Card>

        {/* Notice for hospital staff */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
          <p>
            <strong>Hospital Staff:</strong> Public registration is disabled.
            Your account is created automatically by the Blood Bank Administrator.
            Contact your administrator for your <strong>Username</strong> and <strong>Password</strong>.
          </p>
          <Link to="/login">
            <Button variant="secondary" className="mt-4">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

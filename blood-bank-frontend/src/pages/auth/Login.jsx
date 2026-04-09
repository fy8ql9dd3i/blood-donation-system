/**     
 * Staff login — POST /api/auth/login with email + password.
 * JWT stored in localStorage; role drives redirect (see AuthContext).
 */
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

const schema = Yup.object({
  email: Yup.string().required('Email or Username is required'),
  password: Yup.string().required('Password is required'),
})

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-600/30">
          B+
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Blood Bank Portal</h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Sign in as <strong>admin</strong>, <strong>hospital staff</strong>, or{' '}
          <strong>blood bank staff</strong>.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <h2 className="mb-6 text-center text-lg font-semibold text-slate-800">
          Sign in
        </h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await login(values)
            } catch (e) {
              const msg =
                e?.response?.data?.message ||
                e?.message ||
                'Unable to sign in'
              toast.error(msg)
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <Field name="email">
                {({ field }) => (
                  <Input
                    {...field}
                    autoComplete="username"
                    label="Email or Username"
                    error={touched.email && errors.email}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    autoComplete="current-password"
                    label="Password"
                    error={touched.password && errors.password}
                  />
                )}
              </Field>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  )
}

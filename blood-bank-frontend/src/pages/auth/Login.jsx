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
import { useState } from 'react'

const schema = Yup.object({
  email: Yup.string().required('Email or Username is required'),
  password: Yup.string().required('Password is required'),
})

export default function Login() {
  const { login } = useAuth()
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail) {
      return toast.error("Please enter your email first")
    }
    setIsSending(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send reset email")
      toast.success(data.message || "Authentication reset link has been sent!")
      setIsForgotMode(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsSending(false)
    }
  }

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
        {isForgotMode ? (
          <div>
            <h2 className="mb-6 text-center text-lg font-semibold text-slate-800">
              Reset Password
            </h2>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your registered email"
              />
              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-500"
                >
                  Back to Sign in
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
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
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-500"
                >
                  Forgot password?
                </button>
              </div>
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
        </div>
        )}
      </Card>
    </div>
  )
}

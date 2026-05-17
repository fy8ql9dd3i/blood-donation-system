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
import clsx from 'clsx'

const schema = Yup.object({
  email: Yup.string().required('Email or Username is required'),
  password: Yup.string().required('Password is required'),
})

export default function Login({ isLandingPart = false }) {
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
    <div className={clsx("flex items-center justify-center bg-white px-4", !isLandingPart ? "min-h-[calc(100vh-16rem)] py-20" : "py-10")}>
      <div className="w-full max-w-lg space-y-10">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-3xl font-black text-white shadow-2xl shadow-brand-200 rotate-3">
            B+
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Staff Access</h1>
          <div className="flex items-center justify-center gap-4">
             <div className="h-[1px] w-12 bg-slate-200" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Secure Portal</p>
             <div className="h-[1px] w-12 bg-slate-200" />
          </div>
        </div>

        <Card className="formal-border p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
          {isForgotMode ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recovery Access</h2>
                <p className="text-sm text-slate-500 mt-2">Enter your email to receive a secure link</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <Input
                  type="email"
                  label="Registered Email Address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="rounded-2xl bg-slate-50 border-slate-200"
                  placeholder="name@organization.com"
                />
                <Button type="submit" className="w-full bg-slate-900 py-4 rounded-2xl shadow-xl shadow-slate-200 text-xs font-black uppercase tracking-widest" disabled={isSending}>
                  {isSending ? 'Verifying...' : 'Request Access Link'}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(false)}
                    className="text-xs font-black text-brand-600 uppercase tracking-widest hover:text-brand-700 transition-colors"
                  >
                    ← Back to Identity Verification
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={schema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    await login(values)
                  } catch (e) {
                    const msg = e?.response?.data?.message || e?.message || 'Unable to sign in'
                    toast.error(msg)
                  } finally {
                    setSubmitting(false)
                  }
                }}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-6">
                    <div>
                      <Field name="email">
                        {({ field }) => (
                          <Input
                            {...field}
                            autoComplete="username"
                            label="Email or Official Username"
                            className="rounded-2xl bg-slate-50 border-slate-200"
                            error={touched.email && errors.email}
                          />
                        )}
                      </Field>
                    </div>
                    <div>
                      <Field name="password">
                        {({ field }) => (
                          <Input
                            {...field}
                            type="password"
                            autoComplete="current-password"
                            label="Security Password"
                            className="rounded-2xl bg-slate-50 border-slate-200"
                            error={touched.password && errors.password}
                          />
                        )}
                      </Field>
                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => setIsForgotMode(true)}
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors"
                        >
                          Credential Recovery?
                        </button>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-brand-600 hover:bg-brand-700 py-5 rounded-2xl shadow-2xl shadow-brand-200 text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><span className="animate-spin">⏳</span> Authenticating...</>
                      ) : (
                        <><span className="text-lg">🛡️</span> Secure Sign In</>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </Card>
        
        <div className="text-center">
           <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
             This is a restricted area. Authorized personnel only. All access is logged for security auditing.
           </p>
        </div>
      </div>
    </div>
  )
}

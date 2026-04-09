import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = Yup.object({
  apiUrl: Yup.string().url().optional(),
  lowStockThreshold: Yup.number().min(0).max(100),
})

/**
 * UI-only settings: persist to localStorage. Wire fields to real admin endpoints when available.
 */
export default function Settings() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System settings</h1>
        <p className="text-slate-600">
          Placeholder preferences stored in the browser. Backend configuration lives on the server.
        </p>
      </div>

      <Card>
        <CardHeader title="Portal preferences" />
        <Formik
          initialValues={{
            apiUrl:
              import.meta.env.REACT_APP_API_URL ||
              import.meta.env.VITE_API_URL ||
              'http://localhost:5000/api',
            lowStockThreshold: Number(localStorage.getItem('lowStockThreshold') || 5),
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            localStorage.setItem('lowStockThreshold', String(values.lowStockThreshold))
            toast.success(
              'Saved locally (API URL is chosen at build time from env vars)'
            )
          }}
        >
          {({ errors, touched }) => (
            <Form className="space-y-4">
              <Field name="apiUrl">
                {({ field }) => (
                  <Input
                    {...field}
                    label="API base URL (set REACT_APP_API_URL or VITE_API_URL before build)"
                    disabled
                    error={touched.apiUrl && errors.apiUrl}
                  />
                )}
              </Field>
              <Field name="lowStockThreshold">
                {({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    label="Highlight low stock below (units, local only)"
                    error={touched.lowStockThreshold && errors.lowStockThreshold}
                  />
                )}
              </Field>
              <Button type="submit">Save preferences</Button>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  )
}

import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardHeader } from '../../components/ui/Card'
import * as hospitalService from '../../services/hospitalService'

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const urgencyLevels = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High (emergency)' },
]

const schema = Yup.object({
  patientName: Yup.string().required('Patient name is required'),
  bloodType: Yup.string().required('Select blood type'),
  unitsRequired: Yup.number()
    .min(1, 'At least 1 unit')
    .required('Units required'),
  urgencyLevel: Yup.string().required('Select urgency'),
})

export default function RequestBlood() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload) => hospitalService.submitBloodRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospital', 'my-requests'] })
      toast.success('Blood request submitted')
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Could not submit request'
      )
    },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Emergency / routine request</h1>
        <p className="text-slate-600">
          Submit a blood request for a patient. The blood bank will process it.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Request details"
          subtitle="All fields are sent to POST /api/requests"
        />
        <Formik
          initialValues={{
            patientName: '',
            bloodType: 'O+',
            unitsRequired: 1,
            urgencyLevel: 'medium',
          }}
          validationSchema={schema}
          onSubmit={(values, { resetForm }) => {
            mutation.mutate(
              {
                patientName: values.patientName.trim(),
                bloodType: values.bloodType,
                unitsRequired: Number(values.unitsRequired),
                urgencyLevel: values.urgencyLevel,
              },
              {
                onSuccess: () => resetForm(),
              }
            )
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <Field name="patientName">
                {({ field }) => (
                  <Input
                    {...field}
                    label="Patient name"
                    error={touched.patientName && errors.patientName}
                  />
                )}
              </Field>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Blood type
                </label>
                <Field
                  as="select"
                  name="bloodType"
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  {bloodTypes.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </Field>
                {touched.bloodType && errors.bloodType && (
                  <p className="mt-1 text-xs text-red-600">{errors.bloodType}</p>
                )}
              </div>

              <Field name="unitsRequired">
                {({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    label="Units required"
                    error={touched.unitsRequired && errors.unitsRequired}
                  />
                )}
              </Field>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Urgency
                </label>
                <Field
                  as="select"
                  name="urgencyLevel"
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  {urgencyLevels.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </Field>
              </div>

              <Button type="submit" disabled={isSubmitting || mutation.isPending}>
                {mutation.isPending ? 'Submitting…' : 'Submit request'}
              </Button>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  )
}

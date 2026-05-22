import React from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import donorService from '../../../services/donorService'
import { Card } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { useNavigate } from 'react-router-dom'

const regSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  age: Yup.number().min(18, 'Must be at least 18').max(65, 'Max age is 65').required('Age is required'),
  phone: Yup.string().required('Phone is required'),
  address: Yup.string().required('Address is required'),
  gender: Yup.string().required('Gender is required'),
})

export default function RegisterDonor() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const regMutation = useMutation({
    mutationFn: (payload) => donorService.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] })
      toast.success('New Walk-In Donor Registered Successfully!')
      navigate('/blood-bank/lab/verify')
    },
    onError: (err) => {
      toast.error('Registration failed: ' + (err.response?.data?.message || err.message))
    }
  })

  return (
    <div className="p-4 sm:p-8 bg-white min-h-screen">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Register New Donor</h1>
        <p className="text-sm text-slate-500 mb-8">Add a walk-in donor physically present at the blood bank.</p>
        
        <Card className="p-6 shadow-md border border-slate-200">
          <Formik
            initialValues={{ name: '', age: '', gender: '', phone: '', address: '' }}
            validationSchema={regSchema}
            onSubmit={(values, { setSubmitting, resetForm }) => {
              regMutation.mutate(values, {
                onSettled: () => setSubmitting(false)
              })
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <Field as={Input} name="name" placeholder="E.g. Abebe Kebede" error={touched.name && errors.name} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <Field as={Input} name="phone" placeholder="09..." error={touched.phone && errors.phone} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                    <Field as={Input} type="number" name="age" placeholder="25" error={touched.age && errors.age} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                  <Field as="select" name="gender" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:outline-none font-medium text-slate-900">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Field>
                  {touched.gender && errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Address / City</label>
                  <Field as={Input} name="address" placeholder="Addis Ababa" error={touched.address && errors.address} />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="button" onClick={() => navigate('/blood-bank/lab/verify')} className="w-1/3 bg-slate-200 text-slate-700 hover:bg-slate-300">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || regMutation.isPending} className="w-2/3 bg-brand-600">
                    {regMutation.isPending ? 'Registering...' : 'Complete Registration'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      </div>
    </div>
  )
}

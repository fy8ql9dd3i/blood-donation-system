import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import BarChart from '../../../components/charts/BarChart'
import PieChart from '../../../components/charts/PieChart'
import * as inventoryService from '../../../services/inventoryService'
import api from '../../../services/api'

function pickList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}

const notifySchema = Yup.object({
  donorId: Yup.string().required('Donor ID required'),
  titleKey: Yup.string().required('Title key required'),
  messageKey: Yup.string().required('Message key required'),
})

export default function BloodBankDashboard() {
  const queryClient = useQueryClient()
  const [notifyOpen, setNotifyOpen] = useState(false)

  const inventoryQ = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => inventoryService.getInventory(),
  })

  const donorsQ = useQuery({
    queryKey: ['donors', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/donors')
      return data
    },
  })

  const alertsQ = useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: () => inventoryService.getInventoryAlerts(),
  })

  const rows = pickList(inventoryQ.data)
  const donors = pickList(donorsQ.data)

  const barData = {
    labels: rows.length ? rows.map((r) => r.bloodType || r.blood_type) : ['—'],
    datasets: [
      {
        label: 'Units',
        data: rows.length ? rows.map((r) => Number(r.quantity ?? 0)) : [0],
        backgroundColor: '#b91c1c',
        borderRadius: 6,
      },
    ],
  }

  const low = rows.filter((r) => r.status === 'low' || r.status === 'empty').length
  const pieData = {
    labels: ['Adequate', 'Low / empty'],
    datasets: [
      {
        data: [Math.max(0, rows.length - low), low || 0.001],
        backgroundColor: ['#22c55e', '#f97316'],
        borderWidth: 0,
      },
    ],
  }

  const notifyMutation = useMutation({
    mutationFn: (body) => api.post('/notifications', body),
    onSuccess: () => {
      toast.success('Notification queued')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setNotifyOpen(false)
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to notify donor'
      )
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blood bank dashboard</h1>
          <p className="text-slate-600">Inventory health and donor outreach.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => setNotifyOpen((o) => !o)}>
          {notifyOpen ? 'Close notify form' : 'Notify eligible donors'}
        </Button>
      </div>

      {notifyOpen && (
        <Card>
          <CardHeader
            title="Send notification"
            subtitle="POST /api/notifications — i18n keys must exist in the API (titleKey / messageKey)"
          />
          <Formik
            initialValues={{
              donorId: '',
              titleKey: 'emergency.title',
              messageKey: 'emergency.message',
            }}
            validationSchema={notifySchema}
            onSubmit={(values) => {
              notifyMutation.mutate({
                donorId: values.donorId,
                titleKey: values.titleKey.trim(),
                messageKey: values.messageKey.trim(),
              })
            }}
          >
            {({ errors, touched }) => (
              <Form className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Donor
                  </label>
                  <Field
                    as="select"
                    name="donorId"
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select donor</option>
                    {donors.map((d) => (
                      <option key={d.donorID} value={String(d.donorID)}>
                        {(d.name || 'Donor') + ` (ID: ${d.donorID})`}
                      </option>
                    ))}
                  </Field>
                  {touched.donorId && errors.donorId && (
                    <p className="mt-1 text-xs text-red-600">{errors.donorId}</p>
                  )}
                </div>
                <Field name="titleKey">
                  {({ field }) => (
                    <Input
                      {...field}
                      label="Title translation key"
                      error={touched.titleKey && errors.titleKey}
                    />
                  )}
                </Field>
                <Field name="messageKey">
                  {({ field }) => (
                    <Input
                      {...field}
                      label="Message translation key"
                      error={touched.messageKey && errors.messageKey}
                    />
                  )}
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={notifyMutation.isPending}>
                    {notifyMutation.isPending ? 'Sending…' : 'Send notification'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Inventory rows</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {inventoryQ.isLoading ? '…' : rows.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Low-stock rows</p>
          <p className="mt-1 text-3xl font-semibold text-orange-600">
            {inventoryQ.isLoading ? '…' : low}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Alerts endpoint</p>
          <p className="mt-1 text-sm text-slate-700">
            {alertsQ.isLoading
              ? 'Loading…'
              : alertsQ.isError
                ? 'Unable to load alerts'
                : 'GET /inventory/alerts — see network tab for payload'}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Stock by blood type" />
          <BarChart data={barData} />
        </Card>
        <Card>
          <CardHeader title="Stock pressure" />
          <PieChart data={pieData} />
        </Card>
      </div>
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import * as inventoryService from '../../../services/inventoryService'
import * as reportService from '../../../services/reportService'
import { toast } from 'react-toastify'

function pickList(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}

export default function Reports() {
  const inventoryQ = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => inventoryService.getInventory(),
  })

  const rows = pickList(inventoryQ.data)
  const totalUnits = rows.reduce(
    (sum, r) => sum + Number(r.quantity ?? 0),
    0
  )

  async function tryDownload() {
    try {
      const res = await reportService.downloadReportExcel()
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'blood_donation_report.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          'Report generation failed (check backend /api/reports/generate)'
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600">
          Summaries from live inventory. Excel export uses GET /api/reports/generate.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Inventory lots</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {inventoryQ.isLoading ? '…' : rows.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total units (sum)</p>
          <p className="mt-1 text-3xl font-semibold text-brand-700">
            {inventoryQ.isLoading ? '…' : totalUnits}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Export"
          subtitle="Server builds an Excel workbook when the endpoint succeeds"
          action={
            <Link to="/blood-bank/reports/export">
              <Button variant="secondary" type="button">
                Open export page
              </Button>
            </Link>
          }
        />
        <Button type="button" onClick={tryDownload}>
          Download Excel now
        </Button>
      </Card>
    </div>
  )
}

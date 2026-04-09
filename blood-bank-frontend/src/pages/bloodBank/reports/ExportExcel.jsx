import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import * as reportService from '../../../services/reportService'
import api from '../../../services/api'

const COLUMNS = [
  'Name', 'Age', 'Gender', 'Phone', 'Address',
  'Blood Type', 'Collection Date', 'Expiry Date', 'Total Donations',
]

function pickDonors(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  return []
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB')
}

function calcExpiry(d) {
  if (!d) return '—'
  const exp = new Date(d)
  exp.setDate(exp.getDate() + 42)
  return exp.toLocaleDateString('en-GB')
}

export default function ExportExcel() {
  const [loading, setLoading] = useState(false)

  const donorsQ = useQuery({
    queryKey: ['donors', 'list'],
    queryFn: async () => { const { data } = await api.get('/donors'); return data },
  })
  const donors = pickDonors(donorsQ.data)

  async function download() {
    setLoading(true)
    try {
      const res = await reportService.downloadReportExcel()
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'donor_registry.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success('Excel file downloaded!')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Could not generate report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between bg-slate-100 border border-slate-200 rounded-lg p-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Donor Registry Report</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-0.5">
            Excel Export — {donors.length} donor{donors.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={download}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black uppercase text-xs px-6 py-3 rounded-lg shadow-lg shadow-green-500/20 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {loading ? 'Generating...' : 'Download Excel'}
        </button>
      </div>

      {/* Preview table */}
      <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
        <table className="w-full text-[12px] border-collapse bg-white">
          <thead>
            <tr className="bg-[#1E3A5F] text-white">
              {COLUMNS.map(col => (
                <th key={col} className="border border-slate-400 px-3 py-3 font-black uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {donorsQ.isLoading ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-400 font-bold">
                  Loading donors...
                </td>
              </tr>
            ) : donors.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">
                  No donor records found
                </td>
              </tr>
            ) : (
              donors.map((d, i) => {
                const expiryRaw = d.lastDonationDate
                  ? new Date(new Date(d.lastDonationDate).getTime() + 42 * 864e5)
                  : null
                const isExpired  = expiryRaw && expiryRaw < new Date()
                const isExpiring = expiryRaw && !isExpired && (expiryRaw - new Date()) <= 7 * 864e5

                return (
                  <tr key={d.donorID || d._id} className={i % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'}>
                    <td className="border border-slate-200 px-3 py-2 font-semibold text-slate-800">{d.name || '—'}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center">{d.age || '—'}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center">{d.gender || '—'}</td>
                    <td className="border border-slate-200 px-2 py-2 font-mono">{d.phone || d.phoneNumber || '—'}</td>
                    <td className="border border-slate-200 px-2 py-2 max-w-[140px] truncate">{d.address || '—'}</td>
                    <td className="border border-slate-200 px-2 py-2 text-center">
                      <span className="bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded text-[11px]">
                        {d.bloodType || '—'}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-2 py-2 text-center">{fmtDate(d.lastDonationDate)}</td>
                    <td className={`border border-slate-200 px-2 py-2 text-center font-bold ${
                      isExpired  ? 'bg-red-100 text-red-700' :
                      isExpiring ? 'bg-orange-100 text-orange-700' : ''
                    }`}>
                      {calcExpiry(d.lastDonationDate)}
                      {isExpired  && <span className="ml-1 text-[10px]">⚠ EXPIRED</span>}
                      {isExpiring && <span className="ml-1 text-[10px]">⚠ SOON</span>}
                    </td>
                    <td className="border border-slate-200 px-2 py-2 text-center font-black text-blue-700">
                      {d.totalDonations ?? 0}
                    </td>
                  </tr>
                )
              })
            )}
            {/* Summary row */}
            {donors.length > 0 && (
              <tr className="bg-slate-100 font-black text-slate-700 text-xs">
                <td className="border border-slate-300 px-3 py-2" colSpan={8}>
                  Total Records: {donors.length}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center text-blue-700">
                  {donors.reduce((s, d) => s + (d.totalDonations || 0), 0)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-200 rounded inline-block"></span> Expired blood unit</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-200 rounded inline-block"></span> Expiring within 7 days</span>
      </div>
    </div>
  )
}

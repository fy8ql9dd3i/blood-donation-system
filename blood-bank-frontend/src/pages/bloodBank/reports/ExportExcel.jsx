import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import * as reportService from '../../../services/reportService'
import api from '../../../services/api'

const COLUMNS = [
  'Name', 'Age', 'Gender', 'Phone', 'Address',
  'Blood Type', 'Collection Date', 'Expiry Date', 'Total Donations',
]

const MONTH_OPTIONS = [
  { value: '', label: 'Any month' },
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
]

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, idx) => {
  const year = new Date().getFullYear() - idx
  return { value: String(year), label: String(year) }
})

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
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('All')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    gender: 'All',
    month: '',
    year: '',
    date: '',
  })

  const donorsQ = useQuery({
    queryKey: ['donors', 'list'],
    queryFn: async () => { const { data } = await api.get('/donors'); return data },
  })
  const allDonors = pickDonors(donorsQ.data)
  const donors = allDonors.filter(d => d.status === 'approved')

  const filteredDonors = donors.filter((d) => {
    const name = String(d.name || '').toLowerCase()
    const phone = String(d.phone || d.phoneNumber || '').toLowerCase()
    const gender = String(d.gender || 'Unknown').toLowerCase()
    const search = appliedFilters.searchTerm.trim().toLowerCase()
    const lastDonation = d.lastDonationDate ? new Date(d.lastDonationDate) : null

    const matchesSearch =
      !search ||
      name.includes(search) ||
      phone.includes(search) ||
      String(d.donorID || d.id || '').includes(search) ||
      gender.includes(search)

    const matchesGender =
      appliedFilters.gender === 'All' ||
      gender === appliedFilters.gender.toLowerCase()

    const matchesMonth =
      !appliedFilters.month ||
      (lastDonation && lastDonation.getMonth() === Number(appliedFilters.month))

    const matchesYear =
      !appliedFilters.year ||
      (lastDonation && lastDonation.getFullYear() === Number(appliedFilters.year))

    const matchesDate =
      !appliedFilters.date ||
      (lastDonation && lastDonation.toISOString().slice(0, 10) === appliedFilters.date)

    return matchesSearch && matchesGender && matchesMonth && matchesYear && matchesDate
  })

  function applyFilters() {
    setAppliedFilters({ searchTerm, gender: genderFilter, month: monthFilter, year: yearFilter, date: dateFilter })
  }

  function clearFilters() {
    setSearchTerm('')
    setGenderFilter('All')
    setMonthFilter('')
    setYearFilter('')
    setDateFilter('')
    setAppliedFilters({ searchTerm: '', gender: 'All', month: '', year: '', date: '' })
  }

  async function download() {
    setLoading(true)
    try {
      const res = await reportService.downloadReportExcel({
        searchTerm: searchTerm.trim(),
        gender: genderFilter,
        month: monthFilter,
        year: yearFilter,
        date: dateFilter,
      })
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
            Excel Export — {filteredDonors.length} shown / {donors.length} total
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

      {/* Donor Statistics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col justify-center">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Donors</p>
          <p className="text-2xl font-black text-slate-800">{donors.length}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col justify-center border-l-4 border-l-blue-500">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">New This Month</p>
          <p className="text-2xl font-black text-blue-600">
            {donors.filter(d => d.createdAt && new Date(d.createdAt).getMonth() === new Date().getMonth() && new Date(d.createdAt).getFullYear() === new Date().getFullYear()).length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col justify-center border-l-4 border-l-indigo-500">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">New This Year</p>
          <p className="text-2xl font-black text-indigo-600">
            {donors.filter(d => d.createdAt && new Date(d.createdAt).getFullYear() === new Date().getFullYear()).length}
          </p>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <label className="block text-slate-600 text-[11px] uppercase tracking-[0.2em] font-black">
              Search donor name / phone / ID
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search all donors..."
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </label>
            <label className="block text-slate-600 text-[11px] uppercase tracking-[0.2em] font-black">
              Gender
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="All">All genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="block text-slate-600 text-[11px] uppercase tracking-[0.2em] font-black">
              Month
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                {MONTH_OPTIONS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-slate-600 text-[11px] uppercase tracking-[0.2em] font-black">
              Year
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="">Any year</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-slate-600 text-[11px] uppercase tracking-[0.2em] font-black">
              Exact Date
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-lg bg-brand-600 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-brand-700 transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setGenderFilter('Male')
                setSearchTerm('')
                setMonthFilter('')
                setYearFilter('')
                setDateFilter('')
                setAppliedFilters({ searchTerm: '', gender: 'Male', month: '', year: '', date: '' })
              }}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-100 transition"
            >
              Male only
            </button>
            <button
              type="button"
              onClick={() => {
                setGenderFilter('Female')
                setSearchTerm('')
                setMonthFilter('')
                setYearFilter('')
                setDateFilter('')
                setAppliedFilters({ searchTerm: '', gender: 'Female', month: '', year: '', date: '' })
              }}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-100 transition"
            >
              Female only
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-100 transition"
            >
              Clear filters
            </button>
          </div>
        </div>

        {appliedFilters.gender !== 'All' || appliedFilters.month || appliedFilters.year || appliedFilters.searchTerm || appliedFilters.date ? (
          <p className="mt-4 text-xs text-slate-500 uppercase tracking-[0.2em] font-black">
            Active filters: {appliedFilters.gender !== 'All' ? `${appliedFilters.gender} ` : ''}
            {appliedFilters.month ? `month=${MONTH_OPTIONS.find(m => m.value === appliedFilters.month)?.label || ''} ` : ''}
            {appliedFilters.year ? `year=${appliedFilters.year} ` : ''}
            {appliedFilters.date ? `date=${appliedFilters.date} ` : ''}
            {appliedFilters.searchTerm ? `query="${appliedFilters.searchTerm}"` : ''}
          </p>
        ) : null}
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
            ) : filteredDonors.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-300 font-black uppercase tracking-widest">
                  No donor records match the selected filters
                </td>
              </tr>
            ) : (
              filteredDonors.map((d, i) => {
                const expiryRaw = d.lastDonationDate
                  ? new Date(new Date(d.lastDonationDate).getTime() + 42 * 864e5)
                  : null
                const isExpired = expiryRaw && expiryRaw < new Date()
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
                    <td className={`border border-slate-200 px-2 py-2 text-center font-bold ${isExpired ? 'bg-red-100 text-red-700' :
                        isExpiring ? 'bg-orange-100 text-orange-700' : ''
                      }`}>
                      {calcExpiry(d.lastDonationDate)}
                      {isExpired && <span className="ml-1 text-[10px]">⚠ EXPIRED</span>}
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
            {filteredDonors.length > 0 && (
              <tr className="bg-slate-100 font-black text-slate-700 text-xs">
                <td className="border border-slate-300 px-3 py-2" colSpan={8}>
                  Total Records: {filteredDonors.length}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center text-blue-700">
                  {filteredDonors.reduce((s, d) => s + (d.totalDonations || 0), 0)}
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

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../../../components/ui/Card'
import donationService from '../../../services/donationService'
import api from '../../../services/api'
import { toast } from 'react-toastify'

function getNextDonationDate(collectionDate) {
  const d = new Date(collectionDate)
  d.setDate(d.getDate() + 90)
  return d
}

function NextDateBadge({ collectionDate }) {
  const next = getNextDonationDate(collectionDate)
  const daysLeft = Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24))
  const eligible = daysLeft <= 0

  return eligible ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      ✅ Eligible Now
    </span>
  ) : (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-700">
        {next.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
      </span>
      <span className="text-[10px] text-amber-600 font-bold">{daysLeft} days remaining</span>
    </div>
  )
}

export default function DonationHistory() {
  const [searchTerm, setSearchTerm] = useState('')

  const donationsQ = useQuery({
    queryKey: ['donations', 'all'],
    queryFn: () => donationService.getAllDonations(),
  })

  const rawDonations = Array.isArray(donationsQ.data) ? donationsQ.data : (donationsQ.data?.data || [])
  // Sort newest first
  const donations = [...rawDonations].sort((a, b) => new Date(b.collectionDate) - new Date(a.collectionDate))

  // Filter based on phone / name search
  const filteredDonations = donations.filter(d => {
    const phone = (d.donor?.phone || d.donor?.phoneNumber || '').toLowerCase()
    const name = (d.donor?.name || '').toLowerCase()
    const query = searchTerm.toLowerCase().trim()
    return phone.includes(query) || name.includes(query)
  })

  // Summary stats
  const totalUnits = donations.reduce((s, d) => s + (d.units || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Donation History</h1>
          <p className="text-slate-600">Complete record of all blood donations across the system.</p>
        </div>
        {donations.length > 0 && (
          <div className="flex gap-4">
            <div className="text-center px-5 py-3 bg-red-50 rounded-xl ring-1 ring-red-100">
              <p className="text-2xl font-black text-red-700">{donations.length}</p>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Donations</p>
            </div>
            <div className="text-center px-5 py-3 bg-slate-50 rounded-xl ring-1 ring-slate-100">
              <p className="text-2xl font-black text-slate-700">{totalUnits}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Units</p>
            </div>
          </div>
        )}
      </div>

      {/* Modern Search Control */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by phone / mobile / donor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400 text-slate-700 font-medium"
          />
          <span className="absolute left-3 top-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            🔍 Found <span className="text-red-600 font-extrabold">{filteredDonations.length}</span> matching records
          </div>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-900">Donor</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Phone</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Blood Type</th>
                <th className="px-6 py-3 font-semibold text-slate-900 text-center">Units</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Donated On</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Next Eligible Date</th>
                <th className="px-6 py-3 font-semibold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donationsQ.isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    Loading history...
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No donation records found.
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No records found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d, index) => (
                  <tr key={d.id} className={`hover:bg-slate-50 transition-colors ${index === 0 && !searchTerm ? 'bg-red-50/40' : ''}`}>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">Latest</span>
                        )}
                        {d.donor?.name || 'Unknown Donor'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {d.donor?.phone || d.donor?.phoneNumber || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">
                        {d.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-900 font-semibold">
                      {d.units}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(d.collectionDate).toLocaleString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <NextDateBadge collectionDate={d.collectionDate} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={async () => {
                          try {
                            const { data } = await api.post(`/donations/${d.id}/appreciate`)
                            if (data.success) toast.success('Appreciation sent! 💝')
                          } catch (err) {
                            toast.error('Failed to send appreciation')
                          }
                        }}
                        className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95"
                      >
                        Appreciate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

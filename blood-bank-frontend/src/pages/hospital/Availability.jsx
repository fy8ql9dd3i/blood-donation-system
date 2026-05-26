import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader } from '../../components/ui/Card'
import * as inventoryService from '../../services/inventoryService'
import donorService from '../../services/donorService'
import { isEligibleToDonate, getDonorEligibilityBadge } from '../../utils/donorEligibility'
import clsx from 'clsx'

function pickInventory(res) {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.data)) return res.data
    return []
}

function pickDonors(res) {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.data)) return res.data
    return []
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-']

export default function HospitalAvailability() {
    const [addressSearch, setAddressSearch] = useState('')
    const [searchSubmitted, setSearchSubmitted] = useState(false)

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['inventory', 'all'],
        queryFn: () => inventoryService.getInventory(),
    })

    const donorsQuery = useQuery({
        queryKey: ['donors', 'all'],
        queryFn: () => donorService.getAll(),
    })

    const inventory = pickInventory(data)
    const donors = pickDonors(donorsQuery.data)

    const getStockForType = (type) => {
        return inventory
            .filter((item) => (item.bloodType || item.blood_type) === type)
            .reduce((sum, item) => sum + Number(item.quantity || item.qty || 0), 0)
    }

    const totalUnits = inventory.reduce(
        (sum, item) => sum + Number(item.quantity || item.qty || 0),
        0
    )

    const lowStockTypes = bloodTypes.filter((type) => getStockForType(type) > 0 && getStockForType(type) <= 5)

    const matchedDonors = addressSearch.trim()
        ? donors
            .filter((donor) => (donor.address || '').toLowerCase().includes(addressSearch.trim().toLowerCase()))
            .filter((donor) => donor.status === 'approved')
        : []

    const eligibleDonors = matchedDonors.filter((donor) => isEligibleToDonate(donor))

    const donorsByAddress = matchedDonors.reduce((acc, donor) => {
        const address = donor.address?.trim() || 'Unknown location'
        acc[address] = (acc[address] || 0) + 1
        return acc
    }, {})

    const eligibleByAddress = eligibleDonors.reduce((acc, donor) => {
        const address = donor.address?.trim() || 'Unknown location'
        acc[address] = (acc[address] || 0) + 1
        return acc
    }, {})

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hospital logistics</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Blood Availability</h1>
                <p className="max-w-2xl text-slate-500 font-medium">Review real-time available units for all blood groups across the connected blood bank inventory.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="rounded-3xl border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total available units</p>
                    <p className="mt-2 text-4xl font-black text-slate-900 tracking-tighter">
                        {isLoading ? '…' : totalUnits}
                    </p>
                </Card>
                <Card className="rounded-3xl border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood groups listed</p>
                    <p className="mt-2 text-4xl font-black text-emerald-600 tracking-tighter">{bloodTypes.length}</p>
                </Card>
                <Card className="rounded-3xl border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low stock alerts</p>
                    <p className="mt-2 text-4xl font-black text-red-600 tracking-tighter">{isLoading ? '…' : lowStockTypes.length}</p>
                </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="rounded-3xl border-slate-200">
                    <CardHeader
                        title="Donor address finder"
                        subtitle="Search registered donors by street, neighborhood or nearby address"
                    />
                    <div className="p-6 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                                type="text"
                                value={addressSearch}
                                onChange={(e) => setAddressSearch(e.target.value)}
                                placeholder="Search donor addresses near hospital..."
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setSearchSubmitted(true)}
                                className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-brand-700 transition-all"
                            >
                                Search
                            </button>
                        </div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">{searchSubmitted ? `${matchedDonors.length} registered donor(s) • ${eligibleDonors.length} eligible now` : 'Enter a location keyword and tap Search'}</p>
                        {searchSubmitted && addressSearch.trim() && matchedDonors.length > 0 && (
                            <div className="rounded-3xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-slate-700">
                                {Object.keys(donorsByAddress).length === 1 ? (
                                    <span>{donorsByAddress[matchedDonors[0].address?.trim() || 'Unknown location']} donor(s) found • {eligibleByAddress[matchedDonors[0].address?.trim() || 'Unknown location'] || 0} eligible for emergency response</span>
                                ) : (
                                    <span>{matchedDonors.length} donors across {Object.keys(donorsByAddress).length} location(s) • {eligibleDonors.length} eligible now</span>
                                )}
                            </div>
                        )}
                        <div className="space-y-3">
                            {searchSubmitted && addressSearch.trim() && matchedDonors.length === 0 && (
                                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                                    No donors found for this address. Try a nearby street or sector name.
                                </div>
                            )}
                            {searchSubmitted && matchedDonors.map((donor) => {
                                const donorAddress = donor.address?.trim() || 'Unknown location'
                                const eligible = isEligibleToDonate(donor)
                                const badge = getDonorEligibilityBadge(donor)
                                return (
                                    <div key={donor.id || donor.donorID || donor.phone} className={clsx('rounded-3xl border p-4', eligible ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50')}>
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <div>
                                                <p className="font-black text-slate-900">{donor.name || donor.fullName || 'Unnamed donor'}</p>
                                                <p className="text-xs text-slate-500">{donor.bloodType || donor.blood_type || 'Unknown type'}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">{donor.distance ? `${donor.distance} km` : 'Nearby'}</span>
                                                <span className={clsx('text-[9px] font-black uppercase tracking-[0.3em] px-2 py-1 rounded-full border', badge.color)}>
                                                    {badge.icon} {badge.text}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600"><span className="font-black">Address:</span> {donorAddress}</p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">{donor.phone || donor.phoneNumber || 'No phone'}</p>
                                        <p className="mt-2 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">{donorsByAddress[donorAddress]} donor(s) in place • {eligibleByAddress[donorAddress] || 0} eligible</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Card>
                <Card className="rounded-3xl border-slate-200 overflow-hidden">
                    <CardHeader
                        title="Google street map"
                        subtitle="Hospital location and nearby donor search area"
                    />
                    <div className="h-96 bg-slate-900">
                        <iframe
                            title="Hospital street map"
                            src="https://maps.google.com/maps?q=Felege%20Hiwot%20Hospital%2C%20Bahir%20Dar%2C%20Ethiopia&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            className="h-full w-full border-0"
                            allowFullScreen
                        />
                    </div>
                </Card>
            </div>

            <Card className="rounded-3xl border-slate-200">
                <CardHeader
                    title="Stock by blood group"
                    subtitle="Current ready-to-dispatch units from the regional blood bank"
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 p-6">
                    {bloodTypes.map((type) => {
                        const stock = getStockForType(type)
                        return (
                            <div
                                key={type}
                                className={clsx(
                                    'rounded-3xl border p-4 text-center',
                                    stock === 0 ? 'border-red-100 bg-red-50/20' : 'border-slate-200 bg-white'
                                )}
                            >
                                <div className="text-brand-600 font-black text-xl">{type}</div>
                                <div className={clsx('mt-2 text-3xl font-black', stock === 0 ? 'text-red-600' : 'text-slate-900')}>
                                    {isLoading ? '…' : stock}
                                </div>
                                <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mt-1">Units</div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            <Card className="rounded-3xl border-slate-200">
                <CardHeader
                    title="Detailed inventory"
                    subtitle="Each stock entry with expiry and availability status"
                />
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                                <th className="px-4 py-3">Blood type</th>
                                <th className="px-4 py-3">Units</th>
                                <th className="px-4 py-3">Expiry</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-slate-400">Loading availability...</td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-slate-400">No inventory data available.</td>
                                </tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item.id || `${item.bloodType}-${item.expiryDate || item.expiry}`}>
                                        <td className="px-4 py-4 font-black text-slate-900">{item.bloodType || item.blood_type || '—'}</td>
                                        <td className="px-4 py-4">{Number(item.quantity || item.qty || 0)}</td>
                                        <td className="px-4 py-4 text-slate-500">{item.expiryDate || item.expiry || 'N/A'}</td>
                                        <td className="px-4 py-4 uppercase text-[10px] tracking-[0.3em] font-black text-slate-600">{item.status || 'available'}</td>
                                        <td className="px-4 py-4 text-slate-500">{item.source || item.hospitalName || 'Regional bank'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isError && (
                <Card className="rounded-3xl border border-red-200 bg-red-50 text-red-700">
                    <div className="p-5 text-sm font-bold">Unable to load availability: {error?.response?.data?.message || error?.message || 'Network error'}</div>
                </Card>
            )}
        </div>
    )
}

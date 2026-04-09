import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Card, CardHeader } from '../../components/ui/Card'
import PieChart from '../../components/charts/PieChart'
import AvailabilityMap from '../../components/AvailabilityMap'
import * as inventoryService from '../../services/inventoryService'
import * as hospitalService from '../../services/hospitalService'

/** Backend wraps lists in `{ data: [...] }` (see `successResponse` in the API). */
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

/**
 * Hospital “availability” screen:
 * 1) React Query `useQuery` keeps inventory in cache under key `['inventory','all']` — any other page
 *    using the same key shares this data for ~60s (see main.jsx QueryClient `staleTime`).
 * 2) A second query loads donor lat/lng for the map (`['map','donor-locations']`).
 * 3) `queryFn` must return a Promise; we call thin service functions that wrap Axios.
 */
export default function ViewAvailability() {
  const inventoryToastRef = useRef(false)
  const mapToastRef = useRef(false)

  const inventoryQuery = useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => inventoryService.getInventory(),
  })

  const donorMapQuery = useQuery({
    queryKey: ['map', 'donor-locations'],
    queryFn: () => hospitalService.getDonorLocationsForMap(),
  })

  const rows = pickInventory(inventoryQuery.data)
  const donorPins = useMemo(
    () =>
      pickDonors(donorMapQuery.data).filter(
        (d) =>
          d.latitude != null &&
          d.longitude != null &&
          !Number.isNaN(Number(d.latitude)) &&
          !Number.isNaN(Number(d.longitude))
      ),
    [donorMapQuery.data]
  )

  useEffect(() => {
    if (inventoryQuery.isError) {
      toast.error(
        inventoryQuery.error?.response?.data?.message ||
          'Could not load blood inventory'
      )
    }
  }, [inventoryQuery.isError, inventoryQuery.error])

  useEffect(() => {
    if (inventoryQuery.isSuccess && !inventoryToastRef.current) {
      inventoryToastRef.current = true
      toast.success('Inventory data loaded')
    }
  }, [inventoryQuery.isSuccess])

  useEffect(() => {
    if (donorMapQuery.isError) {
      toast.error(
        donorMapQuery.error?.response?.data?.message ||
          'Could not load donor locations for the map'
      )
    }
  }, [donorMapQuery.isError, donorMapQuery.error])

  useEffect(() => {
    if (donorMapQuery.isSuccess && !mapToastRef.current) {
      mapToastRef.current = true
      toast.success(
        donorPins.length
          ? `Map ready — ${donorPins.length} donor(s) with coordinates`
          : 'Map ready — no donors with coordinates yet (addresses may not be geocoded)'
      )
    }
  }, [donorMapQuery.isSuccess, donorPins.length])

  const pieData = {
    labels: rows.length ? rows.map((r) => r.bloodType || r.blood_type || '?') : ['No data'],
    datasets: [
      {
        data: rows.length
          ? rows.map((r) => Number(r.quantity ?? r.qty ?? 0))
          : [1],
        backgroundColor: [
          '#dc2626',
          '#ea580c',
          '#ca8a04',
          '#16a34a',
          '#0891b2',
          '#4f46e5',
          '#9333ea',
          '#db2777',
        ],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Blood availability</h1>
        <p className="text-slate-600">
          Charts use <strong>GET /api/inventory</strong>. The map loads{' '}
          <strong>GET /api/map/donor-locations</strong> (donors geocoded at registration).
        </p>
      </div>

      <Card>
        <CardHeader
          title="Donor locations (map)"
          subtitle="OpenStreetMap — zoom and tap markers for details"
        />
        {donorMapQuery.isLoading && (
          <p className="text-sm text-slate-500">Loading map data…</p>
        )}
        {!donorMapQuery.isLoading && (
          <AvailabilityMap donors={donorPins} />
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Units by type" />
          {inventoryQuery.isLoading && (
            <p className="text-sm text-slate-500">Loading…</p>
          )}
          {inventoryQuery.isError && (
            <p className="text-sm text-red-600">
              {inventoryQuery.error?.response?.data?.message ||
                'Could not load inventory'}
            </p>
          )}
          {inventoryQuery.isSuccess && !inventoryQuery.isError && (
            <PieChart data={pieData} />
          )}
        </Card>

        <Card>
          <CardHeader title="Stock rows" subtitle="Expiry and status when provided" />
          {inventoryQuery.isLoading && (
            <p className="text-sm text-slate-500">Loading…</p>
          )}
          {!inventoryQuery.isLoading && rows.length === 0 && (
            <p className="text-sm text-slate-500">No inventory rows returned.</p>
          )}
          {!inventoryQuery.isLoading && rows.length > 0 && (
            <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
              {rows.map((r, i) => (
                <li
                  key={r.id ?? i}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="font-medium text-slate-800">
                    {r.bloodType || r.blood_type}
                  </span>
                  <span className="text-slate-600">
                    {r.quantity ?? r.qty} units
                    {r.status ? ` · ${r.status}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

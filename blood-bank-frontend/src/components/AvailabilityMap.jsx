/**
 * OpenStreetMap tiles + Leaflet markers (no Google API key required).
 * Donor coordinates come from GET /api/map/donor-locations (see hospitalService).
 */
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Vite does not serve Leaflet's default marker URLs unless we set them explicitly:
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const DEFAULT_CENTER = [9.03, 38.75]
const DEFAULT_ZOOM = 6

function FitBounds({ pins }) {
  const map = useMap()
  useEffect(() => {
    if (!pins?.length) return
    const latLngs = pins.map((p) => [p.latitude, p.longitude])
    const bounds = L.latLngBounds(latLngs)
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
  }, [map, pins])
  return null
}

export default function AvailabilityMap({ donors = [] }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div
        className="flex h-[min(420px,55vh)] w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500"
        aria-hidden
      >
        Loading map…
      </div>
    )
  }

  const center =
    donors.length > 0
      ? [
          donors.reduce((s, d) => s + d.latitude, 0) / donors.length,
          donors.reduce((s, d) => s + d.longitude, 0) / donors.length,
        ]
      : DEFAULT_CENTER

  return (
    <MapContainer
      center={center}
      zoom={donors.length ? 12 : DEFAULT_ZOOM}
      className="z-0 h-[min(420px,55vh)] w-full rounded-lg border border-slate-200 shadow-inner"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {donors.length > 0 && <FitBounds pins={donors} />}
      {donors.map((d) => (
        <Marker key={d.donorID} position={[d.latitude, d.longitude]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{d.name}</p>
              <p className="text-slate-600">ID: {d.donorID}</p>
              <p className="text-slate-600 capitalize">
                Status: {d.status?.toLowerCase?.() ?? d.status}
              </p>
              <p className="text-slate-600">
                Eligible: {d.eligibilityStatus ? 'yes' : 'no'}
              </p>
              {d.address && (
                <p className="mt-1 max-w-[220px] text-xs text-slate-500">{d.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

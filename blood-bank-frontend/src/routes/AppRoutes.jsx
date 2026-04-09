/**
 * Routes: public login/register, then role-protected areas.
 * Hospital registration: /register-hospital (admin or blood bank, after login).
 */
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/auth/Login'
import RegisterHospital from '../pages/RegisterHospital'
import MobileRegistration from '../pages/MobileRegistration'


import HospitalDashboard from '../pages/hospital/Dashboard'
import RequestBlood from '../pages/hospital/RequestBlood'
import TrackRequest from '../pages/hospital/TrackRequest'
import ViewAvailability from '../pages/hospital/ViewAvailability'

import BloodBankDashboard from '../pages/bloodBank/dashboard/Dashboard'
import ManageInventory from '../pages/bloodBank/inventory/ManageInventory'
import VerifyDonor from '../pages/bloodBank/lab/VerifyDonor'
import Reports from '../pages/bloodBank/reports/Reports'
import ExportExcel from '../pages/bloodBank/reports/ExportExcel'
import RegisterColleague from '../pages/bloodBank/RegisterColleague'


import AdminDashboard from '../pages/admin/Dashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import Settings from '../pages/admin/Settings'

const linkClass = ({ isActive }) =>
  clsx(
    'block rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  )

function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth()
  const loc = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  }
  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

function AppShell({ title, links }) {
  const { logout, user } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:w-64 lg:border-b-0 lg:border-r lg:shrink-0">
        <div className="flex items-center justify-between gap-2 px-4 py-4 lg:flex-col lg:items-stretch">
          <div className="lg:mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Blood portal
            </p>
            <p className="text-lg font-bold text-slate-900">{title}</p>
            <p className="truncate text-xs text-slate-500 capitalize">
              {user?.role?.replace(/_/g, ' ')}
            </p>
          </div>
          <nav className="hidden gap-1 lg:flex lg:flex-col">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} end={l.end}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 py-2 lg:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

function HospitalLayout() {
  return (
    <AppShell
      title="Hospital"
      links={[
        { to: '/hospital/dashboard', label: 'Dashboard', end: true },
        { to: '/hospital/request-blood', label: 'Request blood' },
        { to: '/hospital/track', label: 'Track' },
        { to: '/hospital/availability', label: 'Availability' },
      ]}
    />
  )
}

function BloodBankLayout() {
  return (
    <AppShell
      title="Blood bank"
      links={[
        { to: '/blood-bank/dashboard', label: 'Dashboard', end: true },
        { to: '/blood-bank/inventory', label: 'Inventory' },
        { to: '/blood-bank/lab/verify', label: 'Lab verify' },
        { to: '/blood-bank/reports', label: 'Reports' },
        { to: '/blood-bank/reports/export', label: 'Export' },
      ]}
    />
  )
}

function AdminLayout() {
  return (
    <AppShell
      title="Administration"
      links={[
        { to: '/admin/dashboard', label: 'Dashboard', end: true },
        { to: '/register-hospital', label: 'Register hospital' },
        { to: '/admin/invite-blood-bank', label: 'Register bank staff' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/settings', label: 'Settings' },
      ]}
    />
  )
}

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'hospital_staff') return <Navigate to="/hospital/dashboard" replace />
  if (user?.role === 'blood_bank_staff') return <Navigate to="/blood-bank/dashboard" replace />
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/donor-registration" element={<MobileRegistration />} />
      <Route path="/login" element={<Login />} />


      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/register-hospital" element={<RegisterHospital />} />
      </Route>

      <Route element={<ProtectedRoute roles={['hospital_staff']} />}>
        <Route path="/hospital" element={<HospitalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HospitalDashboard />} />
          <Route path="request-blood" element={<RequestBlood />} />
          <Route path="track" element={<TrackRequest />} />
          <Route path="availability" element={<ViewAvailability />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['blood_bank_staff']} />}>
        <Route path="/blood-bank" element={<BloodBankLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BloodBankDashboard />} />

          <Route path="inventory" element={<ManageInventory />} />
          <Route path="lab/verify" element={<VerifyDonor />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/export" element={<ExportExcel />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="invite-blood-bank" element={<RegisterColleague />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

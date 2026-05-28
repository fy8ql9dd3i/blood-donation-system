/**
 * Routes: public login/register, then role-protected areas.
 * Hospital registration: /register-hospital (admin or blood bank, after login).
 */
import { useEffect } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import clsx from 'clsx'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/auth/Login'
import RegisterHospital from '../pages/RegisterHospital'



import HospitalDashboard from '../pages/hospital/Dashboard'
import RequestBlood from '../pages/hospital/RequestBlood'
import TrackRequest from '../pages/hospital/TrackRequest'
import HospitalAvailability from '../pages/hospital/Availability'


import BloodBankDashboard from '../pages/bloodBank/dashboard/Dashboard'
import ManageInventory from '../pages/bloodBank/inventory/ManageInventory'
import VerifyDonor from '../pages/bloodBank/lab/VerifyDonor'
import RegisterDonor from '../pages/bloodBank/lab/RegisterDonor'
import Reports from '../pages/bloodBank/reports/Reports'
import ExportExcel from '../pages/bloodBank/reports/ExportExcel'
import DonationHistory from '../pages/bloodBank/history/DonationHistory'
import RegisterColleague from '../pages/bloodBank/RegisterColleague'


import AdminDashboard from '../pages/admin/Dashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import Settings from '../pages/admin/Settings'
import EmergencyAlerts from '../pages/shared/EmergencyAlerts'
import PostNews from '../pages/admin/PostNews'
import BroadcastAll from '../pages/admin/BroadcastAll'
import BloodBankInfo from '../pages/shared/BloodBankInfo'
import About from '../pages/shared/About'
import Landing from '../pages/shared/Landing'
import NewsTicker from '../components/NewsTicker'
import AppreciationLetters from '../pages/bloodBank/AppreciationLetters'
import NewsPage from '../pages/shared/NewsPage'

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
    <div className="min-h-screen flex flex-col">
      <NewsTicker />
      <div className="flex-1 lg:flex bg-slate-50">
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
    </div>
  )
}

function PublicLayout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NewsTicker />

      {/* 🏛️ Best-in-Class Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#D31027] rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-rose-200 transition-transform group-hover:scale-110">B+</div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-black tracking-tighter text-slate-900 leading-none">BloodPortal</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-500">Bahir Dar Center</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            {['Services', 'About', 'News', 'Contact', 'Emergency'].map((item) => (
              <NavLink
                key={item}
                to={`/${item.toLowerCase()}`}
                className={({ isActive }) => clsx(
                  "text-[11px] font-black uppercase tracking-widest transition-all hover:text-brand-600",
                  isActive ? "text-brand-600" : "text-slate-400"
                )}
              >
                {item}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <button onClick={() => navigate('/')} className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full shadow-2xl shadow-slate-200 transition-all hover:bg-black active:scale-95">
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.location.pathname !== '/') {
                    navigate('/');
                  }
                  setTimeout(() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
                className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-full shadow-2xl shadow-slate-200 transition-all hover:bg-black active:scale-95"
              >
                Staff Portal
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* 🗺️ Best-in-Class Footer */}
      <footer className="bg-slate-900 pt-24 pb-12 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-16 relative z-10">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-black text-sm">B+</div>
              <span className="font-display text-xl font-black tracking-tighter text-white">BloodPortal</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Serving the Bahir Dar district and Amhara region with life-saving blood supply systems since 2026.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com/BahirDarBloodBank" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white hover:bg-[#1877F2] transition-colors cursor-pointer" title="Facebook">FB</a>
              <a href="https://t.me/BahirDarBloodBank" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white hover:bg-[#0088cc] transition-colors cursor-pointer" title="Telegram">TG</a>
              <a href="https://instagram.com/BahirDarBloodBank" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white hover:bg-[#E4405F] transition-colors cursor-pointer" title="Instagram">IG</a>
              <a href="https://linkedin.com/company/bahirdarbloodbank" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white hover:bg-[#0A66C2] transition-colors cursor-pointer" title="LinkedIn">LI</a>
            </div>
            <div className="pt-6 space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Donor Mobile App</h4>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="bg-black border border-white/20 rounded-lg px-4 py-1.5 flex items-center gap-2 hover:bg-slate-800 transition-colors group">
                  <div className="text-xl">🤖</div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400 leading-none uppercase">Get it on</span>
                    <span className="text-sm text-white font-bold leading-none">Google Play</span>
                  </div>
                </a>
                <a href="#" className="bg-black border border-white/20 rounded-lg px-4 py-1.5 flex items-center gap-2 hover:bg-slate-800 transition-colors group">
                  <div className="text-xl">🍎</div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400 leading-none uppercase">Download on</span>
                    <span className="text-sm text-white font-bold leading-none">App Store</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'About Us', 'Services', 'News'].map(link => (
                <li key={link} className="text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer">{link}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Support</h4>
            <ul className="space-y-4">
              {['Contact Support', 'Privacy Policy', 'Terms of Service', 'Staff Help'].map(link => (
                <li key={link} className="text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer">{link}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Bahir Dar Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-brand-500">📍</span>
                <p className="text-sm text-slate-300">Bahir Dar, Amhara Region<br />Near Felege Hiwot Hospital</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-brand-500">📞</span>
                <p className="text-sm text-slate-300">+251 58 220 1234</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-brand-500">📧</span>
                <p className="text-sm text-slate-300">contact@bahirdarbloodbank.org</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            © 2026 BAHIR DAR DISTRICT BLOOD BANK • ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-500 uppercase">Bilingual Support:</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-white">ENGLISH</span>
            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-white">አማርኛ</span>
          </div>
        </div>
      </footer>
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
        { to: '/blood-bank/lab/verify', label: 'Lab Verify' },
        { to: '/blood-bank/history', label: 'Donation History' },
        { to: '/blood-bank/reports', label: 'Reports' },
        { to: '/blood-bank/reports/export', label: 'Export' },
        { to: '/blood-bank/emergency', label: '🚨 Emergency Alert' },
        { to: '/blood-bank/broadcast', label: '🔔 Broadcast All' },
        { to: '/blood-bank/appreciation', label: '💝 Appreciation' },
        { to: '/blood-bank/news', label: '📢 Post News' },
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
        { to: '/admin/emergency', label: '🚨 Emergency Alert' },
        { to: '/admin/news', label: '📢 Post News' },
        { to: '/admin/broadcast', label: '🔔 Broadcast All' },
      ]}
    />
  )
}

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/about" replace />
  if (user?.role === 'hospital_staff') return <Navigate to="/hospital/dashboard" replace />
  if (user?.role === 'blood_bank_staff') return <Navigate to="/blood-bank/dashboard" replace />
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/about" replace />
}

export default function AppRoutes() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // 🔔 Real-time notifications for staff
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'blood_bank_staff')) {
      // Connect to socket on the same host as the API
      const socket = io(`http://${window.location.hostname}:5000`)

      socket.on('new_appreciation', (data) => {
        toast.info(
          <div className="flex flex-col gap-1">
            <p className="font-black text-xs uppercase tracking-widest text-emerald-600">New Gratitude Received! 💝</p>
            <p className="font-bold text-slate-800">{data.hospitalName} sent a success story: "{data.patientContext}"</p>
            <p className="text-[10px] text-slate-500 line-clamp-1 italic">"{data.message}"</p>
          </div>,
          {
            autoClose: 10000,
            position: 'top-right',
            onClick: () => navigate(user.role === 'admin' ? '/admin/appreciation' : '/blood-bank/appreciation')
          }
        )
      })

      socket.on('emergency_blood_request', (data) => {
        toast.error(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-rose-600"></span>
              <p className="font-black text-xs uppercase tracking-widest text-rose-600">🚨 Emergency Blood Request!</p>
            </div>
            <p className="font-bold text-slate-900 text-sm">
              {data.hospitalName} needs {data.unitsRequired} units of {data.bloodType}!
            </p>
            <p className="text-[10px] text-slate-500 italic">
              Patient: {data.patientName || "Emergency"} • Urgency: <span className="font-bold text-rose-600 uppercase">{data.urgencyLevel}</span>
            </p>
          </div>,
          {
            autoClose: 15000,
            position: 'top-right',
            onClick: () => navigate(user.role === 'admin' ? '/admin/dashboard' : '/blood-bank/dashboard')
          }
        )
      })

      socket.on('inventory_alert', (data) => {
        toast.warning(
          <div className="flex flex-col gap-1">
            <p className="font-black text-xs uppercase tracking-widest text-amber-600">⚠️ Low Stock Warning!</p>
            <p className="font-bold text-slate-900 text-sm">
              Blood Type {data.bloodType} is critically low!
            </p>
            <p className="text-xs text-slate-700">
              Only {data.quantity} units remaining.
            </p>
          </div>,
          {
            autoClose: 12000,
            position: 'top-right',
            onClick: () => navigate(user.role === 'admin' ? '/admin/dashboard' : '/blood-bank/inventory')
          }
        )
      })

      return () => socket.disconnect()
    }
  }, [user, navigate])

  return (
    <Routes>
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/donor-registration" element={<Navigate to="/" replace />} />

      <Route element={<PublicLayout />}>
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/login" element={<Landing />} />
      </Route>


      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/register-hospital" element={<RegisterHospital />} />
      </Route>

      <Route element={<ProtectedRoute roles={['hospital_staff']} />}>
        <Route path="/hospital" element={<HospitalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HospitalDashboard />} />
          <Route path="request-blood" element={<RequestBlood />} />
          <Route path="track" element={<TrackRequest />} />
          <Route path="availability" element={<HospitalAvailability />} />

        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['blood_bank_staff']} />}>
        <Route path="/blood-bank" element={<BloodBankLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BloodBankDashboard />} />

          <Route path="inventory" element={<ManageInventory />} />
          <Route path="lab/verify" element={<VerifyDonor />} />
          <Route path="history" element={<DonationHistory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/export" element={<ExportExcel />} />
          <Route path="emergency" element={<EmergencyAlerts />} />
          <Route path="broadcast" element={<BroadcastAll />} />
          <Route path="appreciation" element={<AppreciationLetters />} />
          <Route path="news" element={<PostNews />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="invite-blood-bank" element={<RegisterColleague />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="emergency" element={<EmergencyAlerts />} />
          <Route path="news" element={<PostNews />} />
          <Route path="broadcast" element={<BroadcastAll />} />
        </Route>
      </Route>

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

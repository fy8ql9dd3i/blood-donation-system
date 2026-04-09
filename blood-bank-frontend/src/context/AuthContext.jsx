/**
 * Auth state: JWT in localStorage, role-based redirect after login / registration.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

function parseJwtPayload(token) {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

const WEB_ROLES = ['admin', 'blood_bank_staff', 'hospital_staff']

function redirectForRole(navigate, role) {
  if (role === 'hospital_staff') navigate('/hospital/dashboard', { replace: true })
  else if (role === 'blood_bank_staff') navigate('/blood-bank/dashboard', { replace: true })
  else if (role === 'admin') navigate('/admin/dashboard', { replace: true })
  else navigate('/login', { replace: true })
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }
    return null
  })

  /** Normalize login OR registration responses and store session */
  const applyAuthResponse = useCallback(
    (res, emailHint) => {
      if (!res?.token) {
        throw new Error(res?.message || 'Authentication failed')
      }
      const role = res.data?.role || res.user?.role
      if (role === 'donor') {
        toast.info('Donor accounts use the mobile app.')
        throw new Error('Use the mobile app for donor access.')
      }
      if (!WEB_ROLES.includes(role)) {
        toast.error('This portal is for hospital, blood bank, or admin users.')
        throw new Error('Unsupported role for web portal.')
      }
      const email =
        emailHint || res.data?.email || res.user?.email || localStorage.getItem('lastLoginEmail') || ''

      localStorage.setItem('token', res.token)
      const nextUser = {
        userId:     res.data?.userId ?? res.user?.id,
        name:       res.data?.name  ?? res.user?.name ?? email,
        role,
        hospitalId: res.data?.hospitalId ?? res.user?.hospitalId ?? null,
        email,
        exp: parseJwtPayload(res.token)?.exp,
      }
      localStorage.setItem('user', JSON.stringify(nextUser))
      setToken(res.token)
      setUser(nextUser)
      redirectForRole(navigate, role)
      toast.success('Signed in successfully')
      return res
    },
    [navigate]
  )

  const login = useCallback(
    async ({ email, password }) => {
      const res = await authService.login({ email, password })
      localStorage.setItem('lastLoginEmail', email)
      return applyAuthResponse(res, email)
    },
    [applyAuthResponse]
  )

  /** After public registration endpoints that return the same shape as login */
  const completeRegistrationLogin = useCallback(
    async (res, emailHint) => {
      return applyAuthResponse(res, emailHint)
    },
    [applyAuthResponse]
  )

  const logout = useCallback(async () => {
    try {
      if (token) await authService.logout()
    } catch {
      /* ignore */
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
    toast.info('Signed out')
  }, [navigate, token])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      completeRegistrationLogin,
    }),
    [token, user, login, logout, completeRegistrationLogin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

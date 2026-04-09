import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import 'react-toastify/dist/ReactToastify.css'

/**
 * TanStack Query (React Query) holds server state in memory.
 * - `staleTime`: for 60s, `useQuery` will not refetch in the background when you revisit a page.
 * - Components call `useQuery({ queryKey, queryFn })`; `queryKey` must include every variable that identifies the data.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <ToastContainer position="top-right" theme="colored" closeOnClick pauseOnHover />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)

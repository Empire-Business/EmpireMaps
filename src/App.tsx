import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ImpersonationProvider } from '@/contexts/ImpersonationContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

// Auth
import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UsersPage from '@/pages/admin/UsersPage'
import FormatLibraryAdminPage from '@/pages/admin/FormatLibraryAdminPage'

// Consultant
import ConsultantDashboard from '@/pages/consultant/ConsultantDashboard'

// Client
import ClientDashboard from '@/pages/client/ClientDashboard'
import DiagnosticPage from '@/pages/client/DiagnosticPage'
import RiskMapPage from '@/pages/client/RiskMapPage'
import BrandBookPage from '@/pages/client/BrandBookPage'
import EditorialLinePage from '@/pages/client/EditorialLinePage'
import ProductionMapPage from '@/pages/client/ProductionMapPage'
import DistributionMapPage from '@/pages/client/DistributionMapPage'
import FormatLibraryPage from '@/pages/client/FormatLibraryPage'

import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ImpersonationProvider>
          <BrowserRouter>
            <Routes>
              {/* Redireciona raiz para login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Rotas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />

              {/* Rotas protegidas com layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Admin */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/banco-formatos"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <FormatLibraryAdminPage />
                    </ProtectedRoute>
                  }
                />

                {/* Consultant */}
                <Route
                  path="/consultant/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['consultant', 'admin']}>
                      <ConsultantDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Client */}
                <Route
                  path="/client/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'consultant', 'admin']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/diagnostico"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'consultant', 'admin']}>
                      <DiagnosticPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/mapa-riscos"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'consultant', 'admin']}>
                      <RiskMapPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/brand-book"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'consultant', 'admin']}>
                      <BrandBookPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/linha-editorial"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'consultant', 'admin']}>
                      <EditorialLinePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/mapa-producao"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'consultant', 'admin']}>
                      <ProductionMapPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/mapa-distribuicao"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'consultant', 'admin']}>
                      <DistributionMapPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/banco-formatos"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'consultant', 'admin']}>
                      <FormatLibraryPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </ImpersonationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

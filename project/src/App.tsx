import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ClientsPage } from './pages/clients/ClientsPage';
import { VehiclesPage } from './pages/vehicles/VehiclesPage';
import { PartsPage } from './pages/parts/PartsPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { Facturacion } from './pages/invoices/InvoicesPage';
import { DetallesOrden } from './pages/orders/OrdersPage';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { MechanicDashboard } from './pages/dashboard/MechanicDashboard';
import { ReceptionistDashboard } from './pages/dashboard/ReceptionistDashboard';

function RoleBasedRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  switch (user?.rol) {
    case 'Administrator':
      return <Navigate to="/dashboard/admin" replace />;
    case 'Mechanic':
      return <Navigate to="/dashboard/mechanic" replace />;
    case 'Recepcionist':
      return <Navigate to="/dashboard/receptionist" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={<RoleBasedRedirect />}
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute allowedRoles={['Recepcionist', 'Administrator']}>
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute allowedRoles={['Recepcionist', 'Administrator']}>
                <VehiclesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['Mechanic', 'Recepcionist', 'Administrator']}>
                <DetallesOrden />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parts"
            element={
              <ProtectedRoute>
                <PartsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute allowedRoles={['Mechanic', 'Administrator']}>
                <Facturacion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute roles={['admin']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={['admin']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
                  <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
              </div>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/mechanic"
            element={
              <ProtectedRoute allowedRoles={['Mechanic']}>
                <MechanicDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/receptionist"
            element={
              <ProtectedRoute allowedRoles={['Recepcionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
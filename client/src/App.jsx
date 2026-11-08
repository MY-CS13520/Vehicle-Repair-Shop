import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerHomePage from './pages/CustomerHomePage'
import StaffHomePage from './pages/StaffHomePage'
import ManagerHomePage from './pages/ManagerHomePage'
import AdminHomePage from './pages/AdminHomePage'
import RoleRoute from './components/RoleRoute'
import AppShell from './components/AppShell'
import BranchListPage from './pages/BranchListPage'
import BranchFormPage from './pages/BranchFormPage'
import BranchDetailPage from './pages/BranchDetailPage'
import ManagerBranchPage from './pages/ManagerBranchPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/customer"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Customer']}>
                 <AppShell>
                  <CustomerHomePage /> 
                 </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Staff']}>
                  <AppShell>
                    <StaffHomePage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['BranchManager']}>
                  <AppShell>
                    <ManagerHomePage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/branch"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['BranchManager']}>
                  <AppShell>
                    <ManagerBranchPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <AdminHomePage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/branches/new"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <BranchFormPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/branches/:id/edit"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <BranchFormPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/branches/:id"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <BranchDetailPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />          
          <Route
            path="/admin/branches"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <BranchListPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
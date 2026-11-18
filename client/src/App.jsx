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
import StaffDirectoryPage from './pages/StaffDirectoryPage'
import StaffProfilePage from './pages/StaffProfilePage'
import ManagerJobsPage from './pages/ManagerJobsPage'
import ManagerJobDetailPage from './pages/ManagerJobDetailPage'
import AttendanceReportPage from './pages/AttendanceReportPage'
import ServiceCatalogPage from './pages/ServiceCatalogPage'
import VehicleManagerPage from './pages/VehicleManagerPage'
import BookingWizardPage from './pages/BookingWizardPage'
import MyBookingsPage from './pages/MyBookingsPage'
import BookingDetailPage from './pages/BookingDetailPage'
import StaffJobsPage from './pages/StaffJobsPage'
import AdminBookingsPage from './pages/AdminBookingsPage'
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
            path="/customer/services"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Customer']}>
                  <AppShell>
                    <ServiceCatalogPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/vehicles"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Customer']}>
                  <AppShell>
                    <VehicleManagerPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/book"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Customer']}>
                  <AppShell>
                    <BookingWizardPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings/:id"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Customer']}>
                  <AppShell>
                    <BookingDetailPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Customer']}>
                  <AppShell>
                    <MyBookingsPage />
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
              path="/staff/jobs"
              element={
                <ProtectedRoute>
                  <RoleRoute roles={['Staff']}>
                    <AppShell>
                      <StaffJobsPage />
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
            path="/manager/staff/:id/edit"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['BranchManager']}>
                  <AppShell>
                    <StaffProfilePage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff/:id/edit"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <StaffProfilePage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/staff"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['BranchManager']}>
                  <AppShell>
                    <StaffDirectoryPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/jobs/:id"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['BranchManager']}>
                  <AppShell>
                    <ManagerJobDetailPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/jobs"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['BranchManager']}>
                  <AppShell>
                    <ManagerJobsPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/attendance"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['BranchManager']}>
                  <AppShell>
                    <AttendanceReportPage />
                  </AppShell>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <AttendanceReportPage />
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
            path="/admin/staff"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <StaffDirectoryPage />
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
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                  <AppShell>
                    <AdminBookingsPage />
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
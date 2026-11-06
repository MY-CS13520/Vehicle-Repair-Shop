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
                <CustomerHomePage /> 
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['Staff']}>
                <StaffHomePage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['BranchManager']}>
                <ManagerHomePage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute roles={['SuperAdmin']}>
                <AdminHomePage />
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
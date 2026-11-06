import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function ProtectedHomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main>
      <h1>Protected Home</h1>
      <p>{user?.name}</p>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </main>
  )
}

export default ProtectedHomePage
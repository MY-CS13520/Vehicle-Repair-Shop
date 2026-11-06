import { useNavigate } from "react-router-dom"
import { useAuth } from '../auth/AuthContext'
function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    function handleSimulateLogin() {
        login('dev-token', { id: '1', name: 'Dev User', role: 'Customer' })
        navigate('/app', { replace: true })
    }
    return (
        <main>
        <h1>Login</h1>
        <button type="button" onClick={handleSimulateLogin}>
          Simulate login
        </button>
      </main>        
    )
}

export default LoginPage
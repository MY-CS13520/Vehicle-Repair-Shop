import { Link,useNavigate } from "react-router-dom"
import { useAuth } from '../auth/AuthContext'
import { useState } from 'react'
import { homePathForRole } from "../auth/homePath"
import { API_BASE_URL } from '../config'

function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
      e.preventDefault()
      setError('')
      setLoading(true)

      try{
        const res = await fetch(`${API_BASE_URL}/api/auth/login`,{
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          setError(data.message || 'Login failed')
          return
        }

        login(data.token, data.user)
        navigate(homePathForRole(data.user.role), { replace: true })
      } catch {
        setError('could not reach server')
      } finally {
        setLoading(false)
      }
    }

    
    return (
      <main>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p>{error}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p>
        <Link to="/register">Create an account</Link>
      </p>
    </main>
   
    )
}

export default LoginPage
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { homePathForRole } from '../auth/homePath'
import { API_BASE_URL } from '../config'

function RegisterPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, seterror] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        seterror('')
        setLoading(true)

        try {
            const registerRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            })

            const registerData = await registerRes.json().catch(() => ({}))

            if (!registerRes.ok) {
                seterror(registerData.message || 'registration failed')
                return
            }

            const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const loginData = await loginRes.json().catch(() => ({}))

            if (!loginRes.ok) {
                navigate('/login', { replace: true })
                return
            }

            login(loginData.token, loginData.user)
            navigate(homePathForRole(loginData.user.role), { replace: true })
        } catch {
            seterror('Could not reach server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              minLength={6}
              required
            />
          </div>
          {error ? <p>{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p>
          <Link to="/login">Already have an account? Sign in</Link>
        </p>
      </main>        
    )
}

export default RegisterPage
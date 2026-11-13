import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function StaffHomePage() {
  const { token } = useAuth()
  const [onShift, setOnShift] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/current`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || 'Failed to load shift')
        return
      }
      setOnShift(Boolean(data.attendance))
    } catch (err) {
      setError('Could not reach server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [token])

  async function handleClock(path) {
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || 'Clock failed')
        return
      }
      setOnShift(path === 'clock-in')
    } catch (err) {
      setError('Could not reach server')
    }
  }

  return (
    <main>
      <h1>Staff Home</h1>
      {loading ? <p>Loading...</p> : (
        <p>Status: {onShift ? 'on shift' : 'shift closed'}</p>
      )}
      {error ? <p>{error}</p> : null}
      <button
        type="button"
        disabled={loading || onShift}
        onClick={() => handleClock('clock-in')}
      >
        Clock in
      </button>
      <button
        type="button"
        disabled={loading || !onShift}
        onClick={() => handleClock('clock-out')}
      >
        Clock out
      </button>
    </main>
  )
}

export default StaffHomePage
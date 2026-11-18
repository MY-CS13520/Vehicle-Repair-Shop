import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function BookingDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [tracking, setTracking] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/tracking`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.message || 'Failed to load booking')
          setTracking(null)
          return
        }
        setTracking(data.tracking)
      } catch (err) {
        setError('Could not reach server')
        setTracking(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, token])

  async function handleCancel() {
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || 'Cancel failed')
        return
      }
      navigate('/customer/bookings', { replace: true })
    } catch (err) {
      setError('Could not reach server')
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    )
  }

  if (!tracking) {
    return (
      <main>
        <h1>Booking</h1>
        <p>{error || 'Not found'}</p>
        <Link to="/customer/bookings">Back to list</Link>
      </main>
    )
  }

  return (
    <main>
      <h1>Booking</h1>
      <p>
        <Link to="/customer/bookings">Back to list</Link>
      </p>
      <p>Status: {tracking.status}</p>
      <p>Start: {String(tracking.scheduledStart)}</p>
      <p>End: {String(tracking.scheduledEnd)}</p>
      <h2>Timeline</h2>
      <ul>
        {(tracking.timeline || []).map((t, i) => (
          <li key={i}>
            {t.status} — {String(t.at)}
          </li>
        ))}
      </ul>
      {error ? <p>{error}</p> : null}
      {tracking.status !== 'Cancelled' ? (
        <button type="button" onClick={handleCancel}>
          Cancel booking
        </button>
      ) : null}
    </main>
  )
}

export default BookingDetailPage
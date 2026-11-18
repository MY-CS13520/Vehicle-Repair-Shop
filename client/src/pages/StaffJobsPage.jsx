import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function StaffJobsPage() {
    const { token } = useAuth()
    const [bookings, setBookings] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError('')
            try {
                const res =await fetch(`${API_BASE_URL}/api/bookings`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message || 'Failed to load jobs')
                    setBookings([])
                    return
                }
                setBookings(data.bookings || [])
            } catch (err) {
                setError('Could not reach the server')
                setBookings([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token])
    return (
        <main>
        <h1>My Jobs</h1>
        {loading ? <p>Loading...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <table>
            <thead>
              <tr>
                <th>Start</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.scheduledStart ? String(b.scheduledStart) : '—'}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </main>        
    )
}

export default StaffJobsPage
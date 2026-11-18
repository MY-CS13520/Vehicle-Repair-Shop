import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function MyBookingsPage() {
    const { token } = useAuth()
    const [bookings, setBookings] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError('')
            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message || 'Failed to load Bookings')
                    setBookings([])
                    return
                }
                setBookings(data.bookings || [])
            } catch(err) {
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
        <h1>My Bookings</h1>
        <p>
          <Link to="/customer/book">New booking</Link>
        </p>
        {loading ? <p>Loading...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <table>
            <thead>
              <tr>
                <th>Start</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.scheduledStart ? String(b.scheduledStart) : '—'}</td>
                  <td>{b.status}</td>
                  <td>
                    <Link to={`/customer/bookings/${b._id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </main>        
    )
}
export default MyBookingsPage
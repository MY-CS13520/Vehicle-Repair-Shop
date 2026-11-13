import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function ManagerJobDetailPage() {
    const { id } = useParams()
    const { token } = useAuth()
    const [booking, setBooking] = useState(null)
    const [staffList, setStaffList] = useState([])
    const [staffId, setStaffId] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    async function load() {
        setLoading(true)
        setError('')
        try {
            const [jobRes, usersRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/api/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ])
            const jobData = await jobRes.json().catch(() => ({}))
            const usersData = await usersRes.json().catch(() => ({}))
            if (!jobRes.ok) {
                setError(jobData.message || 'Failed to load job')
                setBooking(null)
                return
            }
            setBooking(jobData.booking)
            const mechanics = (usersData.users || []).filter((u) => u.role === 'Staff')
            setStaffList(mechanics)
            setStaffId(jobData.booking.assignedStaff
                ?String(jobData.booking.assignedStaff)
                : mechanics[0]?.id || ''
            )
        } catch (err) {
            setError('Could not reach the server')
            setBooking(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [id, token])

    async function handleAssign(e) {
        e.preventDefault()
        setError('')
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/assign`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ staffId }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.message || 'Assign failed')
                return
            }
            setBooking(data.booking)
        } catch (err) {
            setError('Could not reach the server')
        }
    }

    if (loading) return <main><p>Loading...</p></main>

    if (error && !booking) {
        return (
            <main>
                <h1>Job</h1>
                <p>{error}</p>
                <Link to="/manager/jobs">Back to Jobs</Link>
            </main>


        )
    }
    return (
        <main>
          <h1>Job</h1>
          <p>
            <Link to="/manager/jobs">Back to jobs</Link>
          </p>
          <p>Notes: {booking.notes || '—'}</p>
          <p>Status: {booking.status}</p>
          <p>
            Assigned:{' '}
            {booking.assignedStaff ? String(booking.assignedStaff) : 'Unassigned'}
          </p>
          <form onSubmit={handleAssign}>
            <label htmlFor="staffId">Staff</label>
            <select
              id="staffId"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              required
            >
              {staffList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {error ? <p>{error}</p> : null}
            <button type="submit">Assign</button>
          </form>
        </main>
      )    
}

export default ManagerJobDetailPage
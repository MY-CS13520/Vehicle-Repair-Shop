import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function AdminBookingsPage() {
  const { token } = useAuth()
  const [branches, setBranches] = useState([])
  const [bookings, setBookings] = useState([])
  const [region, setRegion] = useState('')
  const [branchId, setBranchId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const query = branchId ? `?branch=${encodeURIComponent(branchId)}` : ''
        const [bookRes, branchRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/bookings${query}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        const bookData = await bookRes.json().catch(() => ({}))
        const branchData = await branchRes.json().catch(() => ({}))
        if (!bookRes.ok) {
          setError(bookData.message || 'Failed to load bookings')
          setBookings([])
          return
        }
        setBookings(bookData.bookings || [])
        setBranches(branchData.branches || [])
      } catch (err) {
        setError('Could not reach the server')
        setBookings([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, branchId])

  const nameById = Object.fromEntries(
    branches.map((b) => [String(b._id), b.name])
  )
  const regionById = Object.fromEntries(
    branches.map((b) => [String(b._id), b.region])
  )
  const branchOptions = region
    ? branches.filter((b) => b.region === region)
    : branches
  const shown = bookings.filter((b) => {
    if (!region) return true
    return regionById[String(b.branch)] === region
  })

  return (
    <main>
      <h1>Bookings</h1>
      <div>
        <label htmlFor="region">Region</label>
        <select
          id="region"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value)
            setBranchId('')
          }}
        >
          <option value="">All</option>
          <option value="Western">Western</option>
          <option value="Central">Central</option>
        </select>
        <label htmlFor="branchId">Branch</label>
        <select
          id="branchId"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        >
          <option value="">All</option>
          {branchOptions.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? <p>Loading...</p> : null}
      {error ? <p>{error}</p> : null}
      {!loading && !error ? (
        <table>
          <thead>
            <tr>
              <th>Start</th>
              <th>Status</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((b) => (
              <tr key={b._id}>
                <td>{b.scheduledStart ? String(b.scheduledStart) : '—'}</td>
                <td>{b.status}</td>
                <td>{nameById[String(b.branch)] || String(b.branch)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </main>
  )
}

export default AdminBookingsPage
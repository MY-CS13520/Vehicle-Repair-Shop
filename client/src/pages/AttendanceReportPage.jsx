import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function AttendanceReportPage() {
    const { token } = useAuth()
    const [from, setFrom] = useState('2026-11-01')
    const [to, setTo] = useState('2026-11-02')
    const [rows, setRows] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError('')
            try {
                const params = new URLSearchParams()
                if (from) params.set('from', from)
                if (to) params.set('to', to)
                const q = params.toString() ? `?${params}` : ''
                const res = await fetch(`${API_BASE_URL}/api/attendance${q}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message || 'Failed to load attendance' )
                    setRows([])
                    return
                }    
                setRows(data.attendance || [])
            } catch (err) {
                setError('Could not reach server')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token, from, to])
    return (
        <main>
          <h1>Attendance</h1>
          <div>
            <label htmlFor="from">From</label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <label htmlFor="to">To</label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          {loading ? <p>Loading...</p> : null}
          {error ? <p>{error}</p> : null}
          {!loading && !error ? (
            <p>{rows.length} record(s)</p>
          ) : null}
          {!loading && !error ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff</th>
                  <th>Clock in</th>
                  <th>Clock out</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>{r.date ? String(r.date).slice(0, 10) : '—'}</td>
                    <td>{r.staff ? String(r.staff) : '—'}</td>
                    <td>{r.clockIn ? String(r.clockIn) : '—'}</td>
                    <td>{r.clockOut ? String(r.clockOut) : 'open'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </main>
      )
}

export default AttendanceReportPage
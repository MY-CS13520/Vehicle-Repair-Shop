import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'
import { Link } from 'react-router-dom'

function StaffDirectoryPage() {
    const { token, user } = useAuth()
    const [users, setUsers] = useState([])
    const [region, setRegion] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const isAdmin = user?.role === 'SuperAdmin'
    const editBase = isAdmin ? '/admin/staff' : '/manager/staff'

    

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError('')
            try {
                const query =
                    isAdmin && region ? `?region=${encodeURIComponent(region)}` : ''
                const res = await fetch(`${API_BASE_URL}/api/users${query}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message || 'Failed to load staff')
                    setUsers([])
                    return
                }
                setUsers(data.users || [])
            } catch (err) {
                setError('Could not reach server')
                setUsers([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token, region, isAdmin])

    return (
        <main>
        <h1>Staff</h1>
        {isAdmin ? (
          <div>
            <label htmlFor="region">Region</label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">All</option>
              <option value="Western">Western</option>
              <option value="Central">Central</option>
            </select>
          </div>
        ) : null}
        {loading ? <p>Loading...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <Link to={`${editBase}/${u.id}/edit`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </main>
  
    )
}

export default StaffDirectoryPage
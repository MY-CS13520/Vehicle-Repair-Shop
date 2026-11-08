import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'
import { Link } from 'react-router-dom'

function BranchListPage() {
    const { token } = useAuth()
    const [branches, setBranches] = useState([])
    const [region, setRegion] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError('')
            try {
                const query = region ? `?region=${encodeURIComponent(region)}` : ''
                const res = await fetch(`${API_BASE_URL}/api/branches${query}`,{
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message || 'Failed to load branches')
                    setBranches([])
                    return
                }
                setBranches(data.branches || [])
            } catch (err) {
                setError('Could not reach server')
                setBranches([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token, region])

    return (
        <main>
        <h1>Branches</h1>
        <p>
            <Link to="/admin/branches/new">Create branch</Link>
        </p>
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
            <option value="West">West</option>
          </select>
        </div>
        {loading ? <p>Loading...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Region</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b._id}>
                  <td>{b.name}</td>
                  <td>{b.region}</td>
                  <td>{b.isActive ? 'Yes' : 'No'}</td>
                  <td>
                    <Link to={`/admin/branches/${b._id}/edit`}>Edit</Link>
                  </td>
                  <td>
                    <Link to={`/admin/branches/${b._id}`}>View</Link>
                    {' · '}
                    <Link to={`/admin/branches/${b._id}/edit`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </main>        
    )
}

export default BranchListPage
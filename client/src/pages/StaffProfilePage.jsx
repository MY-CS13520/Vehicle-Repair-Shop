import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function StaffProfilePage() {
    const { id } = useParams()
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const listPath = user?.role === 'SuperAdmin'? '/admin/staff' : '/manager/staff'

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [skills, setSkills] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const isAdmin = user?.role === 'SuperAdmin'
    const [branch, setBranch] = useState('')
    const [branches, setBranches] = useState([])

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message || 'Failed to load staff')
                    return
                }
                const u = data.user
                setName(u.name || '')
                setPhone(u.phone || '')
                setSkills((u.skills || []).join(', '))
                setIsActive(u.isActive !== false)
                setBranch(u.branch ? String(u.branch) : '')

            } catch (err) {
                setError('Could not reach the server')
            }
        }
        load()
    }, [id, token])

    useEffect(() => {
      if (!isAdmin) return
      async function loadBranches() {
        const res = await fetch(`${API_BASE_URL}/api/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) setBranches(data.branches || [])
      }
      loadBranches()
    }, [isAdmin, token])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
          if (isAdmin) {
            const branchRes = await fetch(`${API_BASE_URL}/api/users/${id}/branch`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ branch }),
            })
            const branchData = await branchRes.json().catch(() => ({}))
            if (!branchRes.ok) {
              setError(branchData.message || 'Branch update failed')
              return
            }
          }
            const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    phone,
                    skills: skills
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    isActive,
                }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.message || 'Save failed')
                return
            }
            navigate(listPath, { replace: true })
        } catch (err) {
            setError('Could not reach server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
          <h1>Edit staff</h1>
          <p>
            <Link to={listPath}>Back to list</Link>
          </p>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="skills">Skills (comma separated)</label>
              <input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
            </div>
            {isAdmin ? (
                <div>
                  <label htmlFor="branch">Branch</label>
                  <select
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.region})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            {error ? <p>{error}</p> : null}
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </form>
        </main>
      )
    }

    export default StaffProfilePage
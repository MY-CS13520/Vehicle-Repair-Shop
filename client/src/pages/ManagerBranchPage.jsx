import { useEffect, useState } from 'react'
import { useAuth} from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function ManagerBranchPage() {
    const { token, user } = useAuth()
    const [branch, setBranch] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user?.branch) {
                setError('No branch assigned')
                setLoading(false)
                return
            }

            setLoading(true)
            setError('')
            try {
                const res = await fetch(`${API_BASE_URL}/api/branches/${user.branch}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message || 'Failed to load branch')
                    setBranch(null)
                    return
                }
                setBranch(data.branch)
            } catch (err) {
                setError('Could not reach server')
                setBranch(null)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token, user])
    if (loading) {
        return (
            <main>
            <p>Loading...</p>
          </main>
        )
    }

    if (error || !branch) {
        return (
          <main>
            <h1>My Branch</h1>
            <p>{error || 'Branch not found'}</p>
          </main>
        )
      }

    return (
        <main>
        <h1>My Branch</h1>
        <p>Name: {branch.name}</p>
        <p>Region: {branch.region}</p>
        <p>Active: {branch.isActive ? 'Yes' : 'No'}</p>
        <p>
          Address:{' '}
          {[branch.address?.street, branch.address?.city]
            .filter(Boolean)
            .join(', ') || '—'}
        </p>
        <p>Phone: {branch.contact?.phone || '—'}</p>
      </main>        
    )
}

export default ManagerBranchPage
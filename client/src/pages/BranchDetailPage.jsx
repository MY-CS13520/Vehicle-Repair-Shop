import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth} from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function BranchDetailPage() {
    const { id } = useParams()
    const { token } = useAuth()
    const [branch, setBranch] = useState(null)
    const[error, setError] = useState('')
    const[loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError('')
            try {
                const res = await fetch(`${API_BASE_URL}/api/branches/${id}`, {
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
            }finally {
                setLoading(false)
            }
        }
        load()
    }, [id, token])

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
                <p>{error || 'Branch not found'}</p>
                <Link to="/admin/branches">Back to List</Link>
            </main>
        )
    }

    return (
        <main>
        <h1>{branch.name}</h1>
        <p>
          <Link to="/admin/branches">Back to list</Link>
          {' · '}
          <Link to={`/admin/branches/${branch._id}/edit`}>Edit</Link>
        </p>
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

export default BranchDetailPage
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function BranchFormPage() {
    const { id } = useParams()
    const isEdit = Boolean(id)
    const { token } = useAuth()
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [region, setRegion] = useState('')
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [phone, setPhone] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isEdit) return
        
        async function load() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/branches/${id}`, {
                    headers: { Authorization: `Bearer ${token}`},
                })
                const data = await res.json().catch(() => ({}))

                if (!res.ok) {
                    setError(data.message || 'Failed to load branch')
                    return
                }

                const b = data.branch
                setName(b.name || '')
                setRegion(b.region || '')
                setStreet(b.address?.street || '')
                setCity(b.address?.city || '')
                setPhone(b.contact?.phone || '')
                setIsActive(b.isActive !== false)
            } catch (err) {
                setError('Could not reach server')
            }
        }
        load()
    }, [id, isEdit, token])
    
    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const body = {
            name,
            region, 
            address: { street, city },
            contact: { phone },
            isActive,
        }

        try {
            const res = await fetch (
                isEdit
                 ? `${API_BASE_URL}/api/branches/${id}`
                 : `${API_BASE_URL}/api/branches`,
                 {
                    method: isEdit ? 'PATCH' : 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type' : 'application/json',
                    },
                    body: JSON.stringify(body),
                 }
            )
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.message || 'Save failed')
                return
            }

            navigate('/admin/branches', { replace: true })
        } catch (err) {
            setError('Could not reach the server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
        <h1>{isEdit ? 'Edit Branch' : 'Create Branch'}</h1>
        <p>
          <Link to="/admin/branches">Back to list</Link>
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
            <label htmlFor="region">Region</label>
            <input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="street">Street</label>
            <input
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="city">City</label>
            <input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
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
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
          {error ? <p>{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </main>        
    )
}

export default BranchFormPage
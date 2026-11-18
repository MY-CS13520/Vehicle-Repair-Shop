import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function ServiceCatalogPage() {
    const { token } = useAuth()
    const [services, setServices] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setError('')
            try {
                const res = await fetch(`${API_BASE_URL}/api/services`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message || 'Failed to load services')
                    setServices([])
                    return
                }
                setServices(data.services || [])
            }catch (err) {
                setError('Could not reach server')
                setServices([])
            }finally {
                setLoading(false)
            }
        }
        load()
    }, [token])
    return (
        <main>
        <h1>Services</h1>
        {loading ? <p>Loading...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Duration (min)</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.basePrice}</td>
                  <td>{s.estimatedDurationMinutes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </main>        
    )
}

export default ServiceCatalogPage
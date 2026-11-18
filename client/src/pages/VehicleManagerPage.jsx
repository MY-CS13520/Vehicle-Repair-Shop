import { useEffect, useState } from 'react'
import { useAuth} from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function VehicleManagerPage(){
    const { token } = useAuth()
    const [vehicles, setVehicles] = useState([])
    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [plate, setPlate] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    async function load() {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data =await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.message || 'Failed to load vehicles')
                setVehicles([])
                return
            }
            setVehicles(data.vehicles || [])
        } catch (err) {
            setError('Could not reach the server')
            setVehicles([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [token])

    async function handleAdd(e) {
        e.preventDefault()
        setError('')
        setError('')
        try {
            const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    make,
                    model,
                    year: Number(year),
                    plate,
                }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.message || 'Could not add vehicles')
                return
            }
            setMake('')
            setModel('')
            setYear('')
            setPlate('')
            await load()
        } catch (err) {
            setError('Could not reach server')
        }
    }

    async function handleDelete(id) {
        setError('')
        try {
            const res = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setError(data.message || 'Could not delete')
                return
            }
            await load()
        }catch (err) {
            setError('Could not reach server')
        }
    }

    return (
        <main>
        <h1>My vehicles</h1>
        <form onSubmit={handleAdd}>
          <div>
            <label htmlFor="make">Make</label>
            <input
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="model">Model</label>
            <input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="year">Year</label>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="plate">Plate</label>
            <input
              id="plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              required
            />
          </div>
          <button type="submit">Add</button>
        </form>
        {error ? <p>{error}</p> : null}
        {loading ? <p>Loading...</p> : null}
        {!loading ? (
          <table>
            <thead>
              <tr>
                <th>Plate</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td>{v.plate}</td>
                  <td>{v.make}</td>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td>
                    <button type="button" onClick={() => handleDelete(v._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </main>       
    )
}

export default VehicleManagerPage
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { API_BASE_URL } from '../config'

function BookingWizardPage() {
    const { token} = useAuth()
    const navigate = useNavigate()
    const [branches, setBranches] = useState([])
    const [services, setServices] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [slots, setSlots] = useState([])
    const [branch, setBranch] = useState('')
    const [service, setService] = useState('')
    const [vehicle, setVehicle] = useState('')
    const [date, setDate] = useState('')
    const [start, setStart] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        async function loadOptions() {
            try {
                const headers = { Authorization: `Bearer ${token}`}
                const [bRes, sRes, vRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/branches`, { headers }),
                    fetch(`${API_BASE_URL}/api/services`, { headers }),
                    fetch(`${API_BASE_URL}/api/vehicles`, { headers }),         
                ])
                const bData = await bRes.json().catch(() => ({}))
                const sData = await sRes.json().catch(() => ({}))
                const vData = await vRes.json().catch(() => ({}))

                if (!bRes.ok || !sRes.ok || !vRes.ok) {
                    setError('Failed to load booking options')
                    return
                }
                setBranches(bData.branches || [])
                setServices(sData.services || [])
                setVehicles(vData.vehicles || [])
            } catch (err) {
                setError('Could not reach server')
            }
        }
        loadOptions()
    }, [token])

    useEffect(() => {
        async function loadSlots() {
            setSlots([])
            setStart('')
            if (!branch || !service || !date) return
            try {
                const q = `branch=${branch}&date=${date}&service=${service}`
                const res = await fetch (`${API_BASE_URL}/api/slots?${q}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError(data.message ||'Failed to load slots')
                    return
                }
                setError('')
                setSlots(data.slots || [])
            } catch (err) {
                setError('Could not reach the server')
            }
        }
        loadSlots()
    }, [token, branch, service, date])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ branch, vehicle, service, start }),
            })
            const data =await res.json().catch(() => ({}))
            if(!res.ok) {
                setError(data.message || 'Booking failed')
                return
            }
            navigate('/customer/bookings', {replace: true })
        } catch (err) {
            setError('Could not reach the server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
        <h1>Book a service</h1>
        <form onSubmit={handleSubmit}>
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
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="service">Service</label>
            <select
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
            >
              <option value="">Select service</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="vehicle">Vehicle</label>
            <select
              id="vehicle"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              required
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.plate} ({v.make} {v.model})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="start">Slot</label>
            <select
              id="start"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            >
              <option value="">Select slot</option>
              {slots.map((s) => (
                <option key={s.start} value={s.start}>
                  {String(s.start)}
                </option>
              ))}
            </select>
          </div>
          {error ? <p>{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Booking...' : 'Book'}
          </button>
        </form>
      </main>        
    )
}

export default BookingWizardPage
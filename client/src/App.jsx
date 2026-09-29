import { useEffect, useState } from 'react'
import './App.css'
import { API_BASE_URL} from './config'

function App() {
  const [health,setHealth] = useState('Loading...')

  useEffect(() =>{
    fetch(`${API_BASE_URL}/api/health`)
    .then((res) => res.json())
    .then((data) => setHealth(JSON.stringify(data)))
    .catch(() => setHealth('Failed to reach API'))
  }, [])
  return (
    <main>
      <h1>Vehicle Repair Shop</h1>
      <p>Management System</p>
      <p>API: {API_BASE_URL}</p>
      <p>Health: {health}</p>
    </main>
  )
}

export default App

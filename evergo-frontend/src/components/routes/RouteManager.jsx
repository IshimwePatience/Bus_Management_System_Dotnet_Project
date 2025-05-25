import { useEffect, useState } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import axios from 'axios'
import RouteList from './RouteList'
import RouteForm from './RouteForm'

const RouteManager = () => {
  const { id } = useParams() // Get the route ID from the URL for edit mode
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      const fetchRoute = async () => {
        setLoading(true)
        try {
          console.log('Fetching route with ID:', id)
          const res = await axios.get(`/api/Routes/${id}`)
          console.log('Fetched route data:', res.data)
          setRouteData(res.data)
        } catch (err) {
          console.error('Error fetching route:', err)
          setError('Failed to load route data: ' + (err.message || 'Unknown error'))
        } finally {
          setLoading(false)
        }
      }
      fetchRoute()
    } else {
      setRouteData(null) // Clear data for "Add" mode
    }
  }, [id])

  return (
    <Routes>
      <Route path="/" element={<RouteList />} />
      <Route
        path="/add"
        element={<RouteForm isEdit={false} initialValues={null} />}
      />
      <Route
        path="/edit/:id"
        element={
          loading ? (
            <div className="text-center p-4 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : (
            <RouteForm isEdit={true} initialValues={routeData} />
          )
        }
      />
    </Routes>
  )
}

export default RouteManager
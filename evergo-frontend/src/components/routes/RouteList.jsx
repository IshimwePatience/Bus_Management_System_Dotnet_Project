import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const RouteList = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get('/api/Routes')
        console.log('Fetched routes:', res.data)
        setRoutes(res.data || [])
      } catch (err) {
        console.error('Error fetching routes:', err)
        setError('Failed to load routes: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchRoutes()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await axios.delete(`/api/Routes/${id}`)
        setRoutes(routes.filter((route) => route.RouteId !== id))
      } catch (err) {
        console.error('Error deleting route:', err)
        setError('Failed to delete route: ' + (err.message || 'Unknown error'))
      }
    }
  }

  const filteredRoutes = routes.filter((route) =>
    Object.values(route).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Loading...</div>
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-1/3 focus:ring-2 focus:ring-[#00C4B4]"
        />
        <Link
          to="/routes/add"
          className="bg-[#3066BE] hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Route Name</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Start Location</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">End Location</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Pickup Points</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map((route, index) => (
              <tr key={route.RouteId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{route.RouteId}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{route.RouteName || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{route.StartLocation || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{route.EndLocation || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">
                  {route.PickupPoints?.map((point) => point.Name).join(', ') || '-'}
                </td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{route.Price || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">
                  <div className="flex gap-2">
                    <Link
                      to={`/routes/edit/${route.RouteId}`}
                      className="bg-[#3066BE] hover:bg-teal-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(route.RouteId)}
                      className="bg-[#FF0000] hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RouteList
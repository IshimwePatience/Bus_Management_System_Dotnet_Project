import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const BusList = () => {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await axios.get('/api/Buses')
        console.log('Fetched buses:', res.data)
        setBuses(res.data || [])
      } catch (err) {
        console.error('Error fetching buses:', err)
        setError('Failed to load buses: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    fetchBuses()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await axios.delete(`/api/Buses/${id}`)
        setBuses(buses.filter((bus) => bus.BusId !== id))
      } catch (err) {
        console.error('Error deleting bus:', err)
        setError('Failed to delete bus: ' + (err.message || 'Unknown error'))
      }
    }
  }

  const filteredBuses = buses.filter((bus) =>
    Object.values(bus).some((value) =>
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
          to="/buses/add"
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
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Bus Number</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Model</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Capacity</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.map((bus, index) => (
              <tr key={bus.BusId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{bus.BusId}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{bus.BusNumber || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{bus.Model || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{bus.Capacity || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{bus.Status || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">
                  <div className="flex gap-2">
                    <Link
                      to={`/buses/edit/${bus.BusId}`}
                      className="bg-[#3066BE] hover:bg-teal-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(bus.BusId)}
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

export default BusList
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([])
  const [routes, setRoutes] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch schedules
        console.log('Starting fetch for schedules...')
        const schedulesRes = await axios.get('/api/Schedules')
        console.log('Schedules data:', schedulesRes.data)
        setSchedules(schedulesRes.data || [])

        // Fetch routes
        console.log('Starting fetch for routes...')
        const routesRes = await axios.get('/api/Routes')
        console.log('Routes data:', routesRes.data)
        setRoutes(routesRes.data || [])

        // Fetch drivers
        console.log('Starting fetch for drivers...')
        const driversRes = await axios.get('/api/Users/drivers')
        console.log('Drivers data:', driversRes.data)
        setDrivers(driversRes.data || [])
      } catch (err) {
        console.error('Error in fetchData:', err)
        setError('Failed to load data: ' + (err.message || 'Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await axios.delete(`/api/Schedules/${id}`)
        setSchedules(schedules.filter((schedule) => schedule.ScheduleId !== id))
      } catch (err) {
        console.error('Error deleting schedule:', err)
        setError('Failed to delete schedule: ' + (err.message || 'Unknown error'))
      }
    }
  }

  const filteredSchedules = schedules.filter((schedule) =>
    Object.values(schedule).some((value) =>
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
          to="/schedules/add"
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
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Route</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Bus</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Driver</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Departure Time</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Trip Date</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((schedule, index) => (
              <tr key={schedule.ScheduleId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{schedule.ScheduleId}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">
                  {schedule.RouteName || (routes.find(r => r.RouteId === schedule.RouteId)?.RouteName) || '-'}
                </td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">
                  {schedule.BusNumber || schedule.BusId || '-'}
                </td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">
                  {schedule.DriverName || (drivers.find(d => d.UserId === schedule.DriverId)?.Name) || '-'}
                </td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{schedule.DepartureTime || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{schedule.TripDate ? schedule.TripDate.split('T')[0] : '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">{schedule.Status || '-'}</td>
                <td className="border-b border-gray-200 px-4 py-2 text-sm">
                  <div className="flex gap-2">
                    <Link
                      to={`/schedules/edit/${schedule.ScheduleId}`}
                      className="bg-[#3066BE] hover:bg-teal-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(schedule.ScheduleId)}
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

export default ScheduleList
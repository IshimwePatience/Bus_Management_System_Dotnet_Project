import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const EditScheduleForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    RouteId: '',
    BusId: '',
    DriverId: '',
    DepartureTime: '',
    TripDate: '',
    Status: '',
  })
  const [routes, setRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const statusOptions = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'InProgress', label: 'In Progress' }, // Match backend enum
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log('Starting fetch for schedule with ID:', id)
        const scheduleRes = await axios.get(`/api/Schedules/${id}`)
        console.log('Fetched schedule data:', scheduleRes.data)
        const { DepartureTime } = scheduleRes.data
        const [hours, minutes] = DepartureTime.split(':')
        setFormData({
          RouteId: scheduleRes.data.RouteId?.toString() || '',
          BusId: scheduleRes.data.BusId?.toString() || '',
          DriverId: scheduleRes.data.DriverId?.toString() || '',
          DepartureTime: `${hours}:${minutes}`,
          TripDate: scheduleRes.data.TripDate ? scheduleRes.data.TripDate.split('T')[0] : '',
          Status: scheduleRes.data.Status || '',
        })

        console.log('Starting fetch for routes...')
        const routesRes = await axios.get('/api/Routes')
        console.log('Routes data:', routesRes.data)
        setRoutes(routesRes.data || [])

        console.log('Starting fetch for buses...')
        const busesRes = await axios.get('/api/Buses')
        console.log('Buses data:', busesRes.data)
        setBuses(busesRes.data || [])

        console.log('Starting fetch for drivers...')
        const driversRes = await axios.get('/api/Users/drivers')
        console.log('Drivers data:', driversRes.data)
        setDrivers(driversRes.data || [])
      } catch (err) {
        console.error('Error in fetchData:', err)
        setError('Failed to load data: ' + (err.message || 'Unknown error') + (err.response?.data?.message ? ` - ${err.response.data.message}` : ''))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value })
  }

  const parseTimeToTimeSpan = (time) => {
    if (!time) return '00:00:00'
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}:00`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const data = {
      RouteId: parseInt(formData.RouteId),
      BusId: parseInt(formData.BusId),
      DriverId: parseInt(formData.DriverId),
      DepartureTime: parseTimeToTimeSpan(formData.DepartureTime),
      TripDate: formData.TripDate,
      Status: formData.Status,
    }

    if (!data.RouteId || !data.BusId || !data.DriverId || !data.DepartureTime || !data.TripDate || !data.Status) {
      setError('All required fields must be filled.')
      return
    }

    try {
      // Backend now supports PUT directly
      await axios.put(`/api/Schedules/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setSuccess('Schedule updated successfully!')
      setTimeout(() => navigate('/schedules'), 1000)
    } catch (err) {
      console.error('Error updating schedule:', err)
      setError('Failed to update schedule: ' + (err.response?.data?.message || err.message))
    }
  }

  if (loading) {
    return <div className="text-center p-4 text-gray-500">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="space-y-4 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800">Edit Schedule</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Route <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.RouteId}
            onChange={(e) => handleChange('RouteId', e.target.value)}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a route</option>
            {routes.length > 0 ? (
              routes.map((route) => (
                <option key={route.RouteId} value={route.RouteId}>
                  {route.RouteName || 'Unnamed Route'}
                </option>
              ))
            ) : (
              <option value="">No routes available</option>
            )}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Bus <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.BusId}
            onChange={(e) => handleChange('BusId', e.target.value)}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a bus</option>
            {buses.length > 0 ? (
              buses.map((bus) => (
                <option key={bus.BusId} value={bus.BusId}>
                  {bus.BusNumber || `Bus ${bus.BusId}`}
                </option>
              ))
            ) : (
              <option value="">No buses available</option>
            )}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Driver <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.DriverId}
            onChange={(e) => handleChange('DriverId', e.target.value)}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a driver</option>
            {drivers.length > 0 ? (
              drivers.map((driver) => (
                <option key={driver.UserId} value={driver.UserId}>
                  {driver.Name || 'Unnamed Driver'}
                </option>
              ))
            ) : (
              <option value="">No drivers available</option>
            )}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Departure Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.DepartureTime}
            onChange={(e) => handleChange('DepartureTime', e.target.value)}
            placeholder="Select departure time"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Trip Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.TripDate}
            onChange={(e) => handleChange('TripDate', e.target.value)}
            placeholder="Select trip date"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.Status}
            onChange={(e) => handleChange('Status', e.target.value)}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a status</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
        >
          Update Schedule
        </button>
      </form>
    </div>
  )
}

export default EditScheduleForm
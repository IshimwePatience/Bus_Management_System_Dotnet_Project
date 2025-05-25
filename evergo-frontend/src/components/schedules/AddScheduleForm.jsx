import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AddScheduleForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    RouteId: '',
    BusId: '',
    DriverId: '',
    DepartureTime: '',
    TripDate: '',
  })
  const [routes, setRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [drivers, setDrivers] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get('/api/Routes')
        setRoutes(res.data || [])
      } catch (err) {
        console.error('Error fetching routes:', err)
        setError('Failed to load routes.')
      }
    }

    const fetchBuses = async () => {
      try {
        const res = await axios.get('/api/Buses')
        console.log('Fetched buses:', res.data)
        setBuses(res.data || [])
      } catch (err) {
        console.error('Error fetching buses:', err)
        setError('Failed to load buses.')
      }
    }

    const fetchDrivers = async () => {
      try {
        const res = await axios.get('/api/Users/drivers')
        setDrivers(res.data || [])
      } catch (err) {
        console.error('Error fetching drivers:', err)
        setError('Failed to load drivers.')
      }
    }

    fetchRoutes()
    fetchBuses()
    fetchDrivers()
  }, [])

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
    }

    if (!data.RouteId || !data.BusId || !data.DriverId || !data.DepartureTime || !data.TripDate) {
      setError('All required fields must be filled.')
      return
    }

    try {
      await axios.post('/api/Schedules', data)
      setSuccess('Schedule created successfully!')
      setTimeout(() => navigate('/schedules'), 1000)
    } catch (err) {
      console.error('Error creating schedule:', err)
      setError('Failed to create schedule: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="space-y-4 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800">Create Schedule</h2>
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
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
        >
          Create Schedule
        </button>
      </form>
    </div>
  )
}

export default AddScheduleForm
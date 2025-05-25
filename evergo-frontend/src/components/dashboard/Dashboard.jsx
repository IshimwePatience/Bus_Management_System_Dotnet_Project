import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeBuses: 0,
    todaysBookings: 0,
    totalRoutes: 0,
    registeredDrivers: 0,
  })
  const [alerts, setAlerts] = useState([])
  const [latestBookings, setLatestBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [statsRes, alertsRes, bookingsRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/alerts').catch(err => {
            throw new Error('Failed to fetch alerts: ' + (err.response?.data?.message || err.message));
          }),
          axios.get('/api/dashboard/latest-bookings'),
        ])
        setStats(statsRes.data)
        setAlerts(alertsRes.data || [])
        setLatestBookings(bookingsRes.data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) return <div className="text-center p-4 text-gray-500">Loading...</div>
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm">
        Retry
      </button>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow-lg rounded-lg p-4 text-center border-l-4 border-blue-500">
          <p className="text-4xl font-bold text-blue-600">{stats.ActiveBuses}</p>
          <h3 className="text-l font-normal text-gray-500">Active Buses</h3>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 text-center border-l-4 border-orange-500">
          <p className="text-4xl font-bold text-orange-600">{stats.TodaysBookings}</p>
          <h3 className="text-l font-normal text-gray-500">Today's Bookings</h3>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 text-center border-l-4 border-green-500">
          <p className="text-4xl font-bold text-green-600">{stats.TotalRoutes}</p>
          <h3 className="text-l font-normal text-gray-500">Total Operational Routes</h3>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-4 text-center border-l-4 border-yellow-500">
          <p className="text-4xl font-bold text-yellow-600">{stats.RegisteredDrivers}</p>
          <h3 className="text-l font-normal text-gray-500">Registered Drivers</h3>
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/buses"
            className="bg-[#3066BE] hover:bg-teal-600 text-white px-4 py-2 rounded-md text-center"
          >
            Manage Buses
          </Link>
          <Link
            to="/routes"
            className="bg-[#3066BE] hover:bg-teal-600 text-white px-4 py-2 rounded-md text-center"
          >
            Manage Routes
          </Link>
          <Link
            to="/bookings"
            className="bg-[#3066BE] hover:bg-teal-600 text-white px-4 py-2 rounded-md text-center"
          >
            Manage Bookings
          </Link>
          <Link
            to="/users"
            className="bg-[#3066BE] hover:bg-teal-600 text-white px-4 py-2 rounded-md text-center"
          >
            Manage Users
          </Link>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Alerts</h3>
        {alerts.length === 0 ? (
          <div className="text-gray-500 text-center">No alerts at this time.</div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  alert.type === 'maintenance' ? 'bg-orange-100 text-orange-700' : 
                  alert.type === 'OutOfService' ? 'bg-red-100 text-red-700' : 
                  'bg-[#E8F5E9] text-green-700'}`}
              >
                {alert.Message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Latest Bookings */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Latest Bookings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Booking ID</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Schedule ID</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Passenger Name</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Pickup Point</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Seats</th>
              </tr>
            </thead>
            <tbody>
              {latestBookings.map((booking, index) => (
                <tr key={booking.BookingId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{booking.BookingId}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{booking.ScheduleId}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{booking.PassengerName}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{booking.PassengerEmail}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{booking.PassengerPhone}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{booking.PickupPoint}</td>
                  <td className="border-b border-gray-200 px-4 py-2 text-sm">{booking.NumberOfSeats}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard